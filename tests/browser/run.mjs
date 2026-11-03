// Tests navigateurs (Chromium, Firefox, WebKit) : erreurs console / violations CSP, débordement horizontal,
// accessibilité automatisée (axe-core), captures d'écran. Usage : node run.mjs https://localhost
import { chromium, firefox, webkit } from "playwright";
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] ?? "https://localhost";
const OUT = process.argv[3] ?? "/out";
mkdirSync(OUT, { recursive: true });
const PAGES = ["/", "/le-laboratoire", "/nos-services", "/nos-services/bilan-vocal", "/la-voix", "/la-voix/dysphonies", "/polymnivox", "/references", "/actualites", "/contact", "/informations-pratiques", "/mentions-legales", "/confidentialite", "/cookies", "/admin/login"];
const VIEWPORTS = { mobile: { width: 375, height: 800 }, tablette: { width: 768, height: 1024 }, bureau: { width: 1440, height: 900 } };
const rows = [], axeAll = [];
let fail = 0;

for (const [bname, bt] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await bt.launch();
  for (const [vname, vp] of Object.entries(VIEWPORTS)) {
    if (bname !== "chromium" && vname === "tablette") continue; // tablette : Chromium seul
    const ctx = await browser.newContext({ viewport: vp, ignoreHTTPSErrors: true, locale: "fr-FR" });
    for (const path of PAGES) {
      const page = await ctx.newPage();
      const problems = [];
      page.on("console", (m) => { if (["error", "warning"].includes(m.type())) problems.push(`console.${m.type()}: ${m.text().slice(0, 160)}`); });
      page.on("pageerror", (e) => problems.push(`exception: ${String(e).slice(0, 160)}`));
      page.on("requestfailed", (r) => { if (!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|annul/i.test(r.failure()?.errorText ?? "")) problems.push(`requête échouée: ${r.url().slice(0, 100)} (${r.failure()?.errorText})`); });
      const resp = await page.goto(BASE + path, { waitUntil: "networkidle" });
      const status = resp?.status();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
      if (overflow) problems.push("débordement horizontal");
      if (status !== 200) problems.push(`HTTP ${status}`);
      if (bname === "chromium" && vname === "bureau") {
        await page.addScriptTag({ content: axeSource });
        const res = await page.evaluate(async () => await axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }));
        for (const v of res.violations) axeAll.push({ path, id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes[0]?.html?.slice(0, 120) });
      }
      if (["/", "/contact", "/nos-services", "/admin/login"].includes(path) && bname === "chromium") await page.screenshot({ path: `${OUT}/${vname}${path === "/" ? "-accueil" : path.replace(/\//g, "-")}.png`, fullPage: path === "/" });
      rows.push({ browser: bname, viewport: vname, path, ok: problems.length === 0, problems });
      if (problems.length) fail++;
      await page.close();
    }
    await ctx.close();
  }

  // Parcours formulaire (réel, dans le navigateur) — Chromium/Firefox/WebKit
  const ctx = await browser.newContext({ viewport: VIEWPORTS.mobile, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const problems = [];
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console.error: ${m.text().slice(0, 160)}`); });
  await page.goto(BASE + "/contact", { waitUntil: "networkidle" });
  await page.click("button[type=submit]");
  const errs = await page.locator("[role=alert]").count();
  if (errs < 4) problems.push(`validation client : ${errs} erreurs affichées (≥ 4 attendues)`);
  await page.fill("#lastName", "Test"); await page.fill("#firstName", `Nav-${bname}`);
  await page.fill("#email", `nav-${bname}@test.example`); await page.fill("#phone", "+33 0 00 00 00 00");
  await page.check("input[value=suivi]"); await page.check("input[name=consent]");
  await page.waitForTimeout(3200); // délai anti-robot minimal
  await page.click("button[type=submit]");
  const ok = await page.locator("[role=status]").filter({ hasText: /LSV-\d{4}-/ }).waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
  if (!ok) problems.push("confirmation avec référence non affichée");
  if (bname === "chromium") await page.screenshot({ path: `${OUT}/formulaire-confirmation.png` });
  rows.push({ browser: bname, viewport: "mobile", path: "PARCOURS formulaire (validation + envoi)", ok: problems.length === 0, problems });
  if (problems.length) fail++;
  await ctx.close();
  await browser.close();
}
writeFileSync(`${OUT}/resultats.json`, JSON.stringify({ rows, axe: axeAll }, null, 1));
const bad = rows.filter((r) => !r.ok);
console.log(`${rows.length - bad.length}/${rows.length} contrôles navigateur réussis`);
for (const r of bad) console.log(`ÉCHEC ${r.browser}/${r.viewport} ${r.path}\n   - ${r.problems.join("\n   - ")}`);
console.log(`\naxe-core (WCAG 2.2 AA, Chromium bureau) : ${axeAll.length} violation(s)`);
for (const a of axeAll) console.log(` - [${a.impact}] ${a.path} ${a.id} (${a.n} él.) ${a.help} — ${a.sample ?? ""}`);
process.exit(fail ? 1 : 0);
