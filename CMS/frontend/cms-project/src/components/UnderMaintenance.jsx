import React, { useEffect } from 'react'
import './UnderMaintenance.css'
import logo from '../assets/images/zircar_logo.png'
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const UnderMaintenance = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? currentUser.s_usertype : null;
    // console.log(userType)

    if (!token || userType !== 1) {
      // No token or wrong user type, redirect immediately
      navigate("/Login");
      return;
    }
    fetch("http://192.168.1.29:5015/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        console.log("Protected data:", data);
        // setUserData(data); // Or update state
      })
      .catch(err => {
        console.error("Access denied or token invalid", err);
        navigate('/Login')
        // Optionally redirect to login
      });
  }, []);

  function handleMaintenanceSubmit(e) {
    e.preventDefault();
    const startDate = e.target.startDate.value;
    const endDate = e.target.endDate.value;

    fetch('http://192.168.1.29:5015/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    })
      .then(res => res.json())
      .then(() => {
        alert("Maintenance schedule submitted successfully!");
        e.target.reset();
      });
  }

  return (
    <div className="maintenance-layout">
      <Sidebar />
      <div className="maintenance-bg maintenance-content">
        <form className="maintenance-card" onSubmit={handleMaintenanceSubmit}>
          <div className="maintenance-logo-wrap">
            <img src={logo} alt="Logo" className="maintenance-logo" />
          </div>
          <h2 className="maintenance-title">Maintenance Schedule</h2>
          <div className="maintenance-field">
            <input type="datetime-local" name="startDate" id="sdate" required placeholder=" " />
            <label htmlFor="sdate">Start Date and Time</label>
          </div>
          <div className="maintenance-field">
            <input type="datetime-local" name="endDate" id="edate" required placeholder=" " />
            <label htmlFor="edate">End Date and Time</label>
          </div>
          <button className="maintenance-btn" type='submit'>Submit</button>
          <div className="maintenance-footer">
            <span>@ Zircar Refractories. All Rights Reserved</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UnderMaintenance;