import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './ManageBranch.css'
import BranchRegistration from './BranchRegistration'
import { useNavigate } from 'react-router-dom';

function ManageBranch() {
  const [branchData, setBranchData] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
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

  useEffect(() => {
    // Replace with your actual API endpoint for branches
    fetch('http://192.168.1.29:5015/branches')
      .then(res => res.json())
      .then(data => setBranchData(data))
      .catch(err => console.error('Error fetching branches:', err));
  }, []);

  // Dropdown toggle handler
  const handleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Enable/Disable handler
  const handleStatusToggle = (branchId, currentStatus) => {
    const newStatus = currentStatus === "4" ? "6" : "4";
    fetch(`http://192.168.1.29:5015/branch_status/${branchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(() => {
        setBranchData(prev =>
          prev.map(b =>
            b.s_branch_id === branchId ? { ...b, s_branch_status: newStatus } : b
          )
        );
        setOpenDropdown(null);
      })
      .catch(err => console.error("Status update error:", err));
  };

  return (
    <div className='manageBranch-layout'>
      <Sidebar />
      <div className='manageBranch-content'>
        <header className='manageBranch-header'>
          <h1>Manage Branch</h1>
          <span>
            Home /
            Branch / <span className='tag'>Form</span>
          </span>
        </header>
        <BranchRegistration />
        <section className="manageBranch-table-section">
          <div className="manageBranch-table-title">
            <h2>Branch list</h2>
            <div className="manageBranch-table-controls">
              <label>
                <select className="manageBranch-table-entries">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                entries per page
              </label>
              <input className="manageBranch-table-search" type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="manageBranch-table-wrapper">
            <table className="manageBranch-table">
              <thead>
                <tr>
                  <th>Branch Id</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {branchData.map((branch) => (
                  <tr key={branch.s_branch_id}>
                    <td data-label="Branch Id">
                      <a href="#" className="manageBranch-link">{branch.s_branch_id}</a>
                    </td>
                    <td data-label="Name">{branch.s_branch_name}</td>
                    <td data-label="Email">{branch.s_branch_email}</td>
                    <td data-label="Mobile">{branch.s_branch_mob}</td>
                    <td data-label="Type">{branch.s_branch_type}</td>
                    <td data-label="Status">
                      <span className={`manageBranch-status ${(branch.s_branch_status === "4" && "active") || (branch.s_branch_status === "6" && "inactive")}`}>
                        {(branch.s_branch_status === "4" && "Active") || (branch.s_branch_status === "6" && "Inactive")}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ position: "relative" }}>
                      <button
                        className="manageBranch-action-btn"
                        onClick={e => {
                          e.preventDefault();
                          handleDropdown(branch.s_branch_id);
                        }}
                        type="button"
                      >
                        Update Branch <span className="manageBranch-action-arrow">▼</span>
                      </button>
                      {openDropdown === branch.s_branch_id && (
                        <div className="manageBranch-dropdown">
                          <button className="manageBranch-dropdown-item" disabled>
                            Reset Password
                          </button>
                          <button
                            className="manageBranch-dropdown-item enable-disable-btn"
                            onClick={() =>
                              handleStatusToggle(branch.s_branch_id, branch.s_branch_status)
                            }
                          >
                            {branch.s_branch_status === "4" ? "Disable" : "Enable"}
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

export default ManageBranch