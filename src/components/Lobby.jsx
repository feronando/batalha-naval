import '../style/Lobby.css'
import {useContext, useEffect, useRef, useState} from "react";
import {ServerMessageContext, WebSocketContext} from "./WebSocketContext.jsx";
import {Link} from "react-router-dom";
import {Backdrop, CircularProgress, Skeleton} from "@mui/material";

export default function Lobby() {
    const webSocket = useContext(WebSocketContext);
    const {serverMessage, setServerMessage} = useContext(ServerMessageContext);
    const [waitingSecondPlayer, setWaitingSecondPlayer] = useState(false);
    const [opponentReady, setOpponentReady] = useState(false);
    const [selectedCells, updateSelectedCells] = useState([]);
    const prevServerMessage = useRef(serverMessage);

    useEffect(() => {
        setWaitingSecondPlayer(false);
        setOpponentReady(false);
        updateSelectedCells([]);

        if (webSocket && !webSocket.sentJoinRoomMessage) {
            webSocket.send(JSON.stringify({ message: 'joinRoom' }));
            webSocket.sentJoinRoomMessage = true;
        }
    }, [webSocket]);

    useEffect(() => {
        handleLobbyMessages();
    }, [serverMessage]);

    function handleLobbyMessages() {
        const newMessages = serverMessage.filter(message => !prevServerMessage.current.includes(message));
        newMessages.forEach(message => {
            switch (message) {
                case 'Player1':
                    console.log("player1")
                    setWaitingSecondPlayer(true);
                    break;
                case 'Player2':
                    console.log("player2")
                    break;
                case 'roomFull':
                    console.log("roomfull")
                    setWaitingSecondPlayer(false);
                    break;
                case 'opponentReady':
                    console.log("oppready")
                    setOpponentReady(true);
                    break;
                default:
                    break;
            }
        });
        prevServerMessage.current = serverMessage;
    }

    function handleCellClick(cellID) {
        if (selectedCells.includes(cellID)) {
            updateSelectedCells(selectedCells.filter(cell => cell !== cellID));
        } else if (selectedCells.length < 20){
            updateSelectedCells([...selectedCells, cellID]);
        }
    }

    return <>
        <Backdrop open={waitingSecondPlayer} sx={{fontSize: '2vw', color: '#BDB7B8FF'}}>
            <div className="container">
                <CircularProgress size='4.5vw' color="primary" />
            <div className="ellipsis">Waiting for another player</div>
            </div>
        </Backdrop>

        {!waitingSecondPlayer && <div className="container">
            <h2>PLACE YOUR SHIPS ON THE BOARD BELOW</h2>
            <div className="game-container">
                <div className="game-rules">
                    <h3>RULES</h3>
                    <div className="rules-content">
                        <p className="rules">
                            Select <b>{20 - selectedCells.length}</b> cells on the board located to the right. The
                            button below will
                            become available only after all cells are selected. Click it when you're ready to start the
                            game.
                        </p>
                    </div>
                    <Link to={selectedCells.length === 20 ? '/game' : ''}
                          className={selectedCells.length === 20 ? 'btnLobbyReady' : 'btnLobbyNotReady'}
                          onClick={() => {
                              if (selectedCells.length === 20 && webSocket) {
                                  webSocket.send(JSON.stringify({ message: 'playerReady',  selectedCells: selectedCells }));
                              }
                          }}
                    >
                        {selectedCells.length === 20 ? "I'M READY" : 'NOT READY'}
                    </Link>
                </div>
                <div id="player-grid" className="grid">
                    {[...Array(10)].map((_, i) => (
                        [...Array(10)].map((_, j) => {
                            const cellID = `player-cell-${i}-${j}`;
                            return (
                                <div key={cellID} className={`cell ${selectedCells.includes(cellID) ? 'selected' : ''}`}
                                     onClick={() => handleCellClick(cellID)}/>
                            );
                        })
                    ))}
                </div>
                <Skeleton variant="rectangular" width="25vw" height="25vw" animation={!opponentReady ? 'pulse' : false}
                          sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#BDB7B8FF',
                              backgroundColor: opponentReady ? '#4CAF50' : 'rgba(37,38,41,0.5)',
                              borderRadius: '3px',
                              fontWeight: 'light'
                          }}>
                    {opponentReady ? "Your opponent is ready" : 'Your opponent is placing their ships'}
                </Skeleton>
            </div>
        </div>}
    </>
}