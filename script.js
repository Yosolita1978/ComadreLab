(function () {
  'use strict';

  /* ================================
     Language Toggle
     ================================ */
  var STORAGE_KEY = 'comadrelab-lang';

  function getInitialLanguage() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'es' || stored === 'en') {
      return stored;
    }
    var browserLang = navigator.language || navigator.userLanguage || 'en';
    return browserLang.startsWith('es') ? 'es' : 'en';
  }

  function setLanguage(lang) {
    document.documentElement.classList.toggle('es', lang === 'es');
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggleLanguage() {
    var current = document.documentElement.classList.contains('es') ? 'es' : 'en';
    var next = current === 'es' ? 'en' : 'es';
    setLanguage(next);
  }

  function initLanguage() {
    var lang = getInitialLanguage();
    setLanguage(lang);

    var toggleButtons = document.querySelectorAll('.lang-toggle');
    toggleButtons.forEach(function (btn) {
      btn.addEventListener('click', toggleLanguage);
    });
  }

  /* ================================
     Mobile Menu
     ================================ */
  function initMobileMenu() {
    var menuToggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('#main-nav');

    if (!menuToggle || !nav) {
      return;
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function openMenu() {
      nav.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when a nav link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* ================================
     Tile Bloom Animation
     ================================ */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createTileSVG() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('width', '60');
    svg.setAttribute('height', '60');

    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M50 0 C60 25, 75 40, 100 50 C75 60, 60 75, 50 100 C40 75, 25 60, 0 50 C25 40, 40 25, 50 0 Z');
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);

    return svg;
  }

  function createTile(container) {
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.appendChild(createTileSVG());

    var size = 40 + Math.random() * 40;
    var startX = Math.random() * 100;
    var startY = Math.random() * 100;
    var duration = 20 + Math.random() * 20;
    var delay = Math.random() * -20;

    tile.style.cssText =
      'position: absolute;' +
      'left: ' + startX + '%;' +
      'top: ' + startY + '%;' +
      'width: ' + size + 'px;' +
      'height: ' + size + 'px;' +
      'color: ' + (Math.random() > 0.5 ? 'var(--cobalt)' : 'var(--gold)') + ';' +
      'opacity: 0;' +
      'pointer-events: none;' +
      'animation: tileFloat ' + duration + 's ease-in-out ' + delay + 's infinite;';

    container.appendChild(tile);
    return tile;
  }

  function initTileAnimation() {
    if (prefersReducedMotion()) {
      return;
    }

    var heroBg = document.querySelector('.hero-bg');
    if (!heroBg) {
      return;
    }

    var style = document.createElement('style');
    style.textContent =
      '@keyframes tileFloat {' +
      '  0%, 100% { opacity: 0; transform: translate(0, 0) rotate(0deg) scale(0.8); }' +
      '  20% { opacity: 0.1; }' +
      '  50% { opacity: 0.06; transform: translate(20px, -30px) rotate(45deg) scale(1); }' +
      '  80% { opacity: 0.1; }' +
      '}';
    document.head.appendChild(style);

    var tileCount = window.innerWidth < 768 ? 6 : 12;
    for (var i = 0; i < tileCount; i++) {
      createTile(heroBg);
    }
  }

  /* ================================
     Scroll Reveal (Intersection Observer)
     ================================ */
  function initScrollReveal() {
    if (prefersReducedMotion()) {
      // If reduced motion, just show everything immediately
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ================================
     Contact Form
     ================================ */
  function initContactForm() {
    var form = document.querySelector('.contact-form');
    var successMessage = document.querySelector('.form-success');

    if (!form || !successMessage) {
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var formData = new FormData(form);
      var submitButton = form.querySelector('button[type="submit"]');

      submitButton.disabled = true;
      submitButton.textContent = '...';

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(function (response) {
          if (response.ok) {
            form.reset();
            form.hidden = true;
            successMessage.hidden = false;
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function () {
          submitButton.disabled = false;
          submitButton.textContent = document.documentElement.classList.contains('es')
            ? 'Error — intenta de nuevo'
            : 'Error — try again';

          setTimeout(function () {
            submitButton.innerHTML = '<span lang="en">Request a quote</span><span lang="es">Pedir cotización</span>';
          }, 3000);
        });
    });
  }

  /* ================================
     Smooth Scroll (offset for fixed header)
     ================================ */
  function initSmoothScroll() {
    var header = document.querySelector('.header');
    if (!header) {
      return;
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') {
          return;
        }

        var target = document.querySelector(targetId);
        if (!target) {
          return;
        }

        e.preventDefault();
        var headerHeight = header.offsetHeight;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion() ? 'auto' : 'smooth'
        });
      });
    });
  }

  /* ================================
     Initialize
     ================================ */
  function init() {
    initLanguage();
    initMobileMenu();
    initTileAnimation();
    initScrollReveal();
    initContactForm();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
