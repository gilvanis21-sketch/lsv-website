#!/usr/bin/env python3
"""Mesure de charge légère : latence (p50/p95) par page, avec 10 clients simultanés. Usage : perf_check.py https://localhost"""
import ssl, statistics, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
BASE = sys.argv[1].rstrip("/"); N = int(sys.argv[2]) if len(sys.argv) > 2 else 200
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
def hit(path):
    t = time.perf_counter(); r = urllib.request.urlopen(urllib.request.Request(BASE + path, headers={"Accept-Encoding": "gzip"}), context=ctx, timeout=30)
    b = r.read(); return (time.perf_counter() - t) * 1000, r.status, len(b), r.headers.get("content-encoding", "")
print(f"{'page':28} {'p50':>7} {'p95':>7} {'max':>7}  {'taille':>8} {'enc':>5}  erreurs")
for p in ["/", "/nos-services", "/nos-services/bilan-vocal", "/la-voix", "/polymnivox", "/actualites", "/contact", "/informations-pratiques", "/api/health"]:
    hit(p)  # échauffement
    with ThreadPoolExecutor(10) as ex: rs = list(ex.map(hit, [p] * N))
    ts = sorted(r[0] for r in rs); err = sum(r[1] != 200 for r in rs)
    print(f"{p:28} {statistics.median(ts):6.0f}ms {ts[int(.95*len(ts))-1]:6.0f}ms {ts[-1]:6.0f}ms  {rs[0][2]:7d}o {rs[0][3]:>5}  {err}")
