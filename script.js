const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

let score = 0;
let lives = 3;
let isGameOver = false;
let animationId;

const sword = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  prevX: canvas.width / 2,
  prevY: canvas.height / 2,
  length: 50
};

let hollows = [];
let slashes = [];
let particles = [];

// Event listener pergerakan mouse
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  sword.prevX = sword.x;
  sword.prevY = sword.y;
  sword.x = e.clientX - rect.left;
  sword.y = e.clientY - rect.top;

  const dist = Math.hypot(sword.x - sword.prevX, sword.y - sword.prevY);
  if (dist > 10) {
    slashes.push({
      x1: sword.prevX,
      y1: sword.prevY,
      x2: sword.x,
      y2: sword.y,
      alpha: 1,
      width: 6
    });
  }
});

// Event listener layar sentuh
canvas.addEventListener('touchmove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  sword.prevX = sword.x;
  sword.prevY = sword.y;
  sword.x = touch.clientX - rect.left;
  sword.y = touch.clientY - rect.top;
});

function createReiatsu(x, y, color) {
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      radius: Math.random() * 4 + 1,
      color: color,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      alpha: 1
    });
  }
}

function spawnHollow() {
  if (Math.random() < 0.03 + score * 0.001) {
    const radius = Math.random() * 15 + 15;
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? -radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? -radius : canvas.height + radius;
    }

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    hollows.push({
      x: x,
      y: y,
      radius: radius,
      vx: Math.cos(angle) * (1.5 + score * 0.05),
      vy: Math.sin(angle) * (1.5 + score * 0.05),
      color: '#ffffff',
      maskColor: '#ff0055'
    });
  }
}

function update() {
  if (isGameOver) return;

  particles.forEach((p, index) => {
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.03;
    if (p.alpha <= 0) particles.splice(index, 1);
  });

  slashes.forEach((s, index) => {
    s.alpha -= 0.05;
    if (s.alpha <= 0) slashes.splice(index, 1);
  });

  hollows.forEach((hollow, index) => {
    hollow.x += hollow.vx;
    hollow.y += hollow.vy;

    const distToSword = Math.hypot(sword.x - hollow.x, sword.y - hollow.y);
    if (distToSword < hollow.radius + 15) {
      createReiatsu(hollow.x, hollow.y, '#ff4500');
      hollows.splice(index, 1);
      score += 1;
      scoreEl.innerText = score;
    } else if (Math.hypot(canvas.width / 2 - hollow.x, canvas.height / 2 - hollow.y) < 20) {
      createReiatsu(hollow.x, hollow.y, '#ff0055');
      hollows.splice(index, 1);
      lives--;
      updateLivesUI();
      if (lives <= 0) triggerGameOver();
    }
  });

  spawnHollow();
}

function updateLivesUI() {
  livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Pusat Karakter
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#ff4500';
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ff4500';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Tebasan Getsuga
  slashes.forEach(s => {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.strokeStyle = `rgba(255, 69, 0, ${s.alpha})`;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
  });

  // Musuh (Hollow)
  hollows.forEach(h => {
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0055';
    ctx.fillStyle = '#0a0a0d';
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = h.maskColor;
    ctx.beginPath();
    ctx.arc(h.x - 3, h.y - 2, 2, 0, Math.PI * 2);
    ctx.arc(h.x + 3, h.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Partikel
  particles.forEach(p => {
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.fillStyle = `rgba(255, 69, 0, ${p.alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Kursor Pedang
  ctx.shadowBlur = 12;
  ctx.shadowColor = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sword.x, sword.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  update();
  if (!isGameOver) animationId = requestAnimationFrame(draw);
}

function triggerGameOver() {
  isGameOver = true;
  finalScoreEl.innerText = score;
  gameOverEl.classList.add('active');
}

function restartGame() {
  score = 0;
  lives = 3;
  hollows = [];
  particles = [];
  slashes = [];
  isGameOver = false;
  scoreEl.innerText = score;
  updateLivesUI();
  gameOverEl.classList.remove('active');
  draw();
}

draw();
