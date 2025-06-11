import React, { useState, useEffect } from 'react';
import logo from '../assets/images/zircar_logo.png';
import './manageform.css';
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

const ManageForm = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [status, setStatus] = useState('4'); // 4 = active, 6 = inactive
    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const userType = currentUser ? currentUser.s_usertype : null;
        // console.log(userType)

        if (!token || userType !== 1) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role || !name || !file) {
            setMsg("Please fill all fields and select a PDF file.");
            return;
        }
        const formData = new FormData();
        formData.append('s_form_for', role);
        formData.append('s_form_name', name);
        formData.append('s_form', file);
        formData.append('s_form_type', 'pdf');
        // console.log("file:", file)
        // console.log("content_type:", file.content_type)
        formData.append('s_form_status', status);

        try {
            const res = await fetch('http://192.168.1.29:5015/addform', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setMsg("Form uploaded successfully!");
                setRole('');
                setName('');
                setFile(null);
            } else {
                setMsg("Upload failed.");
            }
        } catch (err) {
            setMsg("Error uploading form.");
        }
    };

    return (
        <div className="manageform-bg manageform-layout">
            <Sidebar />
            <div className='manageform-content'>
                <main>
                    <div className="manageform-breadcrumb">
                        <h2>Manage Form</h2>
                        <h4>Home / Manage Form / <span className='tag'>Form</span></h4>
                    </div>
                    <div className="manageform-main-card">
                        <section className="manageform-content">
                            <form className="manageform-details-card" onSubmit={handleSubmit}>
                                <header className="manageform-header">
                                    <a href="#" className="manageform-logo-link">
                                        <img src={logo} alt="Logo" className="manageform-logo" />
                                    </a>
                                </header>
                                <header className="manageform-details">Fill the details to Add new form</header>
                                <div className="manageform-detail-field">
                                    <label>Role</label>
                                    <select id="role" value={role} onChange={e => setRole(e.target.value)}>
                                        <option value="" disabled>Select</option>
                                        <option value="Dealer">Dealer</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                                <div className="manageform-detail-field">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div className="manageform-detail-field">
                                    <label>File Upload (PDF only)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                </div>
                                <div className="manageform-detail-field">
                                    <label>Status</label>
                                    <select value={status} onChange={e => setStatus(e.target.value)}>
                                        <option value="4">Active</option>
                                        <option value="6">Inactive</option>
                                    </select>
                                </div>
                                <button className="submit-btn" type='submit'>Submit</button>
                                {msg && <div style={{ marginTop: "10px", color: "red" }}>{msg}</div>}
                            </form>
                        </section>
                    </div>
                    <div className="manageform-footer-card">
                        <h1 className='manageform-view'>View Attachment</h1>
                        <div className='manageform-border'></div>
                        <div className='manageform-footer'><span className='manageform-footer-span'>@ Zircar Refractories. </span> All Rights Reserved</div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManageForm;
