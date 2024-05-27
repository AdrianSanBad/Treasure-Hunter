document.addEventListener('DOMContentLoaded', () => {
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

canvas.addEventListener('mousemove', (e) => { /*eventos que se ejecutan cuando el mouse se mueve en el canvas*/
    const rect = canvas.getBoundingClientRect(); 
    mousePos.x = e.clientX - rect.left; /*obtenemos la posicion del mouse en x*/
    mousePos.y = e.clientY - rect.top; /*obtenemos la posicion del mouse en y*/

    // Verificar colisión con objetos
    objects.forEach((obj, index) => {
        if (mousePos.x > obj.x && mousePos.x < obj.x + 40 && mousePos.y > obj.y && mousePos.y < obj.y + 40) { 
            /*si el mouse colisiona con un objeto*/
            if (obj.type === 'tesoro') score += 20; /*si el objeto es un tesoro sumamos 20 puntos*/
            if (obj.type === 'joya') score += 5; /*si el objeto es una joya sumamos 5 puntos*/
            objects.splice(index, 1); /*eliminamos el objeto*/
        }
    });

    // Verificar colisión con piratas
    pirates.forEach((pirate) => { /*recorremos los piratas*/
        if (mousePos.x > pirate.x && mousePos.x < pirate.x + 40 && mousePos.y > pirate.y && mousePos.y < pirate.y + 40) { 
            gameOver = true; /*si el mouse colisiona con un pirata el juego termina*/
            showGameOverScreen(); /*mostramos la pantalla de juego terminado*/
            gameMusic.pause(); /*pausamos la musica del juego*/
        }
    });

    // Verificar colisión con cangrejos
    crabs.forEach((crab, index) => { /*recorremos los cangrejos*/
        if (mousePos.x > crab.x && mousePos.x < crab.x + 40 && mousePos.y > crab.y && mousePos.y < crab.y + 40) { 
            score -= 10; /*si el mouse colisiona con un cangrejo restamos 10 puntos*/
            crabs.splice(index, 1); /*eliminamos el cangrejo*/
        }
    });

    // Verificar colisión con bolas de cañón
    canonBalls.forEach((ball, index) => { /*recorremos las balas del canon*/
        if (Math.hypot(ball.x - mousePos.x, ball.y - mousePos.y) < 6) { /*si la distancia entre la bala y el mouse es menor a 5*/
            gameOver = true; /*el juego termina*/
            showGameOverScreen(); /*mostramos la pantalla de juego terminado*/
            gameMusic.pause(); /*pausamos la musica del juego*/
        }
    });

    // Mover piratas hacia el ratón
    pirates.forEach((pirate) => { /*recorremos los piratas*/
        const angle = Math.atan2(mousePos.y - pirate.y, mousePos.x - pirate.x); /*calculamos el angulo entre el pirata y el mouse*/
        pirate.x += Math.cos(angle) * 2; /*movemos el pirata en x*/
        pirate.y += Math.sin(angle) * 2; /*movemos el pirata en y*/
    });

    // Disparar cañones hacia el ratón
    canons.forEach((canon) => { /*recorremos los canones*/
        if (Math.random() < 0.01) { /*si un numero aleatorio es menor a 0.01*/
            shootCanon(canon, { x: mousePos.x, y: mousePos.y }); /*disparamos el canon hacia el mouse*/
        }
    });
});

function showGameOverScreen() { /*funcion que muestra la pantalla de juego terminado*/
    document.getElementById('finalScore').innerText = score; /*mostramos el puntaje final*/
    gameOverScreen.style.display = 'block'; /*mostramos la pantalla de juego terminado*/
}

window.restartGame = function() { /*funcion que reinicia el juego*/
//se reinician las variables
    score = 0;
    objects = [];
    pirates = [];
    crabs = [];
    canons = [];
    canonBalls = [];
    gameOver = false;
    gameOverScreen.style.display = 'none';
    gameMusic.currentTime = 0;
    gameMusic.play();
    update();
};

setInterval(() => createObject('tesoro'), 1500); /*creamos un tesoro cada segundo y medio*/
setInterval(() => createObject('joya'), 2000);  /*creamos una joya cada 2 segundos*/
setInterval(createPirate, 2000); /*creamos un pirata cada 2 segundos*/
setInterval(createCrab, 2500); /*creamos un cangrejo cada 2.5 segundos*/
setInterval(createCanon, 5000); /*creamos un canon cada 5 segundos*/

backgroundImage.onload = () => { /*cuando la imagen de fondo se cargue*/
    update(); /*actualizamos el canvas*/
};
});