import React, {useState,useEffect } from 'react';
import axios from 'axios';
import { useNavigate , useParams } from 'react-router-dom';
import Header from './Header';
import './Dashboard.css';
import { MdAssignment, MdPendingActions, MdThumbUp, MdCancel } from 'react-icons/md';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const Dashboard = () => {

  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const { usertype } = useParams()
  const staffRoles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account'];
  const isStaffRole = staffRoles.includes(usertype?.toLowerCase());
  const [branchTypeCounts, setBranchTypeCounts] = useState([]);
  const [monthlyComplaints, setMonthlyComplaints] = useState([]);
  // console.log(usertype)
  const [counts, setCounts] = useState({
    field: 0,
    inProcess: 0,
    approved: 0,
    rejected: 0
  });

  const handleEntriesChange = (e) => {
    const value = e.target.value;
    setEntriesPerPage(value === "All" ? "All" : parseInt(value));
    setCurrentPage(1); // Reset to first page on change
  };

  const complaintsToDisplay = searchTerm ? filteredComplaints : complaints;
  const displayedComplaints =
    entriesPerPage === "All"
      ? complaintsToDisplay
      : complaintsToDisplay.slice(
          (currentPage - 1) * entriesPerPage,
          currentPage * entriesPerPage
        );

  const totalEntries = complaintsToDisplay.length;

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      console.error('No email found in localStorage');
      return;
    }
      if (usertype?.toLowerCase() === 'branch') {
  axios.post(`http://192.168.1.32:5015/branch/monthly_complaints`)
    .then(res => {
      if (res.data.success) {
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const formatted = res.data.data.map(item => ({
          month: monthNames[item.month - 1],
          complaints: item.count
        }));
        setMonthlyComplaints(formatted);
      }
    })
    .catch(err => console.error("Monthly complaints fetch error:", err));

    }
 
    axios.post(`http://192.168.1.32:5015/${usertype.toLowerCase()}/dashboard`, { email })
      .then(res => {
        if (res.data.success) {
          const complaintsData = res.data.data;
          setComplaints(complaintsData);

          const counts = {
            field: 0,
            inProcess: 0,
            approved: 0,
            rejected: 0
          };
          complaintsData.forEach(item => {
            const code = Number(item.status_code);
            if ([0, 1, 2].includes(code)) counts.field++;
            else if ([4, 6, 8, 10, 12, 14, 16].includes(code)) counts.inProcess++;
            else if (code === 18) counts.approved++;
            else if ([3, 5, 7, 9, 11, 13, 15].includes(code)) counts.rejected++;
          });

          setCounts(counts);
          //  
          const pieData = [
        { name: 'Field', value: counts.field },
        { name: 'In-Process', value: counts.inProcess },
        { name: 'Approved', value: counts.approved },
        { name: 'Rejected', value: counts.rejected },
      ];
        setBranchTypeCounts(pieData);
        //
        } else {
          console.error(res.data.message);
        }
      })
      .catch(err => console.error('Dashboard error:', err));
  }, [usertype]);

  const handleDelete = (report_no) => {
    axios.post(`http://192.168.1.32:5015/${usertype.toLowerCase()}/delete_complaint`, { report_no },
        {headers:{ 'Content-Type': 'application/json' }}
    )
      .then(res => {
        if (res.data.success) {
          // Remove the deleted complaint from the UI
          setComplaints(prevComplaints =>
            prevComplaints.filter(c => c.report_no !== report_no)
          );
          setFilteredComplaints(prevFiltered =>
            prevFiltered.filter(c => c.report_no !== report_no)
          );
          setMessage("Complaint deleted successfully.");
        } else {
          console.error('Delete failed');
          setMessage("Failed to delete complaint.");
        }
        setTimeout(() => {
        setMessage('');
      }, 2000);
      })
      .catch(err => {
        console.error('Delete error:', err);
        setMessage('An error occurred during deletion.');
  });
  };

  return (
    <div>
      <Header />
      <main>
        <div className='dashboard-header'>
          <h2>Dashboard</h2>
          <p>Home / Dashboard</p>
        </div>

        <div className='group-four-div'>
          <div className='dashboard-card'>
            <p>Field | Complaints</p>
            <div className='icon-row'>
              <MdAssignment color='#007bff' size={40} />
              <h3>{counts.field}</h3>
            </div>
          </div>

          <div className='dashboard-card'>
            <p>In-Process | Complaints</p>
            <div className='icon-row'>
              <MdPendingActions color="#ffc107" size={40} />
              <h3>{counts.inProcess}</h3>
            </div>
          </div>

          <div className='dashboard-card'>
            <p>Approved | Complaints</p>
            <div className='icon-row'>
              <MdThumbUp color="#28a745" size={40} />
              <h3>{counts.approved}</h3>
            </div>
          </div>

          <div className='dashboard-card'>
            <p>Rejected Complaints</p>
            <div className='icon-row'>
              <MdCancel color="#dc3545" size={40} />
              <h3>{counts.rejected}</h3>
            </div>
          </div>
        </div>
  {/*  */}
  {usertype?.toLowerCase() === 'branch' && branchTypeCounts.length > 0 && (
  <div className="dashboard-piechart-section">
    <h3 style={{ marginBottom: '10px' }}>Complaint Status Distribution</h3>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={branchTypeCounts}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label >
          {branchTypeCounts.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={['#007bff', '#ffc107', '#28a745', '#dc3545'][index % 4]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)}
{usertype?.toLowerCase() === 'branch' && monthlyComplaints.length > 0 && (
  <div className="dashboard-barchart-section">
    <h3 style={{ marginBottom: '10px' }}>Monthly Complaints Count</h3>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyComplaints}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="complaints" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}

{/*  */}
        { ['dealer', 'branch'].includes(usertype?.toLowerCase()) && (

        <div className="dealer-entry-table">
          <p id="table-h3">All Complaints</p>

          <div className="entries-per-page">
            <label className="entries-label">Entries per page:</label>
            <select className="entries-select" onChange={handleEntriesChange} value={entriesPerPage}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="All">All</option>
            </select>

            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => {
                  const term = e.target.value;
                  setSearchTerm(term);
                  const filtered = complaints.filter(c =>
                    c.customer_name?.toLowerCase().includes(term.toLowerCase()) ||
                    c.report_no?.toString().includes(term)
                  );
                  setFilteredComplaints(filtered);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Form View</th>
                  <th>Delete Claim</th>
                </tr>
              </thead>
              <tbody>
                    {displayedComplaints.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No complaints found.</td>
                      </tr>
                    ) : (
                      displayedComplaints.map((item) => (
                        <tr key={item.complaint_id}>
                          <td>{item.report_no}</td>
                          <td>{item.customer_name}</td>
                          <td>
                              <span className="badge badge-info">{item.status_name || 'No Status'}</span>
                          </td>
                          <td>
                            <button
                              className="btn btn-info"
                              onClick={() => navigate(`/${usertype}/form_view`, { state: { claim_id: item.claim_id } })}
                            >
                              View
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDelete(item.report_no)}
                              disabled={!([0, 1, 2].includes(Number(item.status_code)))}
                            >
                              Delete
                            </button>
                          </td>
                          </tr>
                        ))
                      )}
                </tbody>
            </table>
          </div>

          {message && (
            <div className="alert-message">
              {message}
            </div>
          )}

          <div className="pagination-info">
            <span>
              Showing {entriesPerPage === "All" ? totalEntries : displayedComplaints.length} of {totalEntries} entries
            </span>
          </div>
        </div>
        )}

      </main>

      <p id='dashboard-footer'><b>@ Zircar Refractories.</b> All Rights Reserved</p>
    </div>
  );
};

export default Dashboard;
