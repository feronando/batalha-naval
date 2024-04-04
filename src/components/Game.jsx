import "../style/Game.css"
import {Backdrop, CircularProgress, Skeleton} from "@mui/material";
import {Link} from "react-router-dom";
import {useContext, useEffect, useRef, useState} from "react";
import {PlayerBoardContext, ServerMessageContext, WebSocketContext} from "./WebSocketContext.jsx";

export default function Game() {
    const webSocket = useContext(WebSocketContext);
    const {serverMessage, setServerMessage} = useContext(ServerMessageContext);
    const prevServerMessage = useRef(serverMessage);
    const {playerBoard, updatePlayerBoard} = useContext(PlayerBoardContext);
    const [waitingPlayer, setWaitingPlayer] = useState(false);
    const [playerTurn, setPlayerTurn] = useState(false);

    useEffect(() => {
        console.log(playerBoard)
    }, [playerBoard]);

    useEffect(() => {
        handleLobbyMessages();
    }, [serverMessage]);

    function handleLobbyMessages() {
        const newMessages = serverMessage.filter(message => !prevServerMessage.current.includes(message));
        newMessages.forEach(message => {
            switch (message) {
                case 'waitingOpponent':
                    console.log("waitingOpponent")
                    setWaitingPlayer(true);
                    break;
                case 'startGame':
                    console.log("startGame")
                    setWaitingPlayer(false);
                    break;
                case 'yourTurn':
                    console.log("myTurn")
                    setPlayerTurn(true);
                    break;
                case 'miss':
                    console.log("startGame")
                    setPlayerTurn(false);
                    break;
                case 'hit':
                    console.log("startGame")
                    setPlayerTurn(true);
                    break;
                default:
                    break;
            }
        });
        prevServerMessage.current = serverMessage;
    }

    return <>
        <Backdrop open={waitingPlayer} sx={{fontSize: '2vw', color: '#BDB7B8FF'}}>
            <div className="container">
                <CircularProgress size='4.5vw' color="primary" />
                <div className="ellipsis">Other player is finishing placing their ships</div>
            </div>
        </Backdrop>

        {!waitingPlayer && <div className="container">
            <h1>BATTLESHIPS</h1>
            <h2>{playerTurn ? "YOUR TURN" : "YOUR OPPONENT'S TURN"}</h2>
            <div className="game-container">
                <div id="player-grid" className="grid">
                    {[...Array(10)].map((_, i) => (
                        [...Array(10)].map((_, j) => {
                            const cellID = `player-cell-${i}-${j}`;
                            const isSelected = playerBoard?.[i]?.[j] === 1;
                            return (
                                <div key={cellID} className={`cell ${isSelected ? 'selected' : ''}`}/>
                            );
                        })
                    ))}
                </div>
                <div id="enemy-grid" className="grid">
                    {[...Array(10)].map((_, i) =>
                        [...Array(10)].map((_, j) => {
                            const cellID = `enemy-cell-${i}-${j}`;
                            return (
                                <div
                                    key={cellID}
                                    className="cell"
                                    onClick={() => {
                                        const cellElement = document.getElementById(cellID);
                                        if (playerTurn && webSocket && !cellElement.classList.contains('clicked')) {
                                            if (cellElement) {
                                                cellElement.classList.add('clicked');
                                            }
                                            webSocket.send(JSON.stringify({ message: 'playerReady' }));
                                        }
                                    }}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>}
    </>
}