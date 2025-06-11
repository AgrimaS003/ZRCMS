import React, { useState } from 'react'
import logo from '../assets/images/zircar_logo.png'
import './BranchRegistration.css'

const BranchRegistration = () => {

  const [msg,setMsg]=useState('');

    function handleBranchFormSubmit(e){
        e.preventDefault();
        // console.log('Registration Button Clicked')

        const Username=document.getElementById('username').value;
        const Email=document.getElementById('email').value;
        const Branchname=document.getElementById('branchName').value;
        const Password=document.getElementById('password').value;
        const role=document.getElementById('role').value;
        const Role=parseInt(role)

        if(isNaN(Role)){
          setMsg('Please select a valid role');
          return ;
        } 
        fetch('http://192.168.1.32:5015/user_registration',
          {
          method:'POST',
          headers: {'Content-type':'application/json'},
          body:JSON.stringify({Username,Email,Branchname,Password,Role})
          })
          .then(res=>res.json())
          .then(data=>{
            if(data.success){
                setMsg('Registration Successful')
            }
            else{
              setMsg(data.message || 'Registration Failed');
            }
          })
          .catch(err=>{
            console.log(err);
          })

      e.target.reset();
    }

  return (
    <>
        <div id="branch-registration-container">
            <form onSubmit={handleBranchFormSubmit} method='post' id="branch-registration-form">
              <center>
                <img src={logo} style={{ width: "50%", height: "100px" }} />
              </center>
              <br />
              <h3>Fill the form to Register Branch</h3><br />

              <div id='Name'>
                <label>Name : </label>
                <input type='text' name='username' id='username' required />
              </div><br />

              <div id='Email'>
                <label>Email : </label>
                <input type='email' name="email" id='email' required />
              </div><br />

              <div id='Branch'>
                <label>Branch Name : </label>
                <input type='text' name="branchName" id='branchName' required />
              </div><br />

              <div id='Password'>
                <label>Password : </label>
                <input type='password' name="password" id='password' required />
              </div><br />

              <div id='Role'>
                <label>Assign Role : </label>
                <select id='role'>
                  <option>Select Role</option>
                  <option value={10}>Branch</option>
                </select>
              </div><br />

              <div id="form-message" className='msg'>{msg}</div>

              <div>
                <button type='submit' id="submit-btn">Register</button>
              </div>
            </form>
          </div>

    </>
  )
}

export default BranchRegistration
