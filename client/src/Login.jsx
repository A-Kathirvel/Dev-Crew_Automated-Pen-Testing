import React from "react";
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom'
import { useNavigate} from "react-router-dom"
import { useState } from "react";
import axios from 'axios'
function Login(){
    const [name,setName]=useState()

    const navigate=useNavigate()

    const handleSubmit=(e)=>{
        e.preventDefault()
        axios.post('http://localhost:3001/login',{name})
        .then(result=>{console.log(result)
        if(result.data==="Success"){
            navigate('/Request1')
        }
        })
        .catch(err=>console.log(err))
    }
    return(
        <div>
            <h2>Login</h2>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="uname">Username</label>
                <input type="text" name="uname" id="uname" placeholder="Enter Your Name" onChange={(e)=>setName(e.target.value)}/><br />
                <button type="submit">Login</button>
                <p></p>
                Don't have an account? &nbsp;
                <Link to="/register">Register</Link>
            </form>
        </div>
    )
}

export default Login
