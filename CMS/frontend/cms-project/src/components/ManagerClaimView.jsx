import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManagerClaimView.css';
import ManagerClaimAccordion from './ManagerClaimAccordion';
import DefectiveCruciblePhotos from './DefectiveCruciblePhotos';

const steps = [
    { date: '5/19/2025 3:13:27 PM', label: 'Claim Initiated' },
    { date: '5/19/2025 3:13:27 PM', label: 'Assign To Manager' },
    { date: '5/20/2025 2:28:15 PM', label: 'Assign To QualityCheck' },
    { date: '5/20/2025 2:33:17 PM', label: 'Assign To Director' },
    { date: '5/20/2025 2:37:53 PM', label: 'Claim Pass' },
    { date: '5/20/2025 2:42:05 PM', label: 'Voucher Generated' }
];

// const claimDetails = {
//     complaintId: '57',
//     financialYear: '2025-2026',
//     reportId: 'DD/SGR/2',
//     date: '19/05/2025',
//     dealerBranch: 'Darshit Jajadiya',
//     dealerCompany: 'Darshit Demo',
//     customerCompany: 'Olsen Wright Traders',
//     customerName: 'Jaden Avery',
//     customerAddress: 'Minus sit ad qui vo',
//     customerMobile: '+1 (702) 449-5345'
// };

// const photoCards = [
//     { name: 'POINT THE PROBLEM.jpg' },
//     { name: 'FULL VIEW OF PROBLEMATIC CRUCIBLE.jpg' },
//     { name: 'CRUCIBLE WITH REFERENCE OF LOCATION.jpg' },
//     { name: 'TOP VIEW.jpg' },
//     { name: 'BOTTOM VIEW.jpg' }
// ];

function ManagerClaimView() {
    const location = useLocation();
    const navigate = useNavigate(); // <-- Add this
    const claim_id = location.state?.claim_id; // <-- get claim_id from navigation state
    const [communicationData, setcommunicationData] = useState([]);
    const [defectivePhotos, setDefectivePhotos] = useState([]);
    const [performanceData, setperformanceData] = useState([]);
    const [diagramData, setdiagramData] = useState([]);

    const [claimViewData, setClaimViewData] = useState(null);
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
                    // console.log("Protected data:", data);
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
    },[])
    // console.log("Diagram Data", diagramData);
    useEffect(() => {
        if (claim_id) {
            fetch(`http://192.168.1.29:5015/DealerComplaintList/ManagerClaimView?claim_id=${claim_id}`)
                .then(res => res.json())
                .then(data => setClaimViewData(data))
                .catch(err => setClaimViewData(null));
        }
    }, [claim_id]);
    useEffect(() => {
        fetch(`http://192.168.1.29:5015/communicationsection?claim_id=${claim_id}`)
            .then(res => res.json())
            .then(data => setcommunicationData(data))
            .catch(err => console.error("Error fetching communication data:", err));
    }, [claim_id]);
    console.log("Communication Data", communicationData);
    //   console.log("Claim View Data", claimViewData);
    useEffect(()=>{
        fetch(`http://192.168.1.29:5015/DefectivePhotos?claim_id=${claim_id}`)
            .then(res => res.json())
            .then(data => setDefectivePhotos(data))
            .catch(err => console.error("Error fetching defective photos:", err));
    },[])
    useEffect(() => {
        fetch(`http://192.168.1.29:5015/passtsalesperformance?claim_id=${claim_id}`)
            .then(res => res.json())
            .then(data => {
                setperformanceData(data);
                // console.log("Past Sales Performance Data:", data);
            })
            .catch(err => console.error("Error fetching past sales performance data:", err));
    },[])
     const [status, setStatus] = useState(null);
    const [claimId, setClaimId] = useState(null);

    function handleReject(e) {
        // console.log(e); // optionally inspect the event or ID
        setStatus(3);
        setClaimId(e); // assuming 'e' is the claim ID
    }

    useEffect(() => {
        if (claimId !== null) {
            fetch(`http://192.168.1.29:5015/rejectclaimbymanager?claimid=${claimId}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Claim rejected:', data);
                })
                .catch(error => {
                    console.error('Error rejecting claim:', error);
                });
        }
    }, [claimId]); 

    return (
        <div className="managerclaim-dashboard-bg">
            <div className="managerclaim-header">
                <h1>
                    <span className="managerclaim-gradient-text">Claim Details</span>
                </h1>
                <p className="managerclaim-breadcrumb">
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
            <div className="managerclaim-claiminfo-card">
                <div className="managerclaim-claiminfo-row">
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
                            className="managerclaim-btn blue"
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
                        <button className="managerclaim-btn red"
                        onClick={()=>handleReject(claimViewData?.claim_id)}
                        >Reject Claim</button>
                    </div>
                </div>
                <ManagerClaimAccordion claimViewData={claimViewData} communicationData={communicationData} performanceData={performanceData} />
            </div>
            <DefectiveCruciblePhotos defectivePhotos={defectivePhotos}/>
            <footer className="managerclaim-footer">
        <span>@ Zircar Refractories. All Rights Reserved</span>
      </footer>
        </div>
    );
}

export default ManagerClaimView;