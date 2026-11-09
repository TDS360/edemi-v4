#!/usr/bin/env python3
"""Builds dist/ede-mi.html: one self-contained page (CSS and JS inlined) for publishing as a Claude artifact
or hosting anywhere. Usage:  python3 build.py
It reads the script and style order from index.html so the two never drift apart."""
import re, pathlib
root = pathlib.Path(__file__).parent
idx = (root / 'index.html').read_text(encoding='utf8')
idx = re.sub(r'<!--.*?-->', '', idx, flags=re.S)   # ignore commented-out scripts
css = '\n'.join((root / m).read_text(encoding='utf8') for m in re.findall(r'<link rel="stylesheet" href="(css/[^"]+)"', idx))
js = '\n'.join((root / m).read_text(encoding='utf8') for m in re.findall(r'<script src="(js/[^"]+)"', idx))
assert '</script' not in js.lower(), 'a script contains a closing script tag'
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts[^"]+)"', idx).group(1)
out = f'''<title>Èdè Mi</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="{fonts}">
<style>
{css}
</style>

<div id="app"><div class="wrap" id="main"></div></div>
<nav aria-label="Main"><div class="in" id="nav"></div></nav>
<div id="toast" role="status" hidden></div>

<script>
{js}
</script>
'''
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'ede-mi.html').write_text(out, encoding='utf8')
print('wrote dist/ede-mi.html', len(out)//1024, 'KB')
