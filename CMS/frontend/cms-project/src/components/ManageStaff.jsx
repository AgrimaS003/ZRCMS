import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './ManageStaff.css'
import StaffRegistration from './StaffRegistration'
import { useNavigate } from 'react-router-dom';

function ManageStaff() {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

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

  useEffect(() => {
    // Replace with your actual API endpoint for staff
    fetch('http://192.168.1.29:5015/staff')
      .then(res => res.json())
      .then(data => setStaffData(data))
      .catch(err => console.error('Error fetching staff:', err));
  }, []);

  // Handler for dropdown toggle
  const handleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Handler for enable/disable
  const handleStatusToggle = (staffId, currentStatus) => {
    const newStatus = currentStatus === "4" ? "6" : "4";
    fetch(`http://192.168.1.29:5015/staff_status/${staffId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(() => {
        setStaffData(prev =>
          prev.map(s =>
            s.s_staff_id === staffId ? { ...s, s_staff_status: newStatus } : s
          )
        );
        setOpenDropdown(null);
      })
      .catch(err => console.error("Status update error:", err));
  };

  return (
    <div className='manageStaff-layout'>
      <Sidebar />
      <div className='manageStaff-content'>
        <header className='manageStaff-header'>
          <h1>Manage Staff</h1>
          <span>
            Home /
            Staff / <span className='tag'>Form</span>
          </span>
        </header>
        {/* You can add a RegistrationForm for staff here if needed */}
        <StaffRegistration />
        <section className="manageStaff-table-section">
          <div className="manageStaff-table-title">
            <h2>Staff list</h2>
            <div className="manageStaff-table-controls">
              <label>
                <select className="manageStaff-table-entries">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                entries per page
              </label>
              <input className="manageStaff-table-search" type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="manageStaff-table-wrapper">
            <table className="manageStaff-table">
              <thead>
                <tr>
                  <th>Staff Id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Mobile</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => (
                  <tr key={staff.s_staff_id}>
                    <td data-label="Staff Id">
                      <a href="#" className="manageStaff-link">{staff.s_staff_id}</a>
                    </td>
                    <td data-label="Name">{staff.s_staff_name}</td>
                    <td data-label="Email">{staff.s_staff_email}</td>
                    <td data-label="Department">
                      {staff.s_department_id === "1" && 'Manager' ||
                        staff.s_department_id === "2" && 'SuperVisor' ||
                        staff.s_department_id === "3" && 'Inspection' ||
                        staff.s_department_id === "4" && 'Quality_Check' ||
                        staff.s_department_id === "5" && 'Sales_Head' ||
                        staff.s_department_id === "6" && 'Director' ||
                        staff.s_department_id === "7" && 'Account'}
                    </td>
                    <td data-label="Mobile">{staff.s_staff_mobile}</td>
                    <td data-label="Status">
                      <span className={`manageStaff-status ${(staff.s_staff_status === "4" && "active") || (staff.s_staff_status === "6" && "inactive")}`}>
                        {(staff.s_staff_status === "4" && "active") || (staff.s_staff_status === "6" && "inactive")}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ position: "relative" }}>
                      <button
                        className="manageStaff-action-btn"
                        onClick={e => {
                          e.preventDefault();
                          handleDropdown(staff.s_staff_id);
                        }}
                        type="button"
                      >
                        Update User <span className="manageStaff-action-arrow">▼</span>
                      </button>
                      {openDropdown === staff.s_staff_id && (
                        <div className="manageStaff-dropdown">
                          <button className="manageStaff-dropdown-item" disabled>
                            Reset Password
                          </button>
                          <button
                            className="manageStaff-dropdown-item enable-disable-btn"
                            onClick={() =>
                              handleStatusToggle(staff.s_staff_id, staff.s_staff_status)
                            }
                          >
                            {staff.s_staff_status === "4" ? "Disable" : "Enable"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ManageStaff