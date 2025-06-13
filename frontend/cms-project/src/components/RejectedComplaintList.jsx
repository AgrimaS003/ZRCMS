import React, { useEffect, useState } from 'react';
import './ActiveComplaintList.css';
// import Header from './Header';
import { useParams } from 'react-router-dom';

const RejectedComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const { usertype } = useParams()

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    } else {
      console.warn('User email not found in localStorage');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://192.168.1.32:5015/${usertype}/rejected_complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: userEmail , usertype : usertype}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setComplaints(data.data);
        } else {
          console.error('Failed to fetch complaints:', data.message || data.error_msg);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching complaints:', err);
        setLoading(false);
      });
  }, [userEmail]);

  const filteredComplaints = complaints.filter((complaint) =>
    complaint.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedComplaints =
    entriesPerPage === 'All'
      ? filteredComplaints
      : filteredComplaints.slice(0, entriesPerPage);

  return (
    <div>
      {/* <Header /> */}
      <main>
        <div className="complaint-header">
          <h2>Complaint</h2>
          <p>Home / Complaints</p>
        </div>
        <br />
        <div className="complaint-table">
          <p id="complaint-table-p">Rejected Complaint List</p>

          <div className="entries-per-page">
            <label className="entries-label">entries per page:</label>
            <select
              className="entries-select"
              value={entriesPerPage}
              onChange={(e) =>
                setEntriesPerPage(e.target.value === 'All' ? 'All' : parseInt(e.target.value))
              }
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="All">All</option>
            </select>

            <div className="search-bar">
              <input
                type="text"
                style={{ width: '240px' }}
                className="search-input"
                placeholder="Search by customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="complaint-table-wrapper">
            <table className="complaint-data-table">
              <thead>
                <tr>
                  <th>Report No</th>
                  <th>Customer Name</th>
                  <th>Customer Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.length > 0 ? (
                  paginatedComplaints.map((complaint, index) => (
                    <tr key={index}>
                      <td>{complaint.report_no}</td>
                      <td>{complaint.customer_name}</td>
                      <td>{complaint.customer_address}</td>
                      <td>{complaint.status_name}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No rejected complaints found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            <span>
              Showing {filteredComplaints.length > 0
                ? `1 to ${paginatedComplaints.length}`
                : '0'} of {filteredComplaints.length} entries
            </span>
          </div>
        </div>
      </main>
      <br />
      <p id="complaint-footer"><b>@ Zircar Refractories.</b> All Rights Reserved</p>
    </div>
  );
};

export default RejectedComplaintList;
