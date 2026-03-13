/* =============================================================
   MARKDOWN.JS — Markdown Content Loader
   =============================================================
   Fetches a .md file, parses it with the marked.js library
   (loaded from CDN in the HTML page), and injects the rendered
   HTML into a placeholder element.

   After injection, it wraps each entry (h2 + following paragraphs)
   inside a .md-card <div> for clean card-based styling.

   For CV pages, each # section becomes its own self-contained
   timeline segment wrapped in a .cv-section <div>.

   USAGE:
   1. Add a <div class="md-content" id="md-content" data-src="content/file.md"></div>
   2. Include the marked.js CDN script before this file.
   3. This script runs automatically on DOMContentLoaded.

   Users only need to edit the .md files inside /content/ —
   no HTML knowledge required.
   ============================================================= */


/**
 * loadMarkdown()
 * ----------------
 * Fetches a markdown file, renders it, wraps entries in cards,
 * and injects into a placeholder element.
 *
 * @param {string} elementId – id of the placeholder <div>.
 *                             Must have a data-src attribute.
 */
async function loadMarkdown(elementId) {
  if (window.location.protocol === 'file:') return; // Stop if opened as local file

  const container = document.getElementById(elementId);
  if (!container) return;

  const mdPath = container.getAttribute('data-src');
  if (!mdPath) {
    console.error('[markdown.js] No data-src attribute on #' + elementId);
    return;
  }

  try {
    const response = await fetch(mdPath);

    if (!response.ok) {
      throw new Error(`Failed to load ${mdPath}: ${response.status}`);
    }

    const mdText = await response.text();

    // Check that marked.js is available
    if (typeof marked === 'undefined') {
      throw new Error('marked.js library not loaded. Add the CDN script.');
    }

    // Parse markdown -> HTML and inject
    container.innerHTML = marked.parse(mdText);

    // Check if this is a CV timeline page
    const isTimeline = container.parentElement &&
                       container.parentElement.classList.contains('cv-timeline');

    if (isTimeline) {
      // Wrap entries into self-contained sections
      wrapEntriesInSections(container);
      observeTimelineNodes(container);
    } else {
      // Standard card wrapping for other pages
      wrapEntriesInCards(container);
      if (typeof initScrollAnimations === 'function') {
        initScrollAnimations();
      }
    }

  } catch (error) {
    console.error(`[markdown.js] ${error.message}`);
    container.innerHTML = '<p style="color:var(--color-text-muted)">Failed to load content.</p>';
  }
}


/**
 * wrapEntriesInCards()
 * ----------------
 * Walks through the rendered markdown DOM and groups each <h2>
 * plus its following siblings (paragraphs, etc.) into a
 * <div class="md-card fade-in"> wrapper.
 *
 * Groups are delimited by <hr> elements (--- in markdown).
 * <h1> section headings are left outside cards and get a
 * .fade-in class directly.
 */
function wrapEntriesInCards(container) {
  const children = Array.from(container.children);
  const fragment = document.createDocumentFragment();
  let currentCard = null;

  children.forEach(child => {
    const tag = child.tagName;

    if (tag === 'H1') {
      // Close any open card
      if (currentCard) {
        fragment.appendChild(currentCard);
        currentCard = null;
      }
      // Section heading — just add fade-in and append
      child.classList.add('fade-in');
      fragment.appendChild(child);

    } else if (tag === 'H2') {
      // Close previous card if open
      if (currentCard) {
        fragment.appendChild(currentCard);
      }
      // Start a new card
      currentCard = document.createElement('div');
      currentCard.className = 'md-card fade-in';
      currentCard.appendChild(child);

    } else if (tag === 'HR') {
      // <hr> = entry separator -> close the current card
      if (currentCard) {
        fragment.appendChild(currentCard);
        currentCard = null;
      }
      // Don't append the <hr> itself (cards provide separation)

    } else if (tag === 'UL' || tag === 'OL') {
      // Lists (e.g. Skills) — close any card, append as standalone
      if (currentCard) {
        fragment.appendChild(currentCard);
        currentCard = null;
      }
      child.classList.add('fade-in');
      fragment.appendChild(child);

    } else {
      // Paragraphs and other elements -> add to current card
      if (currentCard) {
        currentCard.appendChild(child);
      } else {
        // Orphaned element (not inside a card) — append directly
        fragment.appendChild(child);
      }
    }
  });

  // Close any remaining open card
  if (currentCard) {
    fragment.appendChild(currentCard);
  }

  // Replace container contents with the restructured DOM
  container.innerHTML = '';
  container.appendChild(fragment);
}


