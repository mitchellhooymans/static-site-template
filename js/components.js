/* =============================================================
   COMPONENTS.JS — Reusable Component Injection
   =============================================================
   This script loads shared HTML snippets (navbar, footer) from
   the /components/ folder and injects them into placeholder
   elements on each page.

   HOW IT WORKS:
   1. On every page you add:
        <div id="navbar-placeholder"></div>   (where the nav goes)
        <div id="footer-placeholder"></div>   (where the footer goes)
   2. This script fetches the HTML files and drops them in.
   3. After injection it wires up the mobile-menu toggle and
      sets the copyright year.

   WHY?  You only edit navbar.html or footer.html ONCE and the
   change appears on every page that includes this script.
   ============================================================= */


/**
 * loadComponent()
 * ----------------
 * Fetches an HTML snippet and injects it into a placeholder element.
 *
 * @param {string} placeholderId – The id of the target <div>.
 * @param {string} filePath      – Relative path to the HTML snippet.
 * @returns {Promise<void>}
 */
async function loadComponent(placeholderId, filePath) {
  const placeholder = document.getElementById(placeholderId);

  // Safety check — skip if the placeholder doesn't exist on this page
  if (!placeholder) return;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status}`);
    }

    // Insert the fetched HTML into the placeholder
    placeholder.innerHTML = await response.text();

  } catch (error) {
    console.error(`[components.js] ${error.message}`);
  }
}


/**
 * initNavbar()
 * ----------------
 * Wires up the mobile hamburger menu toggle.
 * Called after the navbar HTML has been injected.
 */
function initNavbar() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu when a link is clicked
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/**
 * initFooter()
 * ----------------
 * Sets the copyright year to the current year automatically.
 * Called after the footer HTML has been injected.
 */
function initFooter() {
  const yearSpan = document.getElementById('footer-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}


/* -----------------------------------------------------------
   BOOT — Load components when the DOM is ready
   ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', async () => {

  // Load the navbar, then initialise its toggle behaviour
  await loadComponent('navbar-placeholder', 'components/navbar.html');
  initNavbar();

  // Load the footer, then set the copyright year
  await loadComponent('footer-placeholder', 'components/footer.html');
  initFooter();
});
