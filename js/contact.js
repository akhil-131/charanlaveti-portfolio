window.initContact = function () {
  const toast = document.getElementById('toastNotification');
  let toastTimer = null;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  function copyTextSafe(text, onComplete) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          if (onComplete) onComplete(true);
        })
        .catch(() => {
          const ok = fallbackCopy(text);
          if (onComplete) onComplete(ok);
        });
    } else {
      const ok = fallbackCopy(text);
      if (onComplete) onComplete(ok);
    }
  }

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ta);
      return success;
    } catch (err) {
      return false;
    }
  }

  // Pre-formatted inquiry message for Instagram DM
  const igPreMessage = "Hi Charan! I saw your portfolio website and I'd like to discuss a video editing project.";
  const igButtons = document.querySelectorAll('.contact-card--ig, a[href*="ig.me"]');

  igButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const igUrl = button.getAttribute('href') || 'https://ig.me/m/icharan05';

      copyTextSafe(igPreMessage, () => {
        showToast('📋 Project inquiry message copied! Paste it directly in Instagram DM.');
        setTimeout(() => {
          window.open(igUrl, '_blank', 'noopener,noreferrer');
        }, 300);
      });
    });
  });

  // Direct email copy helper
  const emailCard = document.getElementById('emailCard');
  if (emailCard) {
    emailCard.addEventListener('click', () => {
      const email = 'charanlaveti286@gmail.com';
      copyTextSafe(email, () => {
        showToast('✓ Email copied & opening Mail app...');
      });
    });
  }
};
