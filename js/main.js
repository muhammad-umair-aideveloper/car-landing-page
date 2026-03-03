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
       HORIZONTAL TIMELINE
       Drag scroll + snap + progress bar
       ══════════════════════ */
    function initTimeline() {
        const track = document.getElementById('timeline-track');
        const progressBar = document.getElementById('timeline-progress');
        const prevBtn = document.getElementById('timeline-prev');
        const nextBtn = document.getElementById('timeline-next');

        if (!track) return;

        // Drag-to-scroll
        let isDown = false;
        let startX, scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.style.cursor = 'grabbing';
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
        });

        track.addEventListener('mouseleave', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });

        track.addEventListener('mouseup', () => {
            isDown = false;
            track.style.cursor = 'grab';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5; // Momentum multiplier
            track.scrollLeft = scrollLeft - walk;
        });

        // Progress bar
        function updateProgress() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            const progress = maxScroll > 0 ? (track.scrollLeft / maxScroll) * 100 : 0;
            progressBar.style.width = Math.max(progress, 5) + '%';
        }

        track.addEventListener('scroll', updateProgress, { passive: true });

        // Nav buttons
        const cardWidth = () => {
            const card = track.querySelector('.timeline__card');
            return card ? card.offsetWidth + 32 : 400; // card width + gap
        };

        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: cardWidth(), behavior: 'smooth' });
        });

        // Initial progress
        updateProgress();
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
