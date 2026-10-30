/* ==========================================================================
   WORK SECTION INTERACTIVE CONTROLLER
   - True Circular Queue (Infinite Loop) Carousels:
     * Shorts / Reels (9:16): Exactly 3 visible at 1024px+, 2 on tablet, 1 on mobile
     * Long Form (16:9): Exactly 1 visible on all screens
   - Smooth 1-by-1 Shift: 1 -> 2 -> 3 -> 4 -> 5 -> 1 -> 2... and reverse
   - Click-to-Play Instant Embeds (YouTube 16:9 & Instagram 9:16)
   - Auto-pause playing videos on slide change or navigation
   - Zero Google Drive dependencies & Full Security Audit
   ========================================================================== */

window.initWork = function () {
  // ------------------------------------------------------------------------
  // 1. VIDEO PLAYBACK CONTROLLER (PAUSE ALL / PLAY CLICKED)
  // ------------------------------------------------------------------------
  function pauseAllVideos() {
    document.querySelectorAll('.video-media.is-playing').forEach(media => {
      media.classList.remove('is-playing');
      const slot = media.querySelector('.video-player-slot');
      if (slot) {
        slot.innerHTML = '';
      }
    });
  }

  function playVideo(media) {
    if (!media) return;

    // 1. Stop any currently playing video
    pauseAllVideos();

    // 2. Mark this media as active
    media.classList.add('is-playing');

    const slot = media.querySelector('.video-player-slot');
    if (!slot) return;

    const videoType = media.getAttribute('data-video-type');

    if (videoType === 'youtube') {
      const ytId = media.getAttribute('data-yt-id');
      if (ytId) {
        slot.innerHTML = `<iframe
          src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&enablejsapi=1"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>`;
      }
    } else if (videoType === 'instagram') {
      const reelId = media.getAttribute('data-reel-id');
      if (reelId) {
        slot.innerHTML = `<iframe
          src="https://www.instagram.com/reel/${reelId}/embed/"
          frameborder="0"
          scrolling="no"
          allowtransparency="true"
          sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin">
        </iframe>`;
      }
    }
  }

  // Click delegation for play buttons & poster overlays
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.reel-play-btn, .video-poster');
    if (!trigger) return;
    const media = trigger.closest('.video-media');
    if (!media) return;

    const viewport = media.closest('.carousel-viewport');
    if (viewport && viewport.classList.contains('is-dragging')) return;

    playVideo(media);
  });

  // ------------------------------------------------------------------------
  // 2. CIRCULAR QUEUE (INFINITE LOOP) CAROUSEL ENGINE
  // ------------------------------------------------------------------------
  function initCircularCarousel(options) {
    const {
      wrapper,
      viewport,
      track,
      prevBtn,
      nextBtn,
      counterEl,
      dotsContainer,
      getVisibleCount,
      gap = 24
    } = options;

    if (!wrapper || !viewport || !track) return null;

    const originalCards = Array.from(track.querySelectorAll('.carousel-card:not([data-clone])'));
    const N = originalCards.length;
    if (N === 0) return null;

    // Helper to clone cards without duplicate IDs
    function createClone(card, cloneType) {
      const clone = card.cloneNode(true);
      clone.setAttribute('data-clone', cloneType);
      clone.setAttribute('aria-hidden', 'true');
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      return clone;
    }

    // Prepend 1 full set of clones in exact order
    originalCards.slice().reverse().forEach(card => {
      track.insertBefore(createClone(card, 'prepend'), track.firstChild);
    });

    // Append 1 full set of clones in exact order
    originalCards.forEach(card => {
      track.appendChild(createClone(card, 'append'));
    });

    // Track now contains 3 * N cards:
    // [0 .. N-1]        : Prepend clones
    // [N .. 2*N - 1]    : Original cards
    // [2*N .. 3*N - 1]  : Append clones

    let currentIndex = N; // Start at original card 0

    function updateLayout() {
      const viewportWidth = viewport.clientWidth;
      const visibleCount = getVisibleCount();
      const currentGap = (window.innerWidth <= 640) ? 16 : gap;
      track.style.setProperty('--gap', `${currentGap}px`);

      const cardWidth = Math.floor((viewportWidth - (visibleCount - 1) * currentGap) / visibleCount);
      wrapper.style.setProperty('--card-width', `${cardWidth}px`);

      return cardWidth + currentGap;
    }

    let step = updateLayout();

    function applyTransform(withTransition = true) {
      if (withTransition) {
        track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
      } else {
        track.style.transition = 'none';
      }
      track.style.transform = `translate3d(${- currentIndex * step}px, 0, 0)`;
    }

    function updateIndicators() {
      const realIndex = ((currentIndex % N) + N) % N;

      if (counterEl) {
        const cur = String(realIndex + 1).padStart(2, '0');
        const tot = String(N).padStart(2, '0');
        counterEl.textContent = `${cur} / ${tot}`;
      }

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === realIndex);
        });
      }
    }

    function goToIndex(targetIndex, withTransition = true) {
      if (targetIndex !== currentIndex) {
        pauseAllVideos();
      }
      currentIndex = targetIndex;
      updateIndicators();
      applyTransform(withTransition);
    }

    // Seamless Infinite Loop Normalization on Transition End
    track.addEventListener('transitionend', (e) => {
      if (e.target !== track) return;

      if (currentIndex >= 2 * N) {
        // Teleport silently back into the original range
        track.style.transition = 'none';
        currentIndex = (currentIndex % N) + N;
        track.style.transform = `translate3d(${- currentIndex * step}px, 0, 0)`;
        void track.offsetWidth;
      } else if (currentIndex < N) {
        // Teleport silently back into the original range
        track.style.transition = 'none';
        currentIndex = (currentIndex % N) + N;
        track.style.transform = `translate3d(${- currentIndex * step}px, 0, 0)`;
        void track.offsetWidth;
      }
    });

    // Arrow Navigation
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        goToIndex(currentIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        goToIndex(currentIndex - 1);
      });
    }

    // Dots Navigation (Shortest Circular Path)
    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.carousel-dot');
        if (!dot) return;
        const targetReal = parseInt(dot.getAttribute('data-index'), 10);
        if (isNaN(targetReal)) return;

        const currentReal = ((currentIndex % N) + N) % N;
        let diff = targetReal - currentReal;
        if (diff > N / 2) diff -= N;
        if (diff < -N / 2) diff += N;

        goToIndex(currentIndex + diff);
      });
    }

    // Pointer / Touch / Mouse Drag Swiping
    let isPointerDown = false;
    let startX = 0;
    let currentTranslateX = 0;
    let dragDeltaX = 0;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a, iframe, input, select')) return;
      isPointerDown = true;
      startX = e.clientX;
      currentTranslateX = - currentIndex * step;
      track.style.transition = 'none';
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch(err) {}
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isPointerDown) return;
      dragDeltaX = e.clientX - startX;
      track.style.transform = `translate3d(${currentTranslateX + dragDeltaX}px, 0, 0)`;
    });

    function handlePointerEnd(e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      viewport.classList.remove('is-dragging');
      try { viewport.releasePointerCapture(e.pointerId); } catch(err) {}

      if (dragDeltaX < -45) {
        goToIndex(currentIndex + 1);
      } else if (dragDeltaX > 45) {
        goToIndex(currentIndex - 1);
      } else {
        goToIndex(currentIndex);
      }
      dragDeltaX = 0;
    }

    viewport.addEventListener('pointerup', handlePointerEnd);
    viewport.addEventListener('pointercancel', handlePointerEnd);

    // Responsive Auto-Update via ResizeObserver
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        step = updateLayout();
        applyTransform(false);
      });
      ro.observe(viewport);
    } else {
      window.addEventListener('resize', () => {
        step = updateLayout();
        applyTransform(false);
      });
    }

    // Initial setup
    step = updateLayout();
    goToIndex(N, false);

    return {
      update: () => {
        step = updateLayout();
        applyTransform(false);
      }
    };
  }

  // ------------------------------------------------------------------------
  // 3. INITIALIZE CAROUSELS
  // ------------------------------------------------------------------------
  const reelsCarouselCtrl = initCircularCarousel({
    wrapper:       document.getElementById('reelsCarousel'),
    viewport:      document.getElementById('reelsViewport'),
    track:         document.getElementById('reelsTrack'),
    prevBtn:       document.getElementById('reelsPrevBtn'),
    nextBtn:       document.getElementById('reelsNextBtn'),
    counterEl:     document.getElementById('reelsCounter'),
    dotsContainer: document.getElementById('reelsDots'),
    getVisibleCount: () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 641)  return 2;
      return 1;
    },
    gap: 24
  });

  const longCarouselCtrl = initCircularCarousel({
    wrapper:       document.getElementById('longCarousel'),
    viewport:      document.getElementById('longViewport'),
    track:         document.getElementById('longTrack'),
    prevBtn:       document.getElementById('longPrevBtn'),
    nextBtn:       document.getElementById('longNextBtn'),
    counterEl:     document.getElementById('longCounter'),
    dotsContainer: document.getElementById('longDots'),
    getVisibleCount: () => 1,
    gap: 24
  });

  // ------------------------------------------------------------------------
  // 4. WORK FILTER TABS SWITCHER
  // ------------------------------------------------------------------------
  const filterTabs  = document.querySelectorAll('.filter-tab');
  const reelsGroups = document.querySelectorAll('.work-group-reels');
  const longGroups  = document.querySelectorAll('.work-group-long');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      reelsGroups.forEach(g => {
        g.style.display = (filter === 'long') ? 'none' : 'block';
      });
      longGroups.forEach(g => {
        g.style.display = (filter === 'reels') ? 'none' : 'block';
      });

      pauseAllVideos();

      setTimeout(() => {
        if (reelsCarouselCtrl) reelsCarouselCtrl.update();
        if (longCarouselCtrl)  longCarouselCtrl.update();
      }, 50);
    });
  });
};
