/* U-MA showreel — "一本のハイフンが、スタジオになる。" (One hyphen becomes the studio.)
   15 s at 120 BPM, loops (the last frame is the first frame).
   Pure function of time: UMA_REEL.draw(ctx, t, pixelWidth, pixelHeight). No timers, no state between frames.
   Design space is 1920x1080; it is fitted ("contain") into any canvas, with backgrounds bled to the edges. */
(function (global) {
  var W = 1920, H = 1080, CX = 960, CY = 540, DUR = 15;
  var WHITE = '#ffffff', BLACK = '#0b0b0b', RED = '#e60012';
  var FONT = '"Jost", "Futura", "Futura PT", "Century Gothic", sans-serif';
  var BLUR_SAMPLES = 24, SHUTTER = .5 / 60;   // 180° shutter: each moving element is averaged over the last half frame (1 sample = off)

  // ---------- time & easing (all functions of time) ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, x) { return a + (b - a) * x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function eOut(x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); }
  function eIn(x) { return x <= 0 ? 0 : Math.pow(2, 10 * x - 10); }
  function eInOut(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2; }
  function spring(x) { x = Math.max(0, x); return x >= 1 ? 1 : 1 - (1 + 9 * x) * Math.exp(-9 * x); }   // critically damped: no overshoot
  function hash(i) { var s = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); }

  // ---------- type ----------
  var cache = {}, CAP = 0.7;
  function setFont(ctx, w, s) { ctx.font = w + ' ' + s + 'px ' + FONT; }
  function mw(ctx, str, w) { var k = w + '|' + str; if (cache[k] == null) { setFont(ctx, w, 100); ctx.letterSpacing = '0px'; cache[k] = ctx.measureText(str).width / 100; } return cache[k]; }
  function fitFs(ctx, str, w, width, cap) { return Math.min(width / mw(ctx, str, w), cap || 1e9); }
  function text(ctx, str, x, y, fs, w, color, align, track) {
    setFont(ctx, w, fs); ctx.letterSpacing = (track || 0) + 'px'; ctx.textAlign = align || 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(str, x + (align === 'center' || !align ? (track || 0) / 2 : 0), y); ctx.letterSpacing = '0px';
  }
  function init(ctx) { cache = {}; setFont(ctx, 700, 100); var m = ctx.measureText('H'); CAP = (m.actualBoundingBoxAscent || 70) / 100; }

  // U-MA: the hyphen is a red bar, centered on the cap height
  function umaFs(ctx, width) { return width / (mw(ctx, 'U', 700) + mw(ctx, 'MA', 700) + .45); }
  function uma(ctx, cx, cy, fs) {
    var wU = mw(ctx, 'U', 700) * fs, wMA = mw(ctx, 'MA', 700) * fs, hw = .30 * fs, g = .075 * fs, tot = wU + g + hw + g + wMA, x0 = cx - tot / 2;
    return { fs: fs, xU: x0, wU: wU, hx: x0 + wU + g + hw / 2, xMA: x0 + wU + g + hw + g, wMA: wMA, base: cy + CAP * fs / 2, hy: cy, hw: hw, hh: .075 * fs, w: tot, cy: cy };
  }
  function drawUMA(ctx, L, color, hyphen) {
    text(ctx, 'U', L.xU, L.base, L.fs, 700, color, 'left');
    text(ctx, 'MA', L.xMA, L.base, L.fs, 700, color, 'left');
    if (hyphen !== false) { ctx.fillStyle = hyphen || RED; ctx.fillRect(L.hx - L.hw / 2, L.hy - L.hh / 2, L.hw, L.hh); }
  }

  // ---------- drawing helpers ----------
  function bg(ctx, c) { ctx.fillStyle = c; ctx.fillRect(-W * 4, -H * 8, W * 9, H * 17); }   // bleeds to any screen shape
  function rrect(ctx, x, y, w, h, r, c) { ctx.fillStyle = c; ctx.beginPath(); r = Math.min(r, w / 2, h / 2); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.fill(); }
  // motion blur that follows speed and direction: the element is averaged over its own path during the shutter time
  // (oldest copy at full alpha, the i-th at 1/(i+1) — a running mean, so static elements are unchanged)
  function trail(ctx, t, fn) {
    var n = BLUR_SAMPLES, a = ctx.globalAlpha;
    for (var i = 0; i < n; i++) { ctx.globalAlpha = a / (i + 1); fn(t - (n - 1 - i) / (n - 1 || 1) * SHUTTER); }
    ctx.globalAlpha = a;
  }
  // radius functions for shape morphing (unit size)
  function rSquare(th) { return 1 / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th))); }
  function rTri(th) { var p = Math.PI / 2, b = Math.max(Math.cos(th - p), Math.cos(th - p - 2 * Math.PI / 3), Math.cos(th - p + 2 * Math.PI / 3)); return 1 / b; }
  function poly(ctx, cx, cy, rf, rot, color) {
    ctx.beginPath();
    for (var i = 0; i <= 240; i++) { var th = i / 240 * Math.PI * 2, r = rf(th), x = cx + Math.cos(th + rot) * r, y = cy + Math.sin(th + rot) * r; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  }
  var VIEW = null, layers = {};
  function layer(ctx, name) {
    var c = layers[name];
    if (!c || c.width !== ctx.canvas.width || c.height !== ctx.canvas.height) { c = document.createElement('canvas'); c.width = ctx.canvas.width; c.height = ctx.canvas.height; layers[name] = c; }
    var l = c.getContext('2d'); l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, c.width, c.height);
    l.setTransform(VIEW.s, 0, 0, VIEW.s, VIEW.ox, VIEW.oy); return l;
  }
  function blit(ctx, l, dx) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(l.canvas, (dx || 0) * VIEW.s, 0); ctx.restore(); }

  // ================= SCENES =================
  // Bar 1 (0–2 s) HOOK: a red dot → a line across → it splits the screen open → U-MA slams in
  function bar1(ctx, t) {
    bg(ctx, WHITE);
    if (t < 1) {
      var pul = t < .5 ? (t < .2 ? eOut(seg(t, 0, .2)) : 1 - eInOut(seg(t, .2, .5))) : 0;
      var st = eOut(seg(t, .5, .9)), w = lerp(32, W + 400, st) * (1 + .7 * pul), h = lerp(32, 8, st) * (1 + .7 * pul);
      rrect(ctx, CX - w / 2, CY - h / 2, w, h, h / 2, RED); return;
    }
    var g = t < 1.5 ? 380 * eOut(seg(t, 1, 1.4)) : lerp(380, H + 60, eInOut(seg(t, 1.5, 2)));
    ctx.fillStyle = BLACK; ctx.fillRect(-W, CY - g / 2, W * 3, g);
    ctx.fillStyle = RED; ctx.fillRect(-W, CY - g / 2 - 4, W * 3, 8); ctx.fillRect(-W, CY + g / 2 - 4, W * 3, 8);
    if (t >= 1.5) {
      var L = uma(ctx, CX, CY, umaFs(ctx, 1720));
      ctx.save(); ctx.beginPath(); ctx.rect(-W, CY - g / 2 + 4, W * 3, Math.max(0, g - 8)); ctx.clip();
      trail(ctx, t, function (tt) {
        var s = lerp(2.6, 1, eOut(seg(tt, 1.5, 1.85)));
        ctx.save(); ctx.translate(CX, CY); ctx.scale(s, s); ctx.translate(-CX, -CY); drawUMA(ctx, L, WHITE); ctx.restore();
      });
      ctx.restore();
    }
  }

  // Bar 2 (2–4 s) KINETIC TYPE: A VERY / CREATIVE / DESIGN / STUDIO push each other out, one per beat
  var WORDS = ['U-MA', 'A VERY', 'CREATIVE', 'DESIGN', 'STUDIO'];
  function wordAt(ctx, k, y, track) {
    if (k === 0) { var L = uma(ctx, CX, CY + y, umaFs(ctx, 1720)); drawUMA(ctx, L, WHITE); return; }
    var fs = fitFs(ctx, WORDS[k], 700, 1720, 760);
    text(ctx, WORDS[k], CX, CY + y + CAP * fs / 2, fs, 700, WHITE, 'center', track * fs);
  }
  function bar2(ctx, t) {
    bg(ctx, BLACK);
    var k = Math.min(4, 1 + Math.floor((t - 2) / .5)), T0 = 2 + (k - 1) * .5;
    trail(ctx, t, function (tt) {
      var p = eInOut(seg(tt, T0, T0 + .3)), tr = .2 * (1 - eOut(seg(tt, T0 + .1, T0 + .5)));
      if (p < 1) wordAt(ctx, k - 1, -p * H * .95, 0);
      wordAt(ctx, k, (1 - p) * H * .95, tr);
    });
  }

  // Bar 3 (4–6 s) SHAPE MORPH: STUDIO's O → disc → square → triangle → grows into white; the red hyphen is left
  function bar3(ctx, t) {
    var fs = fitFs(ctx, 'STUDIO', 700, 1720, 760), x0 = CX - mw(ctx, 'STUDIO', 700) * fs / 2, base = CY + CAP * fs / 2;
    var L4 = uma(ctx, CX, CY, umaFs(ctx, 1250));
    if (t < 5.5 || seg(t, 5.5, 5.95) < 1) bg(ctx, BLACK);
    if (t < 4.5) {
      'STUDIO'.split('').forEach(function (c, i) {
        if (i === 5) return;   // the O stays and becomes the shape; S T U D I fly off to the left
        var xi = x0 + mw(ctx, 'STUDIO'.slice(0, i), 700) * fs;
        trail(ctx, t, function (tt) { var d = -eIn(seg(tt, 4, 4.35 - (4 - i) * .02)) * 1900; text(ctx, c, xi + d, base, fs, 700, WHITE, 'left'); });
      });
      var wO = mw(ctx, 'O', 700) * fs, xo = x0 + mw(ctx, 'STUDI', 700) * fs + wO / 2, rO = CAP * fs / 2 * 1.03;
      trail(ctx, t, function (tt) {
        var p = eInOut(seg(tt, 4, 4.45)), R = lerp(rO, 260, p), sw = lerp(.165 * fs, 2 * R, eIn(p)), cx = lerp(xo, CX, p);
        ctx.beginPath(); ctx.arc(cx, CY, R, 0, Math.PI * 2); if (R - sw > 0) ctx.arc(cx, CY, R - sw, 0, Math.PI * 2, true);
        ctx.fillStyle = WHITE; ctx.fill('evenodd');
      });
      return;
    }
    if (t < 5) { var m = eInOut(seg(t, 4.5, 4.9)); poly(ctx, CX, CY, function (th) { return lerp(260, 230 * rSquare(th), m); }, lerp(0, Math.PI / 2, m), WHITE); return; }
    var m2 = eInOut(seg(t, 5, 5.4)), k = lerp(1, 9, eIn(seg(t, 5.5, 5.95)));
    poly(ctx, CX, CY, function (th) { return lerp(230 * rSquare(th), 202 * rTri(th), m2) * k; }, lerp(Math.PI / 2, 2 * Math.PI / 3, m2), WHITE);
    var hs = spring(seg(t, 5.62, 6));
    if (hs > 0) { ctx.fillStyle = RED; ctx.fillRect(CX - L4.hw * hs / 2, CY - L4.hh * hs / 2, L4.hw * hs, L4.hh * hs); }
  }

  // Bar 4 (6–8 s) 2D → 3D: the hyphen draws U-MA, the letters extrude into buildings, the camera rises to a street grid
  function cityParams(t) {
    var d = 80 * eOut(seg(t, 6.5, 6.9)), sy = 1, sk = 0, ang = -50, push = 1;
    if (t >= 7) { var m = eInOut(seg(t, 7, 7.45)); sy = lerp(1, .42, m); sk = lerp(0, -.35, m); ang = lerp(-50, -90, m); d = lerp(80, 220, m); push = lerp(1, 1.12, m); }
    if (t >= 7.5) { var n = eInOut(seg(t, 7.5, 7.9)); sy = lerp(.42, 1, n); sk = lerp(-.35, 0, n); d = lerp(220, 0, n); push = lerp(1.12, 1, n); }
    return { d: d, sy: sy, sk: sk, ang: ang * Math.PI / 180, push: push };
  }
  function grid(ctx, t) {
    ctx.fillStyle = BLACK;
    for (var i = 0; i <= 20; i++) { var e = eOut(seg(t, 7.55 + i * .004, 7.95)), l = H * e; ctx.fillRect(i * 96 - 1, CY - l / 2, 2, l); }
    for (var j = 0; j <= 11; j++) { var f = eOut(seg(t, 7.55 + j * .006, 7.95)), w = W * f; ctx.fillRect(CX - w / 2, j * 96 + 12 - 1, w, 2); }
  }
  function label(ctx, str, x, y, align, color) { text(ctx, str, x, y, 24, 500, color || BLACK, align, 7.5); }
  function bar4(ctx, t) {
    bg(ctx, WHITE);
    var L = uma(ctx, CX, CY, umaFs(ctx, 1250)), P = cityParams(t);
    if (t >= 7.5) grid(ctx, t);
    var mv = eInOut(seg(t, 6, 6.35)), hx = lerp(CX, L.hx, mv), rv = eOut(seg(t, 6.1, 6.45));
    function ground(fn) { ctx.save(); ctx.translate(CX, CY); ctx.scale(P.push, P.push); ctx.transform(1, 0, P.sk, P.sy, 0, 0); ctx.translate(-CX, -CY); fn(); ctx.restore(); }
    function letters(color) {
      var ru = rv * (L.wU + .1 * L.fs), rm = rv * (L.wMA + .1 * L.fs);
      if (ru > 0) { ctx.save(); ctx.beginPath(); ctx.rect(hx - L.hw / 2 - ru, -H, ru, H * 3); ctx.clip(); text(ctx, 'U', L.xU + (1 - rv) * L.wU * .7, L.base, L.fs, 700, color, 'left'); ctx.restore(); }
      if (rm > 0) { ctx.save(); ctx.beginPath(); ctx.rect(hx + L.hw / 2, -H, rm, H * 3); ctx.clip(); text(ctx, 'MA', L.xMA - (1 - rv) * L.wMA * .7, L.base, L.fs, 700, color, 'left'); ctx.restore(); }
    }
    // extrusion: layers stacked along the camera's "up", far ones lighter
    var step = 3, n = Math.floor(P.d / step);
    for (var k = n; k >= 1; k--) {
      var dx = Math.cos(P.ang) * k * step, dy = Math.sin(P.ang) * k * step, shade = Math.round(lerp(232, 150, 1 - k / Math.max(1, n)));
      ctx.save(); ctx.translate(dx, dy);
      ground(function () { letters('rgb(' + shade + ',' + shade + ',' + shade + ')'); ctx.fillStyle = '#a5000d'; ctx.fillRect(hx - L.hw / 2, L.hy - L.hh / 2, L.hw, L.hh); });
      ctx.restore();
    }
    ground(function () { letters(BLACK); ctx.fillStyle = RED; ctx.fillRect(hx - L.hw / 2, L.hy - L.hh / 2, L.hw, L.hh); });
    if (t >= 7.5) { var e = eOut(seg(t, 7.5, 7.85)); label(ctx, 'IN TOKYO, SHIBUYA', 120 - (1 - e) * 80, 960, 'left'); }
  }

  // Bar 5 (8–10 s) DATA / UI: the street grid falls flat into a timeline; 2000 → 2026 rolls; bars rise
  var BASE = 790, X0 = 200, STEP = 1520 / 26;
  function tickX(i) { return X0 + i * STEP; }
  function barH(i) { return 60 + 300 * hash(i) * (.55 + .45 * i / 26); }
  function odometer(ctx, v, cx, base, fs) {
    var s = '' + Math.floor(v), dw = mw(ctx, '0', 700) * fs, x = cx - dw * 2;
    var frac = v - Math.floor(v), digits = s.split('').map(Number);
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20, base - CAP * fs - 30, dw * 4 + 40, CAP * fs + 60); ctx.clip();
    for (var p = 0; p < 4; p++) {
      var roll = 0; if (p === 3) roll = frac; else if (digits.slice(p + 1).every(function (d) { return d === 9; })) roll = frac;
      var e = eInOut(roll), d0 = digits[p], d1 = (d0 + 1) % 10;
      text(ctx, '' + d0, x + p * dw, base - e * fs * 1.1, fs, 700, BLACK, 'left');
      if (e > 0) text(ctx, '' + d1, x + p * dw, base + (1 - e) * fs * 1.1, fs, 700, BLACK, 'left');
    }
    ctx.restore();
  }
  function bar5(ctx, t) {
    bg(ctx, WHITE);
    var m = eInOut(seg(t, 8, 8.4)), L = uma(ctx, CX, CY, umaFs(ctx, 1250));
    ctx.fillStyle = BLACK;
    for (var i = 0; i <= 26; i++) {           // grid lines fold into ticks
      var fx = i <= 20 ? i * 96 : W + (i - 20) * 96, tx = tickX(i), tall = i % 10 === 0 || i === 26 ? 44 : 22;
      var x = lerp(fx, tx, m), top = lerp(0, BASE - tall, m), bot = lerp(H, BASE, m);
      ctx.fillRect(x - 1, top, 2, bot - top);
    }
    var hl = lerp(W, tickX(26) - tickX(0) + 2, m);
    for (var j = 0; j <= 11; j++) ctx.fillRect(lerp(CX - W / 2, X0 - 1, m), lerp(j * 96 + 12, BASE, m) - 1, hl, 2);
    if (m < 1) {                              // the letters fold down into the baseline
      ctx.save(); ctx.translate(0, BASE); ctx.scale(1, 1 - m); ctx.translate(0, -BASE); ctx.translate(0, (BASE - CY) * m);
      text(ctx, 'U', L.xU, L.base, L.fs, 700, BLACK, 'left'); text(ctx, 'MA', L.xMA, L.base, L.fs, 700, BLACK, 'left'); ctx.restore();
      var lo = eIn(seg(t, 8, 8.3)); label(ctx, 'IN TOKYO, SHIBUYA', 120, 960 + lo * 200, 'left');
    }
    // the hyphen turns into the red marker at 2000
    var hm = eInOut(seg(t, 8, 8.4)), mh = lerp(L.hh, 120, hm) + 140 * eOut(seg(t, 9.5, 9.85)), mw_ = lerp(L.hw, 8, hm);
    var mx = lerp(L.hx, tickX(0), hm), my = lerp(L.hy, BASE - mh / 2, hm);
    // bars
    for (var b = 0; b <= 26; b++) { var e = eOut(seg(t, 9 + b * .012, 9.35 + b * .012)), h = barH(b) * e; if (h > 0) ctx.fillRect(tickX(b) - 11, BASE - h, 22, h); }
    ctx.fillStyle = RED; ctx.fillRect(mx - mw_ / 2, my - mh / 2, mw_, mh);
    // counter + cursor + labels
    if (t >= 8.5) {
      var ce = eOut(seg(t, 8.5, 8.85)), v = 2000 + 26 * eInOut(seg(t, 8.6, 9.85));
      ctx.save(); ctx.beginPath(); ctx.rect(-W, -H, W * 3, BASE - 60 + H); ctx.clip(); odometer(ctx, Math.min(v, 2026), CX, lerp(BASE + 300, 470, ce), 300); ctx.restore();
      [[0, '2000'], [10, '2010'], [20, '2020'], [26, '2026']].forEach(function (a, i) { var e = eOut(seg(t, 8.55 + i * .06, 8.85 + i * .06)); if (e > 0) text(ctx, a[1], tickX(a[0]), BASE + 44 + (1 - e) * 24, 20, 500, BLACK, 'center', 4); });
    }
    if (t >= 9) { var cx = lerp(tickX(0), tickX(26), eInOut(seg(t, 9, 9.85))); ctx.fillStyle = BLACK; ctx.fillRect(cx - .5, BASE - 420, 1, 420); ctx.fillRect(cx - 5, BASE - 425, 10, 10); }
    if (t >= 9.5) { var se = eOut(seg(t, 9.5, 9.8)); label(ctx, 'SINCE 2000', tickX(0) + 20 + (1 - se) * 60, BASE - 230, 'left', RED); }
  }

  // Bar 6 (10–12 s) MASK: the bars stand up into a black wall; U-MA opens as a window onto running type
  var LINE = 'A VERY CREATIVE DESIGN STUDIO — IN TOKYO, SHIBUYA — SINCE 2000 — ';
  function marquee(ctx, t) {
    bg(ctx, WHITE);
    var steps = 0; for (var b = 10.5; b < 12; b += .5) steps += eOut(seg(t, b, b + .3));
    var fs = 44, lw = mw(ctx, LINE, 700) * fs + 0;
    for (var r = 0; r < 18; r++) {
      var dir = r % 2 ? 1 : -1, off = ((dir * steps * 380 + r * 233) % lw + lw) % lw;
      for (var x = -off - lw; x < W + lw; x += lw) text(ctx, LINE, x, 70 + r * 62, fs, 700, BLACK, 'left');
    }
  }
  function windowLayer(ctx, t) {
    var l = layer(ctx, 'wall');
    l.fillStyle = BLACK; l.fillRect(-W, -H, W * 3, H * 3);
    var sc = eOut(seg(t, 10.5, 10.95)) * lerp(1, 1.06, seg(t, 11, 12));
    var L = uma(l, CX, CY, umaFs(l, 1720));
    l.save(); l.translate(L.hx, CY); l.scale(sc, sc); l.translate(-L.hx, -CY);
    l.globalCompositeOperation = 'destination-out'; drawUMA(l, L, '#000', false); l.globalCompositeOperation = 'source-over';
    l.fillStyle = RED; l.fillRect(L.hx - L.hw / 2, L.hy - L.hh / 2, L.hw, L.hh); l.restore();
    return l;
  }
  function bar6(ctx, t) {
    if (t < 10.5) {
      bar5(ctx, 9.999); ctx.fillStyle = BLACK;
      for (var i = 0; i <= 26; i++) {
        var m = eInOut(seg(t, 10 + i * .006, 10.38 + i * .006)), x = tickX(i), h = barH(i);
        var left = lerp(x - 11, i === 0 ? -40 : x - STEP / 2 - 1, m), right = lerp(x + 11, i === 26 ? W + 40 : x + STEP / 2 + 1, m);
        var top = lerp(BASE - h, -40, m), bot = lerp(BASE, H + 40, m);
        ctx.fillRect(left, top, right - left, bot - top);
      }
      return;
    }
    marquee(ctx, t); blit(ctx, windowLayer(ctx, t));
  }

  // Bar 7 (12–14 s) STRONGEST: the wall leaves in slices on 8th notes; each slice snaps a slice of the giant U-MA into place
  var ORDER = [3, 4, 2, 5, 1, 6, 0, 7];   // slice index → hit number (center out)
  function bar7(ctx, t) {
    var hits = ORDER.map(function (o) { return 12 + o * .25; }), sh = H / 8;
    var Lg = uma(ctx, CX, CY, umaFs(ctx, 1720));
    var last = 12; hits.forEach(function (h) { if (t >= h && h > last) last = h; });
    var push = 1 + .05 * (1 - eOut(seg(t, last, last + .25)));
    bg(ctx, WHITE);
    for (var k = 0; k < 8; k++) {
      (function (k) {
        ctx.save(); ctx.beginPath(); ctx.rect(-W, k === 0 ? -H : k * sh, W * 3, k === 0 || k === 7 ? sh + H : sh); ctx.clip();
        trail(ctx, t, function (tt) {
          var dx = (k % 2 ? 1 : -1) * 700 * (1 - eOut(seg(tt, hits[k], hits[k] + .25)));
          ctx.save(); ctx.translate(dx, 0); ctx.translate(CX, CY); ctx.scale(push, push); ctx.translate(-CX, -CY); drawUMA(ctx, Lg, BLACK, false); ctx.restore();
        });
        ctx.restore();
      })(k);
    }
    // the red hyphen: snaps in with the middle slices, then on the last hit stretches across the screen and back
    var str = t < 13.75 ? 0 : eOut(seg(t, 13.75, 13.88)) * (1 - eInOut(seg(t, 13.88, 14)));
    var hw = Lg.hw * push * (1 + 9 * str);
    ctx.fillStyle = RED; ctx.fillRect(Lg.hx - hw / 2, Lg.hy - Lg.hh * push / 2, hw, Lg.hh * push);
    // the wall, sliced
    var wall = windowLayer(ctx, 11.999);
    var mq = layer(ctx, 'mq'); marquee(mq, 11.999); mq.save(); mq.setTransform(1, 0, 0, 1, 0, 0); mq.drawImage(wall.canvas, 0, 0); mq.restore();
    for (var j = 0; j < 8; j++) {
      (function (j) {
        if (t >= hits[j] + .2) return;
        ctx.save(); ctx.beginPath(); ctx.rect(-W, j === 0 ? -H : j * sh, W * 3, j === 0 || j === 7 ? sh + H : sh); ctx.clip();
        trail(ctx, t, function (tt) { var dx = (j % 2 ? -1 : 1) * (W + 200) * eIn(seg(tt, hits[j], hits[j] + .2)); blit(ctx, mq, dx); });
        ctx.restore();
      })(j);
    }
  }

  // Bar 8, first half (14–15 s) END TITLE, then everything folds back into the red dot of frame 1
  function bar8(ctx, t) {
    bg(ctx, WHITE);
    var Lg = uma(ctx, CX, CY, umaFs(ctx, 1720)), Lf = uma(ctx, CX, CY, umaFs(ctx, 1080));
    var a = eInOut(seg(t, 14, 14.3)), fs = lerp(Lg.fs, Lf.fs, a), L = uma(ctx, CX, CY, fs);
    var out = eIn(seg(t, 14.5, 14.85)), dot = eInOut(seg(t, 14.5, 15));
    var inn = eOut(seg(t, 14, 14.3)), slide = (1 - inn) * 900 + out * 1500;
    label(ctx, 'A VERY CREATIVE DESIGN STUDIO', 120 - slide, 150, 'left');
    label(ctx, 'IN TOKYO, SHIBUYA', 120 - slide, 960, 'left');
    label(ctx, 'SINCE 2000', 1800 + slide, 960, 'right');
    var hx = lerp(L.hx, CX, dot);
    trail(ctx, t, function (tt) {
      var o = eIn(seg(tt, 14.5, 14.85)), s = 1 - o;
      if (s <= 0) return;
      ctx.save(); ctx.translate(hx, CY); ctx.scale(s, s); ctx.translate(-L.hx, -CY); drawUMA(ctx, L, BLACK, false); ctx.restore();
    });
    var w = lerp(L.hw, 32, dot), h = lerp(L.hh, 32, dot);
    rrect(ctx, hx - w / 2, CY - h / 2, w, h, lerp(0, 16, dot), RED);
  }

  function draw(ctx, t, pw, ph) {
    t = ((t % DUR) + DUR) % DUR;
    var s = Math.min(pw / W, ph / H);
    VIEW = { s: s, ox: (pw - W * s) / 2, oy: (ph - H * s) / 2 };
    ctx.setTransform(s, 0, 0, s, VIEW.ox, VIEW.oy);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (t < 2) bar1(ctx, t); else if (t < 4) bar2(ctx, t); else if (t < 6) bar3(ctx, t); else if (t < 8) bar4(ctx, t);
    else if (t < 10) bar5(ctx, t); else if (t < 12) bar6(ctx, t); else if (t < 14) bar7(ctx, t); else bar8(ctx, t);
  }

  global.UMA_REEL = { W: W, H: H, DUR: DUR, init: init, draw: draw, setBlurSamples: function (n) { BLUR_SAMPLES = Math.max(1, n | 0); } };
})(typeof window !== 'undefined' ? window : this);
