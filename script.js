// ===== Scroll reveal: elements animate IN on entering the viewport and
// reset/animate OUT the moment they leave it, replaying every time =====
(function initScrollReveal(){
  const items = document.querySelectorAll('[data-aos]');

  items.forEach(el => {
    const delay = el.getAttribute('data-aos-delay');
    const duration = el.getAttribute('data-aos-duration');
    if (delay) el.style.transitionDelay = delay + 'ms';
    if (duration) el.style.transitionDuration = duration + 'ms';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Toggling on every crossing (not just once) is what makes it
      // reveal in on the way down AND reveal out / replay on the way back up.
      entry.target.classList.toggle('aos-animate', entry.isIntersecting);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });

  items.forEach(el => revealObserver.observe(el));
})();

// ===== Navbar scroll state =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

function toggleMenu(open){
  hamburger.classList.toggle('active', open);
  mobileMenu.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
}
hamburger.addEventListener('click', () => {
  toggleMenu(!mobileMenu.classList.contains('open'));
});
overlay.addEventListener('click', () => toggleMenu(false));
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', () => toggleMenu(false));
});

// ===== Animated stat counters (replays every time you scroll back to it) =====
const statNumbers = document.querySelectorAll('.stat-number');
// Each counter tracks its own running animation frame so re-triggers don't stack
const statFrames = new Map();

function animateStats(){
  statNumbers.forEach(el => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '+';
    const duration = 1600;
    const start = performance.now();

    // cancel any in-flight animation for this element before starting a new one
    const prevFrame = statFrames.get(el);
    if (prevFrame) cancelAnimationFrame(prevFrame);

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + (progress === 1 ? suffix : '');
      if (progress < 1){
        statFrames.set(el, requestAnimationFrame(tick));
      } else {
        statFrames.delete(el);
      }
    }
    statFrames.set(el, requestAnimationFrame(tick));
  });
}

function resetStats(){
  statNumbers.forEach(el => {
    const prevFrame = statFrames.get(el);
    if (prevFrame) cancelAnimationFrame(prevFrame);
    statFrames.delete(el);
    el.textContent = '0';
  });
}

const statsSection = document.querySelector('.stats-section');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      animateStats();       // count up every time the section scrolls into view
    } else {
      resetStats();         // reset back to 0 once it scrolls out, ready to replay
    }
  });
}, { threshold: 0.4 });
if (statsSection) statsObserver.observe(statsSection);

// ===== Contact form validation (no reload) =====
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

function setError(groupId, hasError){
  document.getElementById(groupId).classList.toggle('error', hasError);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formStatus.classList.remove('show');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  setError('nameGroup', name === '');
  setError('emailGroup', !emailValid);
  setError('messageGroup', message === '');

  if (name !== '' && emailValid && message !== ''){
    formStatus.classList.add('show');
    form.reset();
    setTimeout(() => formStatus.classList.remove('show'), 4000);
  }
});

// ===== Custom mouse tracker (small transparent whitish-purple orb) =====
(function initCursorTracker(){
  // Skip entirely on touch/coarse-pointer devices
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
    document.body.classList.remove('cursor-hide');
  });

  document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hide'));
  document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hide'));

  // Ring trails the dot with a soft lag for a floating feel
  function animateRing(){
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  // Grow the ring over interactive elements
  const interactiveSelector = 'a, button, input, textarea, .feature-card, .testi-card, .code-window, .avatar';
  document.querySelectorAll(interactiveSelector).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('grow'));
    el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
  });
})();