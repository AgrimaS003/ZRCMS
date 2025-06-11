import React,{useState} from 'react'
import logo from '../assets/images/zircar_logo.png'
import './StaffRegistration.css'
function StaffRegistration() {
    const [msg,setMsg]=useState('');

    const DepartmentId={
      "3":"3",
      "4":"4",
      "5":"5",
      "6":"6",
      "7":"7",
      "8":"8",
      "9":"9"
    };

    function handleStaffFormSubmit(e){
        e.preventDefault();
        console.log('Registration Button Clicked')

        const Username=document.getElementById('username').value;
        const Email=document.getElementById('email').value;
        const Password=document.getElementById('password').value;
        const Role=document.getElementById('userType').value;

        if(Role === 'Select Role'){
          setMsg('Please select a valid role');
          return;
        }
        // const Usertypeid=parseInt(DepartmentId[staffRole]);

        fetch('http://192.168.1.32:5015/user_registration',
          {
            method:'POST', 
            headers:{'Content-type':'application/json'},
            body:JSON.stringify({ Username,Email,Password,Role })
          })
          .then(res=>res.json())
          .then(data=>{
            if(data.success){
              setMsg('Staff Registration Successful')
            }
            else{
              setMsg('Staff with this Email is already registered')
            }
          })
          .catch(err=>{
            console.log(err);
          })

        e.target.reset();
    }
  return (
          <div id="staff-registration-container">
        <form method='post' onSubmit={handleStaffFormSubmit} id="staff-registration-form">
          <center>
            <img src={logo} style={{width:"50%",height:"100px"}}/>
          </center>
          <h3>Fill the form to Register Staff</h3><br/>
          
          <div id='Name'>
            <label>UserName : </label>
            <input type='text' name='username' id='username' required />
          </div>

          <div id='Email'>
            <label>Email : </label>
            <input type='email' name="email" id='email' required />
          </div>

          <div id='Password'>
            <label>Password : </label>
            <input type='password' name="password" id='password' required />
          </div>

          <div id='Role'>
            <label>Assign Role : </label>
            <select id='userType' required>
              <option>Select Role</option>
              <option value="3">Manager</option>
              <option value="4">SuperVisor</option>
              <option value="5">Inspection</option>
              <option value="6">Quality_Check</option>
              <option value="7">Sales_Head</option>
              <option value="8">Director</option>
              <option value="9">Account</option>
            </select>
          </div><br/>

          <div id="form-message" className='msg'>{msg}</div>

          <div>
            <button type='submit' id="submit-btn">Register</button>
          </div>
        </form>
      </div>

  )
}

export default StaffRegistration
