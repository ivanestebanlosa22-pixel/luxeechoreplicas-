/* ============================================
   LUXEECHO REPLICAS — UNIFIED APP JS 2026
   Version: 3.0.0 — Premium Interactive Edition
   ============================================ */
(function () {
  'use strict';

  var CONFIG = {
    scrollRevealThreshold: 0.1,
    scrollRevealRootMargin: '0px 0px -40px 0px',
    navScrollOffset: 50,
    floatingCtaOffset: 400,
    testimonialAutoInterval: 4800,
    counterDuration: 1800,
    particleCount: 55
  };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function debounce(fn, wait) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, wait); };
  }

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ─── READING PROGRESS BAR ─── */
  function initProgressBar() {
    var bar = $('#readingProgress');
    if (!bar) return;
    function update() {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      var pct = Math.round((window.scrollY / docH) * 100);
      bar.style.width = clamp(pct, 0, 100) + '%';
      bar.setAttribute('aria-valuenow', pct);
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ─── SCROLL REVEAL (fade-in + reveal classes) ─── */
  function initScrollReveal() {
    var els = $$('.fade-in, .reveal, .reveal-left, .reveal-right');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: CONFIG.scrollRevealThreshold, rootMargin: CONFIG.scrollRevealRootMargin });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ─── NAVBAR SCROLL STATE ─── */
  function initNavbarScroll() {
    var nav = $('.nav') || $('.nav-premium');
    if (!nav) return;
    var onScroll = debounce(function () {
      nav.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > CONFIG.navScrollOffset);
    }, 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU ─── */
  function initMobileMenu() {
    var btn = $('.mobile-menu-btn');
    var links = $('.nav-links');
    if (!btn || !links) return;
    var body = document.body;
    var html = document.documentElement;
    var origOverflow = '';
    var origScrollY = 0;

    function openMenu() {
      btn.classList.add('active');
      links.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      origOverflow = body.style.overflow || '';
      origScrollY = window.scrollY;
      body.style.position = 'fixed';
      body.style.top = '-' + origScrollY + 'px';
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      var first = $('a', links);
      if (first) first.focus();
    }
    function closeMenu() {
      btn.classList.remove('active');
      links.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = origOverflow;
      html.style.overflow = '';
      window.scrollTo(0, origScrollY);
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      links.classList.contains('active') ? closeMenu() : openMenu();
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (links.classList.contains('active')) closeMenu();
      });
    });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('active') && !links.contains(e.target) && !btn.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('active')) { closeMenu(); btn.focus(); }
    });
    btn.setAttribute('aria-expanded', 'false');
  }

  /* ─── SMOOTH SCROLL ─── */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (href === '#' || !href) return;
      var target = $(href);
      if (!target) return;
      e.preventDefault();
      var nav = $('.nav') || $('.nav-premium');
      var navH = nav ? nav.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  /* ─── LAZY IMAGES ─── */
  function initLazyImages() {
    $$('img[loading="lazy"]').forEach(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function () { img.classList.add('loaded'); });
        img.addEventListener('error', function () {
          img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 fill=%22%2316161e%22%3E%3Crect width=%22400%22 height=%22400%22/%3E%3Ctext x=%22200%22 y=%22200%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2214%22 font-family=%22sans-serif%22%3EImage unavailable%3C/text%3E%3C/svg%3E';
          img.classList.add('loaded');
        });
      }
    });
  }

  /* ─── ANIMATED COUNTERS ─── */
  function initCounters() {
    var counters = $$('[data-target]');
    if (!counters.length) return;
    if (prefersReducedMotion()) {
      counters.forEach(function (el) {
        var t = parseFloat(el.dataset.target);
        var d = parseInt(el.dataset.decimals || '0');
        el.textContent = (el.dataset.prefix || '') + t.toFixed(d) + (el.dataset.suffix || '');
      });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var t = parseFloat(el.dataset.target);
        var d = parseInt(el.dataset.decimals || '0');
        el.textContent = (el.dataset.prefix || '') + t.toFixed(d) + (el.dataset.suffix || '');
      });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { obs.observe(el); });
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    var decimals = parseInt(el.dataset.decimals || '0');
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var start = parseFloat(el.dataset.start || '0');
    var duration = CONFIG.counterDuration;
    var startTime = null;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = clamp((ts - startTime) / duration, 0, 1);
      var val = start + (target - start) * easeOut(progress);
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ─── TESTIMONIAL SLIDER ─── */
  function initTestimonialSlider() {
    var track = $('#testimonialTrack');
    var dots = $$('.testimonial-dot', $('#testimonialDots'));
    var prev = $('#testimonialPrev');
    var next = $('#testimonialNext');
    var slider = $('#testimonialSlider');
    if (!track || !dots.length) return;

    var current = 0;
    var total = dots.length;
    var autoTimer = null;
    var isHovered = false;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function startAuto() {
      if (prefersReducedMotion()) return;
      autoTimer = setInterval(function () {
        if (!isHovered) goTo(current + 1);
      }, CONFIG.testimonialAutoInterval);
    }

    function stopAuto() { clearInterval(autoTimer); }

    if (prev) prev.addEventListener('click', function () { goTo(current - 1); stopAuto(); startAuto(); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); stopAuto(); startAuto(); });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); stopAuto(); startAuto(); });
    });

    if (slider) {
      slider.addEventListener('mouseenter', function () { isHovered = true; });
      slider.addEventListener('mouseleave', function () { isHovered = false; });
      var touchStartX = 0;
      slider.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); stopAuto(); startAuto(); }
      }, { passive: true });
    }

    goTo(0);
    startAuto();
  }

  /* ─── FLOATING CTA ─── */
  function initFloatingCta() {
    var cta = $('#floatingCta');
    var closeBtn = $('#floatingCtaClose');
    if (!cta) return;

    var dismissed = false;

    function onScroll() {
      if (dismissed) return;
      cta.classList.toggle('visible', (window.scrollY || window.pageYOffset) > CONFIG.floatingCtaOffset);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dismissed = true;
        cta.classList.remove('visible');
        cta.style.display = 'none';
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── HERO CANVAS PARTICLES ─── */
  function initParticles() {
    var canvas = $('#heroCanvas');
    if (!canvas || prefersReducedMotion()) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W, H, particles = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function initParticles() {
      particles = [];
      var count = Math.min(CONFIG.particleCount, Math.floor((W * H) / 16000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: randomBetween(0, W),
          y: randomBetween(0, H),
          r: randomBetween(0.8, 2.2),
          vx: randomBetween(-0.25, 0.25),
          vy: randomBetween(-0.3, -0.08),
          alpha: randomBetween(0.15, 0.55)
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 107, 53, ' + p.alpha + ')';
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = randomBetween(0, W); }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
      });
    }

    var raf;
    function loop() { draw(); raf = requestAnimationFrame(loop); }

    window.addEventListener('resize', debounce(function () { resize(); initParticles(); }, 200));
    resize();
    initParticles();
    loop();

    // Stop animation when hero leaves viewport to save resources
    var heroSection = canvas.closest('.hero');
    if (heroSection && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!raf) loop();
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      }, { threshold: 0 }).observe(heroSection);
    }
  }

  /* ─── 3D TILT EFFECT ─── */
  function initTiltEffect() {
    if (prefersReducedMotion()) return;
    var cards = $$('.tilt-card');
    if (!cards.length) return;
    var isMobile = window.innerWidth < 1024;
    if (isMobile) return;

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(1000px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg) scale(1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  /* ─── FAQ ACCORDION ─── */
  function initFaq() {
    var items = $$('.faq-item');
    items.forEach(function (item) {
      var btn = $('.faq-question', item);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('active');
        items.forEach(function (i) { i.classList.remove('active'); });
        if (!isOpen) item.classList.add('active');
      });
    });
  }

  /* ─── NAV DROPDOWN KEYBOARD ─── */
  function initNavDropdowns() {
    $$('.nav-dropdown').forEach(function (dd) {
      var trigger = $('.nav-dropdown-trigger', dd);
      var menu = $('.nav-dropdown-menu', dd);
      if (!trigger || !menu) return;

      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          dd.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
          var first = $('a', menu);
          if (first) first.focus();
        }
      });

      menu.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          dd.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.focus();
        }
      });

      document.addEventListener('click', function (e) {
        if (!dd.contains(e.target)) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ─── TRUST BAR DUPLICATE FOR MARQUEE ─── */
  function initTrustBarMarquee() {
    var track = $('.trust-bar-track');
    if (!track) return;
    // Clone for seamless loop
    var clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentNode.appendChild(clone);
  }

  /* ─── INIT ─── */
  function init() {
    initProgressBar();
    initScrollReveal();
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initLazyImages();
    initCounters();
    initTestimonialSlider();
    initFloatingCta();
    initParticles();
    initTiltEffect();
    initFaq();
    initNavDropdowns();
    initTrustBarMarquee();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
