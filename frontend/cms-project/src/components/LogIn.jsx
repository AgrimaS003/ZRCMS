import React, { useState } from 'react'
import './LogIn.css';
import logo from '../assets/images/zircar_logo.png'
import { useNavigate } from 'react-router-dom';

function LogIn(){

  const [msg,setMsg]=useState('');
  const navigate = useNavigate();

    function handleLogIn(e){
        e.preventDefault();

        const email=document.getElementById('email').value;
        const password=document.getElementById('password').value;

         fetch('http://192.168.1.32:5015/login',
          {
            method:'POST',
            headers:{'Content-type':'application/json'},
            body: JSON.stringify({email,password})
          })
        .then(res=>res.json())
        .then(data=>{
          if(data.success){
            setMsg('Login Successful'); 
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('usertype',data.usertype.toLowerCase());
            // console.log(data.usertype)
            // console.log(data.email)
            e.target.reset();
            setTimeout( () => {
              navigate(`/${data.usertype}/dashboard`);
            },1000);
          }
          else{
            setMsg('Login Failed');
            setTimeout(() => setMsg(''), 2000);
          }
        })
        .catch(err=>{
          console.error('Login error : ',err)
        });

    }

    function handleForgotPassword(e){
        e.preventDefault();
        const email=document.getElementById('email').value; 
        if(email===''){
            setMsg('Please Enter Your Email');
        }
        else{
          setMsg('Password Reset Link Sent to Your Registered Mail.')
        }
    }

    function showPassword(){
      const passwordInput=document.getElementById('password');
      const checkbox =document.getElementById('showPassword');
      passwordInput.type=checkbox.checked ? "text" : "password";
    }

  return ( 
    <>
    <div className="login-container">
        <form method='post' onSubmit={handleLogIn}>
          <center>
          <img src={logo} style={{width:"50%", height:"100px"}}/>
          </center>
        <h3 id='login-h3'>User Login</h3>
        <br/>
        <div id='Email'>
          <label id='login-label'>Email : </label>
          <input type='email' name="email" id='email' required></input>
        </div><br/>
        <div id='Password'>
          <label>Password : </label>
          <input type='password' name="password" id='password' required></input>
        </div>
        <div id='show_password' className='ShowingPassword'>
          <input type='checkbox' id='showPassword' onChange={showPassword}/> 
          <label id='show_Password' style={{marginBottom:'0'}}>Show Password</label>
        </div>
        <div className={`msg ${msg === 'Login Successful' ? 'success' : msg === 'Login Failed' ? 'error' : ''}`}>
            {msg}
        </div>
        <div className="LogIn">
            <button type='submit'>LogIn</button>
        </div>
        <br/>
        <div className="forgotPassword">
          <a id='fpassword' href="" style={{textDecoration:'none'}} onClick={handleForgotPassword}>Forgot Password?</a>
        </div> 
        </form>
        </div>
   </>
  )
}

export default LogIn
