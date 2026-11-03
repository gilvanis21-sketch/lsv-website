#!/usr/bin/env python3
"""
Suite de tests de sécurité et de non-régression fonctionnelle (boîte noire, via HTTP).

  python3 -I tests/security_suite.py https://localhost --env .env.production [--report docs/rapport-tests.md]

PRÉREQUIS : environnement NON PRODUCTION avec compte admin initial (SEED_ADMIN_*) et boîte mail factice.
ATTENTION : crée des comptes et des demandes FICTIFS ; ne jamais lancer sur le site réel.
Les limiteurs de débit étant en mémoire, redémarrer l'application avant chaque exécution.
"""
import http.cookiejar, re, ssl, sys, urllib.error, urllib.parse, urllib.request

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:3000"
ENV = sys.argv[sys.argv.index("--env") + 1] if "--env" in sys.argv else ".env"
REPORT = sys.argv[sys.argv.index("--report") + 1] if "--report" in sys.argv else None
HTTPS = BASE.startswith("https")
CTX = ssl.create_default_context(); CTX.check_hostname = False; CTX.verify_mode = ssl.CERT_NONE


def env(key):
    for line in open(ENV):
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip()
    raise SystemExit(f"{key} introuvable dans {ENV}")


ADMIN_EMAIL, ADMIN_PW = env("SEED_ADMIN_EMAIL"), env("SEED_ADMIN_PASSWORD")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def client():
    cj = http.cookiejar.CookieJar()
    return urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler(context=CTX), urllib.request.HTTPCookieProcessor(cj)), cj


def req(op, path, data=None, headers=None, method=None):
    h = dict(headers or {})
    r = urllib.request.Request(BASE + path, data=data, headers=h, method=method)
    try:
        x = op.open(r, timeout=30)
        return x.status, x.headers, x.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read().decode("utf-8", "replace")


def multipart(op, path, fields, files=()):
    b = "----lsvtest"
    out = b""
    for k, v in fields:
        out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    for k, fn, ct, data in files:
        out += f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{fn}"\r\nContent-Type: {ct}\r\n\r\n'.encode() + data + b"\r\n"
    out += f"--{b}--\r\n".encode()
    return req(op, path, out, {"Origin": BASE, "Content-Type": f"multipart/form-data; boundary={b}"})


def post_form(op, page, fields, files=()):
    """Soumet un formulaire à action serveur (identifiant d'action lu dans le HTML) sans JavaScript."""
    html = req(op, page)[2]
    for f in re.findall(r"<form[^>]*>(.*?)</form>", html, re.S):
        m = re.search(r'name="(\$ACTION_ID_[0-9a-f]+)"', f)
        names = set(re.findall(r'name="([^"$][^"]*)"', f))
        if m and set(fields) <= names:
            return multipart(op, page, [(m.group(1), "")] + list(fields.items()), files)
    raise RuntimeError(f"formulaire introuvable sur {page}: {list(fields)}")


loc = lambda r: r[1].get("location")
RESULTS = []


def check(section, name, ok, detail=""):
    RESULTS.append((section, name, bool(ok), detail))
    print(f"[{'OK ' if ok else 'ÉCHEC'}] {section} — {name}" + (f"  ({detail})" if detail and not ok else ""))


JSON_H = {"Content-Type": "application/json", "Origin": BASE}
VALID = '{"lastName":"Test","firstName":"Suite","email":"suite@test.example","phone":"+33 0 00 00 00 00","type":"suivi","consent":true,"website":"","fillMs":5000}'
anon, _ = client()

