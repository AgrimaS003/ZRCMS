import React, { useState, useEffect, useRef, useContext} from 'react';
import { UserContext } from './UserContext';
import logo from '../assets/images/zircar_logo.png';
import menu from '../assets/images/menuIcon.png';
import { FaUser, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './Header.css';
import {useNavigate,useParams} from 'react-router-dom'

const Header = () => {
  
  const urlUsertype = useParams().usertype;
  const localUsertype = localStorage.getItem('usertype');
  const usertype = urlUsertype || localUsertype;
  const [showSidebar, setShowSidebar] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); 

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
    // const { user, setUser } = useState([]);
    // Fetch user data on mount
    useEffect(() => {
      const logInEmail = localStorage.getItem('userEmail');

      if (logInEmail && usertype && (!user?.name || !user?.email)) {
        fetch(`http://192.168.1.32:5015/${usertype}/get_profile?email=${logInEmail}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const fetchedProfile = {
                name: data.profile.name,
                email: data.profile.email,
                company: data.profile.company,
                mobile: data.profile.mobile,
                address: data.profile.address,
                userType: usertype.charAt(0).toUpperCase() + usertype.slice(1),
              };
              setUser(fetchedProfile);
            } else {
              console.log('Failed to fetch profile data');
            }
          })
          .catch(err => 
            console.error('Error fetching profile:', err)
          );
      }
    }, [user,setUser,user?.name, user?.email]);
    console.log(user)

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  useEffect( () => {
    const handleClickOutside = (event) =>{
      if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
        setDropdownOpen(false);
      }
    };
    if(dropdownOpen){
      document.addEventListener('mousedown',handleClickOutside);
    }
    return ()=>{
      document.removeEventListener('mousedown', handleClickOutside);
    };
  
  }, [dropdownOpen]);

const handleLogout = () => {
  localStorage.clear();
  setUser(null); // clears user profile from context
  navigate('/'); // go to home
};
  return (
    <>
      <header id="main-header">
        
        <div id="left-section">
        <button
          id="menu-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <img src={menu} alt="Menu Icon" className="menu-icon" />
        </button>

        <div id="logo-section">
          <img src={logo} alt="Zircar Logo" id="company-logo" />
        </div>
        </div>

        <div id="user-dropdown">
          <button id="user-toggle-btn" onClick={toggleDropdown}>
            <span id="user-name" style={{color : '#012970'}}>{user?.name}</span>
          </button>

          {dropdownOpen && (
            <div id="dropdown-menu" ref={dropdownRef}
            style={{backgroundColor: 'white',
                  border: '1px solid black',
                  position: 'absolute',
                  right: '35px',
                  top: '160%',
                  width: '225px',
                  // zIndex: 9999,
                }}
            >
              <div className="dropdown-item user-info">
                <strong>{user?.name}</strong>
                <small>{user?.userType}</small>
              </div>
              <div className="dropdown-divider" />
              <div className="dropdown-item" onClick={()=> navigate(`/${usertype}/profile`)}>
                <FaUser size={16} />
                <span>My Profile</span>
              </div>
              { ( usertype?.toLowerCase() === 'dealer' || usertype?.toLowerCase() === 'branch') && (
              <div className="dropdown-item" onClick={() => navigate(`/${usertype}/need-help`)}>
                <FaQuestionCircle size={16} />
                <span>Need Help</span>
              </div>
              )}
              <div className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt size={16} />
                <span>Sign Out</span>
              </div>

            </div>
          )}

        </div>
      </header>

      {showSidebar && <Sidebar />}
    </>
  );
};

export default Header;