import { useContext, useEffect } from 'react';
import {WebSocketContext} from './WebSocketContext';

export function useWebSocketClient(setServerMessage, updatePlayerBoard) {
    const webSocket = useContext(WebSocketContext);

    useEffect(() => {
        if (webSocket && !webSocket.handleEventsExecuted) {
            handleEvents(webSocket, setServerMessage, updatePlayerBoard);
            webSocket.handleEventsExecuted = true;
        }
    }, [webSocket]);
}

function handleEvents(webSocket, setServerMessage, updatePlayerBoard) {
    webSocket.onmessage = (e) => {
        const message = JSON.parse(e.data).message;
        setServerMessage(prevMessages => [...prevMessages, message]);
        if(JSON.parse(e.data).gameBoard) {
            updatePlayerBoard(JSON.parse(e.data).gameBoard)
        }
    };

    webSocket.onclose = () => {
        console.log('WebSocket connection closed');
    };

    webSocket.onerror = (err) => {
        console.error('WebSocket error detected:', err.error);
    };
}
