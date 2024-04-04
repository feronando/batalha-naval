import React from 'react'
import ReactDOM from 'react-dom/client'
import BattleshipRouter from './components/BattleshipRouter.jsx'
import './style/index.css'
import WebSocketProvider from "./components/WebSocketContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <WebSocketProvider>
            <BattleshipRouter/>
        </WebSocketProvider>
    </React.StrictMode>,
)
