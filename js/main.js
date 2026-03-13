/* =============================================================
   MAIN.JS — Page Interactivity
   =============================================================
   Lightweight scripts for:
     • Scroll-triggered fade-in animations (IntersectionObserver)
     • Active-nav highlighting as the user scrolls
   ============================================================= */


/* -----------------------------------------------------------
   1. SCROLL FADE-IN ANIMATIONS
   -----------------------------------------------------------
   Any element with the class .fade-in will animate into view
   when it enters the viewport.  The CSS for .fade-in and
   .fade-in.visible lives in main.css.
   ----------------------------------------------------------- */

function initScrollAnimations() {
  const faders = document.querySelectorAll('.fade-in');

  // If the browser doesn't support IntersectionObserver, just
  // make everything visible immediately (graceful fallback).
  if (!('IntersectionObserver' in window)) {
    faders.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);   // animate only once
      }
    });
  }, {
    /* Trigger when 15% of the element is visible */
    threshold: 0.15
  });

  faders.forEach(el => observer.observe(el));
}


/* -----------------------------------------------------------
   2. ACTIVE NAV HIGHLIGHTING
   -----------------------------------------------------------
   Watches which <section> is in view and applies the .active
   class to the matching navbar link.
   ----------------------------------------------------------- */

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');

  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        // Remove .active from all nav links, then add to the match
        document.querySelectorAll('.navbar__links a').forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px'   /* roughly "middle of viewport" */
  });

  sections.forEach(section => observer.observe(section));
}


/* -----------------------------------------------------------
   BOOT
   ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();

  // Small delay so the navbar component is injected first
  setTimeout(initActiveNav, 300);
});
