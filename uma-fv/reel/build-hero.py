"""Build uma-fv/uma-hero.js (the live first view) from reel/reel.js + reel/hero-shell.js."""
import os
here = os.path.dirname(os.path.abspath(__file__))
reel = open(os.path.join(here, 'reel.js'), encoding='utf-8').read()
shell = open(os.path.join(here, 'hero-shell.js'), encoding='utf-8').read()
# reel.js registers itself on `global`; inside the shell it gets a private `window` object
reel = reel.replace("})(typeof window !== 'undefined' ? window : this);", "})(window);")
out = shell.replace('/*REEL*/', reel)
open(os.path.join(here, '..', 'uma-hero.js'), 'w', encoding='utf-8').write(out)
print('wrote uma-hero.js', len(out), 'bytes')
