const canvas = document.querySelector("#cyber-stage");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let particles = [];
let skyline = [];
let pulse = 0;

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  particles = Array.from({ length: Math.floor(width / 16) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.25 + Math.random() * 1.6,
    size: 1 + Math.random() * 2.2,
    hue: Math.random() > 0.5 ? "#00e5ff" : "#ff3df2",
  }));

  const buildingCount = Math.max(14, Math.floor(width / 90));
  const buildingWidth = width / buildingCount;
  skyline = Array.from({ length: buildingCount }, (_, index) => ({
    x: index * buildingWidth,
    w: buildingWidth * (0.62 + Math.random() * 0.34),
    h: height * (0.15 + Math.random() * 0.26),
    windows: Math.floor(4 + Math.random() * 9),
  }));
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#070313");
  gradient.addColorStop(0.55, "#09051a");
  gradient.addColorStop(1, "#17051f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSun() {
  const radius = Math.min(width, height) * 0.18;
  const x = width * 0.72;
  const y = height * 0.28;
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, "rgba(255, 230, 109, 0.42)");
  glow.addColorStop(0.35, "rgba(255, 45, 117, 0.22)");
  glow.addColorStop(1, "rgba(255, 45, 117, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 230, 109, 0.22)";
  ctx.lineWidth = 1;
  for (let line = -3; line < 5; line += 1) {
    const yy = y + line * 18 + Math.sin(pulse * 0.025 + line) * 3;
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.82, yy);
    ctx.lineTo(x + radius * 0.82, yy);
    ctx.stroke();
  }
}

function drawSkyline() {
  const baseY = height * 0.56;
  skyline.forEach((building, index) => {
    const x = building.x;
    const top = baseY - building.h;

    ctx.fillStyle = "rgba(5, 3, 15, 0.92)";
    ctx.fillRect(x, top, building.w, building.h + 4);

    ctx.strokeStyle = index % 2 === 0 ? "rgba(0, 229, 255, 0.42)" : "rgba(255, 61, 242, 0.36)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, top + 0.5, building.w, building.h);

    const gap = building.w / 5;
    for (let row = 0; row < building.windows; row += 1) {
      for (let col = 1; col < 4; col += 1) {
        if ((row + col + index + Math.floor(pulse / 60)) % 4 === 0) continue;
        ctx.fillStyle = col % 2 === 0 ? "rgba(0, 229, 255, 0.65)" : "rgba(255, 230, 109, 0.55)";
        ctx.fillRect(x + col * gap, top + 14 + row * 14, Math.max(3, gap * 0.28), 3);
      }
    }
  });
}

function drawGrid() {
  const horizon = height * 0.58;
  const bottom = height;
  const center = width * 0.5;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0, 229, 255, 0.24)";
  for (let i = -18; i <= 18; i += 1) {
    const x = center + i * 42;
    ctx.beginPath();
    ctx.moveTo(center + i * 5, horizon);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }

  for (let i = 0; i < 22; i += 1) {
    const t = i / 22;
    const y = horizon + Math.pow(t, 2.25) * (bottom - horizon);
    const alpha = 0.13 + t * 0.42;
    ctx.strokeStyle = `rgba(255, 61, 242, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawParticles() {
  particles.forEach((particle) => {
    particle.y += particle.speed;
    particle.x += Math.sin((particle.y + pulse) * 0.01) * 0.18;

    if (particle.y > height) {
      particle.y = -12;
      particle.x = Math.random() * width;
    }

    ctx.fillStyle = particle.hue;
    ctx.globalAlpha = 0.35 + Math.random() * 0.38;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size * 8);
    ctx.globalAlpha = 1;
  });
}

function drawGlitches() {
  if (Math.random() > 0.92) {
    const y = Math.random() * height * 0.72;
    const h = 2 + Math.random() * 10;
    const x = Math.random() * width * 0.35;
    const w = width * (0.18 + Math.random() * 0.5);
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0, 229, 255, 0.34)" : "rgba(255, 61, 242, 0.28)";
    ctx.fillRect(x, y, w, h);
  }
}

function draw() {
  pulse += 1;
  drawBackground();
  drawSun();
  drawSkyline();
  drawGrid();
  drawParticles();
  drawGlitches();
  window.requestAnimationFrame(draw);
}

resizeCanvas();
draw();

window.addEventListener("resize", resizeCanvas);
