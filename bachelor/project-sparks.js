(function () {
  const canSpark = window.matchMedia('(any-hover: hover) and (prefers-reduced-motion: no-preference)');
  const starColors = ['#ffdf67', '#ffc29b', '#ffe6b0', '#d9f38b', '#ff91c2'];
  const candyColors = ['#ff8eac', '#fda956', '#cde875', '#8de3cc', '#c6a3f4'];

  function scatterSpark(project, angle = Math.random() * Math.PI * 2, candy = Math.random() < .38) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const distance = 36 + Math.random() * 46;
    const offset = (14 + Math.random() * 72) + '%';
    const exitsSide = Math.abs(dx) > Math.abs(dy);
    const spark = document.createElement('span');
    spark.className = candy ? 'project-spark is-candy' : 'project-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.style.left = exitsSide ? (dx < 0 ? '0%' : '100%') : offset;
    spark.style.top = exitsSide ? offset : (dy < 0 ? '0%' : '100%');
    spark.style.setProperty('--spark-size', (candy ? 6 + Math.random() * 7 : 6 + Math.random() * 10) + 'px');
    const colors = candy ? candyColors : starColors;
    spark.style.setProperty('--spark-ink', colors[Math.floor(Math.random() * colors.length)]);
    project.appendChild(spark);

    function positionAt(progress, scale) {
      const x = (dx * distance * progress).toFixed(1);
      const y = (dy * distance * progress).toFixed(1);
      const tilt = (dx * (candy ? 155 : 90) * progress).toFixed(0);
      return 'translate(calc(-50% + ' + x + 'px), calc(-50% + ' + y + 'px)) rotate(' + tilt + 'deg) scale(' + scale + ')';
    }

    const flight = spark.animate([
      { opacity: 0, transform: positionAt(0, .35) },
      { opacity: 1, transform: positionAt(.2, 1), offset: .2 },
      { opacity: .9, transform: positionAt(.58, .88), offset: .58 },
      { opacity: 0, transform: positionAt(1, .45) }
    ], { duration: 850 + Math.random() * 480, easing: 'ease-out' });
    flight.onfinish = function () { spark.remove(); };
  }

  document.querySelectorAll('.timeline .node').forEach(function (project) {
    let emitter;
    function stop() {
      window.clearInterval(emitter);
      emitter = null;
    }

    project.addEventListener('pointerenter', function (event) {
      if (!canSpark.matches || event.pointerType === 'touch' || emitter) return;
      const startAngle = Math.random() * Math.PI * 2;
      for (let i = 0; i < 12; i++) {
        scatterSpark(project, startAngle + i * Math.PI / 6, i % 3 === 0);
      }
      emitter = window.setInterval(function () {
        if (!canSpark.matches || !project.matches(':hover') || document.hidden) {
          stop();
          return;
        }
        for (let i = 0; i < 3; i++) scatterSpark(project);
      }, 125);
    });

    project.addEventListener('pointerleave', stop);
    project.addEventListener('pointercancel', stop);
  });
})();
