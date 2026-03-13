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


/**
 * loadHomeContent()
 * ----------------
 * Maps home.md to the hero section layout
 */
async function loadHomeContent(elementId) {
  if (window.location.protocol === 'file:') return;
  const container = document.getElementById(elementId);
  if (!container) return;
  const mdPath = container.getAttribute('data-src');
  if (!mdPath) return;

  try {
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error(`Failed to load ${mdPath}`);
    const mdText = await response.text();

    if (typeof marked === 'undefined') throw new Error('marked.js missing');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(mdText);

    const h1 = tempDiv.querySelector('h1');
    const h2 = tempDiv.querySelector('h2');
    const h3 = tempDiv.querySelector('h3');
    const paragraphs = Array.from(tempDiv.querySelectorAll('p'));

    let html = '';
    if (h1) html += `<span class="hero__badge">${h1.innerHTML}</span>\n`;
    if (h2) html += `<h1 class="hero__title">${h2.innerHTML}</h1>\n`;
    if (h3) html += `<p class="hero__role">${h3.innerHTML}</p>\n`;
    paragraphs.forEach(p => {
      html += `<p class="hero__subtitle">${p.innerHTML}</p>\n`;
    });

    // Add back the hero actions
    html += `
      <div class="hero__actions">
        <a href="about.html" class="btn btn--primary">Learn More</a>
        <a href="publications.html" class="btn btn--outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Publications
        </a>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    console.error(`[markdown.js] ${err.message}`);
  }
}

/**
 * loadAboutContent()
 * ----------------
 * Maps about.md to the about page grid
 */
async function loadAboutContent(elementId) {
  if (window.location.protocol === 'file:') return;
  const container = document.getElementById(elementId);
  if (!container) return;
  const mdPath = container.getAttribute('data-src');
  if (!mdPath) return;

  try {
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error(`Failed to load`);
    const mdText = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(mdText);

    const children = Array.from(tempDiv.children);
    let bioHtml = '<h2>Who I Am</h2>';
    let isResearch = false;
    let researchTags = [];
    let educationHtml = '';
    let currentEduCard = '';

    children.forEach(child => {
      if (child.tagName === 'H2') {
        if (child.textContent === 'Research Interests') {
          isResearch = true;
        } else if (child.textContent === 'Education') {
          isResearch = false;
        }
      } else if (child.tagName === 'UL' && isResearch) {
        // Collect tags
        Array.from(child.children).forEach(li => researchTags.push(li.textContent));
      } else if (!isResearch) {
        // Bio or Education
        if (child.tagName === 'P' && educationHtml === '' && currentEduCard === '') {
          bioHtml += `<p>${child.innerHTML}</p>`;
        } else if (child.tagName === 'H3') {
          if (currentEduCard) educationHtml += `<div class="edu-card">${currentEduCard}</div>`;
          currentEduCard = `<h3>${child.innerHTML}</h3>`;
        } else if (child.tagName === 'P' && currentEduCard) {
          // Check if strong
          if (child.querySelector('strong')) {
             currentEduCard += `<div class="edu-card__institution">${child.innerHTML}</div>`;
          } else if (child.querySelector('em')) {
             currentEduCard += `<div class="edu-card__year">${child.innerHTML}</div>`;
          } else {
             currentEduCard += `<p>${child.innerHTML}</p>`;
          }
        }
      }
    });

    if (currentEduCard) educationHtml += `<div class="edu-card">${currentEduCard}</div>`;

    let html = bioHtml;
    if (researchTags.length > 0) {
      html += `<h2 style="margin-top: var(--space-xl);">Research Interests</h2><div class="about__interests">`;
      researchTags.forEach(tag => html += `<span class="tag">${tag}</span>`);
      html += `</div>`;
    }

    container.innerHTML = html;

    // Output Education block right after the about__grid, using DOM traversal in the actual page if needed,
    // or we assume container is wrapping both. But about.html separates about__body and about__education.
    // The easiest way is to push education to a specific element.
    const eduContainer = document.getElementById('about-education');
    if (eduContainer) {
       eduContainer.innerHTML = `<h2>Education</h2>${educationHtml}`;
    }

  } catch (err) {
    console.error(err);
  }
}

/**
 * loadContactContent()
 * ----------------
 * Maps contact.md to contact grid
 */
async function loadContactContent(elementId) {
  if (window.location.protocol === 'file:') return;
  const container = document.getElementById(elementId);
  if (!container) return;
  const mdPath = container.getAttribute('data-src');
  if (!mdPath) return;

  try {
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error('Failed to load');
    const mdText = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = marked.parse(mdText);

    // Split by HR
    let cards = [];
    let currentCard = [];
    Array.from(tempDiv.children).forEach(child => {
      if (child.tagName === 'HR') {
        if (currentCard.length) cards.push(currentCard);
        currentCard = [];
      } else {
        currentCard.push(child);
      }
    });
    if (currentCard.length) cards.push(currentCard);

    let html = '';
    
    // Assign icons based on index
    const icons = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>`
    ];

    cards.forEach((card, index) => {
      const icon = icons[index % icons.length];
      const title = card.find(c => c.tagName === 'H1' || c.tagName === 'H2');
      const paragraphs = card.filter(c => c.tagName === 'P');

      if (title) {
         html += `
          <div class="contact-card">
            <div class="contact-card__icon">${icon}</div>
            <h3>${title.textContent}</h3>
            ${paragraphs.map(p => {
               // Make email clickable if it contains @
               if (p.textContent.includes('@')) {
                 return `<a href="mailto:${p.textContent}">${p.innerHTML}</a>`;
               }
               return `<p>${p.innerHTML}</p>`;
            }).join('')}
          </div>
         `;
      }
    });

    container.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

/* -----------------------------------------------------------
   BOOT — Load markdown when the DOM is ready
   ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('md-content')) loadMarkdown('md-content');
  if (document.getElementById('home-content')) loadHomeContent('home-content');
  if (document.getElementById('about-content')) loadAboutContent('about-content');
  if (document.getElementById('contact-content')) loadContactContent('contact-content');
});
