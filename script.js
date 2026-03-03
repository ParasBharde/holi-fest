// Holi Color Blitz: step-wise flow + game + canvas effects + optional Neon leaderboard APIs.
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

const GAME_DURATION = 20;

const canvas = document.getElementById("powderCanvas");
const ctx = canvas.getContext("2d");
const cursorGlow = document.getElementById("cursorGlow");
const quoteEl = document.getElementById("quote");
const gradientBg = document.querySelector(".gradient-bg");
const throwBtn = document.getElementById("throwColorsBtn");
const restartBtn = document.getElementById("restartBtn");
const bonusOrb = document.getElementById("bonusOrb");

const setupPanel = document.getElementById("setupPanel");
const gamePanel = document.getElementById("gamePanel");
const playerForm = document.getElementById("playerForm");
const playerNameInput = document.getElementById("playerName");
const playerLabel = document.getElementById("playerLabel");
const scoreLabel = document.getElementById("scoreLabel");
const timeLabel = document.getElementById("timeLabel");
const leaderboard = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboardList");

let width = 0;
let height = 0;
let paletteIndex = 0;
let particles = [];
let playerName = "Guest";
let score = 0;
let timeLeft = GAME_DURATION;
let gameRunning = false;
let timerId;
let quoteIndex = 0;

const PARTICLE_COUNT_BG = 70;
const PARTICLE_COUNT_BURST = 140;

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

function random(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function createFloatingParticles() {
  const palette = HOLI_PALETTES[paletteIndex];
  for (let i = 0; i < PARTICLE_COUNT_BG; i += 1) {
    particles.push({
      x: random(0, width), y: random(0, height),
      vx: random(-0.25, 0.25), vy: random(-0.4, -0.08),
      size: random(2, 6), alpha: random(0.15, 0.55), color: pick(palette),
      life: Infinity, drag: 1, gravity: 0
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
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: random(2, 9),
      alpha: random(0.45, 0.95),
      color: pick(palette),
      life: random(30, 90),
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

    if (p.life !== Infinity && (p.life <= 0 || p.alpha <= 0.02)) particles.splice(i, 1);
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
  setInterval(() => {
    quoteEl.classList.add("fade");
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % QUOTES.length;
      quoteEl.textContent = QUOTES[quoteIndex];
      quoteEl.classList.remove("fade");
    }, 280);
  }, 2600);
}

function updateHud() {
  scoreLabel.textContent = String(score);
  timeLabel.textContent = String(timeLeft);
  playerLabel.textContent = playerName;
}

function showBonusOrb() {
  if (!gameRunning) return;
  bonusOrb.classList.remove("hidden");
  bonusOrb.style.left = `${random(30, width - 90)}px`;
  bonusOrb.style.top = `${random(30, height - 90)}px`;
  setTimeout(() => bonusOrb.classList.add("hidden"), 1200);
}

function scheduleBonusOrbs() {
  const orbLoop = () => {
    if (!gameRunning) return;
    showBonusOrb();
    setTimeout(orbLoop, random(1800, 3600));
  };
  setTimeout(orbLoop, 1200);
}

async function submitScore() {
  try {
    await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, score })
    });
  } catch (_) {
    // If API is missing in local/static mode, game still works client-side.
  }
}

async function loadLeaderboard() {
  leaderboardList.innerHTML = "<li>Loading…</li>";
  try {
    const res = await fetch("/api/leaderboard");
    if (!res.ok) throw new Error("Leaderboard unavailable");
    const data = await res.json();
    if (!Array.isArray(data.players) || data.players.length === 0) {
      leaderboardList.innerHTML = "<li>No scores yet. Be first!</li>";
      return;
    }
    leaderboardList.innerHTML = data.players
      .map((p) => `<li>${p.name} — ${p.score}</li>`)
      .join("");
  } catch (_) {
    leaderboardList.innerHTML = "<li>API not connected yet.</li>";
  }
}

function startGame() {
  score = 0;
  timeLeft = GAME_DURATION;
  gameRunning = true;
  updateHud();

  setupPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  leaderboard.classList.remove("hidden");

  burst(width * 0.5, height * 0.5, 0.9);
  scheduleBonusOrbs();

  clearInterval(timerId);
  timerId = setInterval(async () => {
    timeLeft -= 1;
    updateHud();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      gameRunning = false;
      bonusOrb.classList.add("hidden");
      quoteEl.textContent = `Great game, ${playerName}! Final Score: ${score}`;
      await submitScore();
      await loadLeaderboard();
    }
  }, 1000);
}

playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = playerNameInput.value.trim();
  if (!value) return;
  playerName = value.slice(0, 32);
  startGame();
});

throwBtn.addEventListener("click", (event) => {
  if (!gameRunning) return;
  score += 1;
  updateHud();
  showRipple(throwBtn, event.clientX, event.clientY);

  const rect = throwBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  burst(centerX, centerY, 1.2);
  setTimeout(() => burst(centerX - random(70, 150), centerY - random(30, 140), 0.7), 120);
  setTimeout(() => burst(centerX + random(70, 150), centerY - random(30, 140), 0.7), 180);
  cycleTheme();
});

bonusOrb.addEventListener("click", (event) => {
  if (!gameRunning) return;
  score += 5;
  updateHud();
  burst(event.clientX, event.clientY, 1.4);
  bonusOrb.classList.add("hidden");
});

restartBtn.addEventListener("click", () => {
  setupPanel.classList.remove("hidden");
  gamePanel.classList.add("hidden");
  playerNameInput.focus();
  quoteEl.textContent = QUOTES[0];
  loadLeaderboard();
});

window.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

window.addEventListener("pointerdown", (event) => {
  if (gameRunning) {
    score += 1;
    updateHud();
  }
  burst(event.clientX, event.clientY, 0.8);
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
setGradientTheme();
createFloatingParticles();
rotateQuotes();
updateParticles();
loadLeaderboard();
