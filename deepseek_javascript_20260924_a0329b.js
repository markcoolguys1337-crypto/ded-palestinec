const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const GROUND_Y = H - 60;

const scoreEl = document.getElementById('score');
const gameoverEl = document.getElementById('gameover');
const finalScoreEl = document.getElementById('final-score');
const musicEl = document.getElementById('music');

let state = {
    running: true,
    score: 0,
    speed: 5,
    frame: 0,
    obstacles: [],
    clouds: [],
    grassTufts: [],
    timer: 0
};

const babka = {
    x: 120,
    y: GROUND_Y,
    w: 50,
    h: 80,
    vy: 0,
    jumping: false,
    legPhase: 0
};

const ded = {
    x: -80,
    w: 60,
    h: 90,
    legPhase: 0
};

// ==== КОНСТАНТЫ ФИЗИКИ ====
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

// ==== ИНИЦИАЛИЗАЦИЯ ====
function init() {
    state.clouds = [];
    for (let i = 0; i < 5; i++) {
        state.clouds.push({
            x: Math.random() * W,
            y: 30 + Math.random() * 100,
            size: 40 + Math.random() * 30,
            speed: 0.2 + Math.random() * 0.3
        });
    }
    state.grassTufts = [];
    for (let i = 0; i < 30; i++) {
        state.grassTufts.push({
            x: Math.random() * W * 2,
            y: GROUND_Y + 5 + Math.random() * 25,
            h: 8 + Math.random() * 15
        });
    }
}

// ==== УПРАВЛЕНИЕ ====
function jump() {
    if (!state.running) return;
    if (!babka.jumping) {
        babka.vy = JUMP_FORCE;
        babka.jumping = true;
        playMusic();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
    if (e.code === 'KeyR') restart();
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

function playMusic() {
    if (musicEl.paused) {
        musicEl.volume = 0.4;
        musicEl.play().catch(() => {});
    }
}

// ==== РИСОВАНИЕ БАБКИ ====
function drawBabka(x, y) {
    const bob = Math.sin(babka.legPhase) * 2;
    // Тень
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + babka.w/2, GROUND_Y + 5, babka.w/2, 8, 0, 0, Math.PI*2);
    ctx.fill();

    const cy = y - babka.h + bob;

    // Платок (красный) — треугольник
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(x + 25, cy - 15);
    ctx.lineTo(x - 5, cy + 20);
    ctx.lineTo(x + 55, cy + 20);
    ctx.closePath();
    ctx.fill();

    // Юбка — сарафан
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(x + 5, cy + 45);
    ctx.lineTo(x + 45, cy + 45);
    ctx.lineTo(x + 50, cy + 80);
    ctx.lineTo(x, cy + 80);
    ctx.closePath();
    ctx.fill();

    // Узор на юбке
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, cy + 55, 30, 3);
    ctx.fillRect(x + 8, cy + 65, 34, 3);

    // Лицо
    ctx.fillStyle = '#f5cba7';
    ctx.beginPath();
    ctx.arc(x + 25, cy + 25, 15, 0, Math.PI * 2);
    ctx.fill();

    // Глаза
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 20, cy + 22, 2, 0, Math.PI*2);
    ctx.arc(x + 30, cy + 22, 2, 0, Math.PI*2);
    ctx.fill();

    // Румянец
    ctx.fillStyle = 'rgba(255,100,100,0.5)';
    ctx.beginPath();
    ctx.arc(x + 17, cy + 28, 4, 0, Math.PI*2);
    ctx.arc(x + 33, cy + 28, 4, 0, Math.PI*2);
    ctx.fill();

    // Ноги
    const legOffset = Math.sin(babka.legPhase) * 5;
    ctx.strokeStyle = '#f5cba7';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 15, cy + 78);
    ctx.lineTo(x + 12 + legOffset, cy + 95);
    ctx.moveTo(x + 35, cy + 78);
    ctx.lineTo(x + 38 - legOffset, cy + 95);
    ctx.stroke();

    // Лапти
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 5 + legOffset, cy + 92, 15, 5);
    ctx.fillRect(x + 32 - legOffset, cy + 92, 15, 5);
}

