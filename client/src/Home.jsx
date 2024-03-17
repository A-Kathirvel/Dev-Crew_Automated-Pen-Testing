import React from "react"
import { Link } from 'react-router-dom';
import './Home.css'; 
function Home() {
    return (
        <div>
        <nav>
          <ul>
            <li style={{color:"blue"}}>Dev Crew</li>
            <li><Link to="/register">Signup</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>
        <h1>Welcome to Web Penetration Testing</h1>
        <p>Developed By Dev Crew</p>
        <p>Signup To Continue<br/><br/>
        <Link to="/register">Signup</Link></p>
      </div>
    )
}

export default Home
