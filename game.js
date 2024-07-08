// Matrix effect
const matrixCanvas = document.getElementById('matrix');
const matrixCtx = matrixCanvas.getContext('2d');

matrixCanvas.width = window.innerWidth;
matrixCanvas.height = window.innerHeight;

const fontSize = 16;
const columns = matrixCanvas.width / fontSize;
const drops = Array.from({ length: columns }).fill(0);

function drawMatrix() {
    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    matrixCtx.fillStyle = '#0F0';
    matrixCtx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96);
        matrixCtx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }

    requestAnimationFrame(drawMatrix);
}

drawMatrix();

// Game logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: 0,
    y: 0,
    width: 20, // Doublement de la taille
    height: 20, // Doublement de la taille
    color: 'green',
    dx: 0,
    dy: 0,
    speed: 7,
    gravity: 0.8,
    jump: -20,
    onGround: false
};

let platforms = [];
let coins = [];
let score = 0;
let level = 1;
let coinsNeeded = 10; // Nombre de pièces nécessaires pour passer au niveau suivant

const sounds = {
    jump: new Audio('jump.mp3'),
    coin: new Audio('coin.mp3'),
    fall: new Audio('fall.mp3')
};

function createPlatform(x, y, width, height) {
    return { x, y, width, height, color: 'green' };
}

function createCoin(x, y, size) {
    return { x, y, size, color: 'green', angle: 0 };
}

function initGame() {
    score = 0;
    platforms = [];
    coins = [];
    
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = canvas.height - (i + 1) * 60;
        platforms.push(createPlatform(x, y, 100, 10));
    }

    player.x = platforms[0].x + platforms[0].width / 2 - player.width / 2;
    player.y = platforms[0].y - player.height;
    player.dx = 0;
    player.dy = 0;

    for (let i = 0; i < 15; i++) { // Ajout de 15 pièces au total
        const x = Math.random() * (canvas.width - 20);
        const y = Math.random() * (canvas.height - 200);
        coins.push(createCoin(x, y, 10));
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawCoins() {
    coins.forEach(coin => {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.angle);
        ctx.fillStyle = coin.color;
        ctx.fillRect(-coin.size / 2, -coin.size / 2, coin.size, coin.size);
        ctx.restore();
        coin.angle += 0.1;
    });
}

function updatePlayer() {
    player.dy += player.gravity;
    player.x += player.dx;
    player.y += player.dy;

    if (player.y + player.height > canvas.height) {
        sounds.fall.play();
        initGame();
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    player.onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + platform.height + player.dy) {
            player.onGround = true;
            player.dy = 0;
            player.y = platform.y - player.height;
        }
    });

    coins = coins.filter(coin => {
        if (player.x < coin.x + coin.size / 2 &&
            player.x + player.width > coin.x - coin.size / 2 &&
            player.y < coin.y + coin.size / 2 &&
            player.y + player.height > coin.y - coin.size / 2) {
            score += 1;
            scoreDisplay.innerText = `Score: ${score}`;
            sounds.coin.play();
            return false;
        }
        return true;
    });

    if (score >= coinsNeeded) { // Passer au niveau suivant lorsque le score atteint coinsNeeded
        level += 1;
        score = 0;
        coins = [];
        platforms = [];
        initGame();
    }
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'z':
            if (player.onGround) {
                player.dy = player.jump;
                sounds.jump.play();
            }
            break;
        case 'q':
            player.dx = -player.speed;
            break;
        case 'd':
            player.dx = player.speed;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'q':
        case 'd':
            player.dx = 0;
            break;
    }
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawCoins();
    drawPlayer();
    updatePlayer();
    requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
