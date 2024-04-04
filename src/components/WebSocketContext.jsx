import {createContext, useEffect, useState} from 'react';
import PropTypes from "prop-types";

export const WebSocketContext = createContext(null)
export const ServerMessageContext = createContext({})
export const PlayerBoardContext = createContext({})

export default function WebSocketProvider({ children }) {
    const [webSocket, setWebSocket] = useState(null)
    const [serverMessage, setServerMessage] = useState([]);
    const [playerBoard, updatePlayerBoard] = useState([]);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setWebSocket(ws);
        };

        return () => {
            if(webSocket) {
                webSocket.close();
            }
        }
    }, [])

    return (
        <WebSocketContext.Provider value={webSocket}>
            <ServerMessageContext.Provider value={{serverMessage, setServerMessage}}>
                <PlayerBoardContext.Provider value={{playerBoard, updatePlayerBoard}}>
                    {children}
                </PlayerBoardContext.Provider>
            </ServerMessageContext.Provider>
        </WebSocketContext.Provider>
    )
}

WebSocketProvider.propTypes = {
    children: PropTypes.node.isRequired
}