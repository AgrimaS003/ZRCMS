import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './LogIn.css';
import logo from '../assets/images/zircar_logo.png'

function LogIn() {

  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch('http://192.168.1.29:5015/fetchusers')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  }, []);

  function handleLogIn(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    fetch('http://192.168.1.29:5015/login',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const token = data.access_token;
          localStorage.setItem("token", token);

          const user = data.output;
          localStorage.setItem("currentUser", JSON.stringify(user));

          setMsg('Login Successful');
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } else {
          setMsg('Login Failed');
        }
      })
      .catch(err => {
        console.error('Login error : ', err)
      });

    e.target.reset();
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    if (email === '') {
      document.getElementsByClassName('msg')[0].innerHTML = 'Please Enter Your Email';
    }
    else {
      document.getElementsByClassName('msg')[0].innerHTML = 'Password Reset Link Sent to Your Registered Mail.'
    }
  }

  function showPassword() {
    const passwordInput = document.getElementById('password');
    const checkbox = document.getElementById('showPassword');
    passwordInput.type = checkbox.checked ? "text" : "password";
  }

  return (
    <div className="login-bg">
      <form className="login-card" method='post' onSubmit={handleLogIn}>
        <div className="login-logo-wrap">
          <img src={logo} alt="Logo" className="login-logo" />
        </div>
        <h2 className="login-title">Welcome Back!</h2>
        <div className='login-field-div'>


          <div className="login-field">
            <input
              type="email"
              name="email"
              id="email"
              required
              autoComplete="username"
              placeholder=" "
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="login-field">
            <input
              type="password"
              name="password"
              id="password"
              required
              autoComplete="current-password"
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
          </div>
        </div>
        <div className='show-password-row'>
          <input type='checkbox' id='showPassword' onChange={showPassword} />
          <label htmlFor='showPassword'>Show Password</label>
        </div>
        <div className={`msg ${msg === "Login Successful" ? "msg-success" : msg ? "msg-error" : ""}`}>{msg}</div>
        <button className="login-btn" type='submit'>Log In</button>
        <div className="forgotPassword">
          <a id='fpassword' href="" onClick={handleForgotPassword}>Forgot Password?</a>
        </div>
        {/* <div className='usernotregister'>
          <a href="RegistrationForm">User Not Register??</a>
        </div> */}
      </form>
    </div>
  )
}

export default LogIn
