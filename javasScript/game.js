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