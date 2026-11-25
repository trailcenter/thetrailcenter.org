(() => {
  'use strict';
  const root = document.querySelector('.home-feature');
  if (!root) return;
  const viewport = root.querySelector('.home-feature-window');
  const track = root.querySelector('.home-feature-track');
  const toggle = root.querySelector('.home-feature-toggle');
  const previous = root.querySelector('.home-feature-prev');
  const next = root.querySelector('.home-feature-next');
  const nav = root.querySelector('.home-feature-nav');
  const counter = root.querySelector('output');
  const marketSource = root.querySelector('.home-feature-market-source');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  for (const slide of track.querySelectorAll('[data-feature-expires]')) {
    if (Date.now() >= Date.parse(slide.dataset.featureExpires)) slide.remove();
  }
  const slides = [...track.children];
  if (slides.length < 2) return;
  const clone = slide => {
    const copy = slide.cloneNode(true);
    copy.inert = true;
    copy.setAttribute('aria-hidden','true');
    return copy;
  };
  const lead = clone(slides.at(-1)), trail = clone(slides[0]);
  track.prepend(lead);
  track.append(trail);
  const all = [...track.children], n = slides.length;
  let index = 0, interval, settle, jump = null;
  let playing = !motion.matches, touchStart = null, lastSwipe = 0;
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'home-feature-dot';
    dot.setAttribute('aria-label', 'Show ' + slide.dataset.featureName);
    dot.setAttribute('aria-controls', viewport.id);
    dot.addEventListener('click', () => manual(i, 0));
    nav.append(dot);
    return dot;
  });
  function updateTimer() {
    clearInterval(interval);
    const active = playing && !document.hidden && !viewport.contains(document.activeElement) && document.activeElement !== marketSource;
    if (active) interval = window.setInterval(() => show(index + 1, 1), 6900);
    root.classList.toggle('is-playing', active);
    syncClip();
    toggle.textContent = playing ? 'Pause slideshow' : 'Play slideshow';
    counter.setAttribute('aria-live', playing ? 'off' : 'polite');
  }
  function syncClip() {
    for (const slide of all) {
      const clip = slide.querySelector('video[data-src]');
      if (!clip) continue;
      const enabled = slide === slides[index] && playing && !motion.matches && !document.hidden;
      if (!enabled) {
        if (!clip.paused) clip.pause();
        continue;
      }
      if (!clip.hasAttribute('src')) clip.src = clip.dataset.src;
      clip.muted = true;
      if (clip.paused) clip.play().catch(() => {});
    }
  }
  function position(slot) {
    track.style.transform = 'translate3d(' + (-100 * slot) + '%, 0, 0)';
  }
  function snap(slot) {
    track.classList.add('is-jump');
    position(slot);
    void track.offsetWidth;
    track.classList.remove('is-jump');
  }
  function settleWrap() {
    if (jump === null) return;
    clearTimeout(settle);
    snap(jump);
    jump = null;
    for (const copy of [lead, trail]) copy.classList.remove('is-active');
  }
  function show(to, direction = 0, initial = false) {
    settleWrap();
    const old = index;
    index = (to + n) % n;
    let slot = index + 1;
    if (!motion.matches) {
      if (direction > 0 && old === n - 1 && index === 0) slot = n + 1;
      if (direction < 0 && old === 0 && index === n - 1) slot = 0;
    }
    if (initial) snap(slot); else position(slot);
    if (slot !== index + 1) {
      jump = index + 1;
      settle = window.setTimeout(settleWrap, 720);
    }
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      if (i === index) {
        slide.removeAttribute('aria-hidden');
        dots[i].setAttribute('aria-current','true');
      } else {
        slide.setAttribute('aria-hidden','true');
        dots[i].removeAttribute('aria-current');
      }
    });
    all.forEach((slide, i) => slide.classList.toggle('is-active', i === slot || i === index + 1));
    if (marketSource) marketSource.hidden = !slides[index].classList.contains('home-feature-market');
    syncClip();
    counter.value = 'Feature ' + (index + 1) + ' of ' + n + ': ' + slides[index].dataset.featureName;
  }
  function manual(to, direction) {
    show(to, direction);
    updateTimer();
  }
  track.addEventListener('transitionend', e => {
    if (e.target === track && e.propertyName === 'transform') settleWrap();
  });
  toggle.addEventListener('click', () => { playing = !playing; updateTimer(); });
  previous.addEventListener('click', () => manual(index - 1, -1));
  next.addEventListener('click', () => manual(index + 1, 1));
  root.addEventListener('focusin', e => {
    if (e.target === toggle) return;
    if (e.target === marketSource) updateTimer();
    if (track.contains(e.target)) {
      updateTimer();
      // Browsers can try to scroll the viewport when focus enters a transformed track.
      viewport.scrollLeft = 0;
    }
  });
  root.addEventListener('focusout', () => window.setTimeout(updateTimer, 0));
  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.isPrimary) touchStart = {x:e.clientX,y:e.clientY};
  });
  viewport.addEventListener('pointerup', e => {
    if (!touchStart || e.pointerType !== 'touch') return;
    const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      const direction = dx < 0 ? 1 : -1;
      lastSwipe = Date.now();
      manual(index + direction, direction);
    }
  });
  viewport.addEventListener('pointercancel', () => { touchStart = null; });
  viewport.addEventListener('click', e => { if (lastSwipe && Date.now() - lastSwipe < 400) e.preventDefault(); }, true);
  document.addEventListener('visibilitychange', updateTimer);
  motion.addEventListener('change', () => { if (motion.matches) playing = false; settleWrap(); updateTimer(); });
  track.style.setProperty('--slide-count', all.length);
  root.classList.add('is-ready');
  show(0, 0, true);
  updateTimer();
})();
