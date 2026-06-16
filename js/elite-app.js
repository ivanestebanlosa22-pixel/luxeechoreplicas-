/* ============================================================
   LUXEECHO REPLICAS — INTERACTION ENGINE "ECHO" v3
   Vanilla JS. No deps. Performance + a11y first.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- LINK CONFIG (single source of truth) ---------- */
  window.LUXE = window.LUXE || {};
  window.LUXE.affiliates = {
    kakobuy: 'https://ikako.vip/r/FINDS',
    usfans:  'https://www.usfans.com/register?ref=RCGD5Y',
    litbuy:  'https://litbuy.com/register?inviteCode=YBMHFG55L'
  };
  window.LUXE.links = {
    spreadsheet: 'https://docs.google.com/spreadsheets/d/13fQgXFzMK20oKd9ZBtemZjBYr0Y_5TpJUJ19vpg9ZUc/edit?usp=sharing',
    reddit:   'https://www.reddit.com/r/luxeechoreplicas/',
    discord:  'https://discord.gg/hyU9ad5dUy',
    telegram: 'https://t.me/repschinabuyhub',
    tiktok:   'https://www.tiktok.com/@usfans_1'
  };
  // Wire any element with data-aff="kakobuy|usfans|litbuy"
  document.querySelectorAll('[data-aff]').forEach(function (el) {
    var key = el.getAttribute('data-aff');
    if (window.LUXE.affiliates[key]) {
      el.setAttribute('href', window.LUXE.affiliates[key]);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer sponsored');
    }
  });
  // Wire any element with data-link="spreadsheet|reddit|discord|telegram"
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var key = el.getAttribute('data-link');
    if (window.LUXE.links[key]) {
      el.setAttribute('href', window.LUXE.links[key]);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
  });

  /* ---------- PAGE LOADER ---------- */
  var loader = document.querySelector('.page-loader');
  if (loader) {
    window.addEventListener('load', function () {
      setTimeout(function () { loader.classList.add('done'); }, 280);
    });
    setTimeout(function () { loader.classList.add('done'); }, 2600); // safety
  }

  /* ---------- STICKY NAV + BACK-TO-TOP ---------- */
  var nav = document.querySelector('.nav-premium');
  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    var btt = document.querySelector('.back-to-top');
    if (btt) btt.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal, .fade-in');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; cObs.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var dec = (target % 1 !== 0) ? 1 : 0;
        if (reduceMotion) { el.textContent = prefix + target.toLocaleString('en-US') + suffix; return; }
        var start = null, dur = 1400;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var val = target * (1 - Math.pow(1 - p, 3));
          el.textContent = prefix + (dec ? val.toFixed(1) : Math.floor(val).toLocaleString('en-US')) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = prefix + (dec ? target.toFixed(1) : target.toLocaleString('en-US')) + suffix;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- POINTER-DRIVEN FX (fine pointers only) ---------- */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.18 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.28 + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = null;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = 'perspective(800px) rotateX(' + (-py * 5) + 'deg) rotateY(' + (px * 6) + 'deg) translateY(-6px)';
        });
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });

    var orbs = document.querySelectorAll('.hero-orb');
    if (orbs.length) {
      window.addEventListener('pointermove', function (e) {
        var cx = (e.clientX / window.innerWidth - 0.5);
        var cy = (e.clientY / window.innerHeight - 0.5);
        orbs.forEach(function (o, i) {
          var depth = (i + 1) * 14;
          o.style.marginLeft = (cx * depth) + 'px';
          o.style.marginTop = (cy * depth) + 'px';
        });
      }, { passive: true });
    }
  }

  /* ---------- BACK TO TOP ---------- */
  var btt = document.querySelector('.back-to-top');
  if (btt) btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- SMOOTH ANCHORS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* ---------- EXIT-INTENT (desktop, once per session) ---------- */
  var exit = document.querySelector('.exit-modal');
  if (exit && !sessionStorage.getItem('luxe_exit')) {
    var closeEx = exit.querySelector('[data-close]');
    function edge(e) { if (e.clientY <= 0 && !e.relatedTarget) { exit.classList.add('show'); sessionStorage.setItem('luxe_exit', '1'); document.removeEventListener('mouseout', edge); } }
    setTimeout(function () { document.addEventListener('mouseout', edge); }, 8000);
    if (closeEx) closeEx.addEventListener('click', function () { exit.classList.remove('show'); });
    exit.addEventListener('click', function (e) { if (e.target === exit) exit.classList.remove('show'); });
  }

})();
