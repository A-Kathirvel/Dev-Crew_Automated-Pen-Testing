import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Register from './Register'
import Login from './Login'
import Home from './Home'
import Request1 from './Request1'
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  return (
   <div>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/register' element={<Register/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/request1' element={<Request1/>}></Route>
      </Routes>
    </BrowserRouter>
   </div>
  )
}

export default App
