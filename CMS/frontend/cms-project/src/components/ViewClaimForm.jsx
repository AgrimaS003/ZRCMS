import React ,{useState,useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import './ViewClaimForm.css'; // Create and style this CSS file
import { useNavigate } from 'react-router-dom';

function ViewClaimForm() {
    const location = useLocation();
    const { claimViewData, communicationData, performanceData, defectivePhotos } = location.state || {};
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

    return (
        <div className="claimform-container">
            <div className="claimform-header">
                <img src="/logo.png" alt="Zircar Logo" className="claimform-logo" />
                <h2>Complaint Form</h2>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Complaint ID</label>
                    <input value={claimViewData?.claim_id || ""} readOnly />
                </div>
                <div>
                    <label>Financial Year</label>
                    <input value={claimViewData?.financial_year || ""} readOnly />
                </div>
            </div>

            {/* Section A: General Details */}
            <h3 className="claimform-section-title">A. General Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Report No</label>
                    <input value={claimViewData?.report_no || ""} readOnly />
                </div>
                <div>
                    <label>Date</label>
                    <input value={claimViewData?.date || ""} readOnly />
                </div>
            </div>

            {/* Section B: Dealer/Branch Details */}
            <h3 className="claimform-section-title">B. Dealer/Branch Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Dealer/Branch company Name</label>
                    <input value={claimViewData?.s_dealer_name|| ""} readOnly />
                </div>
                <div>
                    <label>Name of Dealer/Branch</label>
                    <input value={claimViewData?.s_dealer_company || ""} readOnly />
                </div>
            </div>

            {/* Section C: Customer Details */}
            <h3 className="claimform-section-title">C. Customer Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Customer Company Name</label>
                    <input value={claimViewData?.customer_company || ""} readOnly />
                </div>
                <div>
                    <label>Customer name</label>
                    <input value={claimViewData?.customer_name || ""} readOnly />
                </div>
                <div>
                    <label>Address</label>
                    <input value={claimViewData?.customer_address || ""} readOnly />
                </div>
                <div>
                    <label>Customer Mobile No.</label>
                    <input value={claimViewData?.customer_mobile || ""} readOnly />
                </div>
            </div>

            {/* Section D: Product Details */}
            <h3 className="claimform-section-title">D. Product Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Segment</label>
                    <input value={claimViewData?.segment || ""} readOnly />
                </div>
                <div>
                    <label>Zircar's Invoice No.</label>
                    <input value={claimViewData?.zircar_invoice_no || ""} readOnly />
                </div>
                <div>
                    <label>Invoice Date</label>
                    <input value={claimViewData?.zircar_invoice_date || ""} readOnly />
                </div>
                <div>
                    <label>Product</label>
                    <input value={claimViewData?.product_name || ""} readOnly />
                </div>
                <div>
                    <label>Code no.</label>
                    <input value={claimViewData?.product_code || ""} readOnly />
                </div>
                <div>
                    <label>Product Brand</label>
                    <input value={claimViewData?.product_brand || ""} readOnly />
                </div>
                <div>
                    <label>Zircar Product Code no.</label>
                    <input value={claimViewData?.zircar_product_code_no || ""} readOnly />
                </div>
            </div>

            {/* Section E: Crucible Application Details */}
            <h3 className="claimform-section-title">E. Crucible Application Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Application</label>
                    <input value={claimViewData?.application || ""} readOnly />
                </div>
                <div>
                    <label>Fuel</label>
                    <input value={claimViewData?.fuel || ""} readOnly />
                </div>
                <div>
                    <label>Metal</label>
                    <input value={claimViewData?.metal || ""} readOnly />
                </div>
                <div>
                    <label>Metal/Scrap Type</label>
                    <input value={claimViewData?.metal_scrap_type || ""} readOnly />
                </div>
                <div>
                    <label>Fluxes Used</label>
                    <input value={claimViewData?.fluxes_used || ""} readOnly />
                </div>
                <div>
                    <label>Flux Quantity (Kg per Charge)</label>
                    <input value={claimViewData?.flux_quantity || ""} readOnly />
                </div>
                {/* Add more fields as needed */}
            </div>

            {/* Section F: Product Failure & Required Details */}
            <h3 className="claimform-section-title">F. Product Failure & Required Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Installation Date</label>
                    <input value={claimViewData?.Installation_date || ""} readOnly />
                </div>
                <div>
                    <label>Failed Date</label>
                    <input value={claimViewData?.failed_date || ""} readOnly />
                </div>
                <div>
                    <label>Life Expected</label>
                    <input value={claimViewData?.life_expected || ""} readOnly />
                </div>
                <div>
                    <label>Life Achieved</label>
                    <input value={claimViewData?.life_achieved || ""} readOnly />
                </div>
                {/* Add more fields as needed */}
            </div>

            {/* Section G: Inspection Details */}
            <h3 className="claimform-section-title">G. Inspection Details</h3>
            <div className="claimform-row">
                <div>
                    <label>Failure Reasons</label>
                    <input value={claimViewData?.failure_reasons || ""} readOnly />
                </div>
                <div>
                    <label>Whether Inspected by Dealer</label>
                    <input value={claimViewData?.whether_inspected_by_dealer || ""} readOnly />
                </div>
                <div>
                    <label>Whether Inspected by Zircar</label>
                    <input value={claimViewData?.whether_inspected_by_zircar || ""} readOnly />
                </div>
                <div>
                    <label>Name of Inspector</label>
                    <input value={claimViewData?.name_of_inspector || ""} readOnly />
                </div>
                {/* Add more fields as needed */}
            </div>

            {/* Section H: Past Sales Performance */}
            <h3 className="claimform-section-title">H. Past Sales Performance</h3>
            <div className="claimform-row">
                <table className="claimform-table">
                    <thead>
                        <tr>
                            <th>Financial Year</th>
                            <th>Sales (Lacs)</th>
                            <th>Settled Claim</th>
                            <th>Claim(%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performanceData && performanceData.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.FinancialYear}</td>
                                <td>{item.Sales}</td>
                                <td>{item.SettledClaim}</td>
                                <td>{item.ClaimPercentage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Section I: Defective Crucible Images */}
            <h3 className="claimform-section-title">I. Defective Crucible Images</h3>
            <div className="claimform-photo-row">
                {defectivePhotos && defectivePhotos.map((photo, idx) => (
                    <div key={idx} className="claimform-photo-card">
                        <img
                            src={`data:image/jpeg;base64,${photo.s_photo}`}
                            alt={photo.s_photo_name}
                            className="claimform-photo-img"
                        />
                        <div className="claimform-photo-caption">{photo.s_photo_name}</div>
                    </div>
                ))}
            </div>

            {/* Section K: QC Form */}
            <h3 className="claimform-section-title">K. QC Form</h3>
            <div className="claimform-row">
                <div>
                    <label>Nature of complaint</label>
                    <input value={claimViewData?.Nature_of_Complaint || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Product</label>
                    <input value={claimViewData?.product_name || ""} readOnly />
                </div>
                <div>
                    <label>Application</label>
                    <input value={claimViewData?.application || ""} readOnly />
                </div>
                <div>
                    <label>Code</label>
                    <input value={claimViewData?.code_no || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Resin/Pitch Bonded</label>
                    <input value={claimViewData?.Resin_Pitch_Bonded || ""} readOnly />
                </div>
                <div>
                    <label>Recipe</label>
                    <input value={claimViewData?.Recepie || ""} readOnly />
                </div>
                <div>
                    <label>Styling Machine</label>
                    <input value={claimViewData?.Styling_Machine || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Application (Metal/Fuel) of Product Produced For</label>
                    <input value={claimViewData?.application || ""} readOnly />
                </div>
                <div>
                    <label>Date Of Moulding</label>
                    <input value={claimViewData?.Date_of_Moulding || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Green Stage</label>
                    <input value={claimViewData?.Green_Stage || ""} readOnly />
                </div>
                <div>
                    <label>Date</label>
                    <input value={claimViewData?.Green_Stage_date || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>1st Fired Stage / Curing Stage</label>
                    <input value={claimViewData?.Curing_Stage || ""} readOnly />
                </div>
                <div>
                    <label>Date</label>
                    <input value={claimViewData?.Curing_Stage_date || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Glaze Fired Stage (HT Firing)</label>
                    <input value={claimViewData?.Glaze_Fired_Stage || ""} readOnly />
                </div>
                <div>
                    <label>Date</label>
                    <input value={claimViewData?.Glaze_Fired_Stage_date || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>El fire stage (in case of el firing)</label>
                    <input value={claimViewData?.el_fire_stage || ""} readOnly />
                </div>
                <div>
                    <label>Date</label>
                    <input value={claimViewData?.el_fire_stage_date || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Over All Remarks on Produced Product</label>
                    <input value={claimViewData?.Over_All_Remarks_on_Produced_Product || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Remarks on Complaint</label>
                    <input value={claimViewData?.Remarks_on_Complaint || ""} readOnly />
                </div>
            </div>
            <div className="claimform-row">
                <div>
                    <label>Remedial Action to be taken</label>
                    <input value={claimViewData?.RemarksOnFutureBusiness || ""} readOnly />
                </div>
            </div>
        </div>
    );
}

export default ViewClaimForm;