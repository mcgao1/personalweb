(function () {
  const body = document.body;
  const universe = document.getElementById('universe');
  const planetSurface = document.getElementById('planet-surface');
  const mainCharacter = document.getElementById('main-character');
  const hint = document.getElementById('hint');
  const tooltip = document.getElementById('tooltip');
  const replayBtn = document.getElementById('replay-intro');
  const note = document.getElementById('monster-note');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const notes = [
    'Some Things Are Still Unnamed.',
    'Two Flowers Are Awake.',
    'The Ground Is Still Dreaming.',
    'More Will Grow Here.'
  ];

  const hoverNotes = {
    bachelor: 'old notes grew a flower.',
    master: 'this one keeps wandering.',
    ghost: 'not yet.'
  };

  const leafColors = {
    bachelor: ['#8a5a17', '#b3791f', '#ff7a2b', '#ff9a3d', '#ffd45b', '#ffe19a'],
    master: ['#0d5462', '#128995', '#1eb5c5', '#47d2cd', '#148f43', '#7edc68']
  };

  let noteIndex = 0;
  let noteWriteTimer = null;
  let noteAutoTimer = null;
  let wheelDelta = 0;

  if (reduceMotion) body.classList.add('no-motion');

  function setStage(stage) {
    body.className = reduceMotion ? stage + ' no-motion' : stage;
  }

  function setHint(text) {
    hint.textContent = text;
    hint.classList.toggle('visible', !!text);
  }

  function enterClose() {
    if (body.classList.contains('stage-close')) return;
    setStage('stage-close');
    setHint('pick a flower');
    note.tabIndex = 0;
    startNotes(true);
  }

  function resetHome() {
    setStage('stage-distant');
    setHint('come closer');
    hideTooltip();
    stopNotes();
    note.textContent = notes[0];
    note.classList.remove('is-writing', 'is-settled');
    note.tabIndex = -1;
    noteIndex = 0;
  }

  function startNotes(rewrite) {
    stopNotes();
    writeNote(notes[noteIndex], rewrite);
    if (!reduceMotion) {
      noteAutoTimer = window.setInterval(function () {
        nextNote(false);
      }, 7200);
    }
  }

  function stopNotes() {
    clearTimeout(noteWriteTimer);
    clearInterval(noteAutoTimer);
    noteWriteTimer = null;
    noteAutoTimer = null;
  }

  function writeNote(text, rewrite) {
    note.textContent = text;
    note.classList.remove('is-settled', 'is-writing');

    if (reduceMotion || !rewrite) {
      note.classList.add('is-settled');
      return;
    }

    void note.offsetWidth;
    note.classList.add('is-writing');
    clearTimeout(noteWriteTimer);
    noteWriteTimer = window.setTimeout(function () {
      note.classList.remove('is-writing');
      note.classList.add('is-settled');
    }, 3500);
  }

  function nextNote(resetAutoplay) {
    if (!body.classList.contains('stage-close')) return;
    if (resetAutoplay !== false) {
      clearInterval(noteAutoTimer);
      noteAutoTimer = null;
    }
    noteIndex = (noteIndex + 1) % notes.length;
    writeNote(notes[noteIndex], true);
    if (resetAutoplay !== false && !reduceMotion) {
      noteAutoTimer = window.setInterval(function () {
        nextNote(false);
      }, 7200);
    }
  }

  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.style.left = x + 16 + 'px';
    tooltip.style.top = y - 8 + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    tooltip.classList.remove('visible');
  }

  function setTemporaryNote() {
    window.clearTimeout(setTemporaryNote.timer);
  }

  function spawnLeaf(x, y, size, palette) {
    const el = document.createElement('div');
    el.className = 'leaf-particle';
    el.style.width = size + 'px';
    el.style.height = (size * 0.55) + 'px';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.background = palette[Math.floor(Math.random() * palette.length)];
    document.body.appendChild(el);
    return el;
  }

  function burstFrom(el, palette) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height * 0.28;

    for (let i = 0; i < 44; i++) {
      const leaf = spawnLeaf(cx, cy, 11 + Math.random() * 19, palette);
      const angle = Math.random() * Math.PI * 2;
      const dist = 140 + Math.random() * 390;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 80;
      const rot = Math.random() * 700 - 350;
      const scale = 0.6 + Math.random() * 0.9;
      const anim = leaf.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(' + scale + ')', opacity: 0 }
      ], { duration: 620 + Math.random() * 280, easing: 'cubic-bezier(0.2,0.7,0.3,1)' });
      anim.onfinish = function () { leaf.remove(); };
    }
  }

  function wireTooltip(el, noteText) {
    el.addEventListener('pointerenter', function (event) {
      if (!body.classList.contains('stage-close')) return;
      showTooltip(el.dataset.label || '', event.clientX, event.clientY);
      setTemporaryNote(noteText);
    });

    el.addEventListener('pointermove', function (event) {
      if (!body.classList.contains('stage-close')) return;
      showTooltip(el.dataset.label || '', event.clientX, event.clientY);
    });

    el.addEventListener('pointerleave', hideTooltip);
  }

  function wireEntry(el, paletteName, noteText) {
    wireTooltip(el, noteText);

    el.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!body.classList.contains('stage-close')) {
        enterClose();
        return;
      }

      const dest = el.getAttribute('href');

      if (reduceMotion) {
        window.location.href = dest;
        return;
      }

      el.classList.add('is-popping');
      burstFrom(el, leafColors[paletteName]);
      window.setTimeout(function () {
        el.classList.remove('is-popping');
        window.location.href = dest;
      }, 560);
    });
  }

  universe.addEventListener('click', function () {
    if (body.classList.contains('stage-distant')) enterClose();
  });

  planetSurface.addEventListener('click', function (event) {
    if (event.target.closest('.garden-entry') || event.target.closest('.planet-region')) return;
    event.stopPropagation();
    enterClose();
  });

  mainCharacter.addEventListener('click', function (event) {
    event.stopPropagation();
    enterClose();
  });

  document.querySelectorAll('.flower-entry').forEach(function (el) {
    const paletteName = el.classList.contains('flower-bachelor') ? 'bachelor' : 'master';
    const noteText = paletteName === 'bachelor' ? hoverNotes.bachelor : hoverNotes.master;
    wireEntry(el, paletteName, noteText);
  });

  document.querySelectorAll('.planet-region').forEach(function (el) {
    wireTooltip(el, hoverNotes.ghost);
    el.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!body.classList.contains('stage-close')) {
        enterClose();
        return;
      }
      setTemporaryNote(hoverNotes.ghost);
    });
  });

  replayBtn.addEventListener('click', function () {
    resetHome();
  });

  note.addEventListener('click', function (event) {
    event.stopPropagation();
    nextNote(true);
  });

  note.addEventListener('keydown', function (event) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    nextNote(true);
  });

  window.addEventListener('wheel', function (event) {
    wheelDelta += event.deltaY;

    if (wheelDelta < -45) {
      wheelDelta = 0;
      enterClose();
    } else if (wheelDelta > 45 && body.classList.contains('stage-close')) {
      wheelDelta = 0;
      resetHome();
    }
  }, { passive: true });

  document.addEventListener('keydown', function (event) {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (!body.classList.contains('stage-distant')) return;
    event.preventDefault();
    enterClose();
  });

  resetHome();
})();