// ==== РИСОВАНИЕ ДЕДА С ДУБИНКОЙ ====
function drawDed(x, y) {
    const cy = y - ded.h;
    const wobble = Math.sin(state.frame * 0.3) * 3; // шатается, как пьяный

    // Тень
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + ded.w/2, GROUND_Y + 5, ded.w/2, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Ноги — разъезжаются
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 20, cy + 65);
    ctx.lineTo(x + 10 + wobble, cy + 90);
    ctx.moveTo(x + 40, cy + 65);
    ctx.lineTo(x + 50 - wobble, cy + 90);
    ctx.stroke();

    // Тулуп/рубаха
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(x + 5, cy + 30);
    ctx.lineTo(x + 55, cy + 30);
    ctx.lineTo(x + 50, cy + 70);
    ctx.lineTo(x + 10, cy + 70);
    ctx.closePath();
    ctx.fill();

    // Пояс
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x + 8, cy + 55, 44, 6);

    // Голова
    ctx.fillStyle = '#f5cba7';
    ctx.beginPath();
    ctx.arc(x + 30, cy + 15, 16, 0, Math.PI * 2);
    ctx.fill();

    // Шапка-ушанка
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.arc(x + 30, cy + 5, 18, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 12, cy + 5, 36, 8);

    // Глаза (пьяные — крестики)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 22, cy + 12); ctx.lineTo(x + 27, cy + 17);
    ctx.moveTo(x + 27, cy + 12); ctx.lineTo(x + 22, cy + 17);
    ctx.moveTo(x + 33, cy + 12); ctx.lineTo(x + 38, cy + 17);
    ctx.moveTo(x + 38, cy + 12); ctx.lineTo(x + 33, cy + 17);
    ctx.stroke();

    // Красный нос
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(x + 30, cy + 20, 4, 0, Math.PI*2);
    ctx.fill();

    // Усы и борода
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(x + 30, cy + 26, 12, 0, Math.PI);
    ctx.fill();

    // ДУБИНКА в руке
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x + 55, cy + 45);
    ctx.lineTo(x + 75, cy + 10 + wobble);
    ctx.stroke();

    // Утолщение на конце дубинки
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(x + 75, cy + 10 + wobble, 10, 0, Math.PI*2);
    ctx.fill();
}

// ==== РИСОВАНИЕ СТОГА СЕНА ====
function drawHaystack(x) {
    const w = 40;
    const h = 50;
    const y = GROUND_Y;

    // Основа
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w * 0.85, y - h);
    ctx.lineTo(x + w * 0.15, y - h);
    ctx.closePath();
    ctx.fill();

    // Солома — штрихи
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const sx = x + 5 + Math.random() * (w - 10);
        ctx.moveTo(sx, y - 5);
        ctx.lineTo(sx + (Math.random() - 0.5) * 15, y - h + 5);
        ctx.stroke();
    }

    // Верх стога
    ctx.fillStyle = '#e6b422';
    ctx.beginPath();
    ctx.ellipse(x + w/2, y - h, w * 0.45, 8, 0, 0, Math.PI*2);
    ctx.fill();

    // Обвязка
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 5, y - h * 0.4);
    ctx.lineTo(x + w - 5, y - h * 0.4);
    ctx.moveTo(x + 8, y - h * 0.7);
    ctx.lineTo(x + w - 8, y - h * 0.7);
    ctx.stroke();
}

// ==== ФОН ====
function drawBackground() {
    // Солнце
    ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
    ctx.beginPath();
    ctx.arc(750, 80, 45, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 150, 0.4)';
    ctx.beginPath();
    ctx.arc(750, 80, 65, 0, Math.PI*2);
    ctx.fill();

    // Облака
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const c of state.clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size * 0.6, 0, Math.PI*2);
        ctx.arc(c.x + c.size * 0.5, c.y - 10, c.size * 0.5, 0, Math.PI*2);
        ctx.arc(c.x + c.size, c.y, c.size * 0.55, 0, Math.PI*2);
        ctx.arc(c.x + c.size * 0.5, c.y + 10, c.size * 0.5, 0, Math.PI*2);
        ctx.fill();
    }

    // Земля
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // Тёмная полоса земли
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(0, GROUND_Y, W, 8);
}

