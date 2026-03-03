/* ═══════════════════════════════════════════════════
   PORSCHE LANDING PAGE — INTERACTION ENGINE
   Vanilla JS · Zero Dependencies
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DOM Ready ──
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNav();
        initReveal();
        initAssembly();
        initTimeline();
        initCounters();
        initParallax();
        initHeroViewport();
    }

    /* ══════════════════════
       NAVIGATION
       ══════════════════════ */
    function initNav() {
        const nav = document.getElementById('main-nav');
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        const links = menu.querySelectorAll('a');

        // Scroll state
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            nav.classList.toggle('nav--scrolled', y > 80);
            lastScroll = y;
        }, { passive: true });

        // Mobile toggle
        toggle.addEventListener('click', () => {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            toggle.classList.toggle('active');
            menu.classList.toggle('open');
            document.body.style.overflow = expanded ? '' : 'hidden';
        });

        // Close on link click (mobile)
        links.forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                menu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* Scroll reveal: makes elements appear as you scroll down the page */
    function initReveal() {
        const reveals = document.querySelectorAll('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    /* ══════════════════════
       ASSEMBLY ANIMATION — Engineering Cards
       Physics-based fly-in with staggered delays
       ══════════════════════ */
    function initAssembly() {
        const cards = document.querySelectorAll('.assemble');
        if (!cards.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('assembled');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -40px 0px'
        });

        cards.forEach(el => observer.observe(el));
    }

    /* ══════════════════════
       SCROLL-DRIVEN TIMELINE
       Vertical scroll → horizontal card movement
       ══════════════════════ */
    function initTimeline() {
        const section = document.getElementById('chronology');
        const track = document.getElementById('timeline-track');
        const progressBar = document.getElementById('timeline-progress');

        if (!section || !track) return;

        // Calculate how tall the section needs to be so there's
        // enough vertical scroll room to reveal all cards
        function setSectionHeight() {
            const trackScrollWidth = track.scrollWidth;
            const viewportWidth = window.innerWidth;
            // Distance that needs to be "scrolled" horizontally
            const scrollDistance = trackScrollWidth - viewportWidth + 64; // 64 = padding
            // Section height = one viewport + the horizontal scroll distance
            const totalHeight = window.innerHeight + Math.max(scrollDistance, 0);
            section.style.height = totalHeight + 'px';
        }

        setSectionHeight();
        window.addEventListener('resize', setSectionHeight);

        // On scroll: translate the track horizontally
        let ticking = false;

        function onScroll() {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
                const sectionTop = -rect.top + navH;
                const maxScroll = section.offsetHeight - window.innerHeight;
                const trackMaxMove = track.scrollWidth - window.innerWidth + 64;

                if (maxScroll <= 0 || trackMaxMove <= 0) {
                    ticking = false;
                    return;
                }

                // Progress: 0 at section top, 1 when fully scrolled through
                const progress = Math.max(0, Math.min(sectionTop / maxScroll, 1));

                // Translate the track
                const translateX = -progress * trackMaxMove;
                track.style.transform = `translateX(${translateX}px)`;

                // Update progress bar
                if (progressBar) {
                    progressBar.style.width = Math.max(progress * 100, 5) + '%';
                }

                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial position
    }

    /* Counter animation: numbers count up from 0 when they come into view */
    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000; // ms
        const startTime = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function tick(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(eased * target);
            el.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    /* ══════════════════════
       PARALLAX — Hero Image
       Subtle depth on scroll
       ══════════════════════ */
    function initParallax() {
        const heroImg = document.querySelector('.hero__img');
        if (!heroImg) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const y = window.scrollY;
                    const heroH = window.innerHeight;
                    if (y < heroH) {
                        const offset = y * 0.3;
                        heroImg.style.transform = `scale(${1.05 - y * 0.00005}) translateY(${offset}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ══════════════════════
       HERO — Viewport Detection
       Triggers the Ken Burns zoom-out
       ══════════════════════ */
    function initHeroViewport() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Trigger immediate in-view for hero
        setTimeout(() => {
            hero.classList.add('in-view');
        }, 300);
    }

})();
