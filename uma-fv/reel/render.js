// node render.js beats|full <outdir>
//   beats: one frame per beat (mid-beat) + a contact sheet, to check before the full render
//   full : 60 fps, 3 subframes per frame blended with ffmpeg tmix, plus the code-written soundtrack → MP4
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const [mode, out] = [process.argv[2] || 'beats', process.argv[3] || 'out'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'showreel.html'));
  await p.evaluate(() => window.ready);
  const shot = async (t, file) => { await p.evaluate(t => seek(t), t); await p.screenshot({ path: file, type: 'png' }); };
  if (mode === 'beats') {
    const dir = path.join(out, 'beats'); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < 30; i++) await shot(i * .5 + .25, path.join(dir, `b${String(i).padStart(2, '0')}.png`));
    await shot(0, path.join(dir, 'loop_start.png')); await shot(14.999, path.join(dir, 'loop_end.png'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'b%02d.png'), '-vf', 'scale=384:216,tile=6x5:padding=6:color=0x888888', '-frames:v', '1', path.join(out, 'contact.png')]);
  } else {
    const dir = path.join(out, 'frames'); fs.mkdirSync(dir, { recursive: true });
    const N = 15 * 60;
    for (let f = 0; f < N; f++) for (let s = 0; s < 3; s++) await shot((f + s / 3) / 60, path.join(dir, `${String(f * 3 + s).padStart(5, '0')}.png`));
    const wav = await p.evaluate(() => renderAudio());
    fs.writeFileSync(path.join(out, 'sound.wav'), Buffer.from(wav, 'base64'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '180', '-i', path.join(dir, '%05d.png'),
      '-vf', "tmix=frames=3,select='eq(mod(n\\,3)\\,2)',setpts=N/(60*TB)", '-r', '60', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', path.join(out, 'video.mp4')]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'video.mp4'), '-i', path.join(out, 'sound.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', path.join(out, 'U-MA_showreel.mp4')]);
  }
  console.log('errors', errs);
  await b.close();
})();
