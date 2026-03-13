/* =============================================================
   MARKDOWN.JS — Markdown Content Loader
   =============================================================
   Fetches a .md file, parses it with the marked.js library
   (loaded from CDN in the HTML page), and injects the rendered
   HTML into a placeholder element.

   After injection, it wraps each entry (h2 + following paragraphs)
   inside a .md-card <div> for clean card-based styling.

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

    // Parse markdown → HTML and inject
    container.innerHTML = marked.parse(mdText);

    // Wrap entries in card divs for styling
    wrapEntriesInCards(container);

    // Re-run scroll animations for new elements
    if (typeof initScrollAnimations === 'function') {
      initScrollAnimations();
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
 *
 * Before:
 *   <h1>Education</h1>
 *   <h2>PhD ...</h2>
 *   <p>Details...</p>
 *   <p>More...</p>
 *   <hr>
 *   <h2>BSc ...</h2>
 *   <p>Details...</p>
 *   <hr>
 *
 * After:
 *   <h1 class="fade-in">Education</h1>
 *   <div class="md-card fade-in">
 *     <h2>PhD ...</h2>
 *     <p>Details...</p>
 *     <p>More...</p>
 *   </div>
 *   <div class="md-card fade-in">
 *     <h2>BSc ...</h2>
 *     <p>Details...</p>
 *   </div>
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
      // <hr> = entry separator → close the current card
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
      // Paragraphs and other elements → add to current card
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


/* -----------------------------------------------------------
   BOOT — Load markdown when the DOM is ready
   ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  loadMarkdown('md-content');
});
