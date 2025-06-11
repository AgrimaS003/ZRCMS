import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AssignedComplaints.css'; // Adjust the path as necessary
import Sidebar from './Sidebar';

function AssignedComplaints() {
    const navigate = useNavigate(); // <-- Add this
    const [assignedData, setAssignedData] = useState([]);
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(10);
    const [communicationData, setcommunicationData] = useState([]);

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
        // Replace with your actual API endpoint
        fetch('http://192.168.1.29:5015/AssignedComplaints')
            .then(res => res.json())
            .then(data => setAssignedData(data))
            .catch(err => setAssignedData([]));
    }, []);

    // Filter data based on search
    const filteredData = assignedData.filter(row =>
        (row.report_no || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.s_dealer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.s_dealer_email || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.s_dealer_mob || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.s_staff_name || '').toLowerCase().includes(search.toLowerCase())
    );
    function gotoclaimview(claim_id) {
        navigate('/DealerComplaintList/ManagerClaimView', { state: { claim_id } });
    }
    return (
        <div className="AssignedComplaints-dashboard-bg AssignedComplaints-layout">
            <Sidebar />
            <main className='AssignedComplaints-content'>
                <div className="AssignedComplaints-header">
                    <header className='AssignedComplaints-header'>
                        <h1 className='AssignedComplaints-gradient-text'>Dashboard</h1>
                        <span>
                            Home / <span></span>
                            <span className='tag '>
                                <b>Assigned Complaint List</b>
                            </span>
                        </span>
                    </header>
                </div>
                <div className="AssignedComplaints-table-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                        <h3>Assigned Complaints</h3>
                        <div>
                            <select value={entries} onChange={e => setEntries(Number(e.target.value))} style={{ padding: 6, borderRadius: 4, marginRight: 8 }}>
                                {[10, 25, 50, 100].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            entries per page
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ padding: 8, borderRadius: 4, minWidth: 220, marginTop: 20, border: '1px solid #ccc' }}
                        />
                    </div>
                    <div className="AssignedComplaints-table-responsive">
                        <table className="AssignedComplaints-table">
                            <thead>
                                <tr>
                                    <th>Report No</th>
                                    <th>Dealer/Branch Name</th>
                                    <th>Dealer/Branch Email</th>
                                    <th>Dealer/Branch Mobile</th>
                                    <th>Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.slice(0, entries).map((row, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <a
                                                    style={{ color: "#0033ff", textDecoration: "underline", fontWeight: 500 }}
                                                    tabIndex={0}
                                                    onClick={() => gotoclaimview(row.claim_id)}
                                                >
                                                    {row.report_no}
                                                </a>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{row.s_dealer_name}</td>
                                            <td>{row.s_dealer_email}</td>
                                            <td>{row.s_dealer_mob}</td>
                                            <td>{row.s_staff_name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="AssignedComplaints-no-data">
                                            No assigned complaints found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="AssignedComplaints-table-footer" style={{ marginTop: 16 }}>
                        {filteredData.length === 0
                            ? "Showing 0 entries"
                            : `Showing 1 to ${Math.min(entries, filteredData.length)} of ${filteredData.length} entries`}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AssignedComplaints;

