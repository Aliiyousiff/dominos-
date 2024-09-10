let playerTiles = [];
let computerTiles = [];
let boardTiles = [];
let playerScore = 0;
let computerScore = 0;
let currentPlayer = "player";

const startButton = document.getElementById("start");
const restartButton = document.getElementById("restart");
const playerTilesDiv = document.getElementById("player-tiles");
const computerTilesDiv = document.getElementById("computer-tiles");
const scoreDiv = document.getElementById("score");
const boardDiv = document.getElementById("board");

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

function startGame() {
    const allTiles = generateTiles();
    shuffle(allTiles);

    playerTiles = allTiles.splice(0, 7);
    computerTiles = allTiles.splice(0, 7);
    boardTiles = [];

    displayTiles(playerTiles, playerTilesDiv, true, "player");
    displayTiles(computerTiles, computerTilesDiv, false, "computer");

    currentPlayer = "player";
    updateScore();
    boardDiv.innerHTML = "Board";
}

function restartGame() {
    playerScore = 0;
    computerScore = 0;
    startGame();
}

function generateTiles() {
    let tiles = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            tiles.push([i, j]);
        }
    }
    return tiles;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayTiles(tiles, container, showNumbers, owner) {
    container.innerHTML = '';
    tiles.forEach((tile, index) => {
        const tileDiv = createTileElement(tile, showNumbers, owner);
        if (showNumbers && owner === "player") {
            tileDiv.onclick = () => playTurn(tile, index);
        }
        container.appendChild(tileDiv);
    });
}

function createTileElement(tile, showNumbers, owner) {
    const tileDiv = document.createElement("div");
    tileDiv.className = "tile";

    
    if (owner === "player") {
        tileDiv.classList.add("player-tile"); 
    } else {
        tileDiv.classList.add("computer-tile"); 
    }

    const leftSide = document.createElement("div");
    leftSide.className = "half-tile";
    renderPips(leftSide, tile[0]);

    const rightSide = document.createElement("div");
    rightSide.className = "half-tile";
    renderPips(rightSide, tile[1]);

    if (showNumbers) {
        leftSide.innerText = tile[0];
        rightSide.innerText = tile[1];
    }

    tileDiv.appendChild(leftSide);
    tileDiv.appendChild(rightSide);

    return tileDiv;
}


function renderPips(container, number) {
    const positions = [
        [0, 2], [0, 0], [0, 4], [2, 2], [4, 0], [4, 4], [4, 2]
    ];
    const pipMap = [
        [],
        [3],
        [1, 5],
        [1, 3, 5],
        [0, 1, 4, 5],
        [0, 1, 3, 4, 5],
        [0, 1, 2, 4, 5, 6]
    ];

    pipMap[number].forEach(pos => {
        const pip = document.createElement("div");
        pip.className = "pip";
        pip.style.gridRowStart = positions[pos][0] + 1;
        pip.style.gridColumnStart = positions[pos][1] + 1;
        container.appendChild(pip);
    });
}

function playTurn(tile, index) {
    if (currentPlayer === "player") {
        if (isValidMove(tile)) {
            placeTile(tile);
            playerTiles.splice(index, 1);
            displayTiles(playerTiles, playerTilesDiv, true, "player");
            setTimeout(() => {
                checkGameEnd();
            }, 200); 
            currentPlayer = "computer";
            computerPlay();
        } else {
            alert("Invalid move! You must match one of the numbers at either end.");
        }
    }
}

function isValidMove(tile) {
    if (boardTiles.length === 0) {
        return true;
    }
    const firstTile = boardTiles[0];
    const lastTile = boardTiles[boardTiles.length - 1];
    return (tile[0] === firstTile[0] || tile[1] === firstTile[0] ||
            tile[0] === lastTile[1] || tile[1] === lastTile[1]);
}

function placeTile(tile) {
    const firstTile = boardTiles[0];
    const lastTile = boardTiles[boardTiles.length - 1];
    if (boardTiles.length === 0) {
        boardTiles.push(tile);
    } else if (tile[0] === lastTile[1]) {
        boardTiles.push(tile);
    } else if (tile[1] === lastTile[1]) {
        boardTiles.push([tile[1], tile[0]]);
    } else if (tile[1] === firstTile[0]) {
        boardTiles.unshift(tile);
    } else if (tile[0] === firstTile[0]) {
        boardTiles.unshift([tile[1], tile[0]]);
    }
    updateBoard();
}

