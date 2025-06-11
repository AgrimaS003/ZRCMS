import React, { useState, useEffect } from 'react'
import './ApprovedClaim.css'
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

function ApprovedClaim() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [year, setYear] = useState('');
    const [entries, setEntries] = useState(10);
    const [dealerComplaintList, setDealerComplaintList] = useState([]);
    const [isApproved, setIsApproved] = useState(true);
    const [approvedComplaint,setApprovedComplaint] = useState([]);

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
            fetch('http://192.168.1.29:5015/approvedcomplaint')
            .then(res => res.json())
            .then(data => setApprovedComplaint(data))
            .catch(err =>console.error("Error fetching Processed Complaint:",errr))
        })
        // console.log(approvedComplaint);
    

    // Filtering (search and year)
    const filteredData = approvedComplaint.filter(row => {
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
    function gotoclaimview(claim_id, isApproved) {
        navigate('/DirectorClaimView', { state: { claim_id, isApproved } });
    }

    return (
        <div className='approvedclaim-layout'>
            <Sidebar />
            <main className='approvedclaim-content'>
                <div className="approvedclaim-header ">
                    <div>
                        <h1>
                            <span className="approvedclaim-gradient-text">Dashboard</span>
                        </h1>
                        <p className="approvedclaim-breadcrumb">
                            Home <span>/</span> <span className="tag"><b>Complaint List</b></span>
                        </p>
                    </div>
                </div>
                <div className="approvedclaim-table-card">
                    <div className="approvedclaim-table-controls">
                        <div className="approvedclaim-table-controls-left">
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
                        <div className="approvedclaim-table-controls-right">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="approvedclaim-table-responsive">
                        <table className="approvedclaim-table">
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
                                                    className="approvedclaim-view-btn"
                                                    onClick={() => gotoclaimview(row?.claim_id, isApproved)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="approvedclaim-no-data">
                                            No complaints found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="approvedclaim-table-footer">
                        Showing {filteredData.length === 0 ? 0 : 1} to {Math.min(entries, filteredData.length)} of {filteredData.length} entries
                    </div>
                </div>
                <footer className="approvedclaim-footer">
                    <span>@ Zircar Refractories. All Rights Reserved</span>
                </footer>
            </main>
        </div>
    )
}

export default ApprovedClaim