/* ============================================
   LUXEECHO REPLICAS — UNIFIED APP JS 2026
   Version: 2.0.0
   ============================================ */
(function() {
  'use strict';

  /* ─── CONFIG ─── */
  var CONFIG = {
    scrollRevealThreshold: 0.1,
    scrollRevealRootMargin: '0px 0px -32px 0px',
    navScrollOffset: 50
  };

  /* ─── UTILITIES ─── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function debounce(fn, wait) {
    var t;
    return function() {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  /* ─── SCROLL REVEAL ─── */
  function initScrollReveal() {
    var els = $$('.fade-in');
    if (!els.length) return;

    // Fallback for no-JS is handled by noscript; here we add .visible
    if (!('IntersectionObserver' in window)) {
      els.forEach(function(el) { el.classList.add('visible'); });
      return;
    }

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.scrollRevealThreshold,
      rootMargin: CONFIG.scrollRevealRootMargin
    });

    els.forEach(function(el) { obs.observe(el); });
  }

  /* ─── NAVBAR SCROLL STATE ─── */
  function initNavbarScroll() {
    var nav = $('.nav') || $('.nav-premium');
    if (!nav) return;

    var onScroll = debounce(function() {
      var y = window.scrollY || window.pageYOffset;
      nav.classList.toggle('scrolled', y > CONFIG.navScrollOffset);
    }, 16);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU (HAMBURGER) ─── */
  function initMobileMenu() {
    var btn = $('.mobile-menu-btn');
    var links = $('.nav-links');
    if (!btn || !links) return;

    var body = document.body;
    var html = document.documentElement;
    var originalOverflow = '';
    var originalScrollY = 0;

    function openMenu() {
      btn.classList.add('active');
      links.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      originalOverflow = body.style.overflow || '';
      originalScrollY = window.scrollY;
      // Robust scroll lock for iOS + Android
      body.style.position = 'fixed';
      body.style.top = '-' + originalScrollY + 'px';
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';

      // Focus first link for accessibility
      var firstLink = $('a', links);
      if (firstLink) firstLink.focus();
    }

    function closeMenu() {
      btn.classList.remove('active');
      links.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      // Restore scroll
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = originalOverflow;
      html.style.overflow = '';
      window.scrollTo(0, originalScrollY);
    }

    function toggleMenu() {
      if (links.classList.contains('active')) closeMenu(); else openMenu();
    }

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        if (links.classList.contains('active')) closeMenu();
      });
    });

    // Close on click outside
    document.addEventListener('click', function(e) {
      if (links.classList.contains('active') && !links.contains(e.target) && !btn.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && links.classList.contains('active')) {
        closeMenu();
        btn.focus();
      }
    });

    // Trap focus inside menu when open
    links.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab' || !links.classList.contains('active')) return;
      var focusables = $$('a[href], button', links).filter(function(el) {
        return el.tabIndex !== -1;
      });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    btn.setAttribute('aria-expanded', 'false');
  }

  /* ─── SMOOTH SCROLL ─── */
  function initSmoothScroll() {
    document.addEventListener('click', function(e) {
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
    $$('img[loading="lazy"]').forEach(function(img) {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', function() { img.classList.add('loaded'); });
        img.addEventListener('error', function() {
          img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22 fill=%22%2316161e%22%3E%3Crect width=%22400%22 height=%22400%22/%3E%3Ctext x=%22200%22 y=%22200%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2214%22 font-family=%22sans-serif%22%3EImage unavailable%3C/text%3E%3C/svg%3E';
          img.classList.add('loaded');
        });
      }
    });
  }

  /* ─── INIT ─── */
  function init() {
    initScrollReveal();
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initLazyImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
