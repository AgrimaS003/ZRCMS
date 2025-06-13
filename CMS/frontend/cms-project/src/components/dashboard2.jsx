import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios';
import Sidebar from "./Sidebar";
import { Doughnut, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
} from "chart.js";
// import { MdAssignment, MdPendingActions, MdThumbUp, MdCancel } from 'react-icons/md';
// import { PieChart, Pie, Cell,  Legend, ResponsiveContainer } from 'recharts';
// import { BarChart, Bar, XAxis, YAxis } from 'recharts;
import "./Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const staticData = {
    staff: 2010,
    dealer: 311,
    branch: 110,
    user_distribution: {
        Admin: 200,
        Dealer: 150,
        Manager: 120,
        Quality_Check: 100,
        Branch: 180,
        Director: 90,
        Account: 210,
        Supervisor: 140
    },
    bar_data: {
        Mon: 100,
        Tue: 200,
        Wed: 160,
        Thu: 70,
        Fri: 60,
        Sat: 110,
        Sun: 130
    }
};

// Define a color for each user type, order must match donutLabels
const donutColors = [
    "#3b82f6", // Admin
    "#22c55e", // Dealer
    "#facc15", // Manager
    "#37BCF8", // Supervisor
    "#38bdf8", // Inspection
    "#0f766e", // Quality_Check
    "#f97316", // Sales_Head
    "#8b5cf6", // Director
    "#eab308", // Account
    "#ef4444"  // Branch
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [dealerData, setDealerData] = useState([]);
    const [staffData, setStaffData] = useState([]);
    const [branchData, setBranchData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [claimData, setClaimData] = useState([]);
    const [donutLabels, setDonutLabels] = useState([]);
    const [donutDataArray, setDonutDataArray] = useState([]);
    const [assignedData, setAssignedData] = useState([]);
    const [search, setSearch] = useState('');
    const [entries, setEntries] = useState(10);
    const [allComplaintsShowDirector, setAllComplaintsShowDirector] = useState([]);
    const [fieldComplaints, setFieldComplaints] = useState([]);
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
    // Count user types from userData
    let admincount = 0;
    let dealercount = 0;
    let managercount = 0;
    let supervisorcount = 0;
    let inspectioncount = 0;
    let qualitycheckcount = 0;
    let salesheadcount = 0;
    let directorcount = 0;
    let accountcount = 0;
    let branchcount = 0;

    useEffect(() => {
        const token = localStorage.getItem("token");

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

    useEffect(() => {
        fetch('http://192.168.1.29:5015/staff')
            .then(res => res.json())
            .then(data => setStaffData(data))
            .catch(err => console.error('Error fetching staff:', err));
    }, []);

    useEffect(() => {
        fetch('http://192.168.1.29:5015/branches')
            .then(res => res.json())
            .then(data => setBranchData(data))
            .catch(err => console.error('Error fetching branches:', err));
    }, []);

    useEffect(() => {
        fetch('http://192.168.1.29:5015/fetchusers')
            .then(res => res.json())
            .then(data => setUserData(data))
            .catch(err => console.error('Error fetching users:', err));
    }, []);

    useEffect(() => {
        fetch('http://192.168.1.29:5015/claims')
            .then(res => res.json())
            .then(data => setClaimData(data))
            .catch(err => console.error('Error fetching claims:', err));
    }, [])
    useEffect(() => {
        fetch('http://192.168.1.29:5015/directordashboard')
            .then(res => res.json())
            .then(data => setFieldComplaints(data))
            .catch(err => console.error("error fetching :", err))
    }, [])
    // console.log(fieldComplaints)
    useEffect(() => {
        fetch('http://192.168.1.29:5015/AllComplaintsShowDirector')
            .then(res => res.json())
            .then(data => setAllComplaintsShowDirector(data))
            .catch(err => console.error("error fetching :", err))
        // console.log(allComplaintsShowDirector);
    }, [])
    // console.log(claimData)
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? currentUser.s_usertype : null;
    // cosnole.log(currentUser?.s_useremail)

    userData.forEach(user => {
        // If s_usertype is a string, compare with string
        if (user.s_usertype === "1" || user.s_usertype === 1) admincount++;
        else if (user.s_usertype === "2" || user.s_usertype === 2) dealercount++;
        else if (user.s_usertype === "3" || user.s_usertype === 3) managercount++;
        else if (user.s_usertype === "4" || user.s_usertype === 4) supervisorcount++;
        else if (user.s_usertype === "5" || user.s_usertype === 5) inspectioncount++;
        else if (user.s_usertype === "6" || user.s_usertype === 6) qualitycheckcount++;
        else if (user.s_usertype === "7" || user.s_usertype === 7) salesheadcount++;
        else if (user.s_usertype === "8" || user.s_usertype === 8) directorcount++;
        else if (user.s_usertype === "9" || user.s_usertype === 9) accountcount++;
        else if (user.s_usertype === "10" || user.s_usertype === 10) branchcount++;
    });

    // Calculate counts from dealerData
    const activecount = dealerData.filter(d => d.s_dealer_status === "4").length;
    const inactivecount = dealerData.filter(d => d.s_dealer_status !== "4").length;

    const staffActiveCount = staffData.filter(s => s.s_staff_status === "4").length;
    const staffInactiveCount = staffData.filter(s => s.s_staff_status !== "4").length;

    // Calculate counts from branchData
    const branchActiveCount = branchData.filter(b => b.s_branch_status === "4").length;
    const branchInactiveCount = branchData.filter(b => b.s_branch_status !== "4").length;

    // Build user_distribution from live counts
    const user_distribution = {
        Admin: admincount,
        Dealer: dealercount,
        Manager: managercount,
        Supervisor: supervisorcount,
        Inspection: inspectioncount,
        Quality_Check: qualitycheckcount,
        Sales_Head: salesheadcount,
        Director: directorcount,
        Account: accountcount,
        Branch: branchcount
    };
    let claimpass = 0, inprocess = 0, rejected = 0, initiated = 0;
    claimData.map((item, index) => {
        claimpass = 0;
        inprocess = item[index + 1]
        rejected = item[index + 3]
        initiated = item[index]
    })
    const Counter_Complains = {
        Claimpass: claimpass,
        Inprocess: inprocess,
        Rejected: rejected,
        Initiated: initiated
    }
    const barLabels = Object.keys(staticData.bar_data);
    const barValues = Object.values(staticData.bar_data);

    useEffect(() => {
        const normalizedUserType = String(userType);

        if (normalizedUserType === "1") {
            const labels = Object.keys(user_distribution);

            // Update labels only if different
            setDonutLabels(prevLabels => {
                const areSame = prevLabels.length === labels.length && prevLabels.every((v, i) => v === labels[i]);
                return areSame ? prevLabels : labels;
            });

            const updatedDonutDataArray = labels.map(label => {
                if (label === "Dealer") return activecount;
                if (label === "Staff") return staffActiveCount;
                return user_distribution[label];
            });

            // Update data array only if changed
            setDonutDataArray(prevData => {
                const areSame = prevData.length === updatedDonutDataArray.length &&
                    prevData.every((v, i) => v === updatedDonutDataArray[i]);
                return areSame ? prevData : updatedDonutDataArray;
            });

        } else if (normalizedUserType === "2") {

        } else if (normalizedUserType === "3") {
            const labels = Object.keys(Counter_Complains);
            const dataArray = Object.values(Counter_Complains);

            setDonutLabels(prevLabels => {
                const areSame = prevLabels.length === labels.length && prevLabels.every((v, i) => v === labels[i]);
                return areSame ? prevLabels : labels;
            });

            setDonutDataArray(prevData => {
                const areSame = prevData.length === dataArray.length &&
                    prevData.every((v, i) => v === dataArray[i]);
                return areSame ? prevData : dataArray;
            });
        } else if (normalizedUserType === "9") {

        } else if (normalizedUserType === "10") {

        }
    }, [userType, user_distribution, activecount, staffActiveCount, Counter_Complains]);


    const Navigate = (path) => {
        window.location.href = path;
    };
    // console.log("userdata from dashboard",userData)
    const staticData2 = [
        {
            fieldComplaints: 26,
            inProcessClaims: 4,
            approvedClaims: 0,
            rejectedClaims: 10,
            reimbursementRequest: 1141.66,
            reimbursementApproved: 314,
            reimbursementRejected: 1037.23
        }
    ];
    useEffect(() => {
        // Replace with your actual API endpoint
        fetch('http://192.168.1.29:5015/AssignedComplaints')
            .then(res => res.json())
            .then(data => setAssignedData(data))
            .catch(err => setAssignedData([]));
    }, []);

    // Filter data based on search
    const filteredData = allComplaintsShowDirector.filter(row =>
        (row.report_no || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.s_dealer_name || '').toLowerCase().includes(search.toLowerCase()) ||
        // (row.zircar_basic_price || '').toLowerCase().includes(search.toLowerCase()) ||
        (row.product_name || '').toLowerCase().includes(search.toLowerCase())
        // (row.customer_expectations_from_zircar || '').toLowerCase().includes(search.toLowerCase())
    );
    const isProcessed = false;
    function gotoclaimview(claim_id) {
        navigate('/DirectorClaimView', { state: { claim_id, isProcessed } });
    }


    // const email = localStorage.getItem('userEmail');
    // if (!email) {
    //     console.error('No email found in localStorage');
    //     return;
    // }
    // if (usertype?.toLowerCase() === 'branch') {
    //     axios.post(`http://192.168.1.29:5015/branch/monthly_complaints`)
    //         .then(res => {
    //             if (res.data.success) {
    //                 const monthNames = [
    //                     "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    //                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    //                 ];
    //                 const formatted = res.data.data.map(item => ({
    //                     month: monthNames[item.month - 1],
    //                     complaints: item.count
    //                 }));
    //                 setMonthlyComplaints(formatted);
    //             }
    //         })
    //         .catch(err => console.error("Monthly complaints fetch error:", err));

    // }
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
        const storedUser = localStorage.getItem("currentUser");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const userType = currentUser?.s_usertype;
        const email = currentUser?.s_useremail;

        if (!userType || !email) return;

        // 🛠 Map numeric userType to role string
        const userTypeMap = {
            2: 'dealer',
            3: 'branch',
            8: 'staff',
            9: 'read-only',
            1: 'admin'
        };
        const mappedType = userTypeMap[userType] || 'unknown';

        fetch(`http://192.168.1.29:5015/dashboard/${userType}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    console.log("Server response:", res);
                    const complaintsData = res.data;
                    console.log("Complaints received:", complaintsData);
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
                    const pieData = [
                        { name: 'Field', value: counts.field },
                        { name: 'In-Process', value: counts.inProcess },
                        { name: 'Approved', value: counts.approved },
                        { name: 'Rejected', value: counts.rejected },
                    ];
                    setBranchTypeCounts(pieData);
                } else {
                    console.error('Dashboard response error:', res);
                }
            })
            .catch(err => console.error('Dashboard fetch error:', err));
    }, []);


    console.log(counts);


    const handleDelete = (report_no) => {
        axios.post(`http://192.168.1.29:5015/${userType}/delete_complaint`, { report_no },
            { headers: { 'Content-Type': 'application/json' } }
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
        <div className="dashboard-layout">
            {userData ? <Sidebar userData={userData} /> : <div>Loading...</div>}
            <main className="dashboard-content">
                <header className="dashboard-hero">
                    <div>
                        <h1>
                            <span className="dashboard-gradient-text">Dashboard</span>
                            <span className="dashboard-emoji">⚡️</span>
                        </h1>
                        <p className="dashboard-breadcrumb">Home <span>/</span> <span className="tag"> Dashboard </span></p>
                    </div>
                    {/* <div className="dashboard-hero-bg">
            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
              <ellipse cx="60" cy="30" rx="60" ry="30" fill="#e0eafc" />
              <ellipse cx="60" cy="30" rx="40" ry="18" fill="#7b6fd6" opacity="0.13" />
            </svg>
          </div> */}
                </header>

                <section className="dashboard-cards-row">
                    {(userType === "1" || userType === 1) && (
                        <div className="admincarddiv">
                            <Card
                                title="Staff"
                                value={staffActiveCount + staffInactiveCount}
                                icon={
                                    <span className="dashboard-card-svg staff">
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                            <circle cx="22" cy="22" r="22" fill="url(#staffGradient)" />
                                            <circle cx="22" cy="16" r="7" fill="#fff" opacity="0.9" />
                                            <ellipse cx="22" cy="30" rx="11" ry="6" fill="#fff" opacity="0.7" />
                                            <defs>
                                                <linearGradient id="staffGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#7b6fd6" />
                                                    <stop offset="1" stopColor="#3949ab" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span className="dashboard-card-badge">
                                            <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#ef4444" /><text x="9" y="13" textAnchor="middle" fontSize="12" fill="#fff">!</text></svg>
                                        </span>
                                    </span>
                                }
                                accent="#7b6fd6"
                                onClick={() => {
                                    Navigate("/managestaff");
                                }}
                                activecount={staffActiveCount}
                                inactivecount={staffInactiveCount}
                            />
                            <Card
                                title="Dealer"
                                value={activecount + inactivecount}
                                icon={
                                    <span className="dashboard-card-svg dealer">
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                            <circle cx="22" cy="22" r="22" fill="url(#dealerGradient)" />
                                            <rect x="13" y="13" width="18" height="18" rx="9" fill="#fff" opacity="0.9" />
                                            <rect x="18" y="18" width="8" height="8" rx="4" fill="#38bdf8" />
                                            <defs>
                                                <linearGradient id="dealerGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#38bdf8" />
                                                    <stop offset="1" stopColor="#3b82f6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span className="dashboard-card-badge green">
                                            <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#22c55e" /><path d="M9 5v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                                        </span>
                                    </span>
                                }
                                accent="#38bdf8"
                                onClick={() => {
                                    Navigate("/managedealers");
                                    // Your click logic here, e.g. navigate to /managedealers
                                }}
                                activecount={activecount}
                                inactivecount={inactivecount}
                            />
                            <Card
                                title="Branch"
                                value={branchActiveCount + branchInactiveCount}
                                icon={
                                    <span className="dashboard-card-svg branch">
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                            <circle cx="22" cy="22" r="22" fill="url(#branchGradient)" />
                                            <rect x="15" y="15" width="14" height="14" rx="7" fill="#fff" opacity="0.9" />
                                            <rect x="19" y="19" width="6" height="6" rx="3" fill="#facc15" />
                                            <defs>
                                                <linearGradient id="branchGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#facc15" />
                                                    <stop offset="1" stopColor="#f97316" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <span className="dashboard-card-badge green">
                                            <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill="#22c55e" /><path d="M9 5v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                                        </span>
                                    </span>
                                }
                                accent="#facc15"
                                onClick={() => {
                                    Navigate("/managebranch");
                                }}
                                activecount={branchActiveCount}
                                inactivecount={branchInactiveCount}
                            />
                        </div>
                    )}
                    {(userType === "3" || userType === 3) && (
                        <div>
                            {/* http://coder-edgestg.com:8080/ZRCMS_Demo/assets/img/filedComplainIcon.png */}
                            {/* // <div className="dashboard-card-wrapper"> */}
                            {claimData.map((item, index) => (
                                <div className="dashboard-cards-row" key={index}>
                                    <Card
                                        key={index}
                                        title="New | Claims"
                                        value={item[index]}
                                        accent="#FFCA26"
                                        icon={
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="22" cy="22" r="20" stroke="url(#newGradient)" />
                                                <circle cx="22" cy="22" r="22" fill="url(#newGradient)" opacity="0.1" />
                                                <line x1="22" y1="22" x2="22" y2="15" stroke="#FFCA26" strokeWidth="2" strokeLinecap="round" />
                                                <line x1="22" y1="22" x2="27" y2="22" stroke="#FFCA26" strokeWidth="2" strokeLinecap="round" />
                                                <defs>
                                                    <linearGradient id="newGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#FFCA26" />
                                                        <stop offset="1" stopColor="#D4A017" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        }
                                    />
                                    <Card
                                        key={index + 1}
                                        title="In-Process | Claims"
                                        value={item[index + 1]}
                                        accent="#2ECA6A"
                                        icon={
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="22" cy="22" r="20" stroke="url(#processGradient)" />
                                                <circle cx="22" cy="22" r="22" fill="url(#processGradient)" opacity="0.1" />
                                                <path d="M22 8v4M22 32v4M8 22h4M32 22h4M14.6 14.6l2.8 2.8M26.6 26.6l2.8 2.8M14.6 29.4l2.8-2.8M26.6 17.4l2.8-2.8" stroke="#2ECA6A" strokeWidth="2" strokeLinecap="round" />
                                                <defs>
                                                    <linearGradient id="processGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#2ECA6A" />
                                                        <stop offset="1" stopColor="#207B4A" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        }
                                    />
                                    <Card
                                        key={index + 2}
                                        title="Approved | Claims"
                                        value={item[index + 2]}
                                        accent="#FF771E"
                                        icon={
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="22" cy="22" r="20" stroke="url(#approvedGradient)" />
                                                <circle cx="22" cy="22" r="22" fill="url(#approvedGradient)" opacity="0.1" />
                                                <path d="M15 22l6 6 10-14" stroke="#FF771E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                <defs>
                                                    <linearGradient id="approvedGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#FF771E" />
                                                        <stop offset="1" stopColor="#B25B00" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        }
                                    />
                                    <Card
                                        key={index + 3}
                                        title="Rejected | Claims"
                                        value={item[index + 3]}
                                        accent="#E93F46"
                                        icon={
                                            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="22" cy="22" r="20" stroke="url(#rejectedGradient)" />
                                                <circle cx="22" cy="22" r="22" fill="url(#rejectedGradient)" opacity="0.1" />
                                                <line x1="15" y1="15" x2="29" y2="29" stroke="#E93F46" strokeWidth="3" strokeLinecap="round" />
                                                <line x1="29" y1="15" x2="15" y2="29" stroke="#E93F46" strokeWidth="3" strokeLinecap="round" />
                                                <defs>
                                                    <linearGradient id="rejectedGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                        <stop stopColor="#E93F46" />
                                                        <stop offset="1" stopColor="#9A2228" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        }
                                    />
                                </div>
                            ))}
                            {/* </div> */}
                        </div>
                    )}
                    {(userType === "8" || userType === 8) && (
                        <div>
                            {/* http://coder-edgestg.com:8080/ZRCMS_Demo/assets/img/filedComplainIcon.png */}
                            {/* // <div className="dashboard-card-wrapper"> */}
                            {staticData2.map((item, index) => {
                                // {staticData.map((item, index) => {
                                // Unique IDs for gradients per card instance
                                const fieldGradientId = `fieldGradient-${index}`;
                                const inprocessGradientId = `inprocessGradient-${index}`;
                                const approvedGradientId = `approvedGradient-${index}`;
                                const rejectedGradientId = `rejectedGradient-${index}`;
                                const requestGradientId = `requestGradient-${index}`;
                                const approvedReimbGradientId = `approvedReimbGradient-${index}`;
                                const rejectedReimbGradientId = `rejectedReimbGradient-${index}`;

                                return (
                                    <div key={item.id || index} className="dashboard-cards-row">
                                        <div className="directorcarddiv">

                                            <Card
                                                title="Field | Complaints"
                                                value={fieldComplaints?.Field_count}
                                                accent="#FFCA26"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${fieldGradientId})`} strokeWidth={1} />
                                                        <circle cx="22" cy="22" r="22" fill="#FFF7D1" opacity="0.4" />
                                                        <path
                                                            d="M17 22l4 4 6-8"
                                                            stroke="#FFCA26"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id={fieldGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#FFCA26" />
                                                                <stop offset="1" stopColor="#D4A017" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Inprocess | Claims"
                                                value={fieldComplaints?.Inprocess_count}
                                                accent="#2ECA6A"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${inprocessGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#D7F4DD" opacity="0.4" />
                                                        <path d="M20 16h4v4h-4zM20 24h4v4h-4z" fill="#2ECA6A" />
                                                        <defs>
                                                            <linearGradient id={inprocessGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#2ECA6A" />
                                                                <stop offset="1" stopColor="#81C784" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Approved | Claims"
                                                value={fieldComplaints?.Approved_count}
                                                accent="#FF771E"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${approvedGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#FFE6CC" opacity="0.4" />
                                                        <path
                                                            d="M17 22l4 4 6-8"
                                                            stroke="#FF771E"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id={approvedGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#FF771E" />
                                                                <stop offset="1" stopColor="#FF9D4D" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Rejected | Claims"
                                                value={fieldComplaints?.Rejected_count}
                                                accent="#E93F46"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${rejectedGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#FFD6D8" opacity="0.4" />
                                                        <line x1="17" y1="17" x2="27" y2="27" stroke="#E93F46" strokeWidth="4" strokeLinecap="round" />
                                                        <line x1="27" y1="17" x2="17" y2="27" stroke="#E93F46" strokeWidth="4" strokeLinecap="round" />
                                                        <defs>
                                                            <linearGradient id={rejectedGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#E93F46" />
                                                                <stop offset="1" stopColor="#FF6B6B" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Reimbursement | Request"
                                                value={Number(fieldComplaints?.Reimbursement_request).toFixed(2)}
                                                accent="#26C6DA"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${requestGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#D7F0FA" opacity="0.4" />
                                                        <path
                                                            d="M18 23h8M22 18v10"
                                                            stroke="#26C6DA"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id={requestGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#26C6DA" />
                                                                <stop offset="1" stopColor="#81D4FA" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Reimbursement | Approved"
                                                value={item.reimbursementApproved}
                                                accent="#66BB6A"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${approvedReimbGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#D9F0D9" opacity="0.4" />
                                                        <path
                                                            d="M16 22l5 5 7-9"
                                                            stroke="#66BB6A"
                                                            strokeWidth="4"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                        <defs>
                                                            <linearGradient id={approvedReimbGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#66BB6A" />
                                                                <stop offset="1" stopColor="#A5D6A7" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />

                                            <Card
                                                title="Reimbursement | Rejected"
                                                value={fieldComplaints?.Reimbursement_rejected}
                                                accent="#EF5350"
                                                icon={
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="22" cy="22" r="20" stroke={`url(#${rejectedReimbGradientId})`} />
                                                        <circle cx="22" cy="22" r="22" fill="#FFDCDC" opacity="0.4" />
                                                        <line x1="17" y1="17" x2="27" y2="27" stroke="#EF5350" strokeWidth="4" strokeLinecap="round" />
                                                        <line x1="27" y1="17" x2="17" y2="27" stroke="#EF5350" strokeWidth="4" strokeLinecap="round" />
                                                        <defs>
                                                            <linearGradient id={rejectedReimbGradientId} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                                <stop stopColor="#EF5350" />
                                                                <stop offset="1" stopColor="#FFCDD2" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                                // })}

                            })}

                            {/* </div> */}
                        </div>
                    )}
                    {(userType === "10" || userType === 10 || userType === "2" || userType === 2) && (
                        <div>
                            <div className="dashboard-cards-row">
                                <Card
                                    title="Field | Complaints"
                                    value={counts.field}
                                    accent="#FFCA26"
                                    icon={
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="22" cy="22" r="20" stroke="url(#newGradient)" />
                                            <circle cx="22" cy="22" r="22" fill="url(#newGradient)" opacity="0.1" />
                                            <line x1="22" y1="22" x2="22" y2="15" stroke="#FFCA26" strokeWidth="2" strokeLinecap="round" />
                                            <line x1="22" y1="22" x2="27" y2="22" stroke="#FFCA26" strokeWidth="2" strokeLinecap="round" />
                                            <defs>
                                                <linearGradient id="newGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FFCA26" />
                                                    <stop offset="1" stopColor="#D4A017" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    }
                                />

                                <Card
                                    title="In-Process | Complaints"
                                    value={counts.inProcess}
                                    accent="#2ECA6A"
                                    icon={
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="22" cy="22" r="20" stroke="url(#processGradient)" />
                                            <circle cx="22" cy="22" r="22" fill="url(#processGradient)" opacity="0.1" />
                                            <path d="M22 8v4M22 32v4M8 22h4M32 22h4M14.6 14.6l2.8 2.8M26.6 26.6l2.8 2.8M14.6 29.4l2.8-2.8M26.6 17.4l2.8-2.8" stroke="#2ECA6A" strokeWidth="2" strokeLinecap="round" />
                                            <defs>
                                                <linearGradient id="processGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#2ECA6A" />
                                                    <stop offset="1" stopColor="#207B4A" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    }
                                />

                                <Card
                                    title="Approved | Complaints"
                                    value={counts.approved}
                                    accent="#FF771E"
                                    icon={
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="22" cy="22" r="20" stroke="url(#approvedGradient)" />
                                            <circle cx="22" cy="22" r="22" fill="url(#approvedGradient)" opacity="0.1" />
                                            <path d="M15 22l6 6 10-14" stroke="#FF771E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            <defs>
                                                <linearGradient id="approvedGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#FF771E" />
                                                    <stop offset="1" stopColor="#B25B00" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    }
                                />

                                <Card
                                    title="Rejected | Complaints"
                                    value={counts.rejected}
                                    accent="#E93F46"
                                    icon={
                                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="22" cy="22" r="20" stroke="url(#rejectedGradient)" />
                                            <circle cx="22" cy="22" r="22" fill="url(#rejectedGradient)" opacity="0.1" />
                                            <line x1="15" y1="15" x2="29" y2="29" stroke="#E93F46" strokeWidth="3" strokeLinecap="round" />
                                            <line x1="29" y1="15" x2="15" y2="29" stroke="#E93F46" strokeWidth="3" strokeLinecap="round" />
                                            <defs>
                                                <linearGradient id="rejectedGradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                                                    <stop stopColor="#E93F46" />
                                                    <stop offset="1" stopColor="#9A2228" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                    )}
                </section>

                <section className={`dashboard-charts-row  ${(userType === 8 || userType === "8" || userType === "2" || userType === 2 ||  userType === "10" || userType === 10) ? "display-none" : ""}`}>
                    <div className="dashboard-chart-card">
                        <h2>User Types Distribution</h2>
                        <Doughnut
                            data={{
                                labels: donutLabels,
                                datasets: [{
                                    data: donutDataArray,
                                    backgroundColor: donutColors
                                }]
                            }}
                            options={{
                                plugins: {
                                    legend: {
                                        position: "bottom",
                                        labels: { color: "#3949ab", font: { size: 14, weight: "bold" } }
                                    }
                                }
                            }}
                        />
                    </div>
                    <div className="dashboard-chart-card">
                        <h2>Bar Chart</h2>
                        <Bar
                            data={{
                                labels: barLabels,
                                datasets: [{
                                    label: 'Users per Day',
                                    data: barValues,
                                    backgroundColor: "#3b82f6",
                                    borderRadius: 8,
                                    barPercentage: 0.6
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    x: {
                                        ticks: { color: "#3949ab", font: { size: 13, weight: "bold" } },
                                        grid: { display: false }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: { color: "#3949ab", font: { size: 13, weight: "bold" } },
                                        grid: { color: "#e0eafc" }
                                    }
                                }
                            }}
                        />
                    </div>
                </section>
                {/* Assigned Complaints Table (Visible to Roles Other Than 1, 2, 3) */}
                <section className={`${[1, 2, 3,10].includes(userType) ? 'display-none' : ''}`}>
                    <div className="dashboardcomplaints-table-card">
                        <div className="dashboardcomplaints-table-controls">
                            <h3>Assigned Complaints</h3>
                            <div>
                                <select
                                    value={entries}
                                    onChange={(e) => setEntries(Number(e.target.value))}
                                    className="dashboardcomplaints-select"
                                >
                                    {[10, 25, 50, 100].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                                entries per page
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="dashboardcomplaints-search"
                            />
                        </div>

                        <div className="dashboardcomplaints-table-responsive">
                            <table className="dashboardcomplaints-table">
                                <thead>
                                    <tr>
                                        <th>Report No</th>
                                        <th>Dealer/Branch Name</th>
                                        <th>Product Name</th>
                                        <th>Zircar Basic Price (Rs)</th>
                                        <th>Customer Expectation (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.slice(0, entries).map((row, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <a
                                                        onClick={() => gotoclaimview(row?.claim_id)}
                                                        className="dashboardcomplaints-link"
                                                    >
                                                        {row?.report_no}
                                                    </a>
                                                </td>
                                                <td>{row?.s_dealer_name}</td>
                                                <td>{row?.product_name}</td>
                                                <td>{row?.zircar_basic_price}</td>
                                                <td>{row?.customer_expectations_from_zircar}%</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="dashboardcomplaints-no-data">
                                                No assigned complaints found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="dashboardcomplaints-table-footer">
                            {filteredData.length === 0
                                ? "Showing 0 entries"
                                : `Showing 1 to ${Math.min(entries, filteredData.length)} of ${filteredData.length} entries`}
                        </div>
                    </div>
                </section>

                {/* All Complaints Table (Visible to userType 2 & 10 Only) */}
                <section className={`${[1, 3, 8].includes(userType) ? 'display-none' : ''}`}>
                    {[2, 10].includes(userType) && (
                        <div className="dashboardcomplaints-table-card">
                            <div className="dashboardcomplaints-table-controls">
                                <h3>All Complaints</h3>
                                <div>
                                    <select
                                        value={entriesPerPage}
                                        onChange={(e) => {
                                            setEntriesPerPage(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="dashboardcomplaints-select"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="15">15</option>
                                        <option value="All">All</option>
                                    </select>
                                    entries per page
                                </div>
                                <input
                                    type="text"
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
                                    className="dashboardcomplaints-search"
                                />
                            </div>

                            <div className="dashboardcomplaints-table-responsive">
                                <table className="dashboardcomplaints-table">
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
                                                <td colSpan="5" className="dashboardcomplaints-no-data">
                                                    No complaints found.
                                                </td>
                                            </tr>
                                        ) : (
                                            displayedComplaints.map((item) => (
                                                <tr key={item.complaint_id}>
                                                    <td>{item.report_no}</td>
                                                    <td>{item.customer_name}</td>
                                                    <td>
                                                        <span className="badge badge-info">
                                                            {item.status_name || 'No Status'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-info"
                                                            onClick={() =>
                                                                navigate(`/${usertype}/form_view`, {
                                                                    state: { claim_id: item.claim_id },
                                                                })
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleDelete(item.report_no)}
                                                            disabled={!([0, 1, 2,110].includes(Number(item.status_code)))}
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

                            {message && <div className="alert-message">{message}</div>}

                            <div className="dashboardcomplaints-table-footer">
                                <span>
                                    Showing {entriesPerPage === "All" ? totalEntries : displayedComplaints.length} of {totalEntries} entries
                                </span>
                            </div>
                        </div>
                    )}
                </section>

            </main>
        </div >
    );
};

const Card = ({ title, value, icon, accent, onClick, activecount, inactivecount }) => {
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? Number(currentUser.s_usertype) : null;

    // Return nothing if userType is 9 or invalid
    if (userType === 9 || !userType) return null;

    // Reusable Card Body
    const cardContent = (
        <div
            className="dashboard-card"
            onClick={onClick}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? "button" : undefined}
            style={{
                borderBottom: `4px solid ${accent}`,
                cursor: onClick ? "pointer" : "default"
            }}
        >
            <div className="dashboard-card-icon">{icon}</div>
            <div>
                <h2 className="dashboard-card-title">{title}</h2>
                <div className="dashboard-card-value">{value}</div>

                {/* Only for userType 1 and specific titles */}
                {userType === 1 && (title === "Dealer" || title === "Staff" || title === "Branch") && (
                    <>
                        <div>Active | Inactive</div>
                        <div className="dashboard-card-status">
                            <span className="dashboard-card-status-count">
                                {activecount} | {inactivecount}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    // Show only for valid types
    if ([1, 2, 3, 8, 10].includes(userType)) {
        return <div>{cardContent}</div>;
    }

    return null;
};


export default Dashboard;