/**
 * wrapEntriesInSections()
 * ----------------
 * For CV timeline pages: wraps each # section and its child cards
 * into a self-contained <div class="cv-section"> wrapper.
 * Each section (Education, Experience, Awards, etc.) becomes its
 * own independent timeline segment with its own track line.
 *
 * Structure after wrapping:
 *   <div class="cv-section">
 *     <h1>Education</h1>
 *     <div class="md-card">...</div>
 *     <div class="md-card">...</div>
 *   </div>
 *   <div class="cv-section">
 *     <h1>Experience</h1>
 *     <div class="md-card">...</div>
 *   </div>
 */
function wrapEntriesInSections(container) {
  const children = Array.from(container.children);
  const fragment = document.createDocumentFragment();
  let currentSection = null;
  let currentCard = null;

  children.forEach(child => {
    const tag = child.tagName;

    if (tag === 'H1') {
      // Close any open card
      if (currentCard) {
        if (currentSection) currentSection.appendChild(currentCard);
        currentCard = null;
      }
      // Close any open section
      if (currentSection) {
        fragment.appendChild(currentSection);
      }
      // Start a new section
      currentSection = document.createElement('div');
      currentSection.className = 'cv-section';
      currentSection.appendChild(child);

    } else if (tag === 'H2') {
      // Close previous card if open
      if (currentCard) {
        if (currentSection) currentSection.appendChild(currentCard);
        else fragment.appendChild(currentCard);
      }
      // Start a new card
      currentCard = document.createElement('div');
      currentCard.className = 'md-card';
      currentCard.appendChild(child);

    } else if (tag === 'HR') {
      // Close the current card
      if (currentCard) {
        if (currentSection) currentSection.appendChild(currentCard);
        else fragment.appendChild(currentCard);
        currentCard = null;
      }

    } else if (tag === 'UL' || tag === 'OL') {
      // Close any open card
      if (currentCard) {
        if (currentSection) currentSection.appendChild(currentCard);
        else fragment.appendChild(currentCard);
        currentCard = null;
      }
      // Append list directly to current section
      if (currentSection) {
        currentSection.appendChild(child);
      } else {
        fragment.appendChild(child);
      }

    } else {
      // Paragraphs — add to current card
      if (currentCard) {
        currentCard.appendChild(child);
      } else if (currentSection) {
        currentSection.appendChild(child);
      } else {
        fragment.appendChild(child);
      }
    }
  });

  // Close remaining card and section
  if (currentCard) {
    if (currentSection) currentSection.appendChild(currentCard);
    else fragment.appendChild(currentCard);
  }
  if (currentSection) {
    fragment.appendChild(currentSection);
  }

  // Replace container contents
  container.innerHTML = '';
  container.appendChild(fragment);
}


/**
 * observeTimelineNodes()
 * ----------------
 * Uses IntersectionObserver to trigger 'in-view' classes on 
 * timeline cards and lists as they scroll into view.
 * Also marks parent cv-section as 'section-active' to trigger
 * the track line glow effect.
 */
function observeTimelineNodes(container) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');

        // Mark the parent section as active for track glow
        const section = entry.target.closest('.cv-section');
        if (section) {
          section.classList.add('section-active');
        }
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  });

  const cards = container.querySelectorAll('.md-card');
  const lists = container.querySelectorAll('ul, ol');

  cards.forEach(card => observer.observe(card));
  lists.forEach(list => observer.observe(list));
}


/* -----------------------------------------------------------
   BOOT — Load markdown when the DOM is ready
   ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  loadMarkdown('md-content');
});
