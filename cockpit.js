(function () {
  const cockpit = document.getElementById('cockpit');
  if (!cockpit) return;

  const body = document.body;
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bubble = cockpit.querySelector('#bubble');
  const title = cockpit.querySelector('.title-scribble');
  const radio = cockpit.querySelector('.radio');
  const radioWrap = cockpit.querySelector('.radio-wrap');
  const radioPeek = cockpit.querySelector('.radio-peek');
  const radioDialog = document.getElementById('space-fm');
  const radioPlaylist = radioDialog.querySelector('#fm-playlist');
  const radioMount = radioDialog.querySelector('#fm-embed');
  const radioLoading = radioDialog.querySelector('.fm-loading');
  const radioLink = radioDialog.querySelector('.fm-open');
  const scenes = Array.from(cockpit.querySelectorAll('.scene'));
  const views = ['none', 'hill', 'future', 'exit', 'sweet'];
  const specimens = Array.from(cockpit.querySelectorAll('.specimen'));
  const dangerWrap = cockpit.querySelector('.danger-wrap');
  const dangerBtn = cockpit.querySelector('.danger');
  const links = { hill: 'bachelor/index.html' };
  let lockedScene = null;
  let alertTimer = null;
  let busy = false;
  let presses = 0;
  let noteIndex = 0;
  let noteTimer = null;
  let fishBubbleTimer = null;
  let titleCloseTimer = null;
  let radioController = null;
  let radioReady = false;
  let radioRequested = false;
  let radioPending = null;
  let radioScript = null;

  const notes = [
    SiteLanguage.text('The fish insisted on coming.', "那条鱼坚持要跟来。"),
    SiteLanguage.text('Somewhere between here and whatever comes next.', "在这里和下一站之间。"),
    SiteLanguage.text('We packed a few things. Mostly memories.', "带了几样东西。大多是回忆。"),
    SiteLanguage.text('No arrival time yet.', "还没定什么时候到。")
  ];

  const copy = {
    hill: SiteLanguage.text('I remember it being steeper.', "记得那个坡更陡来着。"),
    future: SiteLanguage.text('Still figuring this one out.', "这件事还在想。"),
    exit: SiteLanguage.text('A way out. Or a way into something else.', "一个出口。也可能是别处的入口。"),
    sweet: SiteLanguage.text('Keeping these for no particular reason.', "这些东西，就这么留着了。"),
    radio: SiteLanguage.text('Same song. Again.', "又是同一首歌。"),
    apple: SiteLanguage.text('You interrupted the good part.', "你刚好打断了最精彩的地方。"),
    fish: SiteLanguage.text('It has strong opinions about the route.', "它对路线很有意见。"),
    fishClick: SiteLanguage.text('Fine. You navigate.', "好吧。你来导航。"),
    bottle: SiteLanguage.text('Probably best left unopened.', "这瓶还是别开了。"),
    danger1: SiteLanguage.text('That was definitely a button.', "那确实是个按钮。"),
    danger2: SiteLanguage.text('The fish would like to leave.', "那条鱼想下船了。"),
    danger3: SiteLanguage.text('Well.', "嗯……")
  };

  const flash = document.createElement('div');
  flash.className = 'ck-flash';
  document.body.appendChild(flash);

  function scheduleNote() {
    clearTimeout(noteTimer);
    if (!body.classList.contains('cockpit-open') || document.hidden || busy) return;
    noteTimer = setTimeout(function () {
      const occupied = cockpit.querySelector('.specimen:hover, .specimen:focus-visible, .prop:hover, .prop:focus-visible, .apple-hit:hover, .apple-hit:focus-visible, .bottle-slot:hover, .window-cycle:hover, .window-cycle:focus-visible');
      if (lockedScene || occupied) { scheduleNote(); return; }
      nextNote();
    }, 11000);
  }

  function say(text) {
    if (bubble.textContent !== text) {
      bubble.textContent = text;
      bubble.getAnimations().forEach(function (a) { a.cancel(); });
      if (!RM) bubble.animate([
        { opacity: 0, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 650, easing: 'ease-out' });
    }
    scheduleNote();
  }

  function nextNote() {
    noteIndex = (noteIndex + 1) % notes.length;
    say(notes[noteIndex]);
  }

  function setScene(name) {
    cockpit.dataset.active = name || 'none';
    say(copy[name] || notes[noteIndex]);
    specimens.forEach(function (item) {
      item.classList.toggle('is-locked', item.dataset.scene === name && lockedScene === name);
    });
    scenes.forEach(function (scene) {
      scene.classList.toggle('is-active', (scene.dataset.scene || 'none') === (name || 'none'));
    });
  }

  function clearScene() {
    if (!busy) setScene(lockedScene || 'none');
  }

  /* ---------- Rive props, created the first time the cockpit opens ---------- */
  const rigs = {};
  let riveStarted = false;
  let fishLookX = null;
  let fishLookY = null;

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

  const props = cockpit.querySelectorAll('.props :is(.radio-wrap, .fish-prop, .danger, .bottle-slot, .apple-slot)');
  const propAnchors = [[27, 91], [41, 89], [55, 91], [68, 91], [76, 75], [65, 10.25]];
  let previousLayout = '';
  let cockpitWasOpen = false;

  function scatterProps() {
    const slots = [0, 1, 2, 3, 4, 5];
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }

    if (slots.join('') === previousLayout) slots.push(slots.shift());
    previousLayout = slots.join('');
    props.forEach(function (prop, index) {
      const slot = slots[index];
      const [left, top] = propAnchors[slot];
      prop.style.setProperty('--prop-left', left + '%');
      prop.style.setProperty('--prop-top', top + '%');
      prop.style.setProperty('--float-period', (5.2 + Math.random() * 3.5).toFixed(2) + 's');
      prop.style.setProperty('--float-phase', (-Math.random() * 5).toFixed(2) + 's');
      prop.style.setProperty('--prop-row', Math.floor(slot / 3) + 1);
      prop.style.setProperty('--prop-column', slot % 3 + 1);
      prop.style.setProperty('--prop-x', Math.round(Math.random() * 12 - 6) + 'px');
      prop.style.setProperty('--prop-y', Math.round(Math.random() * 10 - 5) + 'px');
      prop.style.setProperty('--prop-tilt', Math.round(Math.random() * 12 - 6) + 'deg');
    });
  }

  function syncCockpit() {
    const isOpen = body.classList.contains('cockpit-open');
    if (isOpen === cockpitWasOpen) return;
    cockpitWasOpen = isOpen;
    if (isOpen) {
      scatterProps();
      positionRadioPeek();
      startRive();
      startRadioPlayer();
      scheduleNote();
    } else {
      resetCockpit();
    }
  }

  new MutationObserver(syncCockpit).observe(body, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('pointermove', function (e) {
    if (!fishLookX || !body.classList.contains('cockpit-open')) return;
    const box = document.getElementById('cv-fish-out').getBoundingClientRect();
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
    setTitleOpen(false);
    radioRequested = false;
    radioPending = false;
    updateRadioState();
    if (radioController) radioController.pause();
    if (radioDialog.matches(':popover-open')) radioDialog.hidePopover();
    busy = false;
    presses = 0;
    lockedScene = null;
    clearTimeout(noteTimer);
    clearTimeout(fishBubbleTimer);
    const fish = cockpit.querySelector('.fish-prop');
    if (fish) fish.classList.remove('is-bubbling');
    cockpit.classList.remove('shake-hard', 'alerting');
    if (dangerWrap) dangerWrap.classList.remove('p1', 'p2');
    show('bottle', 'bottleIdle');
    show('apple', 'appleIdle');
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
      const parts = cockpit.querySelectorAll('.ck-window, .monster, .props, .specimen, .title-scribble, .bubble, .ck-back');
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

  function setTitleOpen(open) {
    clearTimeout(titleCloseTimer);
    title.classList.toggle('is-open', open);
    title.setAttribute('aria-pressed', String(open));
  }

  function updateRadioState() {
    radio.setAttribute('aria-pressed', String(radioRequested));
    radio.setAttribute('aria-busy', String(radioRequested && !radioReady));
  }

  function positionRadioPeek() {
    const right = radio.getBoundingClientRect().right;
    radioWrap.classList.toggle('peek-left', right + radioPeek.offsetWidth + 16 > window.innerWidth);
  }

  function startRadioPlayer() {
    if (radioScript) return;
    radioLoading.hidden = false;
    radioLoading.textContent = SiteLanguage.text('Tuning in…', '正在调频…');
    window.onSpotifyIframeApiReady = function (api) {
      api.createController(radioMount.querySelector('#fm-spotify'), {
        uri: 'spotify:playlist:' + radioPlaylist.value,
        width: '100%',
        height: 352
      }, function (controller) {
        radioController = controller;
        const frame = radioMount.querySelector('iframe');
        frame.className = 'fm-player';
        frame.loading = 'eager';
        frame.title = 'Spotify Embed: ' + radioPlaylist.selectedOptions[0].textContent;
        frame.style.borderRadius = '12px';
        controller.addListener('ready', function () {
          radioReady = true;
          radioLoading.hidden = true;
          updateRadioState();
          if (radioRequested) {
            radioPending = true;
            controller.resume();
          } else radioPending = null;
        });
        controller.addListener('playback_update', function (event) {
          if (!radioReady) return;
          const playing = !event.data.isPaused;
          const detailsOpen = radioDialog.matches(':popover-open');
          if (!detailsOpen && !radioRequested && playing) {
            controller.pause();
            return;
          }
          if (radioPending !== null) {
            if (playing === radioPending) radioPending = null;
            return;
          }
          if (detailsOpen) {
            radioRequested = playing;
            updateRadioState();
          }
        });
      });
    };
    radioScript = document.createElement('script');
    radioScript.src = 'https://open.spotify.com/embed/iframe-api/v1';
    radioScript.async = true;
    radioScript.onerror = function () {
      radioScript.remove();
      radioScript = null;
      radioRequested = false;
      updateRadioState();
      radioLoading.hidden = false;
      radioLoading.textContent = SiteLanguage.text(
        'Spotify could not load. Open the playlist using the link below.',
        'Spotify 暂时无法加载，可以通过下方链接打开歌单。'
      );
    };
    document.body.appendChild(radioScript);
  }

  function loadRadioPlaylist() {
    const id = radioPlaylist.value;
    const name = radioPlaylist.selectedOptions[0].textContent;
    radioLink.href = 'https://open.spotify.com/playlist/' + id;
    radioPeek.querySelector('.fm-peek-title').textContent = name;
    radioLoading.hidden = false;
    if (radioController) {
      radioReady = false;
      radioPending = null;
      updateRadioState();
      radioController.loadEntity('spotify:playlist:' + id);
      radioMount.querySelector('iframe').title = 'Spotify Embed: ' + name;
    }
    startRadioPlayer();
  }

  /* ---------- wiring ---------- */
  radioPlaylist.addEventListener('change', loadRadioPlaylist);
  radioPeek.addEventListener('click', startRadioPlayer);
  radioWrap.addEventListener('pointerenter', positionRadioPeek);
  radioWrap.addEventListener('focusin', positionRadioPeek);
  window.addEventListener('resize', positionRadioPeek);
  radioDialog.addEventListener('wheel', function (event) {
    event.stopPropagation();
  }, { passive: true });
  radioDialog.addEventListener('toggle', function () {
    radioPeek.setAttribute('aria-expanded', String(radioDialog.matches(':popover-open')));
  });

  title.addEventListener('pointerenter', function (event) {
    if (event.pointerType === 'mouse') setTitleOpen(true);
  });
  title.addEventListener('pointerleave', function (event) {
    if (event.pointerType === 'mouse') {
      titleCloseTimer = setTimeout(function () { setTitleOpen(false); }, 3000);
    }
  });
  title.addEventListener('click', function (event) {
    if (event.detail === 0 || event.pointerType !== 'mouse') {
      setTitleOpen(!title.classList.contains('is-open'));
    }
  });
  title.addEventListener('blur', function () { setTitleOpen(false); });
  title.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setTitleOpen(false);
  });

  cockpit.querySelector('.window-cycle').addEventListener('click', function () {
    if (busy) return;
    const current = views.indexOf(cockpit.dataset.active);
    const next = views[(current + 1) % views.length];
    lockedScene = next === 'none' ? null : next;
    setScene(next);
  });

  specimens.forEach(function (item) {
    const name = item.dataset.scene;
    item.addEventListener('mouseenter', function () { if (!busy) setScene(name); });
    item.addEventListener('mouseleave', clearScene);
    item.addEventListener('focus', function () { if (!busy) setScene(name); });
    item.addEventListener('blur', clearScene);
    item.addEventListener('click', function () {
      if (busy) return;
      if (name === 'exit') {
        body.classList.remove('cockpit-open');
        return;
      }
      if (links[name]) { window.location.href = SiteLanguage.url(links[name]); return; }
      lockedScene = lockedScene === name ? null : name;
      setScene(lockedScene || name);
    });
  });

  function describeProp(el, text) {
    function describe() { if (!busy) say(text); }
    el.addEventListener('pointerenter', describe);
    el.addEventListener('focus', describe);
    el.addEventListener('pointerleave', scheduleNote);
    el.addEventListener('blur', scheduleNote);
  }

  cockpit.querySelectorAll('.prop').forEach(function (prop) {
    const type = prop.dataset.prop;
    if (copy[type]) describeProp(prop, copy[type]);
    prop.addEventListener('click', function () {
      if (type === 'danger') { pressDanger(); return; }
      if (busy) return;
      if (type === 'radio') {
        startRadioPlayer();
        if (radioDialog.matches(':popover-open')) radioDialog.hidePopover();
        radioRequested = !radioRequested;
        updateRadioState();
        if (radioReady) {
          radioPending = radioRequested;
          if (radioRequested) radioController.resume();
          else radioController.pause();
        }
        say(copy.radio);
        return;
      }
      if (type === 'fish') {
        say(copy.fishClick);
        prop.classList.remove('is-bubbling');
        void prop.offsetWidth;
        prop.classList.add('is-bubbling');
        clearTimeout(fishBubbleTimer);
        fishBubbleTimer = setTimeout(function () { prop.classList.remove('is-bubbling'); }, 2200);
        return;
      }
      say(copy[type]);
    });
  });

  const bottle = cockpit.querySelector('.bottle-slot');
  if (bottle) {
    describeProp(bottle, copy.bottle);
    bottle.addEventListener('click', function () {
      if (busy) return;
      say(copy.bottle);
      show('bottle', 'bottleClick');
    });
  }

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
    nextNote();
  });

  document.addEventListener('visibilitychange', scheduleNote);

  const back = cockpit.querySelector('#ck-back');
  if (back) back.addEventListener('click', function () {
    body.classList.remove('cockpit-open');
  });

  syncCockpit();
})();
