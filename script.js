/**
 * Script Interactivo - Portafolio Profesional de Luis Leonel Mejía Romero
 * Ambient Particle Mesh + Interactive Navigation & Quick Copy
 */

document.addEventListener('DOMContentLoaded', () => {
  initAmbientCanvas();
  initMobileNav();
  initScrollSpy();
  initEmailCopy();
  initConsoleEasterEgg();
});

/* ==========================================================================
   1. Ambient Canvas (Mesh Particles)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };
  let animationFrameId = null;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createParticles();
  }

  function createParticles() {
    const particleCount = Math.min(65, Math.floor((width * height) / 22000));
    particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.35 + 0.15,
        color: Math.random() > 0.4 ? 'rgba(0, 212, 255,' : 'rgba(56, 189, 248,',
      });
    }
  }

  window.addEventListener('resize', debounce(resize, 200));
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse gentle interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.5;
          p.y -= (dy / dist) * force * 1.5;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.baseAlpha})`;
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        const maxDist = 130;

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  resize();
  draw();
}

/* ==========================================================================
   2. Mobile Navigation Toggle
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when clicking link
  menu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ==========================================================================
   3. Scroll Spy for Active Navigation
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        current = section.getAttribute('id');
      }
    });

    if (current) {
      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   4. One-Click Copy for Email
   ========================================================================== */
function initEmailCopy() {
  const emailCard = document.getElementById('email-card');
  const copyBtn = document.getElementById('copy-email-btn');
  const emailText = document.getElementById('email-text');
  const copyStatus = document.getElementById('copy-status');

  if (!emailCard || !emailText) return;

  const handleCopy = (e) => {
    e.preventDefault();
    const email = emailText.innerText.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showCopyFeedback();
      }).catch(() => {
        fallbackCopy(email);
      });
    } else {
      fallbackCopy(email);
    }
  };

  function fallbackCopy(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showCopyFeedback();
  }

  function showCopyFeedback() {
    if (copyStatus) {
      const originalText = copyStatus.innerText;
      copyStatus.innerText = '✓ ¡Copiado al portapapeles!';
      copyStatus.style.color = '#34d399';
      setTimeout(() => {
        copyStatus.innerText = originalText;
        copyStatus.style.color = '';
      }, 3000);
    }
  }

  emailCard.addEventListener('click', handleCopy);
  if (copyBtn) copyBtn.addEventListener('click', handleCopy);
}

/* ==========================================================================
   5. Developer Console Easter Egg
   ========================================================================== */
function initConsoleEasterEgg() {
  const styles = [
    'color: #00d4ff',
    'background: #050811',
    'font-size: 13px',
    'font-weight: bold',
    'padding: 8px 12px',
    'border: 1px solid #00d4ff',
    'border-radius: 4px',
  ].join(';');

  console.log(
    '%c⚡ Luis Leonel Mejía Romero · Full Stack Developer (Angular / Node / SQL Server)',
    styles
  );
  console.log(
    'Plataforma en producción: https://sgi.unah.edu.hn | Repositorios: https://github.com/Leonel59'
  );
}

/* Helper debounce */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
