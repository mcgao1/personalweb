/* Universal image lightbox. Include lightbox.css + lightbox.js on any
   page, add class="lightbox-img" to any <img>, and it just works:
   click to pop open, +/- buttons or scroll wheel to zoom, drag to pan
   once zoomed in, click the image again (or backdrop / X / Esc) to
   close. No per-page wiring needed. */
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML =
    '<div class="lb-toolbar">' +
    '<button class="lb-zoom-btn" type="button" data-lb-out aria-label="Zoom out">&minus;</button>' +
    '<button class="lb-zoom-btn" type="button" data-lb-in aria-label="Zoom in">&plus;</button>' +
    '</div>' +
    '<button class="lb-close" type="button" aria-label="Close">&times;</button>' +
    '<div class="lb-viewport">' +
    '<div class="lb-pop"><img class="lb-full" alt=""></div>' +
    '</div>';
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.lb-close');
  const zoomInBtn = overlay.querySelector('[data-lb-in]');
  const zoomOutBtn = overlay.querySelector('[data-lb-out]');
  const viewport = overlay.querySelector('.lb-viewport');
  const img = overlay.querySelector('.lb-full');

  let zoom = 1;
  let baseWidth = 640;
  const ZOOM_MIN = 0.8;
  const ZOOM_MAX = 3;

  function applyZoom() {
    img.style.width = Math.round(baseWidth * zoom) + 'px';
  }
  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    applyZoom();
  }

  function openWith(src, alt) {
    img.src = src;
    img.alt = alt || '';
    overlay.classList.add('open');
    document.body.classList.add('lb-locked');
    baseWidth = Math.min(720, window.innerWidth * 0.9);
    setZoom(1);
  }
  function close() {
    overlay.classList.remove('open');
    document.body.classList.remove('lb-locked');
  }

  document.addEventListener('click', function (e) {
    const target = e.target.closest('img.lightbox-img');
    if (!target) return;
    openWith(target.currentSrc || target.src, target.alt);
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });

  zoomInBtn.addEventListener('click', function () { setZoom(zoom + 0.5); });
  zoomOutBtn.addEventListener('click', function () { setZoom(zoom - 0.5); });

  viewport.addEventListener('wheel', function (e) {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    setZoom(zoom - e.deltaY * 0.0015);
  }, { passive: false });

  // drag to pan
  let dragging = false;
  let dragMoved = false;
  let startX = 0, startY = 0, startScrollLeft = 0, startScrollTop = 0;

  img.addEventListener('pointerdown', function (e) {
    dragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startScrollLeft = overlay.scrollLeft;
    startScrollTop = overlay.scrollTop;
    img.setPointerCapture(e.pointerId);
    img.classList.add('grabbing');
  });

  img.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
    overlay.scrollLeft = startScrollLeft - dx;
    overlay.scrollTop = startScrollTop - dy;
  });

  img.addEventListener('pointerup', function () {
    dragging = false;
    img.classList.remove('grabbing');
  });

  img.addEventListener('click', function () {
    if (dragMoved) { dragMoved = false; return; }
    close();
  });
})();