# ───────────── 1. En-têtes HTTP ─────────────
for path in ["/", "/admin/login", "/contact"]:
    st, h, body = req(anon, path)
    csp = h.get("content-security-policy", "")
    script = re.search(r"script-src ([^;]*)", csp)
    check("En-têtes", f"{path} : CSP à nonce, sans unsafe-inline", bool(script) and "nonce-" in script.group(1) and "'unsafe-inline'" not in script.group(1))
    if HTTPS:
        check("En-têtes", f"{path} : pas de unsafe-eval (production)", "unsafe-eval" not in csp)
        check("En-têtes", f"{path} : HSTS", "max-age=" in h.get("strict-transport-security", ""))
    check("En-têtes", f"{path} : X-Frame-Options DENY + frame-ancestors", h.get("x-frame-options") == "DENY" and "frame-ancestors 'none'" in csp)
    check("En-têtes", f"{path} : nosniff + Referrer-Policy + Permissions-Policy", h.get("x-content-type-options") == "nosniff" and bool(h.get("referrer-policy")) and bool(h.get("permissions-policy")))
    check("En-têtes", f"{path} : pas de X-Powered-By ni de version serveur", not h.get("x-powered-by") and "Express" not in str(h.get("server", "")))
    check("En-têtes", f"{path} : aucun cookie déposé aux visiteurs", not h.get("set-cookie"))
    check("En-têtes", f"{path} : nonce réellement appliqué aux scripts", bool(re.search(r"<script[^>]*nonce=", body)) or "<script" not in body)

# ───────────── 2. Routes d'administration sans session ─────────────
for p in ["/admin", "/admin/demandes", "/admin/articles", "/admin/articles/nouveau", "/admin/categories", "/admin/services", "/admin/parametres", "/admin/utilisateurs", "/admin/journal", "/admin/securite"]:
    st, h, _ = req(anon, p)
    check("Accès admin", f"{p} sans session → redirection connexion", st in (302, 307) and "/admin/login" in (h.get("location") or ""), f"{st}")
check("Accès admin", "export JSON sans session → 401", req(anon, "/admin/demandes/00000000-0000-4000-8000-000000000000/export")[0] == 401)
check("Disponibilité", "/api/health → ok sans détail", req(anon, "/api/health")[2].replace(" ", "") == '{"status":"ok"}')

# ───────────── 3. API publique de demande ─────────────
st = req(anon, "/api/demandes", VALID.encode(), {"Content-Type": "application/json"})[0]
check("API demande", "sans en-tête Origin → 403 (anti-CSRF)", st == 403, st)
st = req(anon, "/api/demandes", VALID.encode(), {"Content-Type": "application/json", "Origin": "https://evil.example"})[0]
check("API demande", "origine étrangère → 403", st == 403, st)
st = req(anon, "/api/demandes", VALID.encode(), {"Content-Type": "text/plain", "Origin": BASE})[0]
check("API demande", "Content-Type non JSON → 415", st == 415, st)
check("API demande", "GET interdit → 405", req(anon, "/api/demandes")[0] == 405)
check("API demande", "JSON invalide → 400", req(anon, "/api/demandes", b"{pas du json", JSON_H)[0] == 400)
check("API demande", "corps > 8 Ko → 413", req(anon, "/api/demandes", (VALID[:-1] + ',"x":"' + "a" * 9000 + '"}').encode(), JSON_H)[0] == 413)
st, _, body = req(anon, "/api/demandes", VALID.replace('"website":""', '"website":"http://spam"').encode(), JSON_H)
check("API demande", "honeypot rempli → faux succès, rien d'enregistré", st == 200 and "LSV-0000-000000" in body)
st, _, body = req(anon, "/api/demandes", VALID.replace("Suite", "<script>alert(1)</script>").encode(), JSON_H)
check("API demande", "XSS dans le prénom → 422", st == 422, f"{st}")
st, _, body = req(anon, "/api/demandes", VALID.replace('"Test"', '"Robert\'); DROP TABLE users;--"').encode(), JSON_H)
check("API demande", "tentative d'injection SQL → traitée comme texte (201)", st == 201, f"{st} {body[:80]}")
st, _, body = req(anon, "/api/demandes", VALID.encode(), JSON_H)
check("API demande", "limitation de débit → 429 au-delà de 5 / 10 min", st == 429, f"{st}")
check("API demande", "erreurs sans trace technique", "at " not in body and "Error:" not in body and "stack" not in body.lower())