function updateBoard() {
    boardDiv.innerHTML = '';
    boardTiles.forEach(tile => {
        const tileElement = createTileElement(tile, true, "player"); 
        boardDiv.appendChild(tileElement);
    });
}

function computerPlay() {
    setTimeout(() => {
        let played = false;
        for (let i = 0; i < computerTiles.length; i++) {
            if (isValidMove(computerTiles[i])) {
                placeTile(computerTiles[i]);
                computerTiles.splice(i, 1);
                displayTiles(computerTiles, computerTilesDiv, false, "computer");
                played = true;
                break;
            }
        }

        if (!played) {
            checkGameEnd();
            alert("Computer can't play, your turn!");
            currentPlayer = "player";
            return;
        }

        setTimeout(() => {
            checkGameEnd();
            currentPlayer = "player";
            updateScore();
        }, 200); 
    }, 1000);
}

function checkGameEnd() {
    if (playerTiles.length === 0 || computerTiles.length === 0) {
        if (playerTiles.length === 0) playerScore++;
        if (computerTiles.length === 0) computerScore++;
        alert(`Round over! Player Score: ${playerScore}, Computer Score: ${computerScore}`);
        startGame();
    } else if (!playerHasValidMove() && !computerHasValidMove()) {
        calculateBlockedGameWinner();
    } else if (!playerHasValidMove()) {
        alert("Player can't play, computer's turn!");
        currentPlayer = "computer";
        computerPlay();
    } else if (!computerHasValidMove()) {
        currentPlayer = "player";
    }
}

function playerHasValidMove() {
    return playerTiles.some(isValidMove);
}

function computerHasValidMove() {
    return computerTiles.some(isValidMove);
}

function calculateBlockedGameWinner() {
    const playerPoints = playerTiles.reduce((sum, tile) => sum + tile[0] + tile[1], 0);
    const computerPoints = computerTiles.reduce((sum, tile) => sum + tile[0] + tile[1], 0);

    if (playerPoints > computerPoints) {
        computerScore++;
        alert("Game blocked! Player has higher points, computer wins this round.");
    } else {
        playerScore++;
        alert("Game blocked! Computer has higher points, player wins this round.");
    }
    updateScore();
    startGame();
}

function updateScore() {
    scoreDiv.innerText = `Player Score: ${playerScore} | Computer Score: ${computerScore}`;
}

function showWinnerImage() {
    const winnerPicDiv = document.getElementById("winner-pic");
    winnerPicDiv.style.display = "block"; 

    setTimeout(() => {
        winnerPicDiv.style.display = "none"; 
    }, 5000); //
}


function checkGameEnd() {
    if (playerTiles.length === 0 || computerTiles.length === 0) {
        if (playerTiles.length === 0) {
            playerScore++;
            showWinnerImage(); 
        }
        if (computerTiles.length === 0) computerScore++;
        alert(`Round over! Player Score: ${playerScore}, Computer Score: ${computerScore}`);
        startGame();
    } else if (!playerHasValidMove() && !computerHasValidMove()) {
        calculateBlockedGameWinner();
    } else if (!playerHasValidMove()) {
        currentPlayer = "computer";
        alert("Player can't play, computer's turn!");
        computerPlay();
    } else if (!computerHasValidMove()) {
        currentPlayer = "player";
    }
}

function calculateBlockedGameWinner() {
    const playerPoints = playerTiles.reduce((sum, tile) => sum + tile[0] + tile[1], 0);
    const computerPoints = computerTiles.reduce((sum, tile) => sum + tile[0] + tile[1], 0);

    if (playerPoints > computerPoints) {
        computerScore++;
        alert("Game blocked! Player has higher points, computer wins this round.");
    } else {
        playerScore++;
        showWinnerImage(); 
        alert("Game blocked! Computer has higher points, player wins this round.");
    }
    updateScore();
    startGame();
}
