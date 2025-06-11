import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import './Profile.css';
import Header from './Header';
import { useParams } from 'react-router-dom';

const Profile = () => {

    const {user, setUser} = useContext(UserContext);
    const logInEmail = localStorage.getItem('userEmail');
    const [updateMessage, setUpdateMessage]= useState('');
    const {usertype} = useParams();

    const staffRoles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account'];

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        company: '',
        mobile: '',
        address: '',
        userType: ''
    });

    const [editProfile, setEditProfile] = useState(profile);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (logInEmail && usertype ) {
            fetch(`http://192.168.1.32:5015/${usertype.toLowerCase()}/get_profile?email=${logInEmail}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const fetchedProfile ={
                    name: data.profile.name,
                    email: data.profile.email,
                    company: data.profile.company,
                    mobile: data.profile.mobile,
                    address: data.profile.address,
                    userType: usertype.charAt(0).toUpperCase() + usertype.slice(1)
                };
                setProfile(fetchedProfile);
                setEditProfile(fetchedProfile)
                setUser(fetchedProfile);
                } else {
                alert('Failed to fetch profile data');
                }
            })
            .catch(err => {
                console.error('Error fetching profile:', err);
            });
        }
        }, [logInEmail, setUser]);

    const handleEditChange = (e) => {
        const { id, value } = e.target;
        setEditProfile(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSave = () => {
        fetch( `http://192.168.1.32:5015/${usertype.toLowerCase()}/update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: editProfile.email,
            name: editProfile.name,
            mobile: editProfile.mobile,
            address: editProfile.address
        }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
            setProfile(editProfile);
            setUser(editProfile);  // update global user here too
            setActiveTab('overview');
            // alert('Profile updated successfully!');
            setTimeout( () =>{
            setUpdateMessage('Profile updated successfully!')
            setTimeout(() => setUpdateMessage(''), 3000);
            },100)
            } else {
            setUpdateMessage('Failed to update profile.');
            setTimeout(() => setUpdateMessage(''), 3000);
            }
        }).catch(err => {
            console.log(err)
            setUpdateMessage('Error while updating profile.')
            setTimeout(() => setUpdateMessage(''), 3000);
        })
    };
    const isStaffRole = staffRoles.includes(usertype.toLowerCase());

    return (
        <>
            <div className="profile-container">
                    <Header userName = {user.name || ''} userType = {user.userType || ''} />
                    {/* {user && <Header userName={user.name} userType={user.userType} />} */}
                <main className="main-content">
                    <div className="profile-head">
                        <h2>Profile</h2>
                        <p>Home / Profile</p>
                    </div>
                    <div className="mainDiv">
                        <div className="about card-body">
                            <h2>{profile.name}</h2>
                            <div className="user-type">{profile.userType}</div>
                            {!isStaffRole && <div className="company">{profile.company}</div>}
                        </div>

                        <div className="profile-content">
                            <ul className="button_ul">
                                <li className="overview" key="overview">
                                    <button
                                        className={activeTab === 'overview' ? 'active' : ''}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        Overview
                                    </button>
                                </li>
                                <li className="edit_Profile" key="edit">
                                    <button
                                        className={activeTab === 'edit' ? 'active' : ''}
                                        onClick={() => {
                                            setEditProfile(profile);
                                            setActiveTab('edit');
                                        }}
                                    >
                                        Edit Profile
                                    </button>
                                    
                                </li>
                            </ul>
                            {activeTab === 'overview' && (
                                <div className="profile-overview-card">
                                    <header>Profile Details</header>
                                    <div className="form-grid">
                                        <div>
                                            <label>Full Name</label>
                                            <input type="text" id="name" value={profile.name} readOnly />
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <input type="email" id="email" value={profile.email} readOnly />
                                        </div>
                                        {!isStaffRole && (
                                        <div>
                                            <label>Company Name</label>
                                            <input type="text" id="company" value={profile.company} readOnly />
                                        </div>
                                        )}
                                        <div>
                                            <label>Mobile number</label>
                                            <input type="number" id="mobile" value={profile.mobile} readOnly />
                                        </div>
                                        <div>
                                            <label>Address</label>
                                            <input type="text" id="address" value={profile.address} readOnly />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'edit' && (
                                <div className="profile-edit-card">
                                    <header>Edit Profile</header>
                                    <div className="form-grid">
                                        <div>
                                            <label>Full Name</label>
                                            <input type="text" id="name" value={editProfile.name} onChange={handleEditChange} />
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <input type="email" id="email" value={editProfile.email} readOnly />
                                        </div>
                                        {!isStaffRole && (
                                        <div>
                                            <label>Company Name</label>
                                            <input type="text" id="company" value={editProfile.company} readOnly />
                                        </div>
                                        )}
                                        <div>
                                            <label>Mobile number</label>
                                            <input type="tel" id="mobile" value={editProfile.mobile} onChange={handleEditChange} maxLength="10"/>
                                        </div>
                                        <div>
                                            <label>Address</label>
                                            <input type="text" id="address" value={editProfile.address} onChange={handleEditChange} />
                                        </div>
                                    </div>
                                    <div className="buttons-row">
                                        <button className="save-button" onClick={handleSave}>
                                            Save Changes
                                        </button>
                                        <button id="changes-cancel-button" onClick={() => setActiveTab('overview')}>
                                            Cancel
                                        </button>
                                    </div>
                                    
                                </div>
                            )}
                            <div>
                            {updateMessage && (
                                    <div
                                        className={`update-message ${
                                        updateMessage.includes('successfully') ? 'success' : 'error'
                                        }`}
                                    >{updateMessage}
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <div>
                <p className="footer"><b>@ Zircar Refractories.</b> All Rights Reserved</p>
            </div>
        </>
    );
};

export default Profile;