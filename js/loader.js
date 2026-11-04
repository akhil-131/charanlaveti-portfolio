/* ==========================================================================
   MODULAR SECTION LOADER (VS CODE LIVE SERVER & HARD RELOAD OPTIMIZED)
   - Resolves all section paths relative to window.location.href
   - Strips Live Server injected scripts using DOMParser
   - Fetches sections concurrently via Promise.all to eliminate network delays
   - Batches DOM injections & module inits inside requestAnimationFrame (60/120fps)
   - Synchronizes hero entrance reveal smoothly as preloader curtain lifts (3.0s)
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

  // Concurrently fetch all sections for zero-latency network delivery on hard reload
  const fetched = await Promise.all(
    sections.map(async ({ id, file }) => {
      try {
        const resolvedUrl = new URL(file, window.location.href).href;
        const response = await fetch(resolvedUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const rawText = await response.text();
        return { id, html: sanitizeFetchedHtml(rawText) };
      } catch (err) {
        console.error(`[Loader] Failed to load section "${file}":`, err);
        return { id, html: '' };
      }
    })
  );

  // Batch DOM injections inside a single requestAnimationFrame to eliminate layout thrashing
  requestAnimationFrame(() => {
    for (const { id, html } of fetched) {
      if (!html) continue;
      const slot = document.getElementById(id);
      if (slot) slot.outerHTML = html;
    }

    // Schedule interactive module inits on the subsequent animation frame
    requestAnimationFrame(() => {
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

      // Smooth entrance synchronizer: Reveal hero elements as preloader curtain lifts (3.0s)
      setTimeout(() => {
        requestAnimationFrame(() => {
          document.querySelectorAll('.hero-section [data-reveal]').forEach(el => el.classList.add('revealed'));
        });
      }, 3000);

      // Safety fallback: ensure any off-screen or unobserved reveal elements are visible
      setTimeout(() => {
        requestAnimationFrame(() => {
          document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
        });
      }, 3400);

      // Dispatch portfolio:ready custom event hook
      window.dispatchEvent(new CustomEvent('portfolio:ready'));
    });
  });
});
