window.initAnimations = function () {
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      if (delay > 0) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            el.classList.add('revealed');
          });
        }, delay);
      } else {
        requestAnimationFrame(() => {
          el.classList.add('revealed');
        });
      }
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let countersStarted = false;

  function runCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000;
    let startTime  = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal   = Math.floor(easeProgress * target);

      el.textContent = currentVal;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }

    window.requestAnimationFrame(step);
  }

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        requestAnimationFrame(() => {
          statNumbers.forEach(el => runCounter(el));
        });
      }
    }, { threshold: 0.2 });
    statsObserver.observe(statsSection);
  }
};
