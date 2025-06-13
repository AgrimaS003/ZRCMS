import React,{useState} from 'react';
import './Sidebar.css';
import { useNavigate , useParams } from 'react-router-dom';
 
const Sidebar = () => {

    const navigate = useNavigate();
    const usertype = useParams().usertype || localStorage.getItem('usertype');

    const [activeSubMenu, setActiveSubMenu] = useState(null);

    const handleSubMenuToggle = (menu) => {
      setActiveSubMenu(prev => (prev === menu ? null : menu));
    };
    const staffRoles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account'];
    const isStaff = usertype && staffRoles.includes(usertype.toLowerCase());

    const handleLogout = () => {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    };

  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        <li className="nav-item" onClick={() => navigate(`/${usertype}/dashboard`)}>
          <a className="nav-link">
            <i className="bi bi-grid"></i> <span id='color-id'>Dashboard</span>
          </a>
        </li>
        {!isStaff && (
        <li className="nav-item" onClick={() => navigate(`/${usertype}/register-complaint`)}>
          <a className="nav-link">
            <i className="bi bi-pencil-square"></i> <span id='color-id'>Register Complaint</span>
          </a>
        </li>
        )}
        
        {isStaff ? (
  // If user is staff → show single redirect item without dropdown
              <li>
                <a className="nav-link" onClick={() => navigate(`/${usertype}/all_complaint_list`)}>
                  <i className="bi bi-list-check"></i>
                  <span id="color-id">Complaint List</span>
                </a>
              </li>
            ) : (
              // For other users → show dropdown with submenu
              <li className="nav-item">
                <a className="nav-link" onClick={() => handleSubMenuToggle('complain-list')}>
                  <i className="bi bi-list-check"></i>
                  <span id="color-id">Complaint List</span>
                  <i className="bi bi-chevron-down ms-auto" style={{ marginLeft: '8px' }}></i>
                </a>

    {activeSubMenu === 'complain-list' && (
      <ul className="nav-content">
        <li><a onClick={() => navigate(`/${usertype}/complaints/active-claim`)}><i className="bi bi-circle"></i><span id='color-id'>Active Claim</span></a></li>
        <li><a onClick={() => navigate(`/${usertype}/complaints/rejected-claims`)}><i className="bi bi-circle"></i><span id='color-id'>Rejected Claim</span></a></li>
        <li><a onClick={() => navigate(`/${usertype}/complaints/claim-passed`)}><i className="bi bi-circle"></i><span id='color-id'>Claim Passed</span></a></li>
      </ul>
    )}
  </li>
)}


  {isStaff && (
    <li className="nav-item" onClick={() => navigate(`/${usertype}/reports`)}>
            <a className="nav-link">
              <i className="bi bi-file-earmark-bar-graph"></i>{' '}
              <span id="color-id">Reports</span>
            </a>
      </li>
  )}

  {!isStaff && (
    <>
  <li className="nav-item">
    <a className="nav-link" onClick={() => handleSubMenuToggle('download-forms')}>
      <i className="bi bi-download" ></i>
      <span id='color-id'>Download Forms</span>
      <i className="bi bi-chevron-down ms-auto" style={{'marginLeft':'8px'}}></i>
    </a>
    
    {activeSubMenu === 'download-forms' && (
      <ul className="nav-content"> 
        <li><a href="/ZRCMS-PDF/Claim Form.pdf" download><i className="bi bi-file-earmark"></i><span id='color-id'>Claim Form</span></a></li>
        <li><a href="/ZRCMS-PDF/Observation Form.pdf" download><i className="bi bi-file-earmark-text"></i><span id='color-id'>Observation Form</span></a></li>
        <li><a href="/ZRCMS-PDF/Annexure 1.pdf" download><i className="bi bi-file-earmark-zip"></i><span id='color-id'>Annexure 1</span></a></li>
      </ul> 
    )}
  </li>

        <li className="nav-item" onClick={() => navigate(`/${usertype}/profile`)}>
          <a className="nav-link"><i className="bi bi-person"></i> <span id='color-id'>Profile</span></a>
        </li>
        </>
  )}
        {usertype?.toLowerCase() === 'dealer' && (
        <li className="nav-item" onClick={() => navigate(`/${usertype}/contact`)}>
          <a className="nav-link"><i className="bi bi-envelope"></i> <span id='color-id'>Contact</span></a>
        </li>
        )}
        <li className="nav-item" onClick={handleLogout}>
          <a className="nav-link"><i className="bi bi-box-arrow-right"></i> <span id='color-id'>Logout</span></a>
        </li>
      </ul> 
    </aside>
  );
};

export default Sidebar;
