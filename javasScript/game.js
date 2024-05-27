document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image();
    backgroundImage.src = 'img/playaFondo.jpg';

    const images = {
        cangrejo: 'img/cangrejo.png',
        canon: 'img/canon.png',
        joya: 'img/joya.png',
        pirata: 'img/pirata.png',
        tesoro: 'img/tesoro.png'
    };

    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let objects = [];
    let pirates = [];
    let crabs = [];
    let canons = [];
    let canonBalls = [];
    let gameOver = false;
    let mousePos = { x: 0, y: 0 };

    const gameOverScreen = document.createElement('div');
    gameOverScreen.id = 'gameOverScreen';
    gameOverScreen.innerHTML = `
        <h2>Juego Terminado</h2>
        <p>Puntuación: <span id="finalScore"></span></p>
        <button id="restartButton">Volver a Jugar</button>
    `;
    document.body.appendChild(gameOverScreen);
    gameOverScreen.style.display = 'none';  // Esconder la pantalla de Game Over inicialmente

    document.getElementById('restartButton').addEventListener('click', restartGame);

    function getRandomPosition() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
    }

    function createObject(type) {
        const { x, y } = getRandomPosition();
        objects.push({ type, x, y, life: 5000 });
    }

    function createPirate() {
        if (pirates.length < 2) {
            const { x, y } = getRandomPosition();
            pirates.push({ x, y, life: 5000 });
        }
    }

    function createCrab() {
        const { x, y } = getRandomPosition();
        crabs.push({ x, y, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 2, life: 5000 });
    }

    function createCanon() {
        const { x, y } = getRandomPosition();
        canons.push({ x, y });
    }

    function shootCanon(canon, target) {
        const angle = Math.atan2(target.y - canon.y, target.x - canon.x);
        canonBalls.push({
            x: canon.x,
            y: canon.y,
            dx: Math.cos(angle) * 5,
            dy: Math.sin(angle) * 5
        });
    }

    function drawBackground() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    function drawObjects() {
        objects.forEach((obj, index) => {
            const img = new Image();
            img.src = images[obj.type];
            ctx.drawImage(img, obj.x, obj.y, 40, 40);
            obj.life -= 1000 / 60;
            if (obj.life <= 0) {
                objects.splice(index, 1);
            }
        });
    }

    function drawPirates() {
        pirates.forEach((pirate, index) => {
            const img = new Image();
            img.src = images.pirata;
            ctx.drawImage(img, pirate.x, pirate.y, 40, 40);
            pirate.life -= 1000 / 60;
            if (pirate.life <= 0) {
                pirates.splice(index, 1);
            }
        });
    }

    function drawCrabs() {
        crabs.forEach((crab, index) => {
            const img = new Image();
            img.src = images.cangrejo;
            ctx.drawImage(img, crab.x, crab.y, 40, 40);
            crab.life -= 1000 / 60;
            crab.x += crab.dx;
            crab.y += crab.dy;

            if (crab.x < 0 || crab.x > canvas.width) crab.dx = -crab.dx;
            if (crab.y < 0 || crab.y > canvas.height) crab.dy = -crab.dy;

            if (crab.life <= 0) {
                crabs.splice(index, 1);
            }
        });
    }

    function drawCanons() {
        canons.forEach((canon) => {
            const img = new Image();
            img.src = images.canon;
            ctx.drawImage(img, canon.x, canon.y, 40, 40);
        });
    }

    function drawCanonBalls() {
        canonBalls.forEach((ball, index) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ball.x += ball.dx;
            ball.y += ball.dy;
            if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
                canonBalls.splice(index, 1);
            }
        });
    }

    function update() {
        if (gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawObjects();
        drawPirates();
        drawCrabs();
        drawCanons();
        drawCanonBalls();

        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
        ctx.fillText(`High Score: ${highScore}`, 10, 60);

        requestAnimationFrame(update);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;

        if (!gameOver) {
            objects.forEach((obj, index) => {
                if (mousePos.x > obj.x && mousePos.x < obj.x + 40 && mousePos.y > obj.y && mousePos.y < obj.y + 40) {
                    if (obj.type === 'tesoro') score += 20;
                    if (obj.type === 'joya') score += 5;
                    objects.splice(index, 1);
                }
            });

            pirates.forEach((pirate) => {
                if (mousePos.x > pirate.x && mousePos.x < pirate.x + 40 && mousePos.y > pirate.y && mousePos.y < pirate.y + 40) {
                    gameOver = true;
                    showGameOverScreen();
                    gameMusic.pause();
                }
            });

            crabs.forEach((crab, index) => {
                if (mousePos.x > crab.x && mousePos.x < crab.x + 40 && mousePos.y > crab.y && mousePos.y < crab.y + 40) {
                    score -= 10;
                    crabs.splice(index, 1);
                }
            });

            canonBalls.forEach((ball, index) => {
                if (Math.hypot(ball.x - mousePos.x, ball.y - mousePos.y) < 6) {
                    gameOver = true;
                    showGameOverScreen();
                    gameMusic.pause();
                }
            });
        }

        pirates.forEach((pirate) => {
            const angle = Math.atan2(mousePos.y - pirate.y, mousePos.x - pirate.x);
            pirate.x += Math.cos(angle) * 1.5;
            pirate.y += Math.sin(angle) * 1.5;
        });

        canons.forEach((canon) => {
            if (Math.random() < 0.02) {
                shootCanon(canon, mousePos);
            }
        });
    });

    function showGameOverScreen() {
        gameOverScreen.style.display = 'block';
        document.getElementById('finalScore').textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }

        objects = [];
        pirates = [];
        crabs = [];
        canons = [];
        canonBalls = [];
    }

    function restartGame() {
        gameOverScreen.style.display = 'none';
        score = 0;
        gameOver = false;
        gameMusic.currentTime = 0;
        gameMusic.play();
        update();
    }

    setInterval(createObject.bind(null, 'tesoro'), 4000);
    setInterval(createObject.bind(null, 'joya'), 2000);
    setInterval(createPirate, 5000);
    setInterval(createCrab, 2000);
    setInterval(createCanon, 6000);

    const gameMusic = new Audio('sound/musica.mp3');
    gameMusic.loop = true;
    gameMusic.play();

    update();
});
