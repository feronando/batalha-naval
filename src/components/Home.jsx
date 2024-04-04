import '../style/Home.css'
import {Link} from "react-router-dom";

export default function Home() {
    return (
        <div className="container">
            <h1>BATTLESHIP</h1>
            <Link to="/lobby" className="btnHome">START GAME</Link>
        </div>
    )
}