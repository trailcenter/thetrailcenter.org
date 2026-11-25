(() => {
  'use strict';
  const root = document.querySelector('.home-feature');
  if (!root) return;
  const viewport = root.querySelector('.home-feature-window');
  const track = root.querySelector('.home-feature-track');
  const toggle = root.querySelector('.home-feature-toggle');
  const previous = root.querySelector('.home-feature-prev');
  const next = root.querySelector('.home-feature-next');
  const counter = root.querySelector('output');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  for (const slide of track.querySelectorAll('[data-feature-expires]')) {
    if (Date.now() >= Date.parse(slide.dataset.featureExpires)) slide.remove();
  }
  const slides = [...track.children];
  if (slides.length < 2) return;
  let index = 0, interval = 0, playing = !motion.matches, hovered = false;
  let touchStart = null, lastSwipe = 0;
  function updateTimer() {
    clearInterval(interval);
    if (playing && !motion.matches && !hovered && !document.hidden && !viewport.contains(document.activeElement)) {
      interval = window.setInterval(() => show(index + 1), 8200);
    }
    toggle.textContent = playing ? 'Pause slideshow' : 'Play slideshow';
    toggle.hidden = motion.matches;
    counter.setAttribute('aria-live', playing && !motion.matches ? 'off' : 'polite');
  }
  function show(to) {
    index = (to + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-100 * index) + '%)';
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      if (i === index) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    counter.value = (index + 1) + ' / ' + slides.length;
  }
  function manual(by) {
    playing = false;
    updateTimer();
    show(index + by);
  }
  toggle.addEventListener('click', () => { playing = !playing; updateTimer(); });
  previous.addEventListener('click', () => manual(-1));
  next.addEventListener('click', () => manual(1));
  viewport.addEventListener('focusin', () => { playing = false; updateTimer(); });
  viewport.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hovered = true; updateTimer(); } });
  viewport.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hovered = false; updateTimer(); } });
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.isPrimary) touchStart = {x:e.clientX,y:e.clientY};
  });
  viewport.addEventListener('pointerup', e => {
    if (!touchStart || e.pointerType !== 'touch') return;
    const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      lastSwipe = Date.now(); manual(dx < 0 ? 1 : -1);
    }
  });
  viewport.addEventListener('pointercancel', () => { touchStart = null; });
  viewport.addEventListener('click', e => { if (lastSwipe && Date.now() - lastSwipe < 400) e.preventDefault(); }, true);
  document.addEventListener('visibilitychange', updateTimer);
  motion.addEventListener('change', () => { if (motion.matches) playing = false; updateTimer(); });
  track.style.setProperty('--slide-count', slides.length);
  root.classList.add('is-ready');
  show(0);
  updateTimer();
})();