function drawGrass() {
    ctx.strokeStyle = '#4a7c1a';
    ctx.lineWidth = 2;
    for (const g of state.grassTufts) {
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x - 3, g.y - g.h);
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x + 3, g.y - g.h);
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x, g.y - g.h - 3);
        ctx.stroke();
    }
}

// ==== ОБНОВЛЕНИЕ ====
function spawnObstacle() {
    if (state.timer <= 0) {
        state.obstacles.push({ x: W + 50, passed: false });
        const minGap = 60;
        const maxGap = 110;
        state.timer = minGap + Math.random() * (maxGap - minGap);
    }
}

function update() {
    if (!state.running) return;

    state.frame++;
    babka.legPhase += 0.3;

    // Физика прыжка
    babka.vy += GRAVITY;
    babka.y += babka.vy;

    if (babka.y >= GROUND_Y) {
        babka.y = GROUND_Y;
        babka.vy = 0;
        babka.jumping = false;
    }

    // Движение облаков
    for (const c of state.clouds) {
        c.x -= c.speed;
        if (c.x < -c.size * 2) {
            c.x = W + c.size;
            c.y = 30 + Math.random() * 100;
        }
    }

    // Движение травы
    for (const g of state.grassTufts) {
        g.x -= state.speed;
        if (g.x < -10) {
            g.x = W + Math.random() * 100;
        }
    }

    // Дед догоняет сзади — зависит от скорости
    const targetX = 120 - Math.min(100, state.score * 2);
    ded.x += (targetX - ded.x) * 0.02;

    // Препятствия
    spawnObstacle();
    state.timer -= state.speed * 0.15;

    for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const ob = state.obstacles[i];
        ob.x -= state.speed;

        // Столкновение (hitbox бабки)
        const bx = babka.x + 12;
        const bw = babka.w - 24;
        const byTop = babka.y - babka.h;
        const byBottom = babka.y;

        if (ob.x < bx + bw && ob.x + 40 > bx && byBottom > GROUND_Y - 50 && byTop < GROUND_Y) {
            gameOver();
            return;
        }

        // Счёт
        if (!ob.passed && ob.x + 40 < babka.x) {
            ob.passed = true;
            state.score++;
            scoreEl.textContent = 'Счёт: ' + state.score;
            state.speed = Math.min(12, 5 + state.score * 0.15);
        }

        if (ob.x < -100) state.obstacles.splice(i, 1);
    }
}

// ==== ОТРИСОВКА ====
function render() {
    ctx.clearRect(0, 0, W, H);
    drawBackground();
    drawGrass();

    for (const ob of state.obstacles) {
        drawHaystack(ob.x);
    }

    drawDed(ded.x, GROUND_Y);
    drawBabka(babka.x, babka.y);
}

// ==== ИГРОВОЙ ЦИКЛ ====
function loop() {
    update();
    render();
    requestAnimationFrame(loop);
}

// ==== GAME OVER ====
function gameOver() {
    state.running = false;
    finalScoreEl.textContent = state.score;
    gameoverEl.classList.remove('hidden');
}

function restart() {
    state = {
        running: true,
        score: 0,
        speed: 5,
        frame: 0,
        obstacles: [],
        clouds: state.clouds,
        grassTufts: state.grassTufts,
        timer: 0
    };
    babka.y = GROUND_Y;
    babka.vy = 0;
    babka.jumping = false;
    babka.legPhase = 0;
    ded.x = -80;
    scoreEl.textContent = 'Счёт: 0';
    gameoverEl.classList.add('hidden');
    init();
}

// ==== СТАРТ ====
init();
loop();