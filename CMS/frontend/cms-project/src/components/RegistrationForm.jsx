import React, { useState } from 'react'
import './RegistrationForm.css';
import logo from '../assets/images/zircar_logo.png'
import { useNavigate } from 'react-router-dom';

function RegistrationForm() {

  const [msg, setMsg] = useState('');

  function handleRegistrationFormSubmit(e) {
    e.preventDefault();

    const Username = document.getElementById('username').value;
    const Email = document.getElementById('email').value;
    const Companyname = document.getElementById('companyName').value;
    const Password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const Role = parseInt(role);

    if (role === 'Select Role') {
      setMsg('Please select a valid role');
      return;
    }

    fetch('http://192.168.1.29:5015/user_registration',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ Username, Email, Companyname, Password, Role })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMsg('Dealer Registration Successful');
        }
        else {
          setMsg('User with this Email already registered')
        }
      })
      .catch(err => {
        console.log(err)
      });

    e.target.reset();
  }

  return (
    <div className="register-bg">
      <form className="register-card" onSubmit={handleRegistrationFormSubmit}>
        <div className="register-logo-wrap">
          <img src={logo} alt="Logo" className="register-logo" />
        </div>
        <h2 className="register-title">Register Dealer</h2>
        <div className="register-field">
          <input type='text' name='username' id='username' required placeholder=" " />
          <label htmlFor="username">Username</label>
        </div>
        <div className="register-field">
          <input type='email' name="email" id='email' required placeholder=" " />
          <label htmlFor="email">Email</label>
        </div>
        <div className="register-field">
          <input type='text' name="companyName" id='companyName' required placeholder=" " />
          <label htmlFor="companyName">Dealer's Company Name</label>
        </div>
        <div className="register-field">
          <input type='password' name="password" id='password' required placeholder=" " />
          <label htmlFor="password">Password</label>
        </div>
        <div className="register-field">
          <select id='role' required defaultValue="Select Role">
            <option disabled>Select Role</option>
            <option value={8}>Dealer</option>
          </select>
          <label htmlFor="role">Assign Role</label>
        </div>
        <div className={`msg ${msg === "Dealer Registration Successful" ? "msg-success" : msg ? "msg-error" : ""}`}>{msg}</div>
        <button className="register-btn" type='submit'>Register</button>
        {/* <div className='loginlink'>
          <span>Did You Have Account?</span>
          <a href="/Login">Login</a>
        </div> */}
      </form>
    </div>
  );
}

export default RegistrationForm;