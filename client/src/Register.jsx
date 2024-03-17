import { useState } from "react";
import {BrowserRouter,Routes,Route,Link} from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import './Register.css'

function Register(){
    const [name,setName]=useState()

    const navigate=useNavigate()

    const handleSubmit=(e)=>{
        e.preventDefault()
        axios.post('http://localhost:3001/register',{name})
        .then(result=>{console.log(result)
         navigate('/login')
        })
        .catch(err=>console.log(err))
    }
    return(
        <div>
            <h2>Register</h2>
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="uname">Username</label>
                <input type="text" name="uname" id="uname" placeholder="Enter Your Name" onChange={(e)=>setName(e.target.value)}/><br />
                <button type="submit">Register</button><br/>
                Already have an account? &nbsp;
                <Link to="/login">Login</Link>
            </form>
        </div>
    )
}

export default Register