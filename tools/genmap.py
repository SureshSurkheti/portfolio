"""Regenerates the journey-map dot grid in index.html.

Run from this directory: python3 genmap.py
Reads jpn.json / npl.json (simplified country outlines from
github.com/johan/world.geo.json) and writes jp_d.txt / np_d.txt —
paste their contents into the .jmap__dots--jp / --np path d attributes.
Also prints the pin px coordinates and their %% positions for the chips.
"""
import json, math

def polys(fname):
    g = json.load(open(fname))['features'][0]['geometry']
    if g['type'] == 'Polygon': return [g['coordinates'][0]]
    return [p[0] for p in g['coordinates']]

def inside(lon, lat, ring):
    n, j, ok = len(ring), len(ring)-1, False
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            ok = not ok
        j = i
    return ok

K = 26.0
CLAT = math.cos(math.radians(36))
JP_SHIFT = 26.0     # degrees of ocean removed between the two countries
MX, MY = 40, 30
LAT0 = 45.6         # top of canvas latitude (Hokkaido)

def proj(lon, lat, shift):
    return ((lon - shift - 80.0) * K * CLAT + MX, (LAT0 - lat) * K + MY)

def dots(fname, shift, step=7.4):
    rings = polys(fname)
    # bounding box in px
    pts = [proj(x, y, shift) for r in rings for (x, y) in r]
    x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts)
    y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
    out, row = [], 0
    y = y0
    while y <= y1:
        x = x0 + (step/2 if row % 2 else 0)
        while x <= x1:
            lon = (x - MX) / (K * CLAT) + 80.0 + shift
            lat = LAT0 - (y - MY) / K
            if any(inside(lon, lat, r) for r in rings):
                out.append((round(x, 1), round(y, 1)))
            x += step
        y += step * 0.866
        row += 1
    return out, (x0, y0, x1, y1)

jp, jbb = dots('jpn.json', JP_SHIFT)
np_, nbb = dots('npl.json', 0, step=6.6)

def d(pts):
    return ''.join(f'M{x} {y}h.01' for x, y in pts)

def pin(lon, lat, shift):
    x, y = proj(lon, lat, shift)
    return round(x, 1), round(y, 1)

oita = pin(131.61, 33.24, JP_SHIFT)
nepal = pin(85.32, 27.67, 0)

print('JP dots:', len(jp), 'bbox', [round(v) for v in jbb])
print('NP dots:', len(np_), 'bbox', [round(v) for v in nbb])
print('oita px:', oita, '=', (round(oita[0]/10,1), round(oita[1]/5.6,1)), '%')
print('nepal px:', nepal, '=', (round(nepal[0]/10,1), round(nepal[1]/5.6,1)), '%')
open('jp_d.txt','w').write(d(jp))
open('np_d.txt','w').write(d(np_))
print('path bytes:', len(d(jp)) + len(d(np_)))
