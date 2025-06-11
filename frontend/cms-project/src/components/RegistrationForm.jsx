import React, { useState } from 'react'
import './RegistrationForm.css';
import logo from '../assets/images/zircar_logo.png'

function RegistrationForm() {

  const [msg, setMsg] = useState('');

  function handleRegistrationFormSubmit(e) {
    e.preventDefault();

    const Username = document.getElementById('username').value;
    const Email = document.getElementById('email').value;
    const Companyname = document.getElementById('companyName').value;
    const Password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const Role=parseInt(role)
    
    if (Role === 'Select Role') {
      setMsg('Please select a valid role')
      return;
    }

    const user_id=fetch('http://192.168.1.32:5015/user_registration',
      {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ Username, Email, Companyname, Password, Role})
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
    <>
      <div id='dealer-registration-container'>
      <form className='registration-form' onSubmit={handleRegistrationFormSubmit}>
        <center>
          <img src={logo} style={{ width: "50%", height: "100px" }} />
        </center>
        <br />
        <h3>Fill the form to Register Dealer</h3><br/>
        <div id='Name'>
          <label>UserName : </label>
          <input type='text' name='username' id='username' required></input>
        </div><br />
        <div id='Email'>
          <label>Email : </label>
          <input type='email' name="email" id='email' required></input>
        </div><br />
        <div id='Company'>
          <label>Dealer's Company Name : </label>
          <input type='text' name="companyName" id='companyName' required></input>
        </div><br />
        <div id='Password'>
          <label>Password : </label>
          <input type='password' name="password" id='password' required></input>
        </div><br />
        <div id='Role'>
          <label>Assign Role : </label>
          <select id='role'>
            <option>Select Role</option>
            <option value={2}>Dealer</option>
          </select>
        </div><br/>
        <div className='msg'>{msg}</div>
        <br />
        <div>
          <button type='submit'>Register</button>
        </div>
      </form>
      </div>
    </>
  );
}

export default RegistrationForm;