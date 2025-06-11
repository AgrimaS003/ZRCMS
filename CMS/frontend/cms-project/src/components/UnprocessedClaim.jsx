import React, { useState, useEffect } from 'react'
import './UnprocessedClaim.css'
import Sidebar from './Sidebar'
import { Navigate, useNavigate } from 'react-router-dom';

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

function UnprocessedClaim() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [entries, setEntries] = useState(10);
  // const [dealerComplaintList, setDealerComplaintList] = useState([]);
  const [isProcessed,setIsProcessed] = useState(false);
  const [unprocessedcomplaint,setUnprocessedComplaint] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? currentUser.s_usertype : null;
    // console.log(userType)

    if (!token || userType !== 8 && userType !== 1) {
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

    useEffect(()=>{
          fetch('http://192.168.1.29:5015/unprocessedcomplaint')
          .then(res => res.json())
          .then(data => setUnprocessedComplaint(data))
          .catch(err =>console.error("Error fetching Processed Complaint:",errr))
      },[])
      // console.log(unprocessedcomplaint);

  // Filtering (search and year)
  const filteredData = unprocessedcomplaint.filter(row => {
    const searchMatch =
      (row?.report_no || '').toLowerCase().includes(search.toLowerCase()) ||
      (row?.s_dealer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (row?.s_dealer_mob || '').includes(search);
    let yearMatch = true;
    if (year && row?.ns_claim_added_on) {
      const d = new Date(row?.ns_claim_added_on);
      const y = d.getFullYear();
      if (year === '2024-25') yearMatch = y === 2024 || y === 2025;
      else if (year === '2023-24') yearMatch = y === 2023 || y === 2024;
      else if (year === '2022-23') yearMatch = y === 2022 || y === 2023;
    }
    return searchMatch && yearMatch;
  });
  // const claimid = filteredData.map(row => row.claim_id);
  // console,log('claim',claimid);
  function gotoclaimview(claim_id ,isProcessed) {
    navigate('/DirectorClaimView', { state: { claim_id ,isProcessed } });
  }

  return (
    <div className='unprocessedclaim-layout'>
      <Sidebar />
      <main className='unprocessedclaim-content'>
        <div className="unprocessedclaim-header ">
          <div>
            <h1>
              <span className="unprocessedclaim-gradient-text">Dashboard</span>
            </h1>
            <p className="unprocessedclaim-breadcrumb">
              Home <span>/</span> <span className="tag"><b>Complaint List</b></span>
            </p>
          </div>
        </div>
        <div className="unprocessedclaim-table-card">
          <div className="unprocessedclaim-table-controls">
            <div className="unprocessedclaim-table-controls-left">
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
            <div className="unprocessedclaim-table-controls-right">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="unprocessedclaim-table-responsive">
            <table className="unprocessedclaim-table">
              <thead>
                <tr>
                  <th>Report Id</th>
                  <th>Claim Date</th>
                  <th>Dealer/Branch Name</th>
                  <th>Dealer/Branch Email</th>
                  <th>Dealer/Branch Number</th>
                  <th>View Document</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.slice(0, entries).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row?.report_no}</td>
                      <td>{formatDate(row?.ns_claim_added_on)}</td>
                      <td>{row?.s_dealer_name}</td>
                      <td>{row?.s_dealer_email}</td>
                      <td>{row?.s_dealer_mob}</td>
                      <td>
                        <button
                          className="unprocessedclaim-view-btn"
                          onClick={() => gotoclaimview(row?.claim_id,isProcessed)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="unprocessedclaim-no-data">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="unprocessedclaim-table-footer">
            Showing {filteredData.length === 0 ? 0 : 1} to {Math.min(entries, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>
        <footer className="unprocessedclaim-footer">
          <span>@ Zircar Refractories. All Rights Reserved</span>
        </footer>
      </main>
    </div>
  )
}

export default UnprocessedClaim