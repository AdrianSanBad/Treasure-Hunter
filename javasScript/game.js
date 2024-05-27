document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const backgroundImage = new Image(); // Crear una imagen
    backgroundImage.src = 'img/playaFondo.jpg'; // Asignar la ruta de la imagen

    const images = { // Crear un objeto con las rutas de las imágenes
        cangrejo: 'img/cangrejo.png',
        canon: 'img/canon.png',
        joya: 'img/joya.png',
        pirata: 'img/pirata.png',
        tesoro: 'img/tesoro.png'
    };
    
    let score = 0; // Puntuación inicial
    let highScore = localStorage.getItem('highScore') || 0; // Puntuación máxima
    let objects = []; // Array de objetos
    let pirates = []; // Array de piratas
    let crabs = []; // Array de cangrejos
    let canons = []; // Array de cañones
    let canonBalls = []; // Array de balas de cañón
    let gameOver = false; // Variable para saber si el juego ha terminado
    let mousePos = { x: 0, y: 0 }; // Posición del ratón

    const gameOverScreen = document.createElement('div'); // Crear la pantalla de Game Over
    gameOverScreen.id = 'gameOverScreen'; // Asignar un id
    gameOverScreen.innerHTML = ` 
        <h2>Juego Terminado</h2> 
        <p>Puntuación: <span id="finalScore"></span></p>
        <button id="restartButton">Volver a Jugar</button>
    `; // Contenido de la pantalla de Game Over
    document.body.appendChild(gameOverScreen); // Añadir la pantalla de Game Over al body
    gameOverScreen.style.display = 'none';  // Esconder la pantalla de Game Over inicialmente

    document.getElementById('restartButton').addEventListener('click', restartGame); // Añadir un evento al botón de reiniciar

    function getRandomPosition() { // Función para obtener una posición aleatoria
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
    }

    function createObject(type) { // Función para crear un objeto
        const { x, y } = getRandomPosition();
        objects.push({ type, x, y, life: 5000 });
    }

    function createPirate() { // Función para crear un pirata
        if (pirates.length < 3) {
            const { x, y } = getRandomPosition();
            pirates.push({ x, y, life: 5000 }); //añadir pirata con 5 segundos de vida
        }
    }

    function createCrab() { // Función para crear un cangrejo
        const { x, y } = getRandomPosition();
        crabs.push({ x, y, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 2, life: 5000 }); 
        //añadir cangrejo con 5 segundos de vida
    }

    function createCanon() { // Función para crear un cañón
        const { x, y } = getRandomPosition();
        canons.push({ x, y });
    }

    function shootCanon(canon, target) { // Función para disparar un cañón
        const angle = Math.atan2(target.y - canon.y, target.x - canon.x);
        canonBalls.push({
            x: canon.x,
            y: canon.y,
            dx: Math.cos(angle) * 5,
            dy: Math.sin(angle) * 5
        });
    }

    function drawBackground() { // Función para dibujar el fondo
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    function drawObjects() { // Función para dibujar los objetos
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

    function drawPirates() { // Función para dibujar los piratas
        pirates.forEach((pirate, index) => {
            const img = new Image();
            img.src = images.pirata;
            ctx.drawImage(img, pirate.x, pirate.y, 40, 40); // Dibujar la imagen del pirata
            pirate.life -= 1000 / 60; 
            if (pirate.life <= 0) { // Si la vida del pirata es menor o igual a 0
                pirates.splice(index, 1); // Eliminar el pirata del array
            }
        });
    }

    function drawCrabs() { // Función para dibujar los cangrejos
        crabs.forEach((crab, index) => { 
            const img = new Image();
            img.src = images.cangrejo;
            ctx.drawImage(img, crab.x, crab.y, 40, 40); // Dibujar la imagen del cangrejo
            crab.life -= 1000 / 60; 
            crab.x += crab.dx;
            crab.y += crab.dy;

            if (crab.x < 0 || crab.x > canvas.width) crab.dx = -crab.dx; // Si el cangrejo llega a los límites del canvas, cambiar la dirección
            if (crab.y < 0 || crab.y > canvas.height) crab.dy = -crab.dy;   // Si el cangrejo llega a los límites del canvas, cambiar la dirección

            if (crab.life <= 0) { 
                crabs.splice(index, 1); // Eliminar el cangrejo del array
            }
        });
    }

    function drawCanons() { // Función para dibujar los cañones
        canons.forEach((canon) => {
            const img = new Image();
            img.src = images.canon;
            ctx.drawImage(img, canon.x, canon.y, 40, 40); // Dibujar la imagen del cañón
        });
    }

    function drawCanonBalls() { // Función para dibujar las balas de cañón
        canonBalls.forEach((ball, index) => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = 'black'; // Color de la bala
            ctx.fill(); 
            ball.x += ball.dx;
            ball.y += ball.dy;
            if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) { // Si la bala llega a los límites del canvas
                canonBalls.splice(index, 1); // Eliminar la bala del array
            } 
        });
    }

    function update() { // Función para actualizar el juego
        if (gameOver) return; // Si el juego ha terminado, salir de la función

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
        drawBackground(); // Dibujar el fondo
        drawObjects(); // Dibujar los objetos
        drawPirates(); // Dibujar los piratas
        drawCrabs(); // Dibujar los cangrejos
        drawCanons(); // Dibujar los cañones
        drawCanonBalls(); // Dibujar las balas de cañón

        ctx.fillStyle = '#000'; // Color del texto
        ctx.font = '20px Arial'; // Fuente del texto
        ctx.fillText(`Score: ${score}`, 10, 30); // Dibujar la puntuación
        ctx.fillText(`High Score: ${highScore}`, 10, 60); // Dibujar la puntuación máxima

        requestAnimationFrame(update); // Llamar a la función update
    }

    canvas.addEventListener('mousemove', (e) => { // Añadir un evento al mover el ratón
        const rect = canvas.getBoundingClientRect(); // Obtener la posición del canvas
        mousePos.x = e.clientX - rect.left; // Obtener la posición x del ratón
        mousePos.y = e.clientY - rect.top; // Obtener la posición y del ratón

        if (!gameOver) { // Si el juego no ha terminado
            objects.forEach((obj, index) => {
                if (mousePos.x > obj.x && mousePos.x < obj.x + 40 && mousePos.y > obj.y && mousePos.y < obj.y + 40) {
                    if (obj.type === 'tesoro') score += 20; // Si el objeto es un tesoro, sumar 20 puntos
                    if (obj.type === 'joya') score += 5; // Si el objeto es una joya, sumar 5 puntos
                    objects.splice(index, 1); // Eliminar el objeto del array
                }
            });

            pirates.forEach((pirate) => { // Para cada pirata
                if (mousePos.x > pirate.x && mousePos.x < pirate.x + 40 && mousePos.y > pirate.y && mousePos.y < pirate.y + 40) { 
                    // Si el ratón está sobre el pirata
                    gameOver = true;
                    showGameOverScreen(); // Mostrar la pantalla de Game Over
                    gameMusic.pause(); // Pausar la música
                }
            });

            crabs.forEach((crab, index) => { // Para cada cangrejo
                if (mousePos.x > crab.x && mousePos.x < crab.x + 40 && mousePos.y > crab.y && mousePos.y < crab.y + 40) {
                    score -= 10; // Restar 10 puntos
                    crabs.splice(index, 1); // Eliminar el cangrejo del array
                }
            });

            canonBalls.forEach((ball, index) => { // Para cada bala de cañón
                if (Math.hypot(ball.x - mousePos.x, ball.y - mousePos.y) < 6) {
                    gameOver = true;
                    showGameOverScreen(); // Mostrar la pantalla de Game Over
                    gameMusic.pause(); // Pausar la música
                }
            });
        }

        pirates.forEach((pirate) => { // Para cada pirata
            const angle = Math.atan2(mousePos.y - pirate.y, mousePos.x - pirate.x);
            pirate.x += Math.cos(angle) * 1.5; // Mover el pirata en x
            pirate.y += Math.sin(angle) * 1.5; // Mover el pirata en y
        }); 

        canons.forEach((canon) => { // Para cada cañón
            if (Math.random() < 0.02) { // Si el número aleatorio es menor que 0.02
                shootCanon(canon, mousePos); // Disparar el cañón
            }
        });
    });

    function showGameOverScreen() { // Función para mostrar la pantalla de Game Over
        gameOverScreen.style.display = 'block'; // Mostrar la pantalla de Game Over
        document.getElementById('finalScore').textContent = score; // Mostrar la puntuación final

        if (score > highScore) { // Si la puntuación es mayor que la puntuación máxima
            highScore = score; // Asignar la puntuación a la puntuación máxima
            localStorage.setItem('highScore', highScore); // Guardar la puntuación máxima en el localStorage
        } 

        objects = [];
        pirates = [];
        crabs = [];
        canons = [];
        canonBalls = [];
    }

    function restartGame() { // Función para reiniciar el juego
        gameOverScreen.style.display = 'none';
        score = 0;
        gameOver = false;
        gameMusic.currentTime = 0;
        gameMusic.play();
        update();
    }

    setInterval(createObject.bind(null, 'tesoro'), 4000); // Crear un tesoro cada 4 segundos
    setInterval(createObject.bind(null, 'joya'), 2000); // Crear una joya cada 2 segundos
    setInterval(createPirate, 5000); // Crear un pirata cada 5 segundos
    setInterval(createCrab, 2000); // Crear un cangrejo cada 2 segundos
    setInterval(createCanon, 6000); // Crear un cañón cada 6 segundos

    const gameMusic = new Audio('sound/musica.mp3'); // Crear un audio
    gameMusic.loop = true; // Repetir la música
    gameMusic.play(); // Reproducir la música

    update(); // Llamar a la función update
});
