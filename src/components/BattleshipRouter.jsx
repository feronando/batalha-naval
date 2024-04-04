import '../style/App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Home from './Home.jsx';
import Lobby from './Lobby.jsx';
import Game from "./Game.jsx";
import {useWebSocketClient} from "./Client.js";
import {useContext} from "react";
import {PlayerBoardContext, ServerMessageContext} from "./WebSocketContext.jsx";

export default function BattleshipRouter() {
    const {serverMessage, setServerMessage} = useContext(ServerMessageContext);
    const {playerBoard, updatePlayerBoard} = useContext(PlayerBoardContext);
    useWebSocketClient(setServerMessage, updatePlayerBoard);

    return (
        <BrowserRouter>
            <Routes>
                <Route element = { <Home/> } exact path ="/"/>
                <Route element = { <Lobby/> } path="/lobby"/>
                <Route element = { <Game/> } path="/game"/>
            </Routes>
        </BrowserRouter>
    );
}