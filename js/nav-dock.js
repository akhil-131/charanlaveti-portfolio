window.initNavAndDock = function () {
  const quickDock  = document.getElementById('quickDock');
  const dockHandle = document.getElementById('dockHandle') || quickDock;

  if (quickDock) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startBottom = 0;

    function dockDragStart(e) {
      if (e.target.closest('a')) return;
      isDragging = true;
      const rect = quickDock.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX      = clientX;
      startY      = clientY;
      startLeft   = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      quickDock.style.right  = 'auto';
      quickDock.style.left   = `${startLeft}px`;
      quickDock.style.bottom = `${startBottom}px`;
      quickDock.style.transition = 'none';
      e.preventDefault();
    }

    function dockDragMove(e) {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const newLeft   = Math.max(0, Math.min(window.innerWidth  - quickDock.offsetWidth,  startLeft   + dx));
      const newBottom = Math.max(0, Math.min(window.innerHeight - quickDock.offsetHeight, startBottom - dy));
      quickDock.style.left   = `${newLeft}px`;
      quickDock.style.bottom = `${newBottom}px`;
      e.preventDefault();
    }

    function dockDragEnd() {
      isDragging = false;
      quickDock.style.transition = '';
    }

    dockHandle.addEventListener('mousedown',  dockDragStart, { passive: false });
    dockHandle.addEventListener('touchstart', dockDragStart, { passive: false });
    document.addEventListener('mousemove',    dockDragMove,  { passive: false });
    document.addEventListener('touchmove',    dockDragMove,  { passive: false });
    document.addEventListener('mouseup',      dockDragEnd);
    document.addEventListener('touchend',     dockDragEnd);

    function updateDockVisibility() {
      const scrollY    = window.scrollY;
      const vh         = window.innerHeight;
      const docH       = document.documentElement.scrollHeight;
      const nearFooter = (scrollY + vh) >= (docH - 130);

      if (scrollY > 350 && !nearFooter) {
        quickDock.classList.add('visible');
      } else {
        quickDock.classList.remove('visible');
      }
    }
    window.addEventListener('scroll', updateDockVisibility, { passive: true });
    updateDockVisibility();
  }

  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navLinks     = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      navLinks?.classList.remove('active');
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });
};