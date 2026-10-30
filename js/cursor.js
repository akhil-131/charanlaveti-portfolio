window.initCursor = function () {
  const cursorGlow   = document.getElementById('cursorGlow');
  const cursorDot    = document.getElementById('cursorDot');
  const cursorRing   = document.getElementById('cursorRing');
  const cursorCanvas = document.getElementById('cursorCanvas');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let prevMouseX = mouseX;
  let prevMouseY = mouseY;

  let glowX = mouseX, glowY = mouseY;
  let ringX = mouseX, ringY = mouseY;

  const GOLD_COLORS = [
    '#f7df9c',
    '#e8c97d',
    '#d4a843',
    '#fff6dc',
    '#c4983c'
  ];

  const particles = [];
  const trailPoints = [];
  const MAX_TRAIL = 18;

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

  function spawnGoldParticle(x, y, speedFactor = 1, isBurst = false) {
    if (particles.length > 90) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst
      ? (Math.random() * 3.6 + 1.2)
      : (Math.random() * 1.4 + 0.25) * Math.min(speedFactor, 2.2);

    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? 0 : 0.25),
      size: isBurst ? (Math.random() * 3.2 + 1.5) : (Math.random() * 2.6 + 1.0),
      alpha: 1,
      decay: isBurst ? (Math.random() * 0.022 + 0.016) : (Math.random() * 0.025 + 0.015),
      color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
      isStar: Math.random() > 0.55,
      rotation: Math.random() * Math.PI
    });
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    const dist = Math.hypot(dx, dy);

    trailPoints.push({ x: mouseX, y: mouseY, alpha: 1 });
    if (trailPoints.length > MAX_TRAIL) {
      trailPoints.shift();
    }

    if (dist > 2) {
      const count = Math.min(Math.ceil(dist / 12), 3);
      for (let i = 0; i < count; i++) {
        spawnGoldParticle(mouseX, mouseY, dist / 14, false);
      }
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;
  });

  document.addEventListener('mousedown', (e) => {
    for (let i = 0; i < 12; i++) {
      spawnGoldParticle(e.clientX, e.clientY, 1.5, true);
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

  function drawStar(context, cx, cy, spikes, outerRadius, innerRadius, rotation) {
    let rot = (Math.PI / 2) * 3 + rotation;
    const step = Math.PI / spikes;
    context.beginPath();
    context.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      context.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      context.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    context.closePath();
    context.fill();
  }

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

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha -= p.decay;
        p.rotation += 0.04;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = '#e8c97d';
        ctx.shadowBlur = 8;

        if (p.isStar) {
          drawStar(ctx, p.x, p.y, 4, p.size * 1.6, p.size * 0.55, p.rotation);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
};