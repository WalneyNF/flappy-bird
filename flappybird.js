// Variáveis do tabuleiro
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Variáveis do pássaro
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Variáveis dos canos
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Física do jogo
let velocityX = -2; // Velocidade inicial dos canos
let velocityY = 0; // Velocidade do pássaro
let gravity = 0.4;

let gameOver = false;
let score = 0;
let level = 1; // Nível inicial
let pipesPassed = 0; // Contador de canos passados

// Timer
let timeElapsed = 0; // Tempo decorrido em segundos
let timerInterval;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Carrega a imagem do pássaro
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    // Carrega as imagens dos canos
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Inicia o loop de atualização do jogo
    requestAnimationFrame(update);
    // Coloca novos canos a cada 2 segundos (aumentamos o intervalo)
    setInterval(placePipes, 2000);
    // Adiciona o evento de tecla para mover o pássaro
    document.addEventListener("keydown", moveBird);

    // Inicia o timer
    timerInterval = setInterval(updateTimer, 1000); // Atualiza o timer a cada segundo
};

// Função para atualizar o jogo
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Atualiza a posição do pássaro
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Verifica se o pássaro caiu no chão
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Atualiza os canos
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Move os canos com a velocidade atual
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Verifica se o pássaro passou pelo cano
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 10; // Aumenta a pontuação em 10 pontos por cano
            pipesPassed++; // Incrementa o contador de canos passados
            pipe.passed = true;

            // Verifica se o jogador subiu de nível
            if (pipesPassed % 10 === 0) {
                level++; // Aumenta o nível
                velocityX -= 0.5; // Aumenta a velocidade dos canos
            }
        }

        // Verifica colisão entre o pássaro e o cano
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Remove canos que saíram da tela
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Desenha a pontuação, o nível e o tempo decorrido
    context.fillStyle = "white";
    context.font = "30px sans-serif";
    context.fillText(`Pontos: ${score}`, 5, 30); // Exibe a pontuação
    context.fillText(`Nível: ${level}`, 5, 60); // Exibe o nível
    context.fillText(`Tempo: ${timeElapsed}s`, 5, 90); // Exibe o tempo decorrido

    // Verifica se o jogo acabou
    if (gameOver) {
        clearInterval(timerInterval); // Para o timer
        context.fillText("GAME OVER", 5, 120);
    }
}

// Função para adicionar novos canos
function placePipes() {
    if (gameOver) {
        return;
    }

    // Gera uma posição Y aleatória para os canos
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 3; // Aumentamos o espaço entre os canos

    // Cria o cano de cima
    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    // Cria o cano de baixo
    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

// Função para mover o pássaro
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Faz o pássaro pular
        velocityY = -6;

        // Reinicia o jogo se estiver game over
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            level = 1; // Reseta o nível
            pipesPassed = 0; // Reseta o contador de canos passados
            velocityX = -2; // Reseta a velocidade dos canos
            timeElapsed = 0; // Reseta o tempo
            gameOver = false;
            timerInterval = setInterval(updateTimer, 1000); // Reinicia o timer
        }
    }
}

// Função para detectar colisões
function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Função para atualizar o timer
function updateTimer() {
    if (!gameOver) {
        timeElapsed++; // Incrementa o tempo decorrido
    }
}
