import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DealerComplaintList.css';
import Sidebar from './Sidebar';

const STATUS_MAP = {
  0: "Initiated",
  1: "Under Review",
  2: "Assign To Manager",
  3: "Rejected By Manager",
  4: "Assign To Supervision",
  5: "Rejected By Supervision",
  6: "Assign To Field Inspector",
  7: "Rejected By Field Inspector",
  8: "Assign To Quality Check",
  9: "Rejected By Quality Check",
  10: "Assign To Sales Head",
  11: "Rejected By Sales Head",
  12: "Assign To Director",
  13: "Rejected By Director",
  14: "Assign To Account",
  15: "Rejected By Account",
  16: "Pending",
  17: "Claim Pass",
  18: "Generated Voucher"
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // If date is invalid, return original string
  if (isNaN(date)) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function DealerComplaintList() {
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [entries, setEntries] = useState(10);
  const [dealerComplaintList, setDealerComplaintList] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? currentUser.s_usertype : null;
    // console.log(userType)

    if (!token || userType !== 3 && userType !== 1) {
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
    fetch('http://192.168.1.29:5015/DealerComplaintList')
      .then(res => res.json())
      .then(data => setDealerComplaintList(data))
      .catch(err => console.error('Error fetching dealer complaint list:', err));
  }, []);
  // console.log(dealerComplaintList)

  // Filtering (search and year)
  const filteredData = dealerComplaintList.filter(row => {
    const searchMatch =
      (row.report_no || '').toLowerCase().includes(search.toLowerCase()) ||
      (row.s_dealer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (row.s_dealer_mob || '').includes(search) ||
      (row.s_current_status || '').toLowerCase().includes(search.toLowerCase());
    let yearMatch = true;
    if (year && row.complaint_added_datetime) {
      const d = new Date(row.complaint_added_datetime);
      const y = d.getFullYear();
      if (year === '2024-25') yearMatch = y === 2024 || y === 2025;
      else if (year === '2023-24') yearMatch = y === 2023 || y === 2024;
      else if (year === '2022-23') yearMatch = y === 2022 || y === 2023;
    }
    return searchMatch && yearMatch;
  });
  // const claimid = filteredData.map(row => row.claim_id);
  // console,log('claim',claimid);
  function gotoclaimview(claim_id) {
    navigate('/DealerComplaintList/ManagerClaimView', { state: { claim_id } });
  }
  return (
    <div className="dealercomplaintlist-dashboard-bg dealercomplaintlist-layout">
      <Sidebar />
      <main className='dealercomplaintlist-content'>
        <div className="dealercomplaintlist-header ">
          <div>
            <h1>
              <span className="dealercomplaintlist-gradient-text">Complaint List</span>
            </h1>
            <p className="dealercomplaintlist-breadcrumb">
              Home <span>/</span> <span className="tag">Complaint List</span>
            </p>
          </div>
        </div>
        <div className="dealercomplaintlist-table-card">
          <div className="dealercomplaintlist-table-controls">
            <div className="dealercomplaintlist-table-controls-left">
              <label>
                Financial Year:
                <select value={year} onChange={e => setYear(e.target.value)}>
                  <option value="">All</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2022-23">2022-23</option>
                </select>
              </label>
              <label>
                Show
                <select value={entries} onChange={e => setEntries(Number(e.target.value))}>
                  {[10, 25, 50, 100].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
                entries
              </label>
            </div>
            <div className="dealercomplaintlist-table-controls-right">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="dealercomplaintlist-table-responsive">
            <table className="dealercomplaintlist-table">
              <thead>
                <tr>
                  <th>Report Id</th>
                  <th>Claim Date</th>
                  <th>Dealer Name</th>
                  <th>Dealer Number</th>
                  <th>Current Status</th>
                  <th>View Document</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.slice(0, entries).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.report_no}</td>
                      <td>{formatDate(row.complaint_added_datetime)}</td>
                      <td>{row.s_dealer_name}</td>
                      <td>{row.s_dealer_mob}</td>
                      <td>
                        <span className={`dealercomplaintlist-status status-${row.s_current_status}`}>
                          {STATUS_MAP[row.s_current_status] || row.s_current_status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="dealercomplaintlist-view-btn"
                          onClick={() => gotoclaimview(row.claim_id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="dealercomplaintlist-no-data">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="dealercomplaintlist-table-footer">
            Showing {filteredData.length === 0 ? 0 : 1} to {Math.min(entries, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>
        <footer className="dealercomplaintlist-footer">
          <span>@ Zircar Refractories. All Rights Reserved</span>
        </footer>
      </main>
    </div>
  );
}

export default DealerComplaintList;