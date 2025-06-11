import React, { useEffect, useState } from 'react';
import './ManagerClaimView.css';
import { useNavigate } from 'react-router-dom';

const sections = [
    { key: 'ClaimDetails', label: 'Claim Details' },
    { key: 'ProductDetails', label: 'Product Details' },
    { key: 'CrucibleApplicationDetails', label: 'Crucible Application Details' },
    { key: 'ProductFailureRequiredDetails', label: 'Product Failure & Required Details' },
    { key: 'InspectionDetails', label: 'Inspection Details' },
    { key: 'PastSalesPerformance', label: 'Past Sales Performance' },
    { key: 'QCForm', label: 'QC Form' },
    { key: 'CommunicationDetails', label: 'Communication Details' },
];

const claimDetails = {
    reportId: 'DD/SGR/1',
    date: '19/05/2025',
    dealerBranch: 'Darshit ',
    dealerCompany: 'Demo',
    customerCompany: 'Olsen',
    customerName: 'Jaden ',
    customerAddress: 'Minus ',
    customerMobile: '+91 (702) 449-5345'
};

function renderSectionContent(sectionKey, claimViewData , communicationData , performanceData) {
    if (sectionKey === 'ProductDetails') {
        return (
            <div className="managerclaim-claiminfo-grid">
                <div>
                    <label>Segment</label>
                    <input value={claimViewData?.segment} readOnly />
                </div>
                <div>
                    <label>Zircar's Invoice No.</label>
                    <input value={claimViewData?.zircar_invoice_no} readOnly />
                </div>
                <div>
                    <label>Zircar's Invoice Date</label>
                    <input value={claimViewData?.zircar_invoice_date} readOnly />
                </div>
                <div>
                    <label>Product</label>
                    <input value={claimViewData?.product_name} readOnly />
                </div>
                <div>
                    <label>Code No.</label>
                    <input value={claimViewData?.product_code} readOnly />
                </div>
                <div>
                    <label>Product Brand</label>
                    <input value={claimViewData?.product_brand} readOnly />
                </div>
                <div>
                    <label>SAP Product Code</label>
                    <input value="" readOnly />
                </div>
            </div>
        );
    }
    if (sectionKey === 'CrucibleApplicationDetails') {
        return (
            <div className="managerclaim-claiminfo-grid">
                <div>
                    <label>Application</label>
                    <input value={claimViewData?.application} readOnly />
                </div>
                <div>
                    <label>Fuel</label>
                    <input value={claimViewData?.fuel} readOnly />
                </div>
                <div>
                    <label>Working Frequency Type</label>
                    <input value="Low" readOnly />
                </div>
                <div>
                    <label>Working Frequency (Hz)</label>
                    <input value={claimViewData?.working_frequency_type} readOnly />
                </div>
                <div>
                    <label>Metal</label>
                    <input value={claimViewData?.metal} readOnly />
                </div>
                <div>
                    <label>Metal/Scrap Type</label>
                    <input value={claimViewData?.metal_scrap_type} readOnly />
                </div>
                <div>
                    <label>Fluxes Used</label>
                    <input value="Nostrum autem amet" readOnly />
                </div>
                <div>
                    <label>Flux Quantity (Kg per Charge)</label>
                    <input value={claimViewData?.fluxes_used} readOnly />
                </div>
                <div>
                    <label>Working Temperature (°C)</label>
                    <input value={claimViewData?.working_temperature} readOnly />
                </div>
                <div>
                    <label>Top Glaze Formation</label>
                    <input value={claimViewData?.top_glaze_formation} readOnly />
                </div>
                <div>
                    <label>Bottom Glaze Formation</label>
                    <input value={claimViewData?.bottom_glaze_formation} readOnly />
                </div><div>
                    <label>Flame Orientation</label>
                    <input value={claimViewData?.flame_orientation} readOnly />
                </div>
                <div>
                    <label>No. of Key Bricks</label>
                    <input value={claimViewData?.key_bricks} readOnly />
                </div>
                <div>
                    <label>Support Used at the Bottom of the Crucible</label>
                    <input value={claimViewData?.support_used_at_the_bottom} readOnly />
                </div>
                <div>
                    <label>Metal Output Per Charge (Kg)</label>
                    <input value={claimViewData?.metal_output_per_charges} readOnly />
                </div>
                <div>
                    <label>Heats Per Day</label>
                    <input value={claimViewData?.heats_per_day} readOnly />
                </div>
                <div>
                    <label>Melting Time Per Charge (hrs.)</label>
                    <input value={claimViewData?.melting_time_per_charge} readOnly />
                </div>
                <div>
                    <label>Operating Hours/Day</label>
                    <input value={claimViewData?.operating_hours_per_day} readOnly />
                </div>
                <div>
                    <label>Type of Operation</label>
                    <input value={claimViewData?.type_of_opertion} readOnly />
                </div>
            </div>
        );
    }
    if (sectionKey === 'ProductFailureRequiredDetails') {
        return (
            <div className="managerclaim-claiminfo-grid">
                <div>
                    <label>Installation Date</label>
                    <input value={claimViewData?.Installation_date} readOnly />
                </div>
                <div>
                    <label>Failed Date</label>
                    <input value={claimViewData?.failed_date} readOnly />
                </div>
                <div>
                    <label>Life Expected</label>
                    <input value={claimViewData?.life_expected} readOnly />
                </div>
                <div>
                    <label>Life Achieved</label>
                    <input value={claimViewData?.life_achieved} readOnly />
                </div>
                <div>
                    <label>Competitor's Name</label>
                    <input value={claimViewData?.competitors_name} readOnly />
                </div>
                <div>
                    <label>Competitor's Product</label>
                    <input value={claimViewData?.competitors_product} readOnly />
                </div>
                <div>
                    <label>Competitor's Product Life</label>
                    <input value={claimViewData?.Competitors_Product_Life_data - claimViewData?.Competitors_Product_Life} readOnly />
                </div>
            </div>
        );
    }
    if (sectionKey === 'InspectionDetails') {
        const failureReasons = [
            { key: "failure_erosion", label: "Erosion" },
            { key: "failure_flux_attack", label: "Flux Attack" },
            { key: "failure_cracks", label: "Cracks" },
            { key: "failure_leakages", label: "Leakages" },
            { key: "failure_blistering", label: "Blistering" },
            { key: "failure_bursting", label: "Bursting" },
            { key: "failure_dimension", label: "Dimension" },
            { key: "failure_design", label: "Design" },
            { key: "failure_related_to_bottom_stand", label: "Related to Bottom Stand" },
            { key: "failure_no_expansion_gap", label: "No Expansion Gap" },
            { key: "failure_packing", label: "Packing" },
            { key: "failure_blow_holes", label: "Blow - Holes" },
            { key: "failure_glaze_run_off", label: "Glaze Run Off" },
            { key: "failure_flame_impingement", label: "Flame Impingement" },
            { key: "failure_corrosion", label: "Corrosion" },
            { key: "failure_oxidation", label: "Oxidation" },
            { key: "failure_frozen", label: "Frozen" },
            { key: "failure_metal_issue", label: "Metal Issue" },
            { key: "failure_others", label: "Others" }
        ];
        return (
            <div className="managerclaim-claiminfo-grid">
                <label>Failure Reasons (Based on observation)</label>
                <div className="inspection-checkbox-group">
                    <div className="inspection-checkbox-list">
                        {failureReasons.map((reason, idx) => (
                            <label key={reason.key} className="inspection-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={claimViewData?.[reason.key] === 1}
                                    readOnly
                                />
                                {reason.label}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label>Whether Inspected by Dealer</label>
                    <input type="text" name="inspectedByDealer" value={claimViewData?.whether_inspected_by_dealer} readOnly />
                </div>
                <div>
                    <label>Whether Inspected by Zircar</label>
                    <input type="text" name="inspectedByZircar" value={claimViewData?.whether_inspected_by_zircar} readOnly />
                </div>
                <div>
                    <label>Name of Inspector</label>
                    <input type="text" name="inspectorName" value={claimViewData?.name_of_inspector} readOnly />
                </div>
                <div>
                    <label>Visit Report of Dealer</label>
                    <input type="text" name="dealerReport" value={claimViewData?.visit_reports_of_dealer} readOnly />
                </div>
                <div>
                    <label>Visit Report of Zircar Employee</label>
                    <input type="text" name="zircarReport" value={claimViewData?.visit_reports_of_zircar_employee} readOnly />
                </div>
                <div>
                    <label>Zircar Basic Price (Rs.)</label>
                    <input type="text" name="zircarPrice" value={claimViewData?.zircar_basic_price} readOnly />
                </div>
                <div>
                    <label>Customer Expectations from Zircar</label>
                    <input type="text" name="customerExpectations" value={claimViewData?.customer_expectations_from_zircar} readOnly />
                </div>
            </div>
        );
    }
    if (sectionKey === 'PastSalesPerformance') {
        // Extract years and values from performanceData
        const years = performanceData.map(item => item.FinancialYear);
        const sales = performanceData.map(item => item.Sales);
        const settled = performanceData.map(item => item.SettledClaim);
        const claim = performanceData.map(item => item.ClaimPercentage);

        // You can set outstanding and remarks as needed, or get from the first item
        const outstanding = performanceData[0]?.Outstanding || '';
        const remarks = performanceData[0]?.Remarks || '';

        return (
            <div className="past-sales-performance-table-outer">
                <table className="past-sales-performance-table">
                    <thead>
                        <tr>
                            <th>Financial Year</th>
                            {years.map((year, i) => (
                                <th key={i}>{year}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Sales (Lacs)</td>
                            {sales.map((val, i) => <td key={i}><input value={val} readOnly /></td>)}
                        </tr>
                        <tr>
                            <td>Settled Claim</td>
                            {settled.map((val, i) => <td key={i}><input value={val} readOnly /></td>)}
                        </tr>
                        <tr>
                            <td>Claim (%)</td>
                            {claim.map((val, i) => <td key={i}><input value={val} readOnly /></td>)}
                        </tr>
                        <tr>
                            <td>Outstanding as on Date</td>
                            <td colSpan={years.length}>
                                <input value={outstanding} readOnly />
                            </td>
                        </tr>
                        <tr>
                            <td>Remarks on Future Business</td>
                            <td colSpan={years.length}>
                                <input value={remarks} readOnly />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
    if (sectionKey === 'QCForm') {
    return (
        <div className="managerclaim-claiminfo-grid">
            <div>
                <label>Nature of Complaint</label>
                <input value={claimViewData?.Nature_of_Complaint || ""} readOnly />
            </div>
            <div>
                <label>Product</label>
                <input value={claimViewData?.Product || ""} readOnly />
            </div>
            <div>
                <label>Application</label>
                <input value={claimViewData?.Application || ""} readOnly />
            </div>
            <div>
                <label>Code</label>
                <input value={claimViewData?.Code || ""} readOnly />
            </div>
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
            <div>
                <label>Application (Metal/Fuel) of Product Produced For</label>
                <input value={claimViewData?.Application_of_Product_Produced_For || ""} readOnly />
            </div>
            <div>
                <label>Date of Moulding</label>
                <input value={claimViewData?.Date_of_Moulding ? new Date(claimViewData.Date_of_Moulding).toLocaleDateString() : ""} readOnly />
            </div>
            <div>
                <label>Green Stage</label>
                <input value={claimViewData?.Green_Stage || ""} readOnly />
            </div>
            <div>
                <label>Green Stage Date</label>
                <input value={claimViewData?.Green_Stage_date ? new Date(claimViewData.Green_Stage_date).toLocaleDateString() : ""} readOnly />
            </div>
            <div>
                <label>1st Fired Stage / Curing Stage</label>
                <input value={claimViewData?.Curing_Stage || ""} readOnly />
            </div>
            <div>
                <label>Curing Stage Date</label>
                <input value={claimViewData?.Curing_Stage_date ? new Date(claimViewData.Curing_Stage_date).toLocaleDateString() : ""} readOnly />
            </div>
            <div>
                <label>Glaze Fired Stage (HT Firing)</label>
                <input value={claimViewData?.Glaze_Fired_Stage || ""} readOnly />
            </div>
            <div>
                <label>Glaze Fired Stage Date</label>
                <input value={claimViewData?.Glaze_Fired_Stage_date ? new Date(claimViewData.Glaze_Fired_Stage_date).toLocaleDateString() : ""} readOnly />
            </div>
            <div>
                <label>El fire stage (in case of el firing)</label>
                <input value={claimViewData?.el_fire_stage || ""} readOnly />
            </div>
            <div>
                <label>El fire stage Date</label>
                <input value={claimViewData?.el_fire_stage_date ? new Date(claimViewData.el_fire_stage_date).toLocaleDateString() : ""} readOnly />
            </div>
            <div>
                <label>Overall Remarks on Produced Product</label>
                <input value={claimViewData?.Over_All_Remarks_on_Produced_Product || ""} readOnly />
            </div>
            <div>
                <label>Remarks on Complaint</label>
                <input value={claimViewData?.Remarks_on_Complaint || ""} readOnly />
            </div>
            <div>
                <label>Remedial Action to be taken</label>
                <input value={claimViewData?.Remdial_Action_to_be_taken || ""} readOnly />
            </div>
        </div>
    );
}
    if (sectionKey === 'CommunicationDetails') {
        return <CommunicationDetailsSection claimViewData={claimViewData} communicationData={communicationData}/>;
    }
    // Default: Claim Details (or others)
    return (
        <div className="managerclaim-claiminfo-grid">
            <div>
                <label>Report ID</label>
                <input value={claimViewData?.report_no} readOnly />
            </div>
            <div>
                <label>Date</label>
                <input value={claimDetails?.date} readOnly />
            </div>
            <div>
                <label>Name of Dealer/Branch</label>
                <input value={claimViewData?.s_dealer_name} readOnly />
            </div>
            <div>
                <label>Dealer/Branch Company Name</label>
                <input value={claimViewData?.s_dealer_company} readOnly />
            </div>
            <div>
                <label>Customer Company Name</label>
                <input value={claimViewData?.customer_company} readOnly />
            </div>
            <div>
                <label>Customer Name</label>
                <input value={claimViewData?.customer_name} readOnly />
            </div>
            <div>
                <label>Customer Address</label>
                <input value={claimViewData?.customer_address} readOnly />
            </div>
            <div>
                <label>Customer Mobile</label>
                <input value={claimViewData?.customer_mobile} readOnly />
            </div>
        </div>
    );
}

function CommunicationDetailsSection({ claimViewData , communicationData }) {
    const [data, setData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [remarks, setRemarks] = useState('');

    // console.log('Communication Data from accordion:', communicationData);
    const Department = [
        {key:"1", value:"Admin"},
        {key:"2", value:"Dealer"},
        {key:"3", value:"Manager"},
        {key:"4", value:"Supervisor"},
        {key:"5", value:"Inspection"},
        {key:"6", value:"Quality_Check"},
        {key:"7", value:"Sales_Head"},
        {key:"8", value:"Director"},
        {key:"9", value:"Account"},
        {key:"10", value:"Branch"}
    ];

    const claimStatus = [
        { key: "0", value: "Claim Created" },
        { key: "1", value: "Under Review" },
        { key: "2", value: "Assign To Manager" },
        { key: "3", value: "Rejected By Manager" },
        { key: "4", value: "Assign To Supervision" },
        { key: "5", value: "Rejected By Supervision" },
        { key: "6", value: "Assign To Field Inspector" },
        { key: "7", value: "Rejected By Field Inspector" },
        { key: "8", value: "Assign To Quality Check" },
        { key: "9", value: "Rejected By Quality Check" },
        { key: "10", value: "Assign To Sales Head" },
        { key: "11", value: "Rejected By Sales Head" },
        { key: "12", value: "Assign To Director" },
        { key: "13", value: "Rejected By Director" },
        { key: "14", value: "Assign To Account" },
        { key: "15", value: "Rejected By Account" },
        { key: "16", value: "Pending" },
        { key: "17", value: "Claim Pass" },
        { key: "18", value: "Generated Voucher" }
    ];

    const timeline = Array.isArray(communicationData)
    ? communicationData.map(item => ({
        user: `${item.ns_claimstatus === "0" ? item.s_dealer_name  : item.s_staff_name|| 'Unknown'} - ${item.ns_update_type || 'NA'}`,
        message: item.ns_remarks || ''
    }))
    : [];

    const handleStatusUpdate = () => {
        // TODO: Implement status update logic
        console.log('Status:', selectedStatus);
        console.log('Remarks:', remarks);
    };

    return (
        <div className="communication-details-section">
            <div className="communication-actions-row">
                <input type="file" className="comm-file-input" />
                <select 
                    className="comm-select"
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                >
                    <option value="">Select Status</option>
                    {claimStatus.map(status => (
                        <option key={status.key} value={status.key}>
                            {status.value}
                        </option>
                    ))}
                </select>
                <button 
                    className="comm-assign-btn"
                    onClick={handleStatusUpdate}
                >
                    Assign Claim
                </button>
            </div>
            <div className="comm-remarks-row">
                <label>Remarks</label>
                <textarea 
                    className="comm-remarks-textarea" 
                    rows={3} 
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                />
            </div>
            <div className="comm-timeline">
                {timeline.map((item, idx) => (
                    item.user && (
                        <div className="comm-timeline-row" key={idx}>
                            <div className="comm-timeline-user">
                                <span>{item.user}</span>
                            </div>
                            <div className="comm-timeline-dot-col">
                                <span className="comm-timeline-dot" />
                                {idx !== timeline.length  && <span className="comm-timeline-line" />}
                            </div>
                            <div className="comm-timeline-msg">
                                <div className="comm-timeline-msg-box">{item.message}</div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

function ManagerClaimAccordion({ claimViewData , communicationData , performanceData }) {
    // console.log('communicationData from functtion:', communicationData);
    const [openSection, setOpenSection] = useState('ClaimDetails');
    // console.log('ManagerClaimAccordion Data:', claimViewData?.report_no);
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

    if (!claimViewData) return <div>Loading...</div>;
    if(!communicationData) return <div>Loading Communication Data...</div>;

    return (
        <div className="managerclaim-accordion-list">
            {sections.map((section, idx) => (
                <div
                    className={`managerclaim-accordion-card${openSection === section.key ? ' open' : ''}`}
                    key={section.key}
                >
                    <button
                        className="managerclaim-accordion-header"
                        onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
                        aria-expanded={openSection === section.key}
                    >
                        <span>{section.label}</span>
                        <span className="managerclaim-accordion-arrow">
                            {openSection === section.key ? '▼' : '▶'}
                        </span>
                    </button>
                    <div
                        className="managerclaim-accordion-content"
                        style={{
                            maxHeight: openSection === section.key ? '130vh' : '0',
                            minWidth: openSection === section.key ? '70vw' : '70vw',
                            overflow: 'hidden',
                            padding: openSection === section.key ? '18px 24px' : '0 24px',
                            opacity: openSection === section.key ? 1 : 0,
                            pointerEvents: openSection === section.key ? 'auto' : 'none',
                            transition: 'all 0.35s cubic-bezier(.4,0,.2,1)'
                        }}
                    >
                        {openSection === section.key && renderSectionContent(section.key, claimViewData , communicationData ,performanceData)}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ManagerClaimAccordion;