# ───────────── 4. Authentification ─────────────
adm, cj = client()
st, h, _ = post_form(adm, "/admin/login", {"email": ADMIN_EMAIL, "password": "mauvais-mot-de-passe-123", "code": ""})
check("Authentification", "mauvais mot de passe → message générique", loc((st, h, "")) == "/admin/login?e=invalid")
r = post_form(adm, "/admin/login", {"email": ADMIN_EMAIL, "password": ADMIN_PW, "code": ""})
check("Authentification", "connexion admin valide", loc(r) == "/admin", loc(r))
ck = {c.name: c for c in cj}
name = "__Host-lsv_session" if HTTPS else "lsv_session"
c = ck.get(name)
check("Session", f"cookie nommé {name}", c is not None, list(ck))
if c is not None:
    check("Session", "cookie HttpOnly + SameSite=Strict", c.has_nonstandard_attr("HttpOnly") and (c.get_nonstandard_attr("SameSite") or "").lower() == "strict")
    if HTTPS:
        check("Session", "cookie Secure", c.secure)
    check("Session", "jeton long (≥ 40 car.)", len(c.value) >= 40)
stolen = c.value if c is not None else ""

# Rôles
for who, role, pw in [("secretaire", "secretary", "Secretaire-Test-123!"), ("editeur", "editor", "Editeur-Test-12345!")]:
    post_form(adm, "/admin/utilisateurs", {"name": who, "email": f"{who}@suite.example", "role": role, "password": pw})
sec, _ = client(); post_form(sec, "/admin/login", {"email": "secretaire@suite.example", "password": "Secretaire-Test-123!", "code": ""})
edi, _ = client(); post_form(edi, "/admin/login", {"email": "editeur@suite.example", "password": "Editeur-Test-12345!", "code": ""})
check("Autorisations", "secrétariat : demandes accessibles", req(sec, "/admin/demandes")[0] == 200)
for p in ["/admin/articles", "/admin/services", "/admin/parametres", "/admin/utilisateurs", "/admin/journal"]:
    check("Autorisations", f"secrétariat : {p} refusé", loc(req(sec, p)) == "/admin?refuse=1")
check("Autorisations", "éditeur : articles accessibles", req(edi, "/admin/articles")[0] == 200)
for p in ["/admin/demandes", "/admin/utilisateurs", "/admin/journal"]:
    check("Autorisations", f"éditeur : {p} refusé", loc(req(edi, p)) == "/admin?refuse=1")
rid = re.search(r"/admin/demandes/([0-9a-f-]{36})", req(adm, "/admin/demandes")[2])
check("Autorisations", "éditeur : export de données refusé (401)", bool(rid) and req(edi, f"/admin/demandes/{rid.group(1)}/export")[0] == 401)
# Les identifiants d'action sont identiques pour tous : un éditeur qui les connaît ne doit rien pouvoir exécuter.
if rid:
    page = req(adm, f"/admin/demandes/{rid.group(1)}")[2]
    del_form = [f for f in re.findall(r"<form[^>]*>(.*?)</form>", page, re.S) if 'name="confirm"' in f][0]
    aid = re.search(r'name="(\$ACTION_ID_[0-9a-f]+)"', del_form).group(1)
    r = multipart(edi, f"/admin/demandes/{rid.group(1)}", [(aid, ""), ("id", rid.group(1)), ("confirm", "on")])
    still = rid.group(1) in req(adm, "/admin/demandes")[2]
    check("Autorisations", "éditeur : action serveur « supprimer demande » rejouée → refusée, donnée intacte", still and "/admin" in (loc(r) or "") and "refuse" in (loc(r) or ""), f"{loc(r)} intacte={still}")
else:
    check("Autorisations", "éditeur : action serveur « supprimer demande »", False, "aucune demande trouvée")

# Verrouillage (compte dédié, 5 échecs)
post_form(adm, "/admin/utilisateurs", {"name": "verrou", "email": "verrou@suite.example", "role": "secretary", "password": "Verrou-Test-123456!"})
res = []
for i in range(5):
    res.append(loc(post_form(client()[0], "/admin/login", {"email": "verrou@suite.example", "password": f"faux{i}", "code": ""})))
