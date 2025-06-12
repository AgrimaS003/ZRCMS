import React, { useState, useEffect } from 'react';
import "./BranchComplaintList.css"; // Import your CSS file
import { useNavigate } from 'react-router-dom';
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

function BranchComplaintList() {
    const [branchData, setBranchData] = useState([]);
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(10);
    const [year, setYear] = useState('');
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

    // Example: Fetch data from API (replace with your endpoint)
    useEffect(() => {
        fetch('http://192.168.1.29:5015/BranchComplaintList')
            .then(res => res.json())
            .then(data => setBranchData(data))
            .catch(() => setBranchData([]));
        setBranchData([]); // Remove this and uncomment above when API is ready
    }, []);
    // console.log("Branch Data", branchData);
    // Filter data based on search and year
    const filteredData = branchData.filter(row => {
        const searchMatch =
            (row?.report_no || '').toLowerCase().includes(search.toLowerCase()) ||
            (row?.s_branch_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (row?.s_branch_mob || '').toLowerCase().includes(search.toLowerCase()) ||
            (row?.s_current_status || '').toLowerCase().includes(search.toLowerCase());
        let yearMatch = true;
        if (year && row?.complaint_added_datetime) {
            const d = new Date(row?.complaint_added_datetime);
            const y = d.getFullYear();
            if (year === '2024-25') yearMatch = y === 2024 || y === 2025;
            else if (year === '2023-24') yearMatch = y === 2023 || y === 2024;
            else if (year === '2022-23') yearMatch = y === 2022 || y === 2023;
        }
        return searchMatch && yearMatch;
    });
    function gotoclaimview(claim_id) {
    navigate('/BranchComplaintList/ManagerClaimView', { state: { claim_id } });
  }
    return (
        <div className="branchcomplaintlist-dashboard-bg branchcomplaintlist-layout">
            <Sidebar />
            <main className='branchcomplaintlist-content'>
                <div className="branchcomplaintlist-header ">
                    <div>
                        <h1>
                            <span className="branchcomplaintlist-gradient-text">Complaint List</span>
                        </h1>
                        <p className="branchcomplaintlist-breadcrumb">
                            Home <span>/</span> <span className="tag">Complaint List</span>
                        </p>
                    </div>
                </div>
                <div className="branchcomplaintlist-table-card">
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontWeight: 600, fontSize: 20, display: 'block', marginBottom: 8 }}>
                            Select Financial Year:
                        </label>
                        <select
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            style={{ color: year ? '#222' : '#888' }}
                        >
                            <option value="">Select Financial Year</option>
                            <option value="2024-25">2024-25</option>
                            <option value="2023-24">2023-24</option>
                            <option value="2022-23">2022-23</option>
                        </select>
                    </div>
                    <div className='branchcomplaint-search'>
                        <div>
                            <select
                                value={entries}
                                onChange={e => setEntries(Number(e.target.value))}
                                style={{ padding: 6, borderRadius: 4, marginRight: 8 }}
                            >
                                {[10, 25, 50, 100].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            entries per page
                        </div>
                        <div style={{ flex: 1 }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: 12,
                                borderRadius: 6,
                                minWidth: 180,
                                border: '1px solid #bfc8db',
                                fontSize: 17
                            }}
                        />
                    </div>
                    <div className="branchcomplaintlist-table-responsive">
                        <table className="branchcomplaintlist-table">
                            <thead>
                                <tr>
                                    <th>Report Id</th>
                                    <th>Claim Date</th>
                                    <th>Branch Name</th>
                                    <th>Branch Number</th>
                                    <th>Current Status</th>
                                    <th>View Document</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.slice(0, entries).map((row, idx) => (
                                        <tr key={idx}>
                                            <td>{row?.report_no}</td>
                                            <td>{row?.complaint_added_datetime}</td>
                                            <td>{row?.s_branch_name}</td>
                                            <td>{row?.s_branch_mob}</td>
                                            <td>
                                                <span className={`dealercomplaintlist-status status-${row.s_current_status}`}>
                                                    {STATUS_MAP[row.s_current_status] || row.s_current_status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="branchcomplaintlist-view-btn"
                                                    onClick={() => gotoclaimview(row.claim_id)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="branchcomplaintlist-no-data">
                                            No entries found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default BranchComplaintList;