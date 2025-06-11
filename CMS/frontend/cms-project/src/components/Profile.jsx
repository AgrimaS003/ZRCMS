import React, { useState, useEffect } from 'react';
import './Profile.css';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [profile, setProfile] = useState({
        name: 'User Name',
        email: 'email@gmail.com',
        company: 'dummy demo',
        mobile: 1221221022,
        address: 'abcd'
    });
    const [editProfile, setEditProfile] = useState(profile);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
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
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const userEmail = currentUser?.s_useremail;
        if (!userEmail) return;
        fetch(`http://192.168.1.29:5015/profile?s_useremail=${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.s_useremail) {
                    const newProfile = {
                        name: data.s_username,
                        email: data.s_useremail,
                        company: data.s_companyname,
                        mobile: data.s_usermobile,
                        address: data.s_useraddress
                    };
                    setProfile(newProfile);
                    setEditProfile(newProfile);
                }
            })
            .catch(err => {
                setMsg("Error fetching profile data.");
                console.error("Error fetching profile data:", err);
            });
    }, []);

    const handleEditChange = (e) => {
        const { id, value } = e.target;
        setEditProfile(prev => ({
            ...prev,
            [id]: id === 'mobile' ? Number(value) : value
        }));
    };

    const handleSave = () => {
        setMsg('');
        fetch('http://192.168.1.29:5015/update_profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editProfile)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProfile(editProfile); // Update overview with new data
                    setActiveTab('overview');
                    setMsg('Profile updated successfully!');
                } else {
                    setMsg(data.msg || 'Update failed.');
                }
            })
            .catch(err => {
                setMsg("Error updating profile.");
                console.error("Error updating profile:", err);
            });
    };

    if (!profile || !editProfile) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="profile-layout">
                <Sidebar />
                <main className="profile-content">
                    <header className="profile-hero">
                        <div>
                            <h1>
                                <span className="profile-gradient-text">Profile</span>
                                <span className="profile-emoji">👤</span>
                            </h1>
                            <p className="profile-breadcrumb">
                                Home <span>/</span> <span className="tag">Profile</span>
                            </p>
                        </div>
                        {/* <div className="profile-hero-bg">
                            <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
                                <ellipse cx="60" cy="30" rx="60" ry="30" fill="#e0eafc" />
                                <ellipse cx="60" cy="30" rx="40" ry="18" fill="#7b6fd6" opacity="0.13" />
                            </svg>
                        </div> */}
                    </header>

                    <section className="profile-cards-row" style={{ gap: 0 }}>
                        <div className="profile-card profile-card">
                            <div className="profile-avatar">
                                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                                    <circle cx="30" cy="30" r="30" fill="url(#profileGradient)" />
                                    <ellipse cx="30" cy="24" rx="12" ry="12" fill="#fff" opacity="0.9" />
                                    <ellipse cx="30" cy="44" rx="18" ry="8" fill="#fff" opacity="0.7" />
                                    <defs>
                                        <linearGradient id="profileGradient" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#7b6fd6" />
                                            <stop offset="1" stopColor="#38bdf8" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <div className="profile-card-info">
                                <h2 className="profile-gradient-text" style={{ marginBottom: 0 }}>{profile.name}</h2>
                                <div className="profile-card-role">{profile.company}</div>
                                <div className="profile-card-email">{profile.email}</div>
                            </div>
                        </div>
                    </section>

                    <section className="profile-charts-row" style={{ marginTop: 0 }}>
                        <div className="profile-chart-card" style={{ maxWidth: 600, margin: "0 auto" }}>
                            <ul className="profile-tabs">
                                <li>
                                    <button
                                        className={activeTab === 'overview' ? 'profile-tab-active' : ''}
                                        onClick={() => setActiveTab('overview')}
                                    >
                                        Overview
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className={activeTab === 'edit' ? 'profile-tab-active' : ''}
                                        onClick={() => {
                                            setEditProfile(profile);
                                            setActiveTab('edit');
                                            setMsg('');
                                        }}
                                    >
                                        Edit Profile
                                    </button>
                                </li>
                            </ul>
                            {msg && (
                                <div style={{ margin: "10px 0", color: msg.includes('success') ? "#22c55e" : "#ef4444", fontWeight: 500 }}>
                                    {msg}
                                </div>
                            )}
                            {activeTab === 'overview' && (
                                <div className="profile-form-card">
                                    <header className="profile-form-header">Profile Details</header>
                                    <div className="profile-form-grid">
                                        <div>
                                            <label>Full Name</label>
                                            <input type="text" id="name" value={profile.name} readOnly />
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <input type="email" id="email" value={profile.email} readOnly />
                                        </div>
                                        <div>
                                            <label>Company Name</label>
                                            <input type="text" id="company" value={profile.company} readOnly />
                                        </div>
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
                                <div className="profile-form-card">
                                    <header className="profile-form-header">Edit Profile</header>
                                    <div className="profile-form-grid">
                                        <div>
                                            <label>Full Name</label>
                                            <input type="text" id="name" value={editProfile.name} onChange={handleEditChange} />
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <input type="email" id="email" value={editProfile.email} readOnly />
                                        </div>
                                        <div>
                                            <label>Company Name</label>
                                            <input type="text" id="company" value={editProfile.company} onChange={handleEditChange} />
                                        </div>
                                        <div>
                                            <label>Mobile number</label>
                                            <input type="number" id="mobile" value={editProfile.mobile} onChange={handleEditChange} />
                                        </div>
                                        <div>
                                            <label>Address</label>
                                            <input type="text" id="address" value={editProfile.address} onChange={handleEditChange} />
                                        </div>
                                    </div>
                                    <button className="profile-btn" style={{ marginTop: 18 }} onClick={handleSave}>
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
            <footer className="profile-footer">
                <span>@ Zircar Refractories. All Rights Reserved</span>
            </footer>
        </>
    );
};

export default Profile;
