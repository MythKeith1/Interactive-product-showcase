/* Interactive Showcase JS
   - Mobile nav toggle
   - Smooth scroll + active nav highlight
   - Tilt + cursor-driven glow for cards (desktop & tablet)
   - Reveal on scroll
   - Contact form quick client-side validation + success message
*/

document.addEventListener('DOMContentLoaded', () => {
  // year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
      mobileMenu.setAttribute('aria-hidden', String(expanded));
      mobileMenu.classList.toggle('open');
    });
  }

  // Smooth scroll for internal links and close mobile menu on click
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          hamburger.setAttribute('aria-expanded','false');
        }
      }
    });
  });

  // Active nav highlight based on section in view
  const navLinks = document.querySelectorAll('.nav a');
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const setActiveNav = () => {
    const offset = window.innerHeight / 3;
    const scrollPos = window.scrollY + offset;
    let current = sections[0];
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop) current = sec;
    });
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav a[href="#${current.id}"]`);
    if (activeLink) activeLink.classList.add('active');
  };
  window.addEventListener('scroll', throttle(setActiveNav, 120));
  setActiveNav();

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.18});
  revealEls.forEach(el => revealObserver.observe(el));

  // Tilt + glow for .tilt-card
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    // set fallback base background
    card.style.background = getComputedStyle(card).backgroundColor || 'rgba(255,255,255,0.03)';
    // handlers
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      // support touch & mouse
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = (clientX - cx) / (rect.width / 2);
      const ry = (clientY - cy) / (rect.height / 2);
      const maxTilt = 10; // degrees
      const rotateY = rx * maxTilt;
      const rotateX = -ry * maxTilt;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;

      // glow position (percent)
      const gx = (clientX - rect.left) / rect.width * 100;
      const gy = (clientY - rect.top) / rect.height * 100;

      // dynamic radial gradient overlay for glow
      card.style.setProperty('--glow', `radial-gradient(600px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), rgba(122,102,255,0.06) 10%, transparent 30%)`);
      card.style.backgroundImage = `var(--glow), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00))`;
    };
    const handleLeave = () => {
      card.style.transform = '';
      // revert background
      card.style.backgroundImage = '';
      card.style.removeProperty('--glow');
    };

    // Attach only if device can hover (prevents chaotic touch effects)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    } else {
      // touch fallback: gentle scale on tap
      card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(1.02) translateZ(0)';
        setTimeout(()=>{ card.style.transform=''; }, 500);
      }, {passive:true});
    }
    // keyboard focus raise
    card.addEventListener('focus', () => card.style.transform='translateZ(12px) scale(1.02)');
    card.addEventListener('blur', () => card.style.transform='');
  });

  // Contact form simple validation + simulated submit
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const name = formData.get('name').trim();
      const email = formData.get('email').trim();
      const message = formData.get('message').trim();
      if (!name || !email || !message) {
        showFormMessage('Please complete all fields.', 'error');
        return;
      }
      // simple email test
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }
      // simulate submit (in real project, POST to your endpoint)
      showFormMessage('Sending...', 'info');
      setTimeout(() => {
        contactForm.reset();
        showFormMessage('Thanks — your message was sent. We will reply within 1 business day.', 'success');
      }, 900);
    });
  }
  function showFormMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.style.opacity = '1';
    formMessage.style.color = (type === 'error') ? '#ffb3c6' : (type === 'success' ? '#bff7d6' : '#fff');
    setTimeout(()=>{ formMessage.style.opacity = '0'; }, type === 'success' ? 6000 : 3500);
  }

  // small throttle helper
  function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }
});
