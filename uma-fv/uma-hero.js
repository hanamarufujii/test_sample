/* U-MA first view — typographic motion (white on black text, one red hyphen).
   WordPress Raw HTML:
     <div id="uma-hero"></div>
     <script src="https://hanamarufujii.github.io/test_sample/uma-fv/uma-hero.js" defer></script>
   PC: fills the landscape screen. SP: fills the portrait screen.
   Motion: transform / opacity only, runs once (~6 s) and rests on the final layout. */
(function () {
  var root = document.getElementById('uma-hero');
  if (!root) {
    root = document.createElement('div'); root.id = 'uma-hero';
    var me = document.currentScript; if (me && me.parentNode) me.parentNode.insertBefore(root, me); else document.body.appendChild(root);
  }
  if (root.getAttribute('data-ready')) return;
  root.setAttribute('data-ready', '1');

  var LINE1 = 'A VERY CREATIVE DESIGN STUDIO', LINE3 = 'IN TOKYO, SHIBUYA', LINE4 = 'SINCE 2000';
  var BEAT = 500; // 120 BPM

  if (!document.getElementById('uma-puzzle-font')) {
    var l = document.createElement('link'); l.id = 'uma-puzzle-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500&display=swap';
    document.head.appendChild(l);
  }
  var css = [
    '#uma-hero{--fg:#111;--red:#e60012;position:relative;box-sizing:border-box;background:#fff;color:var(--fg);overflow:hidden;',
    'font-family:"Futura","Futura PT","Jost","Century Gothic",sans-serif;-webkit-font-smoothing:antialiased;-webkit-user-select:none;user-select:none;}',
    '#uma-hero *{box-sizing:border-box;margin:0;padding:0;}',
    '#uma-hero .uh-stage{position:absolute;inset:0;display:grid;grid-template-rows:auto 1fr auto;padding:40px 4vw;}',
    '#uma-hero .uh-small{font-size:12px;font-weight:500;letter-spacing:.32em;line-height:1.6;text-transform:uppercase;white-space:nowrap;}',
    '#uma-hero .uh-top{align-self:start;}',
    '#uma-hero .uh-mid{display:flex;align-items:center;justify-content:center;}',
    '#uma-hero .uh-big{font-weight:500;line-height:.8;letter-spacing:-.02em;white-space:nowrap;}',
    '#uma-hero .uh-big span{display:inline-block;will-change:transform,opacity;}',
    '#uma-hero .uh-big .uh-dash{width:.3em;height:.068em;margin:0 .07em;background:currentColor;vertical-align:.29em;}',
    '#uma-hero .uh-bot{display:flex;justify-content:space-between;align-items:end;gap:16px;}',
    '#uma-hero .uh-type{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;pointer-events:none;}',
    '#uma-hero .uh-type span{display:inline-block;white-space:pre;}',
    '#uma-hero .uh-rule{position:absolute;left:4vw;right:4vw;background:var(--red);transform:scaleX(0);transform-origin:50% 50%;}',
    '#uma-hero.uh-portrait .uh-stage{padding:28px 16px;}',
    '#uma-hero.uh-portrait .uh-small{font-size:11px;letter-spacing:.26em;}',
    '#uma-hero.uh-portrait .uh-bot{flex-direction:column;align-items:flex-start;gap:4px;}',
    '#uma-hero.uh-portrait .uh-mid{justify-content:flex-start;}'
  ].join('');
  if (!document.getElementById('uma-hero-style')) {
    var st = document.createElement('style'); st.id = 'uma-hero-style'; st.textContent = css; document.head.appendChild(st);
  }

  function spans(text) { return text.split('').map(function (c) { return '<span>' + (c === ' ' ? ' ' : c) + '</span>'; }).join(''); }
  root.innerHTML =
    '<div class="uh-stage">' +
      '<div class="uh-top"><div class="uh-small uh-l1">' + LINE1 + '</div></div>' +
      '<div class="uh-mid"><h1 class="uh-big" aria-label="U-MA"><span>U</span><span class="uh-dash"></span><span>M</span><span>A</span></h1></div>' +
      '<div class="uh-bot"><div class="uh-small uh-l3">' + LINE3 + '</div><div class="uh-small uh-l4">' + LINE4 + '</div></div>' +
    '</div>' +
    '<div class="uh-small uh-type" aria-hidden="true">' + spans(LINE1) + '</div>' +
    '<div class="uh-rule" aria-hidden="true"></div>';

  root.style.visibility = 'hidden';   // shown once the font is ready, so nothing flashes
  var stage = root.querySelector('.uh-stage'), big = root.querySelector('.uh-big'), bigL = big.querySelectorAll('span');
  var dash = root.querySelector('.uh-dash'), type = root.querySelector('.uh-type'), typeL = type.querySelectorAll('span'), rule = root.querySelector('.uh-rule');
  var smalls = [root.querySelector('.uh-l1'), root.querySelector('.uh-l3'), root.querySelector('.uh-l4')];

  // ---------- size: full screen width, full screen height ----------
  var lastW = 0;
  function fit(force) {
    var vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (!force && vw === lastW) return;          // ignore height-only changes (mobile address bar)
    lastW = vw;
    root.style.width = vw + 'px'; root.style.maxWidth = 'none'; root.style.marginLeft = '0';
    var left = root.getBoundingClientRect().left; root.style.marginLeft = (-left) + 'px';
    var top = root.getBoundingClientRect().top + window.pageYOffset;
    root.style.height = (top > 0 && top < vh * .4 ? vh - top : vh) + 'px';
    var portrait = vw < 768 || vh > vw;
    root.classList.toggle('uh-portrait', portrait);
    // U-MA as wide as the stage allows
    var avail = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    big.style.fontSize = '100px';
    var w = big.getBoundingClientRect().width || 1;
    var size = avail / w * 100 * .98;
    size = Math.min(size, (stage.clientHeight * (portrait ? .5 : .62)) / .8);
    big.style.fontSize = Math.floor(size) + 'px';
    // the red line sits exactly on the hyphen bar and grows out of its center
    var d = dash.getBoundingClientRect(), r = root.getBoundingClientRect();
    rule.style.height = d.height + 'px';
    rule.style.top = (d.top - r.top) + 'px';
    rule.style.transformOrigin = (d.left - r.left + d.width / 2 - rule.offsetLeft) + 'px 50%';   // offsetLeft ignores the scaleX(0)
  }

  // ---------- motion ----------
  function play() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !Element.prototype.animate) { type.style.display = 'none'; return; }
    var E = 'cubic-bezier(.7,0,.2,1)', OUT = 'cubic-bezier(.2,.8,.2,1)';
    var t0 = 200, step = 60;
    // 1) the studio line types itself in the middle
    typeL.forEach(function (s, i) {
      s.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 140, delay: t0 + i * step, easing: OUT, fill: 'both' });
    });
    var T1 = t0 + typeL.length * step + BEAT;
    // 2) the line turns into U-MA: four letters grow out of letters of the line
    var src = { 0: LINE1.indexOf('U'), 1: LINE1.indexOf('I'), 2: LINE1.indexOf('V'), 3: 0 };   // U←U, -←I, M←V, A←A
    var rot = { 1: 90 };
    bigL.forEach(function (b, i) {
      var s = typeL[src[i]].getBoundingClientRect(), r = b.getBoundingClientRect();
      var k = s.height / r.height, dx = (s.left + s.width / 2) - (r.left + r.width / 2), dy = (s.top + s.height / 2) - (r.top + r.height / 2);
      var from = 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')' + (rot[i] ? ' rotate(' + rot[i] + 'deg)' : '');
      b.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: from, offset: .12 }, { opacity: 1, transform: 'none' }], { duration: BEAT * 2, delay: T1 + i * 60, easing: E, fill: 'both' });
    });
    typeL.forEach(function (s, i) {
      var isSrc = [src[0], src[1], src[2], src[3]].indexOf(i) >= 0;
      s.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: isSrc ? 'none' : 'translateY(-10px)' }], { duration: isSrc ? 120 : 300, delay: T1 + (isSrc ? 0 : Math.abs(i - typeL.length / 2) * 8), easing: OUT, fill: 'both' });
    });
    var T2 = T1 + BEAT * 2 + 120;
    // 3) the hyphen turns red, stretches into a line, and comes back
    dash.animate([{ color: '#111' }, { color: '#e60012' }], { duration: 200, delay: T2, fill: 'both' });
    rule.animate([{ transform: 'scaleX(0)', opacity: 1 }, { transform: 'scaleX(1)', opacity: 1, offset: .4 }, { transform: 'scaleX(1)', opacity: 1, offset: .55 }, { transform: 'scaleX(0)', opacity: 1 }],
      { duration: BEAT * 2, delay: T2 + 150, easing: E, fill: 'both' });
    var T3 = T2 + BEAT * 2;
    // 4) the three small lines settle into place
    smalls.forEach(function (s, i) {
      s.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: BEAT, delay: T3 + i * 120, easing: OUT, fill: 'both' });
    });
  }

  function start() {
    fit(true);
    play();
    root.style.visibility = '';
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { fit(false); }, 120); });
    window.addEventListener('orientationchange', function () { setTimeout(function () { fit(true); }, 300); });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
