import React from 'react'
import './UnderMaintenance.css'; 
import logo from '../assets/images/zircar_logo.png'

const UnderMaintenance = () => {

    function handleMaintenanceSubmit(e){
        e.preventDefault();
        console.log("Button clicked")

        e.target.reset();
    }

  return (
    <>
    <div>
      <header id='umaintenance'> 
      <img src={logo} style={{width:"200px",height:"100px"}} /> 
      </header>
        <form className='maintenance-form' onSubmit={handleMaintenanceSubmit}>
                <h3 id='smaintenance'>Maintenance Schedule</h3>
                <div>
                <label>Start Date and Time </label>
                <input type="datetime-local" name="startDate" id="sdate" required></input>
            </div>
            <div>
                <label>End Date and Time </label>
                <input type="datetime-local" name="endDate" id="edate" required></input>
            </div>
            <div className='Submit'>
                <button type='submit'>Submit</button>
            </div>
      </form>
    </div>
    <div>
        <center>
            <p style={{color:'#012970'}}><b>@ Zircar Refractories.</b> All Rights Reserved</p>
        </center>
    </div>
    </>
  );
}

export default UnderMaintenance;