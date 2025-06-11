import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './ManageDealers.css'
import RegistrationForm from './RegistrationForm'
import { useNavigate } from 'react-router-dom';

function ManageDealers() {
  const [dealerData, setDealerData] = useState([]);
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
    fetch('http://192.168.1.29:5015/dealers')
      .then(res => res.json())
      .then(data => setDealerData(data))
      .catch(err => console.error('Error fetching dealers:', err));
  }, []);

  const handleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleStatusToggle = (dealerId, currentStatus) => {
    // Toggle status: if "4" (active), set to "6" (inactive), else set to "4" (active)
    const newStatus = currentStatus === "4" ? "6" : "4";
    fetch(`http://192.168.1.29:5015/dealer_status/${dealerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => res.json())
      .then(data => {
        // Update UI after successful backend update
        setDealerData(prev =>
          prev.map(d =>
            d.s_dealer_id === dealerId ? { ...d, s_dealer_status: newStatus } : d
          )
        );
      })
      .catch(err => console.error("Status update error:", err));
  };

  return (
    <div className='manageDealers-layout'>
      <Sidebar />
      <div className='manageDealers-content'>
        <header className='manageDealers-header'>
          <h1>Manage Dealer</h1>
          <span>
            Home /
            Dealer / <span className='tag'>
              Form
            </span>
          </span>
        </header>
        <RegistrationForm />
        <section className="manageDealers-table-section">
          <div className="manageDealers-table-title">
            <h2>Dealer list</h2>
            <div className="manageDealers-table-controls">
              <label>
                <select className="manageDealers-table-entries">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
                entries per page
              </label>
              <input className="manageDealers-table-search" type="text" placeholder="Search..." />
            </div>
          </div>
          <div className="manageDealers-table-wrapper">
            <table className="manageDealers-table">
              <thead>
                <tr>
                  <th>Dealer Id</th>
                  <th>Dealer Name</th>
                  <th>Dealer Email</th>
                  <th>Dealer Mobile</th>
                  <th>Dealer Type</th>
                  <th>Dealer Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dealerData.map((dealer) => (
                  <tr key={dealer.s_dealer_id}>
                    <td data-label="Dealer Id">
                      <a href="#" className="manageDealers-link">{dealer.s_dealer_id}</a>
                    </td>
                    <td data-label="Dealer Name">{dealer.s_dealer_name}</td>
                    <td data-label="Dealer Email">{dealer.s_dealer_email}</td>
                    <td data-label="Dealer Mobile">{dealer.s_dealer_mob}</td>
                    <td data-label="Dealer Type">
                      {(dealer.s_dealer_type === "8" && "Dealer") || (dealer.s_dealer_type === "2" && "Director")}
                    </td>
                    <td data-label="Dealer Status">
                      <span className={`manageDealers-status ${dealer.s_dealer_status === "4" ? "active" : "inactive"}`}>
                        {dealer.s_dealer_status === "4" ? "active" : "inactive"}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ position: "relative" }}>
                      <button
                        className="manageDealers-action-btn"
                        onClick={e => {
                          e.preventDefault();
                          handleDropdown(dealer.s_dealer_id);
                        }}
                        type="button"
                      >
                        Update User <span className="manageDealers-action-arrow">▼</span>
                      </button>
                      {openDropdown === dealer.s_dealer_id && (
                        <div className="manageDealers-dropdown">
                          <button className="manageDealers-dropdown-item" disabled>
                            Reset Password
                          </button>
                          <button
                            className="manageDealers-dropdown-item enable-disable-btn"
                            onClick={() =>
                              handleStatusToggle(dealer.s_dealer_id, dealer.s_dealer_status)
                            }
                          >
                            {dealer.s_dealer_status === "4" ? "Disable" : "Enable"}
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

export default ManageDealers