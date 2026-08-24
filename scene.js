(function () {
  const body = document.body;
  const figure = document.getElementById('figure');
  const chair = document.getElementById('chair');
  const planet = document.getElementById('planet');
  const universe = document.getElementById('universe');
  const hint = document.getElementById('hint');
  const dialogLines = document.getElementById('dialog-lines');
  const nameForm = document.getElementById('name-form');
  const nameInput = document.getElementById('name-input');
  const okBtn = document.getElementById('ok-btn');
  const tooltip = document.getElementById('tooltip');
  const replayBtn = document.getElementById('replay-intro');
  const tagMaster = document.getElementById('tag-master');
  const flood = document.getElementById('flood');

  let visitorName = '';
  let greetLines = [];
  let greetIndex = 0;

  function setStage(stage) {
    body.className = 'stage-' + stage;
  }

  function setHint(text) {
    hint.textContent = text;
    hint.classList.toggle('visible', !!text);
  }

  // ---------- Returning visitor: skip straight to explore mode ----------
  const savedName = localStorage.getItem('visitorName_v2');
  if (savedName) {
    visitorName = savedName;
    body.classList.add('no-anim');
    setStage('grown');
    setHint('');
    // let the browser paint once with transitions off, then re-enable them
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.classList.remove('no-anim');
      });
    });
  } else {
    setHint('Click on whatever catches your eye');
  }

  // ---------- The one "advance" action for the current stage ----------
  // Used by click, and mirrored by Space/Enter so a visitor never has to
  // reach for the mouse just to move the story forward. Clicking a
  // *specific* part of the scene (the chair, later: the necklace, the
  // head…) is a separate, deliberate choice and stays mouse-only —
  // this is only the generic "continue" step.
  function advance() {
    if (body.classList.contains('stage-wide')) {
      setStage('zoomed');
      setHint('Click the planet');
    } else if (body.classList.contains('stage-zoomed')) {
      setStage('naming');
      setHint('');
      nameInput.focus();
    } else if (body.classList.contains('stage-greeting')) {
      if (body.classList.contains('ok-ready')) {
        setStage('grown');
      } else {
        revealNextLine();
      }
    }
  }

  universe.addEventListener('click', function () {
    if (body.classList.contains('stage-wide')) advance();
  });

  function wake(e) {
    if (!body.classList.contains('stage-zoomed')) return;
    e.stopPropagation();
    advance();
  }
  figure.addEventListener('click', wake);
  chair.addEventListener('click', wake);
  planet.addEventListener('click', wake);

  // Name input -> build the greeting, then wait for "advance"
  nameForm.addEventListener('submit', function (e) {
    e.preventDefault();
    visitorName = nameInput.value.trim() || 'friend';
    localStorage.setItem('visitorName_v2', visitorName);

    greetLines = [
      visitorName + ', how are you today?',
      "I've been waiting for you for a long time.",
      'Are you ready?'
    ];
    greetIndex = 0;

    setStage('greeting');
    setHint('Click on the person, or press space');
  });

  function revealNextLine() {
    dialogLines.classList.remove('show');
    setTimeout(function () {
      dialogLines.textContent = greetLines[greetIndex];
      dialogLines.classList.add('show');
      greetIndex++;

      if (greetIndex >= greetLines.length) {
        setHint('');
        body.classList.add('ok-ready');
      } else {
        setHint('Click on the person, or press space');
      }
    }, 150);
  }

  function advanceGreeting(e) {
    if (!body.classList.contains('stage-greeting')) return;
    if (body.classList.contains('ok-ready')) return;
    e.stopPropagation();
    advance();
  }
  figure.addEventListener('click', advanceGreeting);
  chair.addEventListener('click', advanceGreeting);
  planet.addEventListener('click', advanceGreeting);

  okBtn.addEventListener('click', function () {
    setStage('grown');
  });

  replayBtn.addEventListener('click', function () {
    localStorage.removeItem('visitorName_v2');
    location.reload();
  });

  // ---------- Green flood: Master floods the screen, then carries
  // through to the thicket page it lands on ----------
  tagMaster.addEventListener('click', function (e) {
    e.preventDefault();
    const dest = tagMaster.getAttribute('href');
    const rect = tagMaster.getBoundingClientRect();
    const fx = ((rect.left + rect.width / 2) / window.innerWidth * 100) + '%';
    const fy = ((rect.top + rect.height / 2) / window.innerHeight * 100) + '%';
    flood.style.setProperty('--fx', fx);
    flood.style.setProperty('--fy', fy);
    // a short delay (not requestAnimationFrame, which some contexts
    // throttle) so the browser paints the 0% state before animating
    setTimeout(function () {
      flood.classList.add('active');
    }, 20);
    setTimeout(function () {
      window.location.href = dest;
    }, 600);
  });

  // ---------- Space / Enter mirrors the generic advance action ----------
  document.addEventListener('keydown', function (e) {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    if (body.classList.contains('stage-naming')) return; // let typing behave normally
    e.preventDefault();
    advance();
  });

  // ---------- Hover tooltip: per-element, follows the cursor ----------
  const tooltipLabels = {
    wide: { figure: 'click me', planet: 'click me', chair: 'click me' },
    zoomed: { figure: 'wake me up', planet: 'click the planet', chair: 'wake me up' },
    greeting: { figure: 'go on…', planet: 'go on…', chair: 'go on…' }
  };

  function currentStageKey() {
    if (body.classList.contains('stage-wide')) return 'wide';
    if (body.classList.contains('stage-zoomed')) return 'zoomed';
    if (body.classList.contains('stage-greeting') && !body.classList.contains('ok-ready')) return 'greeting';
    return null;
  }

  const hoverTargets = [
    { el: figure, key: 'figure' },
    { el: planet, key: 'planet' },
    { el: chair, key: 'chair' }
  ];

  hoverTargets.forEach(function (t) {
    t.el.addEventListener('mouseenter', function () {
      const stageKey = currentStageKey();
      if (!stageKey) return;
      tooltip.textContent = tooltipLabels[stageKey][t.key];
      tooltip.classList.add('visible');
    });
    t.el.addEventListener('mousemove', function (e) {
      tooltip.style.left = e.clientX + 16 + 'px';
      tooltip.style.top = e.clientY - 8 + 'px';
    });
    t.el.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });
  });
})();
