(function () {
  const cockpit = document.getElementById('cockpit');
  if (!cockpit) return;

  const body = document.body;
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bubble = cockpit.querySelector('#bubble');
  const scenes = Array.from(cockpit.querySelectorAll('.scene[data-scene]'));
  const specimens = Array.from(cockpit.querySelectorAll('.specimen'));
  const dangerWrap = cockpit.querySelector('.danger-wrap');
  const dangerBtn = cockpit.querySelector('.danger');
  const links = { hill: 'bachelor/index.html' };
  let lockedScene = null;
  let alertTimer = null;
  let busy = false;
  let presses = 0;

  const copy = {
    none: 'Hover a floating photo. The windshield changes its weather.',
    hill: 'Hold on tight. That slope up ahead is a big one. Click to climb it.',
    future: 'Loading driver file: 2002. The future is still being written.',
    exit: 'See that EXIT? Click it and we fly home to the planet.',
    sweet: 'Shh. Sweet memories live here. Not open yet.',
    radio: 'SPACE FM is on. The apple knows every word.',
    apple: 'Bleh. Do not poke the singer.',
    fish: 'Blub. The fish is my co-pilot. It is watching you.',
    danger1: 'I said do not press it.',
    danger2: 'That was twice. The bottle is starting to wobble.',
    danger3: 'BOOM.',
    exiting: 'Exit found. Hold on to something.'
  };

  const flash = document.createElement('div');
  flash.className = 'ck-flash';
  document.body.appendChild(flash);

  function say(text) { bubble.textContent = text; }

  function setScene(name) {
    cockpit.dataset.active = name || 'none';
    say(copy[name] || copy.none);
    specimens.forEach(function (item) {
      item.classList.toggle('is-locked', item.dataset.scene === name && lockedScene === name);
    });
    scenes.forEach(function (scene) {
      scene.classList.toggle('is-active', scene.dataset.scene === name);
    });
  }

  function clearScene() {
    if (!lockedScene && !busy) setScene('none');
  }

  /* ---------- Rive props, created the first time the cockpit opens ---------- */
  const rigs = {};
  let riveStarted = false;
  let fishLookX = null;
  let fishLookY = null;
  let fridgeAnim = null;

  function crisp(r, canvas) {
    const box = canvas.getBoundingClientRect();
    if (!box.width) return;
    const ratio = Math.min(3, Math.max(2, 320 / box.width));
    try { r.resizeDrawingSurfaceToCanvas(ratio); } catch (e) { try { r.resizeDrawingSurfaceToCanvas(); } catch (e2) {} }
  }

  function rivBuffer(file) {
    const b64 = window.RIVE_DATA && window.RIVE_DATA[file.replace(/\.riv$/, '')];
    if (!b64) return null;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function makeRig(key, canvasId, file, cfg, onLoad) {
    const canvas = document.getElementById(canvasId);
    const buffer = rivBuffer(file);
    if (!canvas || !window.rive || !buffer) return;
    const r = new window.rive.Rive(Object.assign({
      buffer: buffer,
      canvas: canvas,
      autoplay: true,
      layout: new window.rive.Layout({ fit: window.rive.Fit.Contain, alignment: window.rive.Alignment.Center }),
      onLoad: function () {
        crisp(r, canvas);
        if (onLoad) onLoad(r);
      }
    }, cfg));
    rigs[key] = { r: r, canvas: canvas, cfg: cfg };
  }

  // the runtime (wasm bundled in) and the .riv files are local scripts, so this also
  // works offline and when index.html is opened straight from disk
  let riveLoading = null;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const tag = document.createElement('script');
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = reject;
      document.head.appendChild(tag);
    });
  }

  function startRive() {
    if (riveStarted) return;
    if (!window.rive || !window.RIVE_DATA) {
      if (!riveLoading) {
        riveLoading = Promise.all([
          window.rive ? null : loadScript('assets/vendor/rive-canvas-single.js'),
          window.RIVE_DATA ? null : loadScript('assets/rive/rive-data.js?v=1')
        ]).then(startRive, function () { riveLoading = null; });
      }
      return;
    }
    riveStarted = true;
    const SM = { stateMachines: 'State Machine 1' };
    makeRig('appleIdle', 'cv-apple-idle', 'apple-idle.riv', SM);
    makeRig('appleReveal', 'cv-apple-reveal', 'apple-revealed.riv', { animations: ['tongue out', 'lookleft', 'blink'] });
    makeRig('bottleIdle', 'cv-bottle-idle', 'bottle-idle.riv', SM);
    makeRig('bottleHover', 'cv-bottle-hover', 'bottle-hover.riv', SM);
    makeRig('bottleClick', 'cv-bottle-click', 'bottle-click.riv', SM);
    makeRig('fish', 'cv-fish', 'fish.riv', { stateMachines: 'State Machine 1', autoBind: true }, function (r) {
      try {
        let inst = r.viewModelInstance;
        if (!inst) {
          const vm = r.viewModelByIndex(0);
          inst = vm && (vm.defaultInstance() || vm.instanceByIndex(0));
          if (inst) r.bindViewModelInstance(inst);
        }
        if (inst) {
          fishLookX = inst.number('lookX');
          fishLookY = inst.number('lookY');
          if (fishLookX) { fishLookX.value = 0; fishLookY.value = 0; }
        }
      } catch (e) { fishLookX = fishLookY = null; }
      startFishCopy();
    });
    makeRig('fridge', 'cv-fridge', 'fridge-reject.riv', { autoplay: false }, function (r) {
      fridgeAnim = r.animationNames && r.animationNames[0];
      shutFridge();
    });
    setTimeout(function () {
      Object.keys(rigs).forEach(function (k) { crisp(rigs[k].r, rigs[k].canvas); });
    }, 1200);
  }

  // the fish artwork comes on a pink plate; draw each Rive frame onto a second canvas
  // and drop the plate's pink fill and outline (bottom part of the artboard only), so
  // just the fish sits in the bowl
  let fishLoop = null;
  function startFishCopy() {
    const src = document.getElementById('cv-fish');
    const out = document.getElementById('cv-fish-out');
    if (!src || !out || fishLoop) return;
    const ctx = out.getContext('2d', { willReadFrequently: true });
    let last = 0;
    function tick(now) {
      fishLoop = requestAnimationFrame(tick);
      if (!body.classList.contains('cockpit-open') || now - last < 33) return;
      last = now;
      const w = src.width;
      const h = src.height;
      if (!w || !h) return;
      if (out.width !== w || out.height !== h) { out.width = w; out.height = h; }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(src, 0, 0);
      const y0 = Math.floor(h * 0.57);
      const img = ctx.getImageData(0, y0, w, h - y0);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const pinkish = r > 90 && r - g > 40 && r - b > 20;
        const inky = r < 75 && g < 75 && b < 75 && g - r < 18;
        if (pinkish || inky) d[i + 3] = 0;
      }
      ctx.putImageData(img, 0, y0);
    }
    fishLoop = requestAnimationFrame(tick);
  }

  function shutFridge() {
    const rig = rigs.fridge;
    if (!rig || !fridgeAnim) return;
    try { rig.r.play(fridgeAnim); rig.r.pause(fridgeAnim); rig.r.scrub(fridgeAnim, 0); } catch (e) {}
  }

  function replay(key) {
    const rig = rigs[key];
    if (!rig) return;
    try {
      rig.r.reset(Object.assign({ autoplay: true }, rig.cfg));
      crisp(rig.r, rig.canvas);
    } catch (e) {}
  }

  function show(group, key) {
    cockpit.querySelectorAll('.' + group + '-slot .rive-cv').forEach(function (cv) { cv.classList.remove('is-on'); });
    const id = { appleIdle: 'cv-apple-idle', appleReveal: 'cv-apple-reveal', bottleIdle: 'cv-bottle-idle', bottleHover: 'cv-bottle-hover', bottleClick: 'cv-bottle-click' }[key];
    const cv = document.getElementById(id);
    if (cv) cv.classList.add('is-on');
    if (key !== 'appleIdle' && key !== 'bottleIdle') replay(key);
  }

  new MutationObserver(function () {
    if (body.classList.contains('cockpit-open')) startRive();
    else resetCockpit();
  }).observe(body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('pointermove', function (e) {
    if (!fishLookX || !body.classList.contains('cockpit-open')) return;
    const box = document.getElementById('cv-fish').getBoundingClientRect();
    if (!box.width) return;
    const ex = box.left + box.width * 0.335;
    const ey = box.top + box.height * 0.29;
    const dx = e.clientX - ex;
    const dy = e.clientY - ey;
    const dist = Math.hypot(dx, dy) || 1;
    const s = Math.min(1, dist / 280);
    const px = (dx / dist) * s;
    const py = (dy / dist) * s;
    fishLookX.value = px * 12 + py * (-15);
    fishLookY.value = px * 10 + py * 13;
  });

  /* ---------- going home: shared by Exit, the explosion and the back button ---------- */
  function resetCockpit() {
    busy = false;
    presses = 0;
    lockedScene = null;
    cockpit.classList.remove('exiting', 'shake-hard', 'alerting');
    if (dangerWrap) dangerWrap.classList.remove('p1', 'p2');
    show('bottle', 'bottleIdle');
    show('apple', 'appleIdle');
    shutFridge();
    cockpit.querySelectorAll('.stage *').forEach(function (el) {
      el.getAnimations().forEach(function (a) { if (a.id === 'ck-fly') a.cancel(); });
    });
    setScene('none');
  }

  function landOnPlanet(fadeMs) {
    cockpit.style.transition = 'none';
    body.classList.remove('cockpit-open');
    if (!body.classList.contains('stage-close')) body.classList.add('stage-close');
    void cockpit.offsetHeight;
    requestAnimationFrame(function () { requestAnimationFrame(function () { cockpit.style.transition = ''; }); });
    const fade = flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeMs, easing: 'ease-out', fill: 'forwards' });
    function clearFlash() {
      flash.getAnimations().forEach(function (a) { a.cancel(); });
      flash.style.opacity = '0';
      flash.className = 'ck-flash';
      document.querySelectorAll('.ck-debris').forEach(function (d) { d.remove(); });
    }
    fade.onfinish = clearFlash;
    setTimeout(clearFlash, fadeMs + 150);
  }

  function exitHome() {
    if (busy) return;
    busy = true;
    lockedScene = 'exit';
    setScene('exit');
    say(copy.exiting);
    if (RM) { flash.className = 'ck-flash on exit-light'; flash.style.opacity = '1'; landOnPlanet(1); return; }
    cockpit.classList.add('exiting');
    setTimeout(function () {
      const rig = rigs.fridge;
      if (rig && fridgeAnim) { try { rig.r.play(fridgeAnim); } catch (e) {} }
    }, 520);
    setTimeout(function () {
      flash.className = 'ck-flash on exit-light';
      flash.getAnimations().forEach(function (a) { a.cancel(); });
      flash.animate([
        { opacity: 1, clipPath: 'circle(0% at 50% 31%)' },
        { opacity: 1, clipPath: 'circle(150% at 50% 31%)' }
      ], { duration: 650, easing: 'cubic-bezier(0.6, 0, 0.9, 0.6)', fill: 'forwards' });
    }, 1150);
    setTimeout(function () {
      flash.getAnimations().forEach(function (a) { a.cancel(); });
      flash.style.opacity = '1';
      landOnPlanet(900);
    }, 1850);
  }

  function shake(ms) {
    cockpit.classList.add('alerting');
    clearTimeout(alertTimer);
    alertTimer = setTimeout(function () { cockpit.classList.remove('alerting'); }, ms);
  }

  function pressDanger() {
    if (busy) return;
    presses += 1;
    if (presses === 1) {
      say(copy.danger1);
      dangerWrap.classList.add('p1');
      show('bottle', 'bottleHover');
      shake(700);
    } else if (presses === 2) {
      say(copy.danger2);
      dangerWrap.classList.remove('p1');
      dangerWrap.classList.add('p2');
      show('bottle', 'bottleClick');
      shake(1100);
    } else {
      explode();
    }
  }

  function explode() {
    busy = true;
    say(copy.danger3);
    const b = dangerBtn.getBoundingClientRect();
    const cx = b.left + b.width / 2;
    const cy = b.top + b.height / 2;
    flash.className = 'ck-flash on boom-light';
    flash.style.setProperty('--bx', cx + 'px');
    flash.style.setProperty('--by', cy + 'px');
    flash.getAnimations().forEach(function (a) { a.cancel(); });

    if (RM) { flash.style.opacity = '1'; landOnPlanet(1); return; }

    cockpit.classList.add('shake-hard');
    const colors = ['#ff7b26', '#ffe45e', '#ff2b38', '#12a5ff', '#f7f2df', '#39ef6d', '#050505'];
    for (let i = 0; i < 70; i++) {
      const d = document.createElement('div');
      const size = 6 + Math.random() * 24;
      d.className = 'ck-debris';
      d.style.left = cx + 'px';
      d.style.top = cy + 'px';
      d.style.width = size + 'px';
      d.style.height = size * (0.4 + Math.random() * 0.8) + 'px';
      d.style.background = colors[i % colors.length];
      d.style.border = '2px solid #000';
      d.style.borderRadius = Math.random() < 0.4 ? '50%' : '3px';
      document.body.appendChild(d);
      const ang = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 700;
      const a = d.animate([
        { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(ang) * dist) + 'px,' + (Math.sin(ang) * dist - 120) + 'px) rotate(' + (Math.random() * 900 - 450) + 'deg) scale(0.6)', opacity: 0 }
      ], { duration: 900 + Math.random() * 600, delay: 260, easing: 'cubic-bezier(0.15, 0.7, 0.3, 1)', fill: 'backwards' });
      a.onfinish = function () { d.remove(); };
    }

    setTimeout(function () {
      flash.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0.85 }], { duration: 420, fill: 'forwards' });
      const parts = cockpit.querySelectorAll('.window-world, .window-frame, .dashboard, .seat, .monster, .props, .specimen, .title-scribble, .bubble, .tap-note, .ck-back');
      parts.forEach(function (el) {
        const base = getComputedStyle(el).transform;
        const from = base === 'none' ? '' : base;
        const ang = Math.random() * Math.PI * 2;
        const dist = 500 + Math.random() * 600;
        const anim = el.animate([
          { transform: from + ' translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: from + ' translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 200) + 'px) rotate(' + (Math.random() * 120 - 60) + 'deg)', opacity: 0 }
        ], { duration: 1100, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)', fill: 'forwards' });
        anim.id = 'ck-fly';
      });
    }, 260);

    setTimeout(function () {
      cockpit.classList.remove('shake-hard');
      flash.getAnimations().forEach(function (a) { a.cancel(); });
      flash.className = 'ck-flash on blackout';
      flash.animate([{ opacity: 0.85 }, { opacity: 1 }], { duration: 300, fill: 'forwards' });
    }, 1250);

    setTimeout(function () {
      flash.getAnimations().forEach(function (a) { a.cancel(); });
      flash.style.opacity = '1';
      landOnPlanet(1100);
    }, 1650);
  }

  /* ---------- wiring ---------- */
  specimens.forEach(function (item) {
    const name = item.dataset.scene;
    item.addEventListener('mouseenter', function () { if (!busy) setScene(name); });
    item.addEventListener('mouseleave', clearScene);
    item.addEventListener('focus', function () { if (!busy) setScene(name); });
    item.addEventListener('blur', clearScene);
    item.addEventListener('click', function () {
      if (busy) return;
      if (name === 'exit') { exitHome(); return; }
      if (links[name]) { window.location.href = links[name]; return; }
      lockedScene = lockedScene === name ? null : name;
      setScene(lockedScene || name);
    });
  });

  cockpit.querySelectorAll('.prop').forEach(function (prop) {
    prop.addEventListener('click', function () {
      const type = prop.dataset.prop;
      if (type === 'danger') { pressDanger(); return; }
      if (busy) return;
      say(copy[type]);
    });
  });

  // poke the apple: tongue out for 3 s, then back to its idle song
  const appleHit = cockpit.querySelector('.apple-hit');
  let appleTimer = null;
  if (appleHit) appleHit.addEventListener('click', function () {
    if (busy) return;
    say(copy.apple);
    show('apple', 'appleReveal');
    clearTimeout(appleTimer);
    appleTimer = setTimeout(function () { show('apple', 'appleIdle'); }, 3000);
  });

  bubble.addEventListener('click', function () {
    if (busy) return;
    const order = ['hill', 'future', 'exit', 'sweet'];
    const next = order[(order.indexOf(cockpit.dataset.active) + 1) % order.length] || 'hill';
    lockedScene = next;
    setScene(next);
  });

  const back = cockpit.querySelector('#ck-back');
  if (back) back.addEventListener('click', function () {
    body.classList.remove('cockpit-open');
  });

  if (body.classList.contains('cockpit-open')) startRive();
})();
