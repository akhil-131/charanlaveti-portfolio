/* ==========================================================================
   MODULAR SECTION LOADER (VS CODE LIVE SERVER OPTIMIZED)
   - Resolves all section paths relative to window.location.href
   - Strips Live Server injected scripts using DOMParser
   - Sequentially awaits all HTML section injections in order
   - Initializes all interactive modules and dispatches portfolio:ready hook
   ========================================================================== */

function sanitizeFetchedHtml(rawHtml) {
  if (!rawHtml) return '';
  // 1. Strip VS Code Live Server injected comment and script block
  const stripped = rawHtml.replace(/<!--\s*Code injected by live-server\s*-->[\s\S]*?<\/script>/gi, '');

  // 2. Parse using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(stripped, 'text/html');

  // 3. Remove all script tags from the fragment to avoid duplicate execution
  doc.querySelectorAll('script').forEach(script => script.remove());

  return doc.body.innerHTML.trim();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize custom cursor immediately (elements exist in index.html)
  if (typeof window.initCursor === 'function') {
    try {
      window.initCursor();
    } catch (e) {
      console.error('[Loader] Error initializing cursor:', e);
    }
  }

  // Exact 1-to-1 mapping of slots to files in /sections
  const sections = [
    { id: 'navbar-slot',         file: 'sections/navbar.html' },
    { id: 'hero-slot',           file: 'sections/hero.html' },
    { id: 'about-slot',          file: 'sections/about.html' },
    { id: 'work-slot',           file: 'sections/work.html' },
    { id: 'stats-tools-slot',    file: 'sections/stats-tools.html' },
    { id: 'contact-footer-slot', file: 'sections/contact-footer.html' }
  ];

  // Await each section injection sequentially in exact order
  for (const { id, file } of sections) {
    const slot = document.getElementById(id);
    if (!slot) continue;

    try {
      const resolvedUrl = new URL(file, window.location.href).href;
      const response = await fetch(resolvedUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const rawText = await response.text();
      const cleanedHtml = sanitizeFetchedHtml(rawText);
      slot.outerHTML = cleanedHtml;
    } catch (err) {
      console.error(`[Loader] Failed to load section "${file}":`, err);
    }
  }

  // Initialize interactive modules only after all section DOM elements exist
  if (typeof window.initAnimations === 'function') {
    try { window.initAnimations(); } catch (e) { console.error('[Loader] initAnimations error:', e); }
  }
  if (typeof window.initWork === 'function') {
    try { window.initWork(); } catch (e) { console.error('[Loader] initWork error:', e); }
  }
  if (typeof window.initNavAndDock === 'function') {
    try { window.initNavAndDock(); } catch (e) { console.error('[Loader] initNavAndDock error:', e); }
  }
  if (typeof window.initContact === 'function') {
    try { window.initContact(); } catch (e) { console.error('[Loader] initContact error:', e); }
  }

  // Safety guarantee: Reveal all elements with [data-reveal]
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }, 500);

  // Dispatch portfolio:ready custom event hook
  window.dispatchEvent(new CustomEvent('portfolio:ready'));
});
