import React, { useState } from 'react'
import logo from '../assets/images/zircar_logo.png'
import './BranchRegistration.css'
import { useNavigate } from 'react-router-dom';

const BranchRegistration = (props) => {

  const [msg, setMsg] = useState('');

  function handleBranchFormSubmit(e) {
    e.preventDefault();

    const Username = document.getElementById('username').value;
    const Email = document.getElementById('email').value;
    const Branchname = document.getElementById('branchName').value;
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
        body: JSON.stringify({ Username, Email, Branchname, Password, Role })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMsg('Registration Successful')
        }
        else {
          setMsg('User with this Email is already registered')
        }
      })
      .catch(err => {
        console.log(err);
      })

    e.target.reset();
  }

  return (
    <div className="branch-bg">
      <form className="branch-card" onSubmit={handleBranchFormSubmit} method='post'>
        <div className="branch-logo-wrap">
          <img src={logo} alt="Logo" className="branch-logo" />
        </div>
        <h2 className="branch-title">Register Branch</h2>
        <div className="branch-field">
          <input type='text' name='username' id='username' required placeholder=" " />
          <label htmlFor="username">Name</label>
        </div>
        <div className="branch-field">
          <input type='email' name="email" id='email' required placeholder=" " />
          <label htmlFor="email">Email</label>
        </div>
        <div className="branch-field">
          <input type='text' name="branchName" id='branchName' required placeholder=" " />
          <label htmlFor="branchName">Branch Name</label>
        </div>
        <div className="branch-field">
          <input type='password' name="password" id='password' required placeholder=" " />
          <label htmlFor="password">Password</label>
        </div>
        <div className="branch-field">
          <select id='role' required defaultValue="Select Role">
            <option disabled>Select Role</option>
            <option value={9}>Branch</option>
          </select>
          <label htmlFor="role">Assign Role</label>
        </div>
        <div className={`msg ${msg === "Registration Successful" ? "msg-success" : msg ? "msg-error" : ""}`}>{msg}</div>
        <button className="branch-btn" type='submit'>Register</button>
        {/* <div className="switch-login">
          <span>Already have an account? </span>
          <a href="#" onClick={e => { e.preventDefault(); props.onSwitchToLogin && props.onSwitchToLogin(); }}>Log In</a>
        </div> */}
      </form>
    </div>
  )
}

export default BranchRegistration
