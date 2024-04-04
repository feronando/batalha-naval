import { WebSocket, WebSocketServer } from 'ws';

class Player {
    constructor(player) {
        this.player = player;
        this.board = this.initializeBoard();
        this.playerStatus = null;
    }

    initializeBoard() {
        const board = [];
        for (let i = 0; i < 10; i++) {
            board.push(Array(10).fill(0));
        }
        return board;
    }
}

class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player1Board = this.initializeBoard();
        this.player1Status = null;
        this.player2 = player2;
        this.player2Board = this.initializeBoard();
        this.player2Status = null;
        this.currPlayer = null;
        this.gameStatus = null;
    }

    initializeBoard() {
        const board = [];
        for (let i = 0; i < 10; i++) {
            board.push(Array(10).fill(0));
        }
        return board;
    }
}

const wss = new WebSocketServer({ port: 8080 });

const connectedPlayers = new Set();
const gamesRepository = new Map();
let gameIdCounter = 1;

wss.on('connection', function connection(ws) {
    connectedPlayers.add(ws);

    ws?.on('message', function incoming(message) {
        handleMessage(ws, JSON.parse(message.toString()));
    });

    ws?.on('close', function() {
        connectedPlayers.delete(ws);
        let deletedRoomId = null;
        for (const [gameId, game] of gamesRepository.entries()) {
            if (game.player1 === ws || game.player2 === ws) {
                deletedRoomId = gameId;
                break;
            }
        }
        gamesRepository.delete(deletedRoomId);
    });
});

function handleMessage(player, json) {
    if (json.selectedCells) {
        updatePlayerBoard(player, json.selectedCells);
    }
    switch (json.message) {
        case 'joinRoom':
            joinRoom(player);
            break;
        case 'playerReady':
            playerReady(player);
            break;
        case 'playerTurn':
            playerReady(player);
            break;
        default:
            break;
    }
}

function joinRoom(player) {
    let auxRoom = null, auxRoomID = null;

    for (const [gameId, game] of gamesRepository.entries()) {
        if (!game.player2) {
            auxRoom = game;
            auxRoomID = gameId;
            break;
        }
    }

    if (!auxRoom) {
        auxRoom = new Game(player);
        auxRoom.player1Status = "waiting";
        gamesRepository.set('room-' + gameIdCounter++, auxRoom);
        auxRoom.player1.send(JSON.stringify({message: 'Player1'}));
    } else {
        auxRoom.player2 = player;
        auxRoom.player2.send(JSON.stringify({message: 'Player2'}));
        auxRoom.player1.send(JSON.stringify({message: 'roomFull'}));
        auxRoom.player2.send(JSON.stringify({message: 'roomFull'}));
        auxRoom.player1Status = "setup";
        auxRoom.player2Status = "setup";
        auxRoom.gameStatus = "setup";
        gamesRepository.set(auxRoomID, auxRoom);
    }
}

function playerReady(player) {
    for (const [gameId, game] of gamesRepository.entries()) {
        if (player === game.player1 || player === game.player2) {
            if(!game.currPlayer) {
                game.currPlayer = player;
            } else {
                game.player1.send(JSON.stringify({message: 'startGame', gameBoard: game.player1Board}));
                game.player2.send(JSON.stringify({message: 'startGame', gameBoard: game.player2Board}));
                game.currPlayer.send(JSON.stringify({message: 'yourTurn'}));
                game.currPlayer = game.currPlayer === game.player1 ? game.player2 : game.player1;
            }

            if (player === game.player1) {
                game.player1Status = "ready";
            } else {
                game.player2Status = "ready";
            }

            if (game.player1Status === "ready" && game.player2Status !== "ready") {
                game.player2.send(JSON.stringify({message: 'opponentReady'}));
                game.player1.send(JSON.stringify({message: 'waitingOpponent'}));
            } else if (game.player2Status === "ready" && game.player1Status !== "ready") {
                game.player1.send(JSON.stringify({message: 'opponentReady'}));
                game.player2.send(JSON.stringify({message: 'waitingOpponent'}));
            }
            break;
        }
    }
}

function updatePlayerBoard(player, selectedCells) {
    for (const [gameId, game] of gamesRepository.entries()) {
        if (game.player1 === player || game.player2 === player) {
            if (game.player1 === player) {
                selectedCells.forEach(cellID => {
                    const [row, col] = cellID.split('-').slice(2).map(Number);
                    game.player1Board[row][col] = 1;
                });
                gamesRepository.set(gameId, game);
                break;
            }
            if (game.player2 === player) {
                selectedCells.forEach(cellID => {
                    const [row, col] = cellID.split('-').slice(2).map(Number);
                    game.player2Board[row][col] = 1;
                });
                gamesRepository.set(gameId, game);
                break;
            }
        }
    }
}