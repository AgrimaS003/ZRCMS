import React, { useState } from 'react'
import logo from '../assets/images/zircar_logo.png'
import './StaffRegistration.css'
import { useNavigate } from 'react-router-dom';

function StaffRegistration(props) {
  const [msg, setMsg] = useState('');


  function handleStaffFormSubmit(e) {
    e.preventDefault();

    const Username = document.getElementById('username').value;
    const Email = document.getElementById('email').value;
    const Password = document.getElementById('password').value;
    const Role = document.getElementById('userType').value;

    if (Role === 'Select Role') {
      setMsg('Please select a valid role');
      return;
    }

    fetch('http://192.168.1.29:5015/user_registration',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ Username, Email, Password, Role })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMsg('Staff Registration Successful')
        }
        else {
          setMsg('Staff with this Email is already registered')
        }
      })
      .catch(err => {
        console.log(err);
      })

    e.target.reset();
  }

  return (
    <div className="staff-bg">
      <form className="staff-card" method='post' onSubmit={handleStaffFormSubmit}>
        <div className="staff-logo-wrap">
          <img src={logo} alt="Logo" className="staff-logo" />
        </div>
        <h2 className="staff-title">Register Staff</h2>
        <div className="staff-field">
          <input type='text' name='username' id='username' required placeholder=" " />
          <label htmlFor="username">Username</label>
        </div>
        <div className="staff-field">
          <input type='email' name="email" id='email' required placeholder=" " />
          <label htmlFor="email">Email</label>
        </div>
        <div className="staff-field">
          <input type='password' name="password" id='password' required placeholder=" " />
          <label htmlFor="password">Password</label>
        </div>
        <div className="staff-field">
            <select id='userType' required defaultValue="Select Role">
              <option disabled value="Select Role">Select Role</option>
              <option value="1">Manager</option>
              <option value="2">SuperVisor</option>
              <option value="3">Inspection</option>
              <option value="4">Quality_Check</option>
              <option value="5">Sales_Head</option>
              <option value="6">Director</option>
              <option value="7">Account</option>
            </select>
            <label htmlFor="userType">Assign Role</label>
        </div>
        <div className={`msg ${msg === "Staff Registration Successful" ? "msg-success" : msg ? "msg-error" : ""}`}>{msg}</div>
        <button className="staff-btn" type='submit'>Register</button>
        <div className="switch-login">
          <span>Already have an account? </span>
          <a href="#" onClick={e => { e.preventDefault(); props.onSwitchToLogin && props.onSwitchToLogin(); }}>Log In</a>
        </div>
      </form>
    </div>
  )
}

export default StaffRegistration
