// Variáveis do tabuleiro
let board;
let boardWidth = 360; // Largura do tabuleiro
let boardHeight = 640; // Altura do tabuleiro
let context; // Contexto do canvas para desenhar

// Variáveis do pássaro
let birdWidth = 34; // Largura do pássaro (proporção width/height = 17/12)
let birdHeight = 24; // Altura do pássaro
let birdX = boardWidth / 8; // Posição inicial X do pássaro
let birdY = boardHeight / 2; // Posição inicial Y do pássaro
let birdImg; // Imagem do pássaro

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Variáveis dos canos
let pipeArray = []; // Array para armazenar os canos
let pipeWidth = 64; // Largura do cano (proporção width/height = 1/8)
let pipeHeight = 512; // Altura do cano
let pipeX = boardWidth; // Posição inicial X dos canos
let pipeY = 0; // Posição inicial Y dos canos

let topPipeImg; // Imagem do cano de cima
let bottomPipeImg; // Imagem do cano de baixo

// Física do jogo
let velocityX = -2; // Velocidade horizontal dos canos (movendo para a esquerda)
let velocityY = 0; // Velocidade vertical do pássaro (para o pulo)
let gravity = 0.4; // Gravidade aplicada ao pássaro

let gameOver = false; // Estado do jogo
let score = 0; // Pontuação do jogador

// Quando a janela carregar, configura o jogo
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // Contexto para desenhar no canvas

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
    // Coloca novos canos a cada 1.5 segundos
    setInterval(placePipes, 1500);
    // Adiciona o evento de tecla para mover o pássaro
    document.addEventListener("keydown", moveBird);
};

// Função para atualizar o jogo
function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return; // Se o jogo acabou, não atualiza mais
    }
    context.clearRect(0, 0, board.width, board.height); // Limpa o canvas

    // Atualiza a posição do pássaro
    velocityY += gravity; // Aplica a gravidade
    bird.y = Math.max(bird.y + velocityY, 0); // Limita o pássaro ao topo do canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height); // Desenha o pássaro

    // Verifica se o pássaro caiu no chão
    if (bird.y > board.height) {
        gameOver = true;
    }

    // Atualiza os canos
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX; // Move o cano para a esquerda
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height); // Desenha o cano

        // Verifica se o pássaro passou pelo cano
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Aumenta a pontuação (0.5 para cada cano, total 1 por par)
            pipe.passed = true;
        }

        // Verifica colisão entre o pássaro e o cano
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Remove canos que saíram da tela
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); // Remove o primeiro cano do array
    }

    // Desenha a pontuação
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    // Desenha "GAME OVER" se o jogo acabou
    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

// Função para adicionar novos canos
function placePipes() {
    if (gameOver) {
        return; // Se o jogo acabou, não adiciona novos canos
    }

    // Gera uma posição Y aleatória para os canos
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4; // Espaço entre os canos

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
            gameOver = false;
        }
    }
}

// Função para detectar colisões
function detectCollision(a, b) {
    return (
        a.x < b.x + b.width && // Verifica se o lado esquerdo de 'a' colide com o lado direito de 'b'
        a.x + a.width > b.x && // Verifica se o lado direito de 'a' colide com o lado esquerdo de 'b'
        a.y < b.y + b.height && // Verifica se o topo de 'a' colide com a base de 'b'
        a.y + a.height > b.y // Verifica se a base de 'a' colide com o topo de 'b'
    );
}
