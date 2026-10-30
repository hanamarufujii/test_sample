"""Build uma-puzzle.js from uma-puzzle.html (the single source).

uma-puzzle.js fills <div id="uma-puzzle"></div> by itself, so the WordPress
Raw HTML only needs:
  <div id="uma-puzzle"></div>
  <script src="https://hanamarufujii.github.io/test_sample/uma-fv/uma-puzzle.js" defer></script>
Run: python3 uma-fv/build.py
"""
import json, os, re

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'uma-puzzle.html'), encoding='utf-8').read()

css = re.search(r'<style>\n(.*?)</style>', src, re.S).group(1)
markup = re.search(r'<div id="uma-puzzle"[^>]*>\n(.*?)\n</div>\n\n<script>', src, re.S).group(1)
script = re.search(r'<script>\n(.*?)</script>', src, re.S).group(1)
font = re.search(r'href="(https://fonts\.googleapis\.com/css2[^"]+)"', src).group(1)

head = """/* U-MA Design Puzzle — generated from uma-puzzle.html by build.py. Do not edit by hand. */
(function () {
  var root = document.getElementById('uma-puzzle');
  if (!root) {
    root = document.createElement('div'); root.id = 'uma-puzzle';
    var me = document.currentScript; if (me && me.parentNode) me.parentNode.insertBefore(root, me); else document.body.appendChild(root);
  }
  if (root.getAttribute('data-ready') || root.getAttribute('data-shell')) return;
  root.setAttribute('data-shell', '1');
  root.setAttribute('aria-label', 'Design Puzzle');
  if (!document.getElementById('uma-puzzle-font')) {
    var l = document.createElement('link'); l.id = 'uma-puzzle-font'; l.rel = 'stylesheet'; l.href = %s;
    document.head.appendChild(l);
  }
  if (!document.getElementById('uma-puzzle-style')) {
    var st = document.createElement('style'); st.id = 'uma-puzzle-style'; st.textContent = %s;
    document.head.appendChild(st);
  }
  root.innerHTML = %s;
})();
""" % (json.dumps(font), json.dumps(css), json.dumps(markup))

open(os.path.join(here, 'uma-puzzle.js'), 'w', encoding='utf-8').write(head + script)
print('wrote uma-puzzle.js', len(head + script), 'bytes')