check("Authentification", "verrouillage du compte après 5 échecs", res[-1] == "/admin/login?e=locked", res)

# Injection / XSS dans l'admin
base_n = len(re.findall(r"/admin/demandes/[0-9a-f-]{36}\"", req(adm, "/admin/demandes")[2]))
st, _, html = req(adm, "/admin/demandes?q=" + urllib.parse.quote("' OR '1'='1' --"))
check("Injection", "recherche admin : injection SQL sans effet", st == 200 and len(re.findall(r"/admin/demandes/[0-9a-f-]{36}\"", html)) <= base_n)
payload = "<script>alert(1)</script>"
st, _, html = req(adm, "/admin/demandes?q=" + urllib.parse.quote(payload))
check("XSS", "paramètre de recherche non réfléchi en HTML brut", payload not in html)
st, _, html = req(anon, "/actualites?categorie=" + urllib.parse.quote(payload))
check("XSS", "paramètre de catégorie non réfléchi", payload not in html)

# Gestion d'erreurs
for p, exp in [("/admin/demandes/pas-un-uuid", 404), ("/nos-services/inexistant", 404), ("/actualites/inexistant", 404), ("/media/../../etc/passwd", 404), ("/media/evil.html", 404), ("/n-importe-quoi", 404)]:
    st, _, body = req(adm, p)
    check("Erreurs", f"{p} → {exp} sans fuite technique", st == exp and "node_modules" not in body and "at Object" not in body, st)

# Téléversement
st = post_form(adm, "/admin/articles/nouveau", {"title": "Faux", "body": "x"}, files=[("image", "x.png", "image/png", b"<html><script>alert(1)</script></html>")])
check("Téléversement", "HTML déguisé en PNG refusé", loc(st) and "e=image" in loc(st), loc(st))
st = post_form(adm, "/admin/articles/nouveau", {"title": "Svg", "body": "x"}, files=[("image", "x.svg", "image/svg+xml", b"<svg xmlns='http://www.w3.org/2000/svg' onload='alert(1)'/>")])
check("Téléversement", "SVG refusé (vecteur XSS)", loc(st) and "e=image" in loc(st), loc(st))

# Déconnexion : le jeton volé doit cesser de fonctionner
html = req(adm, "/admin")[2]
f = [x for x in re.findall(r"<form[^>]*>(.*?)</form>", html, re.S) if "Se déconnecter" in x][0]
multipart(adm, "/admin", [(re.search(r'name="(\$ACTION_ID_[0-9a-f]+)"', f).group(1), "")])
thief = urllib.request.build_opener(NoRedirect, urllib.request.HTTPSHandler(context=CTX))
r = urllib.request.Request(BASE + "/admin/demandes", headers={"Cookie": f"{name}={stolen}"})
try:
    code = thief.open(r, timeout=30).status
except urllib.error.HTTPError as e:
    code = e.code
check("Session", "jeton réutilisé après déconnexion → rejeté", code in (302, 307), code)
fake = urllib.request.Request(BASE + "/admin/demandes", headers={"Cookie": f"{name}=" + "A" * 43})
try:
    code = thief.open(fake, timeout=30).status
except urllib.error.HTTPError as e:
    code = e.code
check("Session", "jeton forgé → rejeté", code in (302, 307), code)

# ───────────── Rapport ─────────────
ko = [r for r in RESULTS if not r[2]]
print(f"\n{len(RESULTS) - len(ko)}/{len(RESULTS)} contrôles réussis")
if REPORT:
    with open(REPORT, "w") as fh:
        fh.write(f"# Résultats de la suite de sécurité\n\nCible : `{BASE}` — {len(RESULTS) - len(ko)}/{len(RESULTS)} contrôles réussis.\n\n| Domaine | Contrôle | Résultat |\n|---|---|---|\n")
        for s, n, ok, d in RESULTS:
            fh.write(f"| {s} | {n} | {'✅' if ok else '❌ ' + str(d)} |\n")
sys.exit(1 if ko else 0)
