const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const backgroundImage = new Image();
backgroundImage.src = 'img/playaFondo.jpg';
/*declaramos la variable backgroundImage y le asignamos una nueva imagen, la cual se encuentra en la carpeta img y se llama playaFondo.jpg*/
const images = {
    cangrejo: 'cangrejo.png', /*declaramos la variable images y le asignamos las imagenes*/
    canon: 'canon.png',
    joya: 'joya.png',
    pirata: 'pirata.png',
    tesoro: 'tesoro.png'
};
/*declaracion de las variables a utilizar en el juego*/
let score = 0;
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
        <button onclick="restartGame()">Volver a Jugar</button>
    `;
    document.body.appendChild(gameOverScreen);
/*creamos la pantalla de juego terminado y la agregamos al body del html*/

function getRandomPosition() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
    };
}
/*funcion que genera una posicion aleatoria en el canvas*/

function createObject(type) {
    const { x, y } = getRandomPosition(); /*obtenemos la posicion aleatoria*/
    objects.push({ type, x, y, life: 5000 }); // 5 segundos de vida
}
/*funcion que crea un objeto en el canvas*/

function createPirate() {
    if (pirates.length < 4) { /*si la cantidad de piratas es menor a 4*/
        const { x, y } = getRandomPosition(); /*obtenemos la posicion aleatoria*/
        pirates.push({ x, y, life: 2000 }); /*agregamos un pirata al canvas con una vida de 2 segundos*/
    }
} 
/*funcion que crea un pirata en el canvas*/

function createCrab() {
    const { x, y } = getRandomPosition();
    crabs.push({ x, y, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 2, life: 5000 }); 
    /*agregamos un cangrejo al canvas con una vida de 5 segundos y una velocidad aleatoria*/
}
/*funcion que crea un cangrejo en el canvas*/

function createCanon() {
    const { x, y } = getRandomPosition(); /*obtenemos la posicion aleatoria*/
    canons.push({ x, y }); /*agregamos un canon al canvas*/
}
/*funcion que crea un canon en el canvas*/

function shootCanon(canon, target) { /*funcion que dispara el canon que recibe como parametro el ubicacion del canon y el objetivo*/
    const angle = Math.atan2(target.y - canon.y, target.x - canon.x); /*calculamos el angulo del disparo*/
    canonBalls.push({ /*agregamos una bala al canon*/
        x: canon.x, /*posicion x del canon*/
        y: canon.y, 
        dx: Math.cos(angle) * 5, /*velocidad de la bala en x*/
        dy: Math.sin(angle) * 5 /*velocidad de la bala en y*/
    });
}
/*funcion que dispara el canon*/

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}
/*funcion que dibuja el fondo del canvas*/

function drawObjects() { /*funcion que dibuja los objetos en el canvas*/
    objects.forEach((obj, index) => { /*recorremos los objetos*/
        const img = new Image(); /*creamos una nueva imagen*/
        img.src = images[obj.type]; /*asignamos la imagen al objeto*/
        ctx.drawImage(img, obj.x, obj.y, 40, 40); /*dibujamos la imagen en el canvas*/
        obj.life -= 1000 / 60; /*restamos la vida del objeto*/
        if (obj.life <= 0) { /*si la vida del objeto es menor o igual a 0*/
            objects.splice(index, 1); /*eliminamos el objeto*/
        }
    });
}
/*funcion que dibuja los objetos en el canvas*/

function drawPirates() { /*funcion que dibuja los piratas en el canvas*/
    pirates.forEach((pirate, index) => { /*recorremos los piratas*/
        const img = new Image(); 
        img.src = images.pirata; /*asignamos la imagen del pirata*/
        ctx.drawImage(img, pirate.x, pirate.y, 40, 40); /*dibujamos el pirata en el canvas*/
        pirate.life -= 1000 / 60; /*restamos la vida del pirata*/
        if (pirate.life <= 0) { /*si la vida del pirata es menor o igual a 0*/
            pirates.splice(index, 1); /*eliminamos el pirata*/
        }
    });
}
/*funcion que dibuja los piratas en el canvas*/

function drawCrabs() { /*funcion que dibuja los cangrejos en el canvas*/
    crabs.forEach((crab, index) => { /*recorremos los cangrejos*/
        const img = new Image(); 
        img.src = images.cangrejo; /*asignamos la imagen del cangrejo*/
        ctx.drawImage(img, crab.x, crab.y, 40, 40); /*dibujamos el cangrejo en el canvas*/
        crab.life -= 1000 / 60; /*restamos la vida del cangrejo*/
        crab.x += crab.dx; /*movemos el cangrejo en x*/
        crab.y += crab.dy; /*movemos el cangrejo en y*/

        if (crab.x < 0 || crab.x > canvas.width) crab.dx = -crab.dx; /*si el cangrejo se sale del canvas cambiamos su direccion en x*/
        if (crab.y < 0 || crab.y > canvas.height) crab.dy = -crab.dy; /*si el cangrejo se sale del canvas cambiamos su direccion en y*/

        if (crab.life <= 0) { /*si la vida del cangrejo es menor o igual a 0*/
            crabs.splice(index, 1); /*eliminamos el cangrejo*/
        }
    });
}
/*funcion que dibuja los cangrejos en el canvas*/

function drawCanons() {
    canons.forEach((canon, index) => { /*recorremos los canones*/
        const img = new Image(); 
        img.src = images.canon; /*asignamos la imagen del canon*/
        ctx.drawImage(img, canon.x, canon.y, 40, 40); /*dibujamos el canon en el canvas*/
    });
}
/*funcion que dibuja los canones en el canvas*/

function drawCanonBalls() {
    canonBalls.forEach((ball, index) => { /*recorremos las balas del canon*/
        ctx.beginPath(); /*comenzamos el dibujo*/
        ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2); /*dibujamos la bala del canon*/
        ctx.fillStyle = 'black'; /*asignamos el color de las balas*/
        ctx.fill(); /*rellenamos la bala*/
        ball.x += ball.dx; /*movemos la bala en x*/
        ball.y += ball.dy; /*movemos la bala en y*/
        if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) { /*si la bala se sale del canvas*/
            canonBalls.splice(index, 1); /*eliminamos la bala*/
        }
    });
}
/*funcion que dibuja las balas del canon en el canvas*/

function update() { /*funcion que actualiza el canvas*/
    if (gameOver) return; /*si el juego termino no actualizamos el canvas*/

    ctx.clearRect(0, 0, canvas.width, canvas.height); /*limpiamos el canvas*/
    drawBackground(); /*dibujamos el fondo*/
    drawObjects(); /*dibujamos los objetos*/
    drawPirates(); /*dibujamos los piratas*/
    drawCrabs(); /*dibujamos los cangrejos*/
    drawCanons(); /*dibujamos los canones*/
    drawCanonBalls(); /*dibujamos las balas del canon*/

    // Mostrar puntaje
    ctx.fillStyle = '#000'; /*asignamos el color de la fuente*/
    ctx.font = '20px Arial'; /*asignamos el tipo de fuente y el tamaño*/
    ctx.fillText(`Score: ${score}`, 10, 30); /*mostramos el puntaje en el canvas*/

    requestAnimationFrame(update); /*actualizamos el canvas*/
}
/*funcion que actualiza el canvas*/

