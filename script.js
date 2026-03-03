// Holi palette setup: easy to customize in one place.
const HOLI_PALETTES = [
  ["#ff4fa3", "#ffd642", "#3da9ff", "#2be7a5", "#8d5cff"],
  ["#f72585", "#4cc9f0", "#fee440", "#80ed99", "#9d4edd"],
  ["#ff5d8f", "#ffbe0b", "#00bbf9", "#06d6a0", "#8338ec"],
  ["#ff7aa2", "#ffe066", "#54a0ff", "#1dd1a1", "#a55eea"]
];

const QUOTES = [
  '“Bura na mano, Holi hai!”',
  '“Rangon ka tyohar, khushiyon ka izhaar.”',
  '“Play safe, smile bright, and spread color.”',
  '“May your life be as colorful as Holi.”'
];

const canvas = document.getElementById("powderCanvas");
const ctx = canvas.getContext("2d");
const cursorGlow = document.getElementById("cursorGlow");
const throwBtn = document.getElementById("throwColorsBtn");
const quoteEl = document.getElementById("quote");
const gradientBg = document.querySelector(".gradient-bg");

let width = 0;
let height = 0;
let paletteIndex = 0;
let particles = [];

const PARTICLE_COUNT_BG = 70;
const PARTICLE_COUNT_BURST = 160;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createFloatingParticles() {
  const palette = HOLI_PALETTES[paletteIndex];
  for (let i = 0; i < PARTICLE_COUNT_BG; i += 1) {
    particles.push({
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.25, 0.25),
      vy: random(-0.4, -0.08),
      size: random(2, 6),
      alpha: random(0.15, 0.55),
      color: pick(palette),
      life: Infinity,
      drag: 1,
      gravity: 0
    });
  }
}

function burst(x, y, intensity = 1) {
  const palette = HOLI_PALETTES[paletteIndex];
  const count = Math.floor(PARTICLE_COUNT_BURST * intensity);

  for (let i = 0; i < count; i += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(1.8, 7.2) * intensity;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: random(2, 9),
      alpha: random(0.45, 0.95),
      color: pick(palette),
      life: random(38, 92),
      drag: 0.976,
      gravity: 0.05
    });
  }
}

function updateParticles() {
  ctx.clearRect(0, 0, width, height);

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];

    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;

    // Loop ambient particles, fade out burst particles.
    if (p.life === Infinity) {
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
    } else {
      p.life -= 1;
      p.alpha *= 0.985;
    }

    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.life !== Infinity && (p.life <= 0 || p.alpha <= 0.02)) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(updateParticles);
}

function setGradientTheme() {
  const colors = HOLI_PALETTES[paletteIndex];
  gradientBg.style.background = `linear-gradient(120deg, ${colors.join(",")}, ${colors[0]})`;
  gradientBg.style.backgroundSize = "300% 300%";
}

function cycleTheme() {
  paletteIndex = (paletteIndex + 1) % HOLI_PALETTES.length;
  setGradientTheme();
}

function showRipple(button, clientX, clientY) {
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${clientX - rect.left}px`;
  ripple.style.top = `${clientY - rect.top}px`;
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

function rotateQuotes() {
  let index = 0;
  setInterval(() => {
    quoteEl.classList.add("fade");
    setTimeout(() => {
      index = (index + 1) % QUOTES.length;
      quoteEl.textContent = QUOTES[index];
      quoteEl.classList.remove("fade");
    }, 280);
  }, 2600);
}

// Mouse-follow glow effect.
window.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

window.addEventListener("pointerdown", (event) => {
  burst(event.clientX, event.clientY, 0.85);
});

throwBtn.addEventListener("click", (event) => {
  const rect = throwBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  showRipple(throwBtn, event.clientX, event.clientY);

  // Main festive blast + slight firework offset blasts.
  burst(centerX, centerY, 1.2);
  setTimeout(() => burst(centerX - random(80, 160), centerY - random(30, 140), 0.7), 120);
  setTimeout(() => burst(centerX + random(80, 160), centerY - random(30, 140), 0.7), 180);
  setTimeout(() => burst(centerX, centerY - random(80, 180), 0.9), 260);

  cycleTheme();
});

window.addEventListener("resize", resizeCanvas);

// Initialization
resizeCanvas();
setGradientTheme();
createFloatingParticles();
rotateQuotes();
updateParticles();

// Subtle boot splash for smooth entrance.
setTimeout(() => {
  burst(width * 0.5, height * 0.5, 0.75);
}, 260);
