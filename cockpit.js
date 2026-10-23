(function () {
  const cockpit = document.getElementById('cockpit');
  if (!cockpit) return;

  const bubble = cockpit.querySelector('#bubble');
  const scenes = Array.from(cockpit.querySelectorAll('.scene[data-scene]'));
  const specimens = Array.from(cockpit.querySelectorAll('.specimen'));
  const links = { hill: 'bachelor/index.html', exit: 'master/projects.html' };
  let lockedScene = null;
  let alertTimer = null;

  const copy = {
    none: 'Hover a floating photo. The windshield changes its weather.',
    hill: 'Hold on tight. That slope up ahead is a big one. Click to climb it.',
    future: 'Loading driver file: 2002. The future is still being written.',
    exit: 'Go through this door and the hard part is done. Click to step out.',
    sweet: 'Shh. Sweet memories live here. Not open yet.',
    radio: 'Click. The next song is crossing the asteroid belt.',
    jar: 'Something new seems to be growing in the specimen jar.',
    danger: 'I said do not press it. The ship is pretending to panic.'
  };

  function setScene(name) {
    cockpit.dataset.active = name || 'none';
    bubble.textContent = copy[name] || copy.none;
    specimens.forEach(function (item) {
      item.classList.toggle('is-locked', item.dataset.scene === name && lockedScene === name);
    });
    scenes.forEach(function (scene) {
      scene.classList.toggle('is-active', scene.dataset.scene === name);
    });
  }

  function clearScene() {
    if (!lockedScene) setScene('none');
  }

  specimens.forEach(function (item) {
    const name = item.dataset.scene;
    item.addEventListener('mouseenter', function () { setScene(name); });
    item.addEventListener('mouseleave', clearScene);
    item.addEventListener('focus', function () { setScene(name); });
    item.addEventListener('blur', clearScene);
    item.addEventListener('click', function () {
      if (links[name]) {
        window.location.href = links[name];
        return;
      }
      lockedScene = lockedScene === name ? null : name;
      setScene(lockedScene || name);
    });
  });

  cockpit.querySelectorAll('.prop').forEach(function (prop) {
    prop.addEventListener('click', function () {
      const type = prop.dataset.prop;
      bubble.textContent = copy[type];
      if (type === 'danger') {
        cockpit.classList.add('alerting');
        clearTimeout(alertTimer);
        alertTimer = setTimeout(function () { cockpit.classList.remove('alerting'); }, 900);
      }
    });
  });

  bubble.addEventListener('click', function () {
    const order = ['hill', 'future', 'exit', 'sweet'];
    const next = order[(order.indexOf(cockpit.dataset.active) + 1) % order.length] || 'hill';
    lockedScene = next;
    setScene(next);
  });

  const back = cockpit.querySelector('#ck-back');
  if (back) back.addEventListener('click', function () {
    document.body.classList.remove('cockpit-open');
    lockedScene = null;
    setScene('none');
  });
})();
