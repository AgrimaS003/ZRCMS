import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import "./FileComplaint.css";

function FileComplaint() {
    const navigate = useNavigate();
    const [dealerData, setDealerData] = useState([]);
    const [branchData, setBranchData] = useState([]);
    const [predefinedDealerData, setPredefinedDealerData] = useState([]);
    const [predefinedBranchData, setPredefinedBranchData] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedDealer, setSelectedDealer] = useState("");
    const [claimdata, setclaimdata] = useState([]);
    const [invoiceNo, setInvoiceNo] = useState([]);
    const [product, setProduct] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [formData, setFormData] = useState({
        '2022-23': { sales: 49.00, settledClaim: 43.00, outstanding: 0 },
        '2023-24': { sales: 68.00, settledClaim: 47.00, outstanding: 0 },
        '2024-25': { sales: 24.00, settledClaim: 7.00, outstanding: 0 },
        '2025-26': { sales: 46.00, settledClaim: 96.00, outstanding: 0 }
    });
    const financialYears = ['2022-23', '2023-24', '2024-25', '2025-26'];
    const metrics = [
        { key: 'sales', label: 'Sales (Lacs)' },
        { key: 'settledClaim', label: 'Settled Claim' }
    ];
    const failureOptions = [
        "Erosion", "Flux Attack", "Cracks", "Leakages", "Blistering", "Bursting",
        "Dimension", "Design", "Related to Bottom Stand", "No Expansion Gap",
        "Packing", "Blow - Holes", "Glaze Run Off", "Flame Impingement", "Corrosion",
        "Oxidation", "Frozen", "Metal Issue", "Others"
    ];
    const segment = ['SGR', 'CRU', 'CCR', 'TRD', 'MON', 'SCR'];


    

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("currentUser");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const userType = currentUser ? currentUser.s_usertype : null;
        // if (!token || !(userType === "3" || userType === "1")) {
        //     navigate("/Login");
        //     return;
        // }
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
            })
            .catch(err => {
                console.error("Access denied or token invalid", err);
                navigate('/Login');
            });
    }, []);
    useEffect(() => {
        fetch('http://192.168.1.29:5015/dealers')
            .then(res => res.json())
            .then(data => setDealerData(data))
            .catch(err => console.error('Error fetching dealers:', err));
    }, []);
    useEffect(() => {
        fetch('http://192.168.1.29:5015/branches')
            .then(res => res.json())
            .then(data => setBranchData(data))
            .catch(err => console.error('Error fetching branches:', err));
    }, []);
    useEffect(() => {
        fetch('http://192.168.1.29:5015/api/invoices')
            .then(response => response.json())
            .then(data => setInvoices(data))
            .catch(error => console.error("Error fetching invoices:", error));
    }, []);
    useEffect(() => {
        if (dealerData && branchData) {
            const matchedDealer = dealerData.find(
                item => Number(item?.s_dealer_id) === Number(selectedDealer)
            );
            const matchedBranch = branchData.find(
                item => Number(item?.s_branch_id) === Number(selectedBranch)
            );
            // console.log(matchedBranch)
            if (matchedDealer) {
                setForm(prev => ({
                    ...prev,
                    NameofDealerBranch: matchedDealer.s_dealer_name || "",
                    DealerBranchCompanyName: matchedDealer.s_dealer_company || "" // corrected field
                }));
                //   console.log("Matched Dealer:", matchedDealer);
            } else if (matchedBranch) {
                setForm(prev => ({
                    ...prev,
                    NameofDealerBranch: matchedBranch.s_branch_name || "",
                    DealerBranchCompanyName: matchedBranch.s_branch_company || ""
                }));
                //   console.log("Matched Branch:", matchedBranch);
            }
        }
    }, [selectedDealer, selectedBranch, dealerData, branchData]);
    useEffect(() => {
        if (selectedDealer) {
            fetch(`http://192.168.1.29:5015/predefined_data_dealer?dealer_id=${selectedDealer}`)
                .then(res => res.json())
                .then(data => setPredefinedDealerData(data))
                .catch(err => console.error('Error fetching predefined dealer:', err));
        } else if (selectedBranch) {
            fetch(`http://192.168.1.29:5015/predefined_data_branch?branch_id=${selectedBranch}`)
                .then(res => res.json())
                .then(data => setPredefinedBranchData(data))
                .catch(err => console.error('Error fetching predefined branch:', err));
        }
    }, [selectedDealer, selectedBranch]);

    function formatForDateTimeLocal(isoString) {
        const date = new Date(isoString);
        const offset = date.getTimezoneOffset() * 60000;
        const localISO = new Date(date - offset).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
        return localISO;
    }

    const handleOutstandingChange = (year, value) => {
        setFormData(prev => ({
            ...prev,
            [year]: {
                ...prev[year],
                outstanding: parseFloat(value) || 0
            }
        }));
    };
    const handleInputChange = (year, metric, value) => {
        setFormData(prev => ({
            ...prev,
            [year]: {
                ...prev[year],
                [metric]: parseFloat(value) || 0
            }
        }));
    };
    const calculateClaimPercentage = (year) => {
        const data = formData[year];
        if (!data.sales || data.sales === 0) return 0;
        return ((data.settledClaim / data.sales) * 100).toFixed(2);
    };
    const handleReset = () => {
        setFormData({
            '2022-23': { sales: 0, settledClaim: 0, outstanding: 0 },
            '2023-24': { sales: 0, settledClaim: 0, outstanding: 0 },
            '2024-25': { sales: 0, settledClaim: 0, outstanding: 0 },
            '2025-26': { sales: 0, settledClaim: 0, outstanding: 0 }
        });
        setRemarks('');
    };
    const handleDealerChange = (e) => {
        setSelectedDealer(e.target.value);
        setSelectedBranch(null); // ❌ Clear branch
        setPredefinedBranchData({}); // Optional: clear branch data
    };
    const handleBranchChange = (e) => {
        setSelectedBranch(e.target.value);
        setSelectedDealer(null); // ❌ Clear dealer
        setPredefinedDealerData({}); // Optional: clear dealer data
    };
    const [form, setForm] = useState({
        // Section: Customer Details
        ReportID: '',
        Date: '',
        ClaimID: '',
        DealerID: '',
        NameofDealerBranch: branchData?.s_branch_name,
        DealerBranchCompanyName: '',
        customerCompany: '',
        customerName: '',
        customerAddress: '',
        customerMobile: '',

        // Section: Product Details
        segment: '',
        invoiceNo: '',
        invoiceDate: '',
        product: '',
        codeNo: '',
        productBrand: '',
        sapProductCode: '',

        // Section: Crucible Application Details
        application: '',
        fuel: '',
        frequencyType: '',
        frequencyHz: '',
        metal: '',
        scrapType: '',
        fluxesUsed: '',
        fluxQuantity: '',
        workingTemp: '',
        topGlaze: '',
        bottomGlaze: '',
        flameOrientation: '',
        noOfKeyBricks: '',
        bottomSupport: '',
        outputPerCharge: '',
        heatsPerDay: '',
        meltingTime: '',
        operatingHours: '',
        operationType: '',

        // Section: QC Form
        natureOfComplaint: '',
        qcProduct: '',
        qcApplication: '',
        qcCode: '',
        recipe: '',
        stylingMachine: '',
        applicationForProduct: '',
        dateOfMoulding: '',
        greenStageDate: '',
        firedStage: '',
        curingStageDate: '',
        glazeFiredStage: '',
        elFireStage: '',
        elFireStageDate: '',
        overallRemarks: '',
        remarksOnComplaint: '',

        // Section: Inspection Details
        failureReasons: [],
        dealerReport: '',
        zircarEmployeeReport: '',
        zircarPrice: '',
        customerExpectation: '',

        // Section: Product Failure Details
        installationDate: '',
        failedDate: '',
        lifeExpected: '',
        lifeAchieved: '',
        competitorName: '',
        competitorProduct: '',
        competitorProductLife: '',
    });
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;
        if (type === 'datetime-local') {
            const localDate = new Date(value);
            finalValue = localDate.toISOString().replace('.000', ''); // remove milliseconds if needed
        }
        setForm(prev => ({ ...prev, [name]: finalValue }));
    };
    const handleCheckboxChange = (value) => {
        setForm(prev => ({
            ...prev,
            failureReasons: prev.failureReasons.includes(value)
                ? prev.failureReasons.filter(item => item !== value)
                : [...prev.failureReasons, value]
        }));
    };
    const past_sales_performance = financialYears.map((year, index) => {
        const salesData = formData[year];
        return {
            Claim_id: form.ClaimID, // or pass correct claim id if available
            FinancialYear: year,
            Sales: parseFloat(salesData.sales) || 0,
            SettledClaim: parseFloat(salesData.settledClaim) || 0,
            ClaimPercentage: calculateClaimPercentage(year),
            business_review_datetime: new Date().toISOString(),
        };
    });

    let dealer_id = null;
    let dealer_type = null;
    if (selectedDealer) {
        form.DealerID = selectedDealer;
        dealer_type = 'dealer';
    } else if (selectedBranch) {
        form.DealerID = selectedBranch;
        dealer_type = 'branch';
    }
    form.ClaimID = claimdata?.next_claim_id;
    useEffect(() => {
        let updatedId;

        if (predefinedDealerData?.data?.report_id && !predefinedBranchData?.data?.report_id) {
            const originalId = predefinedDealerData.data.report_id; // "U//1"
            // console.log("Original Dealer ID:", originalId);

            const segments = originalId.split('//'); // ["U", "1"]
            const newSegment = form?.segment || "";  // Ensure it's defined
            updatedId = [segments[0], newSegment, segments[1]].join('/');
            // console.log("✅ Final Dealer updatedId:", updatedId);

        } else if (predefinedBranchData?.data?.report_id && !predefinedDealerData?.data?.report_id) {
            const originalId = predefinedBranchData.data.report_id; // "U//1"
            // console.log("Original Branch ID:", originalId);

            const segments = originalId.split('//');
            const newSegment = form?.segment || "";
            updatedId = [segments[0], newSegment, segments[1]].join('/');
            // console.log("✅ Final Branch updatedId:", updatedId);
        }
        const today = new Date().toISOString().split("T")[0];
        if (updatedId) {
            setForm(prev => ({
                ...prev,
                ReportID: updatedId,
                Date: today
            }));
        }

    }, [predefinedDealerData, predefinedBranchData, form?.segment]);
    useEffect(() => {
        fetch(`http://192.168.1.29:5015/fetchclaims?dealer_id=${form.DealerID}`)
            .then(res => res.json())
            .then(data => setclaimdata(data))
            .catch(err => console.err("error fecthing claims in file:", err))
    }, [form.DealerID])
    useEffect(() => {
        if (form.DealerID && form.segment) {
            fetch(`http://192.168.1.29:5015/api/invoiceno?dealerid=${form.DealerID}&segment=${form.segment}`)
                .then(res => res.json())
                .then(data => setInvoiceNo(data))
                .catch(err => console.error("Error fetching invoice no:", err));
        }
    }, [form.DealerID, form.segment]);
    useEffect(() => {
        if (form.invoiceNo && form.invoiceDate) {
            fetch(`http://192.168.1.29:5015/api/product?zircar_invoice_no=${form.invoiceNo}&zircar_invoice_date=${form.invoiceDate}`)
                .then(res => res.json())
                .then(data => setProduct(data))
                .catch(err => console.error("Error fetching product data:", err));
        }
    }, [form.invoiceNo, form.invoiceDate]);
    // console.log(form.ClaimID)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const completeData = {
            report_no: form.ReportID,
            claim_id: form.ClaimID,
            dealer_id: form.DealerID,
            customer_company: form.customerCompany,
            customer_name: form.customerName,
            customer_mobile: form.customerMobile,
            customer_address: form.customerAddress,
            segment: form.segment,
            zircar_invoice_no: form.invoiceNo,
            zircar_invoice_date: form.invoiceDate,
            product_name: form.product,
            dealer_code_no: form.codeNo,
            product_code: form.sapProductCode,
            product_brand: form.productBrand,
            application: form.application,
            fuel: form.fuel,
            working_frequency_type: form.frequencyType,
            working_frequency_hz: parseFloat(form.frequencyHz) || 0,
            metal: form.metal,
            metal_scrap_type: form.scrapType,
            fluxes_used: form.fluxesUsed,
            flux_quantity: parseFloat(form.fluxQuantity) || 0,
            working_temperature: parseFloat(form.workingTemp) || 0,
            top_glaze_formation: form.topGlaze,
            bottom_glaze_formation: form.bottomGlaze,
            flame_orientation: form.flameOrientation,
            key_bricks: form.noOfKeyBricks,
            support_used_at_the_bottom: form.bottomSupport,
            metal_output_per_charges: parseFloat(form.outputPerCharge) || 0,
            heats_per_day: form.heatsPerDay,
            melting_time_per_charge: parseFloat(form.meltingTime) || 0,
            operating_hours_per_day: parseFloat(form.operatingHours) || 0,
            type_of_opertion: form.operationType,
            Installation_date: form.installationDate,
            failed_date: form.failedDate,
            life_expected: form.lifeExpected,
            life_achieved: form.lifeAchieved,
            competitors_name: form.competitorName,
            competitors_product: form.competitorProduct,
            Competitors_Product_Life: form.competitorProductLife,
            failure_reasons: form.failureReasons.join(", "),
            zircar_basic_price: parseFloat(form.zircarPrice) || 0,
            customer_expectations_from_zircar: parseFloat(form.customerExpectation) || 0,
            RemarksOnFutureBusiness: form.remarksOnComplaint,
            complaint_added_datetime: new Date().toISOString(),
            past_sales_performance: past_sales_performance,
            remarks: remarks
        };
        // Now send completeData to backend API
        console.log("Sending Data", completeData);


        try {
            const response = fetch('http://192.168.1.29:5015/add_complaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completeData),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success:', data.status);
        } catch (error) {
            console.error('Error sending data:', error);
        }

    }
    const productFieldOptions = {
        segment:segment.map((item) => ({value: item ,label:item})),
        invoiceNo: invoiceNo.map(inv => ({ value: inv.invoiceNo, label: inv.invoiceNo })),
        invoiceDate: invoiceNo.map(inv => ({ value: inv.invoiceDate, label: new Date(inv.invoiceDate).toLocaleString() })),
        product: product.map(p => ({ value: p.invoiceDate, label: p.product_name })),
        codeNo: product.map(p => ({ value: p.product_code, label: p.product_code })),
        productBrand: product.map(p => ({ value: p.product_brand, label: p.product_brand })),
    };

    return (
        <div className='FileComplaint-layout'>
            <Sidebar />
            <main className='FileComplaint-content'>
                <form className="FileComplaint-form" onSubmit={handleSubmit}>
                    <h1>Register Complaints</h1>
                    {/* Branch and Dealer Dropdown */}
                    <div className="branch-dealer-select-container">
                        <select name="branch" value={selectedBranch} onChange={handleBranchChange} className="styled-select">
                            <option value="">Select Branch</option>
                            {branchData.map((item, index) => (
                                <option key={index} value={item?.s_branch_id}>
                                    {item?.s_branch_name}
                                </option>
                            ))}
                        </select>
                        <select name="dealer" value={selectedDealer} onChange={handleDealerChange} className="styled-select">
                            <option value="">Select Dealer</option>
                            {dealerData.map((item, index) => (
                                <option key={index} value={item?.s_dealer_id}>
                                    {item?.s_dealer_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Reuse Form Fields Section */}
                    {[
                        {
                            title: "Customer Details",
                            fields: [
                                { name: 'customerCompany', label: 'Customer Company Name' },
                                { name: 'customerName', label: 'Customer Name' },
                                { name: 'customerAddress', label: 'Customer Address' },
                                { name: 'customerMobile', label: 'Customer Mobile' },
                            ]
                        },
                        {
                            title: "Product Details",
                            fields: [
                                { name: 'segment', label: 'Segment' },
                                { name: 'invoiceNo', label: `Zircar's Invoice No` },
                                { name: 'invoiceDate', label: `Zircar's Invoice Date`, type: 'datetime-local' },
                                { name: 'product', label: 'Product' },
                                { name: 'codeNo', label: 'Code No.' },
                                { name: 'productBrand', label: 'Product Brand' },
                                { name: 'sapProductCode', label: 'SAP Product Code' },
                            ]
                        },
                        {
                            title: "Crucible Application Details",
                            fields: [
                                { name: 'application', label: 'Application' },
                                { name: 'fuel', label: 'Fuel' },
                                { name: 'frequencyType', label: 'Working Frequency Type' },
                                { name: 'frequencyHz', label: 'Working Frequency (Hz)' },
                                { name: 'metal', label: 'Metal' },
                                { name: 'scrapType', label: 'Metal/Scrap Type' },
                                { name: 'fluxesUsed', label: 'Fluxes Used' },
                                { name: 'fluxQuantity', label: 'Flux Quantity (Kg per Charge)' },
                                { name: 'workingTemp', label: 'Working Temperature (°C)' },
                                { name: 'topGlaze', label: 'Top Glaze Formation' },
                                { name: 'bottomGlaze', label: 'Bottom Glaze Formation' },
                                { name: 'flameOrientation', label: 'Flame Orientation' },
                                { name: 'noOfKeyBricks', label: 'No. of Key Bricks' },
                                { name: 'bottomSupport', label: 'Support Used at the Bottom of the Crucible' },
                                { name: 'outputPerCharge', label: 'Metal Output Per Charge (Kg)' },
                                { name: 'heatsPerDay', label: 'Heats Per Day' },
                                { name: 'meltingTime', label: 'Melting Time Per Charge (hrs.)' },
                                { name: 'operatingHours', label: 'Operating Hours/Day' },
                                { name: 'operationType', label: 'Type of Operation' },
                            ]
                        },
                        {
                            title: "QC Form",
                            fields: [
                                { name: 'natureOfComplaint', label: 'Nature of Complaint' },
                                { name: 'qcProduct', label: 'Product' },
                                { name: 'qcApplication', label: 'Application' },
                                { name: 'qcCode', label: 'Code' },
                                { name: 'recipe', label: 'Recipe' },
                                { name: 'stylingMachine', label: 'Styling Machine' },
                                { name: 'applicationForProduct', label: 'Application (Metal/Fuel)' },
                                { name: 'dateOfMoulding', label: 'Date of Moulding', type: 'date' },
                                { name: 'greenStageDate', label: 'Green Stage Date', type: 'date' },
                                { name: 'firedStage', label: '1st Fired / Curing Stage' },
                                { name: 'curingStageDate', label: 'Curing Stage Date', type: 'date' },
                                { name: 'glazeFiredStage', label: 'Glaze Fired Stage (HT Firing)' },
                                { name: 'elFireStage', label: 'El fire stage (if any)' },
                                { name: 'elFireStageDate', label: 'El fire stage Date', type: 'date' },
                                { name: 'overallRemarks', label: 'Overall Remarks' },
                                { name: 'remarksOnComplaint', label: 'Remarks on Complaint' },
                            ]
                        },
                        {
                            title: "Inspection Details",
                            fields: [
                                { name: 'dealerReport', label: 'Visit Report of Dealer' },
                                { name: 'zircarEmployeeReport', label: 'Visit Report of Zircar Employee' },
                                { name: 'zircarPrice', label: 'Zircar Basic Price (Rs.)' },
                                { name: 'customerExpectation', label: 'Customer Expectations from Zircar' },
                            ]
                        },
                        {
                            title: "Product Failure & Required Details",
                            fields: [
                                { name: 'installationDate', label: 'Installation Date', type: 'datetime-local' },
                                { name: 'failedDate', label: 'Failed Date', type: 'datetime-local' },
                                { name: 'lifeExpected', label: 'Life Expected' },
                                { name: 'lifeAchieved', label: 'Life Achieved' },
                                { name: 'competitorName', label: `Competitor's Name` },
                                { name: 'competitorProduct', label: `Competitor's Product` },
                                { name: 'competitorProductLife', label: `Competitor's Product Life` },
                            ]
                        }
                    ].map(section => (
                        <div key={section.title} className="form-section">
                            <h2 className="section-title">{section.title}</h2>
                            <div className="form-grid">
                                {section.fields.map(({ name, label, type = 'text' }) => (
                                    <div key={name} className="form-group">
                                        <label className="form-label">{label}</label>
                                        {productFieldOptions[name] ? (
                                            <select
                                                name={name}
                                                value={form[name] || ""}
                                                onChange={handleChange}
                                                className="form-input"
                                            >
                                                <option value="" disabled>Select {label}</option>
                                                {productFieldOptions[name].map((opt, idx) => (
                                                    <option key={idx} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={type}
                                                name={name}
                                                value={type === 'datetime-local' && form[name] ? form[name].slice(0, 16) : form[name] || ""}
                                                onChange={handleChange}
                                                className="form-input"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {/* // Checkbox Section */}
                    <div className="checkbox-section">
                        <h2 className="section-title">Failure Reasons (Inspection)</h2>
                        <div className="checkbox-grid">
                            {failureOptions.map(option => (
                                <label key={option} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.failureReasons?.includes(option)}
                                        onChange={() => handleCheckboxChange(option)}
                                    />
                                    <span>{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="header">
                            <h1 className="header-title">
                                Past Sales Performance
                                <div className="header-icon"></div>
                            </h1>
                        </div>
                        <div className="form-content">
                            {/* Table */}
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr className="table-header">
                                            <th className="header-cell">
                                                Financial Year
                                            </th>
                                            {financialYears.map(year => (
                                                <th key={year} className="header-cell year-header">
                                                    {year}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.map((metric, index) => (
                                            <tr key={metric.key} className={`table-row ${index % 2 === 0 ? 'row-even' : 'row-odd'}`}>
                                                <td className="label-cell">
                                                    {metric.label}
                                                </td>
                                                {financialYears.map(year => (
                                                    <td key={`${year}-${metric.key}`} className="input-cell">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData[year][metric.key]}
                                                            onChange={(e) => handleInputChange(year, metric.key, e.target.value)}
                                                            className="data-input"
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {/* Calculated Claim Percentage Row */}
                                        <tr className="calculated-row">
                                            <td className="label-cell">
                                                Claim (%)
                                            </td>
                                            {financialYears.map(year => (
                                                <td key={`${year}-claim`} className="calculated-cell">
                                                    <div className="percentage-display">
                                                        {calculateClaimPercentage(year)}%
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                        {/* Outstanding as on Date Row */}
                                        <tr className="table-row row-even">
                                            <td className="label-cell">
                                                Outstanding as on Date
                                            </td>
                                            {financialYears.map(year => (
                                                <td key={`${year}-outstanding`} className="input-cell">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData[year].outstanding}
                                                        onChange={(e) => handleOutstandingChange(year, e.target.value)}
                                                        className="data-input"
                                                        placeholder="0.00"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {/* Remarks Section */}
                            <div className="remarks-section">
                                <label className="remarks-label">
                                    Remarks on Future Business
                                </label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    rows={4}
                                    className="remarks-textarea"
                                    placeholder="Enter your remarks about future business plans and strategies..."
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="submit-btn">
                        Submit
                    </button>
                </form>
            </main>
        </div>
    );
}

export default FileComplaint;