import React, { useState } from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

function Sidebar({ userData }) {
    const [active, setActive] = useState(window.location.pathname);
    const [collapsed, setCollapsed] = useState(true);
    // console.log(userData);
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userType = currentUser ? currentUser.s_usertype : null;
    // console.log(userType);


    // Icons (reuse your existing icons here)
    const icons = {
        dashboard: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="#3949ab" />
                <rect x="14" y="3" width="7" height="7" rx="2" fill="#7b6fd6" />
                <rect x="14" y="14" width="7" height="7" rx="2" fill="#3949ab" />
                <rect x="3" y="14" width="7" height="7" rx="2" fill="#7b6fd6" />
            </svg>
        ),
        staff: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="8" cy="8" r="4" fill="#3949ab" />
                <circle cx="16" cy="8" r="4" fill="#7b6fd6" />
                <ellipse cx="8" cy="18" rx="6" ry="3" fill="#3949ab" />
                <ellipse cx="16" cy="18" rx="6" ry="3" fill="#7b6fd6" opacity="0.7" />
            </svg>
        ),
        dealers: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="10" rx="3" stroke="#3949ab" strokeWidth="1.7" />
                <rect x="7" y="3" width="10" height="4" rx="2" fill="#7b6fd6" />
            </svg>
        ),
        branch: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="3" fill="#3949ab" />
                <circle cx="5" cy="19" r="3" fill="#7b6fd6" />
                <circle cx="19" cy="19" r="3" fill="#7b6fd6" />
                <path d="M12 8v4m0 0l-7 7m7-7l7 7" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        forms: (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="4" y="3" width="16" height="18" rx="3" stroke="#3949ab" strokeWidth="2" />
                <rect x="7" y="7" width="10" height="2" rx="1" fill="#7b6fd6" />
                <rect x="7" y="11" width="10" height="2" rx="1" fill="#7b6fd6" />
                <rect x="7" y="15" width="6" height="2" rx="1" fill="#7b6fd6" />
            </svg>
        ),
        maintenance: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#7b6fd6" />
                        <stop offset="100%" stopColor="#3949ab" />
                    </radialGradient>
                </defs>
                <circle cx="12" cy="12" r="10" fill="url(#glow)" opacity="0.1" />
                <circle cx="12" cy="12" r="9" stroke="url(#glow)" strokeWidth="2" fill="none" />
                <path d="M12 7v5l3.8 2.2" fill="none" stroke="#3949ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        dealerComplaintList: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M5 5h14v14H5z" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 9h6v6H9z" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        branchComplaintList: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="#26a69a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        assignedComplaints: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M5 12h14M5 12l4-4m-4 4l4 4" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        rejectedComplaints: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        fileComplaints: (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" stroke="#3f51b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 12h8M8 16h5M8 8h8" stroke="#3f51b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        processedClaim: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#e8f0fe" stroke="#3949ab" strokeWidth="1.5" />
                <path d="M7 9h10M7 13h6" stroke="#3949ab" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16 16l1.5 1.5 3-3" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        unprocessedClaim: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" fill="#fff3e0" stroke="#f57c00" strokeWidth="1.5" />
                <path d="M7 9h10M7 13h6" stroke="#f57c00" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="17" cy="17" r="3" fill="#fff" stroke="#f57c00" strokeWidth="1.5" />
                <path d="M17 15v2l1.2 1.2" stroke="#f57c00" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        approvedClaim: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" >
                <path
                    d="M12 2L4 6v6c0 5 4 8 8 8s8-3 8-8V6l-8-4z"
                    stroke="#3D9639"
                    strokeWidth="1.2"
                />
                <path
                    d="M9 12l2 2 4-5"
                    stroke="#3D9639"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        reports: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="4" fill="#eae7fc" stroke="#7b6fd6" strokeWidth="1.5" />
                <path d="M8 14C8 13.4477 8.44772 13 9 13H10C10.5523 13 11 13.4477 11 14V17C11 17.5523 10.5523 18 10 18H9C8.44772 18 8 17.5523 8 17V14Z" fill="#7b6fd6" />
                <path d="M13 10C13 9.44772 13.4477 9 14 9H15C15.5523 9 16 9.44772 16 10V17C16 17.5523 15.5523 18 15 18H14C13.4477 18 13 17.5523 13 17V10Z" fill="#7b6fd6" />
                <path d="M10.5 6C10.5 5.44772 10.9477 5 11.5 5H12.5C13.0523 5 13.5 5.44772 13.5 6V17C13.5 17.5523 13.0523 18 12.5 18H11.5C10.9477 18 10.5 17.5523 10.5 17V6Z" fill="#b2a7f7" />
            </svg>
        ),
        profile: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#7b6fd6" strokeWidth="1.5" fill="#eae7fc" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6H4z" stroke="#7b6fd6" strokeWidth="1.5" fill="#eae7fc" />
            </svg>
        ),
    };

    // Menu Configuration for Each Role
    const roleMenus = {
        '1': [ // Admin
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Manage Staff", href: "/managestaff", icon: icons.staff },
            { label: "Manage Dealers", href: "/managedealers", icon: icons.dealers },
            { label: "Manage Branch", href: "/managebranch", icon: icons.branch },
            { label: "Manage Forms", href: "/manageforms", icon: icons.forms },
            { label: "Maintenance Schedule", href: "/maintenance", icon: icons.maintenance },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '2': [ // Dealer
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Profile", href: "/profile", icon: icons.profile },
            { label: "Register Complaint", href: "/RegisterComplaint", icon: icons.fileComplaints },
        ],
        '3': [ // Manager
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Dealer Complaint List", href: "/DealerComplaintList", icon: icons.dealerComplaintList },
            { label: "Branch Complaint List", href: "/BranchComplaintList", icon: icons.branchComplaintList },
            { label: "Assigned Complaints", href: "/AssignedComplaints", icon: icons.assignedComplaints },
            { label: "Rejected Complaints", href: "/RejectedComplaints", icon: icons.rejectedComplaints },
            { label: "File Complaints", href: "/FileComplaint", icon: icons.fileComplaints },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '4': [ // Supervisor
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Maintenance Schedule", href: "/maintenance", icon: icons.maintenance },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '5': [ // Inspection
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '6': [ // Quality Check
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '7': [ // Sales Head
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Manage Dealers", href: "/managedealers", icon: icons.dealers },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '9': [ // Account
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '8': [ // Director
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Processed Claim", href: "/ProcessedClaim", icon: icons.processedClaim },
            { label: "Unprocessed Claim", href: "/UnprocessedClaim", icon: icons.unprocessedClaim },
            { label: "Approved Claim", href: "/ApprovedClaim", icon: icons.approvedClaim },
            { label: "Reports", href: "/reports", icon: icons.reports },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
        '10': [ // Branch
            { label: "Dashboard", href: "/dashboard", icon: icons.dashboard },
            { label: "Maintenance Schedule", href: "/maintenance", icon: icons.maintenance },
            { label: "Profile", href: "/profile", icon: icons.profile },
        ],
    };
    // const userType = String(userData?.s_usertype);  // Convert to string
    // console.log("userType as string:", userType);

    const selectedMenu = roleMenus[userType] || [];
    // console.log("selected menu:", selectedMenu);


    return (
        <aside className={`sidebar-wrapper${collapsed ? ' collapsed' : ''}`}>
            <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
                <button
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(prev => !prev)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <span className="sidebar-toggle-bar"></span>
                    <span className="sidebar-toggle-bar"></span>
                    <span className="sidebar-toggle-bar"></span>
                </button>

                <div className="sidebar-nav">
                    <ul>
                        {selectedMenu.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    className={`sidebar-link${active === item.href ? ' active' : ''}`}
                                    onClick={() => setActive(item.href)}
                                    title={item.label}
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    {!collapsed && <span className="sidebar-label">{item.label}</span>}
                                    {active === item.href && !collapsed && <span className="sidebar-active-indicator"></span>}
                                </a>
                            </li>
                        ))}
                        <li className="sidebar-logout">
                            <a href="/logout" className="sidebar-link logout-link" title="Logout">
                                <span className="sidebar-icon">
                                    {/* Logout SVG */}
                                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                                        <rect x="3" y="3" width="14" height="18" rx="3" fill="#ffd6d6" />
                                        <path d="M16 12h5m0 0l-2-2m2 2l-2 2" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </span>
                                {!collapsed && <span className="sidebar-label">Logout</span>}
                            </a>
                        </li>
                    </ul>
                </div>
                {/* <div class="sidebar-backdrop"></div> */}
            </div>
        </aside>
    );
}

export default Sidebar;
