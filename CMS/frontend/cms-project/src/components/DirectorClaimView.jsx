import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import DefectiveCruciblePhotos from './DefectiveCruciblePhotos';
import Sidebar from './Sidebar';
import './DirectorClaimView.css'


function DirectorClaimView() {
    const location = useLocation();
    const navigate = useNavigate(); // <-- Add this
    const claim_id = location.state?.claim_id;
    const isProcessed = location.state?.isProcessed;
    const isApproved = location.state?.isApproved;
    const [defectivePhotos, setDefectivePhotos] = useState([]);
    const [diagramData, setdiagramData] = useState([]);
    const [claimViewData, setClaimViewData] = useState(null);
    // console.log(claim_id, isProcessed, isApproved);
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
        fetch(`http://192.168.1.29:5015/stepdata?claim_id=${claim_id}`)
            .then(res => res.json())
            .then(data => setdiagramData(data))
            .catch(err => console.error("Error fetching step data:", err));
    }, [])
    useEffect(() => {
        fetch(`http://192.168.1.29:5015/DefectivePhotos?claim_id=${claim_id}`)
            .then(res => res.json())
            .then(data => setDefectivePhotos(data))
            .catch(err => console.error("Error fetching defective photos:", err));
    }, [])
    return (
        <div className="directorclaim-dashboard-bg directorclaim-layout">
            {/* <Sidebar/> */}
            <div className="directorclaim-header directorclaim-content">
                <h1>
                    <span className="directorclaim-gradient-text">Claim Details</span>
                </h1>
                <p className="directorclaim-breadcrumb">
                    Staff <span>/</span> <span className="tag">claim details</span>
                </p>
            </div>

            {/* Stepper */}
            <div className="directorclaim-stepper-card">
                <div className="directorclaim-stepper">
                    {/* Continuous line behind all dots */}
                    <div className="directorclaim-stepper-line-bg" />
                    {diagramData.map((step, idx) => (
                        <div className="directorclaim-stepper-step" key={idx}>
                            <div className={`directorclaim-stepper-dot step-dot-${idx}`} />
                            <div className="directorclaim-stepper-info">
                                <div className="directorclaim-stepper-date">
                                    {step.s_updated_on
                                        ? (() => {
                                            const date = new Date(step.s_updated_on);
                                            const m = date.getMonth() + 1;
                                            const d = date.getDate();
                                            const y = date.getFullYear();
                                            let h = date.getHours();
                                            const min = date.getMinutes().toString().padStart(2, '0');
                                            const s = date.getSeconds().toString().padStart(2, '0');
                                            const ampm = h >= 12 ? 'PM' : 'AM';
                                            h = h % 12;
                                            h = h === 0 ? 12 : h; // 0 should be 12
                                            return `${m}/${d}/${y} ${h}:${min}:${s} ${ampm}`;
                                        })()
                                        : ''}
                                </div>
                                <div className="directorclaim-stepper-label">{step.status_name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Claim Info Card */}
            {/* <div className="directorclaim-claiminfo-card">
                {/* <div className="directorclaim-claiminfo-row">
                    <div>
                        <div>
                            <label>Complaint Id</label>
                            <input value={claimViewData?.claim_id || ""} readOnly />
                        </div>
                        <div>
                            <label>Financial Year</label>
                            <input value={claimViewData?.financial_year || ""} readOnly />
                        </div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', alignSelf: 'flex-end', flexDirection: 'row' }}>
                        <button
                            className="directorclaim-btn blue"
                            onClick={() => navigate('/DealerComplaintList/ViewClaimForm', {
                                state: {
                                    claimViewData,
                                    communicationData,
                                    performanceData,
                                    defectivePhotos
                                }
                            })}
                        >
                            View Claim
                        </button>
                        <button className="directorclaim-btn red">Reject Claim</button>
                    </div>
                </div> */}
            {/* <directorClaimAccordion claimViewData={claimViewData} communicationData={communicationData} performanceData={performanceData} /> *
            </div> */}
            <DefectiveCruciblePhotos defectivePhotos={defectivePhotos} isProcessed={isProcessed} isApproved={isApproved} />
            <footer className="directorclaim-footer">
                <span>@ Zircar Refractories. All Rights Reserved</span>
            </footer>
        </div>

    )
}

export default DirectorClaimView
