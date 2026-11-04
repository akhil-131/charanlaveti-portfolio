window.initCursor = function () {
  const cursorGlow   = document.getElementById('cursorGlow');
  const cursorDot    = document.getElementById('cursorDot');
  const cursorRing   = document.getElementById('cursorRing');
  const cursorCanvas = document.getElementById('cursorCanvas');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let glowX = mouseX, glowY = mouseY;
  let ringX = mouseX, ringY = mouseY;

  const trailPoints = [];
  const MAX_TRAIL = 20;

  let ctx = null;
  if (cursorCanvas) {
    ctx = cursorCanvas.getContext('2d');
    const resizeCanvas = () => {
      cursorCanvas.width  = window.innerWidth;
      cursorCanvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    trailPoints.push({ x: mouseX, y: mouseY, alpha: 1 });
    if (trailPoints.length > MAX_TRAIL) {
      trailPoints.shift();
    }
  });

  const interactiveSelector = 'a, button, .reel-card, .long-card, .tool-card, .contact-card, .filter-tab, .stat-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorRing?.classList.add('is-hovering');
      cursorDot?.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorRing?.classList.remove('is-hovering');
      cursorDot?.classList.remove('is-hovering');
    }
  });

  function animateCursor() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top  = `${glowY}px`;
    }

    ringX += (mouseX - ringX) * 0.22;
    ringY += (mouseY - ringY) * 0.22;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top  = `${mouseY}px`;
    }
    if (cursorRing) {
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top  = `${ringY}px`;
    }

    if (ctx && cursorCanvas) {
      ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

      if (trailPoints.length > 2) {
        for (let i = 1; i < trailPoints.length; i++) {
          const p0 = trailPoints[i - 1];
          const p1 = trailPoints[i];
          const ratio = i / trailPoints.length;
          const segAlpha = ratio * p1.alpha * 0.38;

          if (segAlpha > 0.01) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = `rgba(232, 201, 125, ${segAlpha})`;
            ctx.lineWidth = ratio * 3.5;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          p1.alpha *= 0.88;
        }
        if (trailPoints[0] && trailPoints[0].alpha < 0.05) {
          trailPoints.shift();
        }
      }
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
};
