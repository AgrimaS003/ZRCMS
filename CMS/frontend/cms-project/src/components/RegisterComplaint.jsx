import React, { useState, useEffect, useRef, useContext } from 'react'
import axios from 'axios';
import image1 from '../../../../../frontend/cms-project/src/assets/images/image1.png'
import image2 from '../../../../../frontend/cms-project/src/assets/images/image2.png'
import image3 from '../../../../../frontend/cms-project/src/assets/images/image3.png'
import image4 from '../../../../../frontend/cms-project/src/assets/images/image4.png'
import image5 from '../../../../../frontend/cms-project/src/assets/images/image5.png'
// import Header from "../../../../../frontend/cms-project/src/components/Header.jsx"
import '../../../../../frontend/cms-project/src/components/RegisterComplaint.css';
import { UserContext } from '../../../../../frontend/cms-project/src/components/UserContext.jsx'
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import './RegisterComplaint.css'

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [rawReportId, setRawReportId] = useState('');
  const { usertype } = useParams();
  console.log(usertype);
  const today = new Date().toISOString().split('T')[0];
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const pointImageRef = useRef(null);
  const fullViewImageRef = useRef(null);
  const referenceLocationImageRef = useRef(null);
  const topViewImageRef = useRef(null);
  const bottomViewImageRef = useRef(null);
  const extraImagesRef = useRef(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchInitialDealerData = async () => {
      try {
        if (!user || !user.email) return;

        const response = await axios.post('http://192.168.1.32:5015/predefined_data', {
          dealer_email: user.email,
          usertype: usertype
        });

        const { report_id, dealer_company, dealer_name } = response.data;
        const parts = report_id.split('/');
        const prefix = parts[0];
        const number = parts[2];
        setRawReportId({ prefix, number });

        const initialId = prefix + '//' + number;

        setFormData((prev) => ({
          ...prev,
          dealer_company,
          dealer_name,
          report_id: initialId,
        }));
      } catch (error) {
        console.error("Error fetching dealer data:", error);
      }
    };
    fetchInitialDealerData();
  }, [user]);

  const [formData, setFormData] = useState({
    report_id: '',
    todays_date: today,
    customer_company: '',
    dealer_name: '',
    customer_name: '',
    contact_person_name: '',
    customer_address: '',
    customer_mobile: '',
    segment: '',
    invoice_no: '',
    invoice_date: '',
    product_name: '',
    code_no: '',
    product_brand: '',
    application: '',
    fuel_type: '',
    metal: '',
    metal_scrap_type: '',
    fluxes: '',
    flux_quantity: '',
    working_temperature: '',
    top_glaze: '',
    bottom_glaze: '',
    flame_orientation: '',
    key_bricks: '',
    finished_product: '',
    support_at_bottom: '',
    metal_output: '',
    heats_per_day: '',
    melting_time: '',
    operating_hours: '',
    type_of_operation: '',
    installation: '',
    failed: '',
    life_expected: '',
    life_expected_data: '',
    life_achieved: '',
    life_achieved_data: '',
    competitor_name: '',
    competitor_product: '',
    competitor_product_life: '',
    competitor_product_life_data: '',
    failure_reasons: [],
    inspected_by_dealer: '',
    inspected_by_zircar: '',
    inspector_name: '',
    dealer_report: '',
    zircar_report: '',
    zircar_basic_price: '',
    customer_expectations: '',
    sales_2022_2023: '',
    sales_2023_2024: '',
    sales_2024_2025: '',
    sales_2025_2026: '',
    settled_2022_2023: '',
    settled_2023_2024: '',
    settled_2024_2025: '',
    settled_2025_2026: '',
    claim_2022_2023: '',
    claim_2023_2024: '',
    claim_2024_2025: '',
    claim_2025_2026: '',
    outstanding: '',
    remarks: '',

    point_image: null,
    full_view_image: null,
    reference_location_image: null,
    top_view_image: null,
    bottom_view_image: null,
    extra_images: [],
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "segment") {
      const parts = formData.report_id.split('/');
      const prefix = parts[0] || '';
      const number = parts[2] || '';

      const updatedReportId = `${prefix}/${value}/${number}`;

      setFormData(prev => ({
        ...prev,
        segment: value,
        report_id: updatedReportId,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  //
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;

    setFormData(prev => {
      const updatedFailures = checked
        ? [...prev.failure_reasons, name]
        : prev.failure_reasons.filter(item => item !== name);
      return { ...prev, failure_reasons: updatedFailures };
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "extra_images") {
      // Multiple files
      setFormData(prev => ({
        ...prev,
        [name]: [...files],  // array of files
      }));
    } else {
      // Single file
      setFormData(prev => ({
        ...prev,
        [name]: files[0], // single file
      }));
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFiles = [
      formData.point_image,
      formData.full_view_image,
      formData.reference_location_image,
      formData.top_view_image,
      formData.bottom_view_image,
    ];

    const missingFiles = requiredFiles.some(file => file === null);

    if (missingFiles) {
      alert("Please upload all 5 required images.");
      return;
    }
    // Prepare form data to send (especially files!)
    const submitData = new FormData();

    // Append all keys to FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value instanceof File) {
        submitData.append(key, value);
      } else if (Array.isArray(value)) {
        if (key === "extra_images") {
          value.forEach((file) => submitData.append("extra_images", file));
        } else {
          // for array of failure_reasons
          submitData.append(key, value.join(","));
        }
      } else {
        submitData.append(key, value);
      }
    });
    if (user && user.email) {
      submitData.append("dealer_email", user.email);
    }
    //   console.log(...submitData); 
    fetch(`http://192.168.1.32:5015/${usertype.toLowerCase()}/register_complaint`, {
      method: 'POST',
      body: submitData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Complaint registered successfully!');
          setMessageType('success')
          setTimeout(() => navigate(`/${usertype}/dashboard`), 2000)
          // clear form if needed
          setFormData({
            report_id: data.report_id,
            todays_date: today,
            customer_name: '',
            contact_person_name: '',
            address: '',
            mobileNumber: '',
            segment: '',
            invoice_no: '',
            invoice_date: '',
            product_name: '',
            code_no: '',
            product_brand: '',
            application: '',
            fuel_type: '',
            metal: '',
            metal_scrap_type: '',
            fluxes: '',
            flux_quantity: '',
            working_temperature: '',
            top_glaze: '',
            bottom_glaze: '',
            flame_orientation: '',
            key_bricks: '',
            finished_product: '',
            support_at_bottom: '',
            metal_output: '',
            heats_per_day: '',
            melting_time: '',
            operating_hours: '',
            type_of_operation: '',
            installation: '',
            failed: '',
            life_expected: '',
            life_expected_data: '',
            life_achieved: '',
            life_achieved_data: '',
            competitor_name: '',
            competitor_product: '',
            competitor_product_life: '',
            competitor_product_life_data: '',
            failure_reasons: [],
            inspected_by_dealer: '',
            inspected_by_zircar: '',
            inspector_name: '',
            dealer_report: '',
            zircar_report: '',
            zircar_basic_price: '',
            customer_expectations: '',
            sales_2022_2023: '',
            sales_2023_2024: '',
            sales_2024_2025: '',
            sales_2025_2026: '',
            settled_2022_2023: '',
            settled_2023_2024: '',
            settled_2024_2025: '',
            settled_2025_2026: '',
            claim_2022_2023: '',
            claim_2023_2024: '',
            claim_2024_2025: '',
            claim_2025_2026: '',
            outstanding: '',
            remarks: '',
            point_image: null,
            full_view_image: null,
            reference_location_image: null,
            top_view_image: null,
            bottom_view_image: null,
            extra_images: [],
          });
          if (pointImageRef.current) pointImageRef.current.value = "";
          if (fullViewImageRef.current) fullViewImageRef.current.value = "";
          if (referenceLocationImageRef.current) referenceLocationImageRef.current.value = "";
          if (topViewImageRef.current) topViewImageRef.current.value = "";
          if (bottomViewImageRef.current) bottomViewImageRef.current.value = "";
          if (extraImagesRef.current) extraImagesRef.current.value = "";
        } else {
          setMessage('Failed to register complaint.');
          setMessageType('error');
        }
      })
      .catch(err => {
        console.error(err);
        setMessage('Error while registering complaint.');
        setMessageType('error');
      });
  };

  return (
    <div className='register_complaint register_complaint_layout'>
      {/* <Header /> */}
      <Sidebar />
      <main id='main-id' className='register_complaint_content'>
        <center>
        {/* <div className="registerClass">
          <h2>Register Complaints</h2>
          <h4>Home / Register Complaints</h4>
        </div> */}
          <div className="form-card">
            <form className='complaint-form' onSubmit={handleSubmit}>
              <div className="general">
                <p style={{ 'color': '#012970', textAlign: 'left' }}>Fill the form to Register Complaint</p>
                <h4 style={{ textAlign: "left" }}>A. General Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="report_id">Report ID</label>
                    <input type="text" name='report_id' id="report_id" value={formData.report_id} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="todays_date">Date</label>
                    <input type="date" name="todays_date" id="todays_date" value={today} readOnly />
                  </div>
                </div>
              </div>
              <hr />
              <div className='dealer_details'>
                <h4 style={{ textAlign: "left" }}>B. Dealer/Branch Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company_name">Dealer Company Name</label>
                    <input type="text" name="dealer_company" id="company_name" value={formData.dealer_company} readOnly />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dealer_name">Name of Dealer/Branch</label>
                    <input type="text" name='dealer_name' id="dealer_name" value={formData.dealer_name} readOnly />
                  </div>
                </div>
              </div>
              <hr />
              <div className="customer">
                <h4 style={{ textAlign: "left" }}>C. Customer Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer_company">Customer Company Name</label>
                    <input type="text" name="customer_company" id="customer_company" value={formData.customer_company} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customer_name">Contact Person Name</label>
                    <input type="text" name="customer_name" id="customer_name" value={formData.customer_name} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input type="text" name='address' id="address" value={formData.address} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobileNumber">Customer Mobile No.</label>
                    <input type="tel" name='mobileNumber' id="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              <hr />
              <div className="product">
                <h4 style={{ textAlign: "left" }}>D. Product Details</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="select_segments">Segment</label>
                    <select name="segment" id="segments" value={formData.segment} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="CRU">CRU</option>
                      <option value="CCR">CCR</option>
                      <option value="SGR">SGR</option>
                      <option value="MON">MON</option>
                      <option value="TRD">TRD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="invoice_no">Zircar's Invoice No.</label>
                    <input type="text" name='invoice_no' id="invoice_no" value={formData.invoice_no} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="invoice_date">Invoice Date</label>
                    <input type="date" name='invoice_date' id="invoice_date" value={formData.invoice_date} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product_name">Product</label>
                    <input type="text" name='product_name' id="product_name" value={formData.product_name} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code_no">Code No.</label>
                    <input type="text" name='code_no' id="code_no" value={formData.code_no} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="product_brand">Product Brand</label>
                    <input type="text" name='product_brand' id="product_brand" value={formData.product_brand} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <hr />

              <div className="crucible">
                <h4 style={{ textAlign: "left" }}>E. Crucible Application Details</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="types_application">Application</label>
                    <select name="application" id="types_application" value={formData.application} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="melting">Melting</option>
                      <option value="holding">Holding</option>
                      <option value="melting+holding">Melting + Holding</option>
                      <option value="zno">ZnO</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="types_fuel">Fuel Type</label>
                    <select name="fuel_type" id="types_fuel" value={formData.fuel_type} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="gas">Gas</option>
                      <option value="oil">Oil</option>
                      <option value="electric-resistance">Electric Resistance</option>
                      <option value="induction">Induction</option>
                      <option value="coal">Coal</option>
                      <option value="wooden-pellet">Wooden Pellet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="metals">Metal</label>
                    <select id="metals" name='metal' value={formData.metal} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="aluminium">Aluminium</option>
                      <option value="copper">Copper</option>
                      <option value="brass">Brass</option>
                      <option value="zinc">Zinc</option>
                      <option value="zinc-oxide">Zinc Oxide</option>
                      <option value="gun-metal">Gun Metal</option>
                      <option value="cast-iro ">Cast Iron</option>
                      <option value="bronze">Bronze</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="pmi-zamak">PMI-Zamak</option>
                      <option value="platu">Platu</option>
                      <option value="stainless-steel">Stainless Steel</option>
                      <option value="tin">Tin</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="metal-scrap">Metal/Scrap Type</label>
                    <select className="metal-scrap" name='metal_scrap_type' id="metal-scrap" value={formData.metal_scrap_type} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="ingot">Ingot</option>
                      <option value="dross">Dross</option>
                      <option value="drust">Drust</option>
                      <option value="top-dross">Top Dross</option>
                      <option value="bottom-dross">Bottom Dross</option>
                      <option value="pmi">PMI</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="fluxes">Fluxes Used</label>
                    <input name='fluxes' type="text" id="fluxes" value={formData.fluxes} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="flux-quantity">Flux Quantity (Kg per Charge)</label>
                    <input type="number" name='flux_quantity' id="flux-quantity" value={formData.flux_quantity} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="working-temp">Working Temperature (°C)</label>
                    <input type="number" name='working_temperature' id="working-temp" className="numbers" value={formData.working_temperature} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="top-glaze">Top Glaze Formation</label>
                    <select id="top-glaze" name='top_glaze' value={formData.top_glaze} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bottom-glaze">Bottom Glaze Formation</label>
                    <select id="bottom-glaze" name="bottom_glaze" value={formData.bottom_glaze} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="flame">Flame Orientation</label>
                    <select name='flame_orientation' id="flame" value={formData.flame_orientation} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="yes">Impingement</option>
                      <option value="no">Tangential</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="key-bricks">No. of Key Bricks</label>
                    <select id="key-bricks" name='key_bricks' value={formData.key_bricks} onChange={handleChange} required>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="more">More</option>
                      <option value="na">NA</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="finished-product">Finished Product</label>
                    <input type="text" id="finished-product" name='finished_product' value={formData.finished_product} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="support-at-bottom">Support at Bottom of Crucible</label>
                    <select id="support-at-bottom" name='support_at_bottom' value={formData.support_at_bottom} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="stand">Stand</option>
                      <option value="brick">Brick</option>
                      <option value="other">Other</option>
                      <option value="not-used">Not Used</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="metal-output">Metal Output Per Charge (Kg)</label>
                    <input type="number" name='metal_output' id="metal-output" className="numbers" value={formData.metal_output} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="heats">Heats Per Day</label>
                    <input type="number" name='heats_per_day' id="heats" className="numbers" value={formData.heats_per_day} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="melting-time">Melting Time Per Charge (hrs.)</label>
                    <input type="number" name='melting_time' id="melting-time" className="numbers" value={formData.melting_time} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="operating-hours">Operating Hours/Day</label>
                    <input type="number" name='operating_hours' id="operating-hours" className="numbers" value={formData.operating_hours} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="types">Type of Operation</label>
                    <select id="types" name='type_of_operation' value={formData.type_of_operation} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="continuous">Continuous</option>
                      <option value="batch">Batch</option>
                    </select>
                  </div>
                </div>
              </div>
              <hr />

              <div className="product-failure">
                <h4 style={{ textAlign: "left" }}>F. Product Failure & Required Details</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="installation">Installation Date</label>
                    <input type="date" name='installation' id="installation" value={formData.installation} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="failed">Failed Date</label>
                    <input type="date" name='failed' id="failed" value={formData.failed} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="life-expected">Life Expected</label>
                    <select id="life-expected" name='life_expected' value={formData.life_expected} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="days">Days</option>
                      <option value="tons">Tons</option>
                      <option value="heats">Heats</option>
                    </select>
                    <input type="number" name='life_expected_data' id="life_expected_data" value={formData.life_expected_data} onChange={handleChange} placeholder="Enter Number" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="life-achieved">Life Achieved</label>
                    <select id="life-achieved" name='life_achieved' value={formData.life_achieved} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="days">Days</option>
                      <option value="tons">Tons</option>
                      <option value="heats">Heats</option>
                    </select>
                    <input type="number" name='life_achieved_data' id="life_achieved_data" value={formData.life_achieved_data} onChange={handleChange} placeholder="Enter Number" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="competitor-name">Competitor's Name</label>
                    <input type="text" name='competitor_name' id="competitor_name" value={formData.competitor_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="competitor-product">Competitor's Product</label>
                    <input type="text" name='competitor_product' id="competitor_product" value={formData.competitor_product} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="product-life">Competitor's Product Life</label>
                    <select id="product-life" name='competitor_product_life' className='one-two-in-line' value={formData.competitor_product_life} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="days">Days</option>
                      <option value="tons">Tons</option>
                      <option value="heats">Heats</option>
                    </select>
                    <input type="number" name='competitor_product_life_data' id="competitor_product_life_data" className='one-two-in-line' value={formData.competitor_product_life_data} onChange={handleChange} placeholder="Enter Number" required />
                  </div>
                </div>
              </div>

              <hr />
              <div className="inspection">
                <h4 style={{ textAlign: "left" }}>G. Inspection Details</h4>

                <p id="failure-reasons" style={{ textAlign: 'left' }}>Failure Reasons (Based on observation)</p>
                <div className="checkbox-grid">
                  <label><input type="checkbox" name="erosion" checked={formData.failure_reasons.includes("erosion")} onChange={handleCheckboxChange} />Erosion</label>
                  <label><input type="checkbox" name="flux-attack" checked={formData.failure_reasons.includes("flux-attack")} onChange={handleCheckboxChange} /> Flux Attack</label>
                  <label><input type="checkbox" name="cracks" checked={formData.failure_reasons.includes("cracks")} onChange={handleCheckboxChange} /> Cracks</label>
                  <label><input type="checkbox" name="leakages" checked={formData.failure_reasons.includes("leakages")} onChange={handleCheckboxChange} /> Leakages</label>
                  <label><input type="checkbox" name="blistering" checked={formData.failure_reasons.includes("blistering")} onChange={handleCheckboxChange} /> Blistering</label>
                  <label><input type="checkbox" name="bursting" checked={formData.failure_reasons.includes("bursting")} onChange={handleCheckboxChange} /> Bursting</label>
                  <label><input type="checkbox" name="dimension" checked={formData.failure_reasons.includes("dimension")} onChange={handleCheckboxChange} /> Dimension</label>
                  <label><input type="checkbox" name="design" checked={formData.failure_reasons.includes("design")} onChange={handleCheckboxChange} /> Design</label>
                  <label><input type="checkbox" name="bottom-stand" checked={formData.failure_reasons.includes("bottom-stand")} onChange={handleCheckboxChange} /> Related to Bottom Stand</label>
                  <label><input type="checkbox" name="expansion-gap" checked={formData.failure_reasons.includes("expansion-gap")} onChange={handleCheckboxChange} /> No Expansion Gap</label>
                  <label><input type="checkbox" name="packing" checked={formData.failure_reasons.includes("packing")} onChange={handleCheckboxChange} /> Packing</label>
                  <label><input type="checkbox" name="blow-holes" checked={formData.failure_reasons.includes("blow-holes")} onChange={handleCheckboxChange} /> Blow-Holes</label>
                  <label><input type="checkbox" name="glaze-run" checked={formData.failure_reasons.includes("glaze-run")} onChange={handleCheckboxChange} /> Glaze Run Off</label>
                  <label><input type="checkbox" name="flame" checked={formData.failure_reasons.includes("flame")} onChange={handleCheckboxChange} /> Flame</label>
                  <label><input type="checkbox" name="impingement" checked={formData.failure_reasons.includes("impingement")} onChange={handleCheckboxChange} /> Impingement</label>
                  <label><input type="checkbox" name="corrosion" checked={formData.failure_reasons.includes("corrosion")} onChange={handleCheckboxChange} /> Corrosion</label>
                  <label><input type="checkbox" name="oxidation" checked={formData.failure_reasons.includes("oxidation")} onChange={handleCheckboxChange} /> Oxidation</label>
                  <label><input type="checkbox" name="frozen" checked={formData.failure_reasons.includes("frozen")} onChange={handleCheckboxChange} /> Frozen</label>
                  <label><input type="checkbox" name="metal-issue" checked={formData.failure_reasons.includes("metal-issue")} onChange={handleCheckboxChange} /> Metal Issue</label>
                  <label><input type="checkbox" name="others" checked={formData.failure_reasons.includes("others")} onChange={handleCheckboxChange} /> Others</label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Whether Inspected by Dealer</label>
                    <select id="inspected_by_dealer" name="inspected_by_dealer" value={formData.inspected_by_dealer} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Whether Inspected by Zircar</label>
                    <select id="inspected_by_zircar" name="inspected_by_zircar" value={formData.inspected_by_zircar} onChange={handleChange} required>
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Name of Inspector</label>
                    <input type="text" id="inspector_name" name='inspector_name' value={formData.inspector_name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Visit Report of Dealer</label>
                    <input type="text" id="dealer_report" name="dealer_report" value={formData.dealer_report} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Report of Zircar Employee</label>
                    <input type="text" id="zircar_report" name="zircar_report" value={formData.zircar_report} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Zircar Basic Price (Rs.)</label>
                    <input type="number" id="zircar_basic_price" name="zircar_basic_price" value={formData.zircar_basic_price} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Expectations from Zircar in (%)</label>
                    <input type="number" id="customer_expectations" name="customer_expectations" value={formData.customer_expectations} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <hr />
              <div className="attachments">
                <h4 style={{ textAlign: "left" }}>H. Attachments</h4>
                <p style={{ textAlign: 'left' }}>Defective Crucible Images</p>

                <div className="attachment-row three-per-row">
                  <div className="attachment-group">
                    <label htmlFor='point_image'>Point The Problem</label>
                    <input type="file" id="point_image" name="point_image" onChange={handleFileChange} ref={pointImageRef} required />
                    <img src={image1} alt="Point Problem" style={{ width: '160px', marginLeft: '60px' }} className="attachment-img" />
                  </div>

                  <div className="attachment-group">
                    <label htmlFor='full_view_image'>Full View of Problematic Crucible</label>
                    <input type="file" id="full_view_image" name="full_view_image" onChange={handleFileChange} ref={fullViewImageRef} required />
                    <img src={image2} alt="Full View" style={{ width: '160px', marginLeft: '60px' }} className="attachment-img" />
                  </div>

                  <div className="attachment-group">
                    <label htmlFor='reference_location_image'>Crucible with Reference of Location</label>
                    <input type="file" id="reference_location_image" name="reference_location_image" onChange={handleFileChange} ref={referenceLocationImageRef} required />
                    <img src={image3} alt="Reference Location" style={{ width: '160px', marginLeft: '60px' }} className="attachment-img" />
                  </div>
                </div>

                <div className="attachment-row two-per-row">
                  <div className="attachment-group">
                    <label htmlFor='top_view_image'>Top View</label>
                    <input type="file" id="top_view_image" name="top_view_image" onChange={handleFileChange} ref={topViewImageRef} required />
                    <img src={image4} alt="Top View" style={{ width: '160px', marginLeft: '50px' }} className="attachment-img" />
                  </div>

                  <div className="attachment-group">
                    <label htmlFor='bottom_view_image'>Bottom View</label>
                    <input type="file" id="bottom_view_image" name="bottom_view_image" onChange={handleFileChange} ref={bottomViewImageRef} required />
                    <img src={image5} style={{ width: '160px', marginLeft: '60px' }} alt="Bottom View" className="attachment-img" />
                  </div>
                </div>

                <p style={{ textAlign: 'left' }}>
                  <b>Note: </b>Minimum 5 Images According to instructions mentioned in Annexure-A Photo Guidelines. Please Download it From "Download Forms" Section.
                </p>

                <div className="attachment-row one-per-row">
                  <div className="attachment-group">
                    <label>Other Attachments (if any)</label>
                    <input type="file" id="extra_images" name="extra_images" multiple onChange={handleFileChange} ref={extraImagesRef} />
                  </div>
                </div>
              </div>

              <hr />
              <div className="past-sales-performance">
                <h4 style={{ textAlign: "left" }}>J. Past Sales Performance</h4>
                <div className="sales-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Financial Year</th>
                        <th>2022-2023</th>
                        <th>2023-2024</th>
                        <th>2024-2025</th>
                        <th>2025-2026</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Sales (Lacs)</td>
                        <td><input type="number" id="sales_2022_2023" name="sales_2022_2023" value={formData.sales_2022_2023} onChange={handleChange} /></td>
                        <td><input type="number" id="sales_2023_2024" name="sales_2023_2024" value={formData.sales_2023_2024} onChange={handleChange} /></td>
                        <td><input type="number" id="sales_2024_2025" name="sales_2024_2025" value={formData.sales_2024_2025} onChange={handleChange} /></td>
                        <td><input type="number" id="sales_2025_2026" name="sales_2025_2026" value={formData.sales_2025_2026} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td>Settled Claim (Lacs)</td>
                        <td><input type="number" id="settled_2022_2023" name="settled_2022_2023" value={formData.settled_2022_2023} onChange={handleChange} /></td>
                        <td><input type="number" id="settled_2023_2024" name="settled_2023_2024" value={formData.settled_2023_2024} onChange={handleChange} /></td>
                        <td><input type="number" id="settled_2024_2025" name="settled_2024_2025" value={formData.settled_2024_2025} onChange={handleChange} /></td>
                        <td><input type="number" id="settled_2025_2026" name="settled_2025_2026" value={formData.settled_2025_2026} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td>Claim (%)</td>
                        <td><input type="number" id="claim_2022_2023" name="claim_2022_2023" value={formData.claim_2022_2023} onChange={handleChange} /></td>
                        <td><input type="number" id="claim_2023_2024" name="claim_2023_2024" value={formData.claim_2023_2024} onChange={handleChange} /></td>
                        <td><input type="number" id="claim_2024_2025" name="claim_2024_2025" value={formData.claim_2024_2025} onChange={handleChange} /></td>
                        <td><input type="number" id="claim_2025_2026" name="claim_2025_2026" value={formData.claim_2025_2026} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td>Outstanding as on Date</td>
                        <td colSpan={4}><input type="text" id="outstanding" name="outstanding" value={formData.outstanding} onChange={handleChange} /></td>
                      </tr>
                      <tr>
                        <td>Remarks on Future Business</td>
                        <td colSpan={4}><input type="text" id="remarks" name='remarks' value={formData.remarks} onChange={handleChange} /></td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>

              <button id='complaint-submit-button' type="submit">Submit Form</button>
            </form>
            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}
          </div>
        </center>
      </main>
      {/* <p className='footer'><b>@ Zircar Refactories.</b> All rights Reserved</p> */}
    </div>
  );
}

export default RegisterComplaint








// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Sidebar from './Sidebar';
// import "./FileComplaint.css";

// function FileComplaint() {
//   const navigate = useNavigate();
//   const [dealerData, setDealerData] = useState([]);
//   const [branchData, setBranchData] = useState([]);
//   const [predefinedDealerData, setPredefinedDealerData] = useState([]);
//   const [predefinedBranchData, setPredefinedBranchData] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   // const [selectedBranch, setSelectedBranch] = useState("");
//   // const [selectedDealer, setSelectedDealer] = useState("");
//   const [claimdata, setclaimdata] = useState([]);
//   const [invoiceNo, setInvoiceNo] = useState([]);
//   const [product, setProduct] = useState([]);
//   const [remarks, setRemarks] = useState('');
//   const [formData, setFormData] = useState({
//     '2022-23': { sales: 49.00, settledClaim: 43.00, outstanding: 0 },
//     '2023-24': { sales: 68.00, settledClaim: 47.00, outstanding: 0 },
//     '2024-25': { sales: 24.00, settledClaim: 7.00, outstanding: 0 },
//     '2025-26': { sales: 46.00, settledClaim: 96.00, outstanding: 0 }
//   });
//   const financialYears = ['2022-23', '2023-24', '2024-25', '2025-26'];
//   const metrics = [
//     { key: 'sales', label: 'Sales (Lacs)' },
//     { key: 'settledClaim', label: 'Settled Claim' }
//   ];
//   const failureOptions = [
//     "Erosion", "Flux Attack", "Cracks", "Leakages", "Blistering", "Bursting",
//     "Dimension", "Design", "Related to Bottom Stand", "No Expansion Gap",
//     "Packing", "Blow - Holes", "Glaze Run Off", "Flame Impingement", "Corrosion",
//     "Oxidation", "Frozen", "Metal Issue", "Others"
//   ];
//   const segment = ['SGR', 'CRU', 'CCR', 'TRD', 'MON', 'SCR'];


//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedUser = localStorage.getItem("currentUser");
//     const currentUser = storedUser ? JSON.parse(storedUser) : null;
//     const userType = currentUser ? currentUser.s_usertype : null;
//     // console.log(currentUser);

//     // if (!token || !(userType === "3" || userType === "1")) {
//     //     navigate("/Login");
//     //     return;
//     // }
//     fetch("http://192.168.1.29:5015/protected", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Unauthorized");
//         return res.json();
//       })
//       .then(data => {
//         console.log("Protected data:", data);
//       })
//       .catch(err => {
//         console.error("Access denied or token invalid", err);
//         navigate('/Login');
//       });
//   }, []);
//   useEffect(() => {
//     fetch('http://192.168.1.29:5015/dealers')
//       .then(res => res.json())
//       .then(data => setDealerData(data))
//       .catch(err => console.error('Error fetching dealers:', err));
//   }, []);
//   // useEffect(() => {
//   //   fetch('http://192.168.1.29:5015/branches')
//   //     .then(res => res.json())
//   //     .then(data => setBranchData(data))
//   //     .catch(err => console.error('Error fetching branches:', err));
//   // }, []);
//   useEffect(() => {
//     fetch('http://192.168.1.29:5015/api/invoices')
//       .then(response => response.json())
//       .then(data => setInvoices(data))
//       .catch(error => console.error("Error fetching invoices:", error));
//   }, []);
//   const token = localStorage.getItem("token");
//   const storedUser = localStorage.getItem("currentUser");
//   const currentUser = storedUser ? JSON.parse(storedUser) : null;

//   const originalId = currentUser?.s_user_id;

//   const correctedUserId = originalId ? Number(String(originalId).slice(1)) : null;

//   // console.log("Corrected User ID:", correctedUserId);
//   useEffect(() => {
// //here we have to add email instead of id because in user table and dealer table id is does not match so first 
// //we find id from dealer table using email we pass through below api and after that same procedure 
//     if (currentUser) {
//       fetch(`http://192.168.1.29:5015/predefined_data_dealer?dealer_id=${correctedUserId}`)
//         .then(res => res.json())
//         .then(data => setPredefinedDealerData(data))
//         .catch(err => console.error('Error fetching predefined dealer:', err));
//       console.log(predefinedDealerData)
//     }
//   }, [correctedUserId])
//   //   } else if (selectedBranch) {
//   //     fetch(`http://192.168.1.29:5015/predefined_data_branch?branch_id=${selectedBranch}`)
//   //       .then(res => res.json())
//   //       .then(data => setPredefinedBranchData(data))
//   //       .catch(err => console.error('Error fetching predefined branch:', err));
//   //   }
//   // }, [selectedDealer, selectedBranch]);

//   function formatForDateTimeLocal(isoString) {
//     const date = new Date(isoString);
//     const offset = date.getTimezoneOffset() * 60000;
//     const localISO = new Date(date - offset).toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
//     return localISO;
//   }

//   const handleOutstandingChange = (year, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [year]: {
//         ...prev[year],
//         outstanding: parseFloat(value) || 0
//       }
//     }));
//   };
//   const handleInputChange = (year, metric, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [year]: {
//         ...prev[year],
//         [metric]: parseFloat(value) || 0
//       }
//     }));
//   };
//   const calculateClaimPercentage = (year) => {
//     const data = formData[year];
//     if (!data.sales || data.sales === 0) return 0;
//     return ((data.settledClaim / data.sales) * 100).toFixed(2);
//   };
//   const handleReset = () => {
//     setFormData({
//       '2022-23': { sales: 0, settledClaim: 0, outstanding: 0 },
//       '2023-24': { sales: 0, settledClaim: 0, outstanding: 0 },
//       '2024-25': { sales: 0, settledClaim: 0, outstanding: 0 },
//       '2025-26': { sales: 0, settledClaim: 0, outstanding: 0 }
//     });
//     setRemarks('');
//   };
//   const [form, setForm] = useState({
//     // Section: Customer Details
//     ReportID: '',
//     Date: '',
//     ClaimID: '',
//     DealerID: '',
//     NameofDealerBranch: '',
//     DealerBranchCompanyName: '',
//     customerCompany: '',
//     customerName: '',
//     customerAddress: '',
//     customerMobile: '',

//     // Section: Product Details
//     segment: '',
//     invoiceNo: '',
//     invoiceDate: '',
//     product: '',
//     codeNo: '',
//     productBrand: '',
//     sapProductCode: '',

//     // Section: Crucible Application Details
//     application: '',
//     fuel: '',
//     frequencyType: '',
//     frequencyHz: '',
//     metal: '',
//     scrapType: '',
//     fluxesUsed: '',
//     fluxQuantity: '',
//     workingTemp: '',
//     topGlaze: '',
//     bottomGlaze: '',
//     flameOrientation: '',
//     noOfKeyBricks: '',
//     bottomSupport: '',
//     outputPerCharge: '',
//     heatsPerDay: '',
//     meltingTime: '',
//     operatingHours: '',
//     operationType: '',

//     // Section: QC Form
//     natureOfComplaint: '',
//     qcProduct: '',
//     qcApplication: '',
//     qcCode: '',
//     recipe: '',
//     stylingMachine: '',
//     applicationForProduct: '',
//     dateOfMoulding: '',
//     greenStageDate: '',
//     firedStage: '',
//     curingStageDate: '',
//     glazeFiredStage: '',
//     elFireStage: '',
//     elFireStageDate: '',
//     overallRemarks: '',
//     remarksOnComplaint: '',

//     // Section: Inspection Details
//     failureReasons: [],
//     dealerReport: '',
//     zircarEmployeeReport: '',
//     zircarPrice: '',
//     customerExpectation: '',

//     // Section: Product Failure Details
//     installationDate: '',
//     failedDate: '',
//     lifeExpected: '',
//     lifeAchieved: '',
//     competitorName: '',
//     competitorProduct: '',
//     competitorProductLife: '',
//   });
//   // console.log(form)
//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     let finalValue = value;
//     if (type === 'datetime-local') {
//       const localDate = new Date(value);
//       finalValue = localDate.toISOString().replace('.000', ''); // remove milliseconds if needed
//     }
//     setForm(prev => ({ ...prev, [name]: finalValue }));
//   };
//   const handleCheckboxChange = (value) => {
//     setForm(prev => ({
//       ...prev,
//       failureReasons: prev.failureReasons.includes(value)
//         ? prev.failureReasons.filter(item => item !== value)
//         : [...prev.failureReasons, value]
//     }));
//   };
//   const past_sales_performance = financialYears.map((year, index) => {
//     const salesData = formData[year];
//     return {
//       Claim_id: form.ClaimID, // or pass correct claim id if available
//       FinancialYear: year,
//       Sales: parseFloat(salesData.sales) || 0,
//       SettledClaim: parseFloat(salesData.settledClaim) || 0,
//       ClaimPercentage: calculateClaimPercentage(year),
//       business_review_datetime: new Date().toISOString(),
//     };
//   });

//  useEffect(() => {
//   if (
//     currentUser &&
//     predefinedDealerData?.data?.report_id ||
//     form?.segment
//   ) {
//     const originalId = predefinedDealerData.data.report_id;
//     const segments = originalId.split('//');

//     if (segments.length === 2) {
//       const newUpdatedId = [segments[0], form.segment, segments[1]].join('/');

//       // Prevent infinite loop by checking if values already match
//       if (form.ReportID !== newUpdatedId) {
//         const today = new Date().toISOString().split("T")[0];

//         setForm(prev => ({
//           ...prev,
//           ReportID: newUpdatedId,
//           NameofDealerBranch: predefinedDealerData?.data?.dealer_name,
//           DealerBranchCompanyName: predefinedDealerData?.data?.dealer_company,
//           Date: today
//         }));
//       }
//     } else {
//       console.warn("❌ Unexpected report_id format:", originalId);
//     }
//   }
// }, [
//   predefinedDealerData?.data?.report_id,
//   form?.segment,
//   currentUser,
//   form?.ReportID // also track this so we can guard against redundant updates
// ]);

//   useEffect(() => {
//     fetch(`http://192.168.1.29:5015/fetchclaims?dealer_id=${form.DealerID}`)
//       .then(res => res.json())
//       .then(data => setclaimdata(data))
//       .catch(err => console.err("error fecthing claims in file:", err))
//   }, [form.DealerID])
//   useEffect(() => {
//     if (form.DealerID && form.segment) {
//       fetch(`http://192.168.1.29:5015/api/invoiceno?dealerid=${form.DealerID}&segment=${form.segment}`)
//         .then(res => res.json())
//         .then(data => setInvoiceNo(data))
//         .catch(err => console.error("Error fetching invoice no:", err));
//     }
//   }, [form.DealerID, form.segment]);
//   useEffect(() => {
//     if (form.invoiceNo && form.invoiceDate) {
//       fetch(`http://192.168.1.29:5015/api/product?zircar_invoice_no=${form.invoiceNo}&zircar_invoice_date=${form.invoiceDate}`)
//         .then(res => res.json())
//         .then(data => setProduct(data))
//         .catch(err => console.error("Error fetching product data:", err));
//     }
//   }, [form.invoiceNo, form.invoiceDate]);
//   // console.log(form.ClaimID)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const completeData = {
//       report_no: form.ReportID,
//       claim_id: form.ClaimID,
//       NameofDealerBranch: form.NameofDealerBranch,
//       DealerBranchCompanyName: form.DealerBranchCompanyName,
//       dealer_id: form.DealerID,
//       customer_company: form.customerCompany,
//       customer_name: form.customerName,
//       customer_mobile: form.customerMobile,
//       customer_address: form.customerAddress,
//       segment: form.segment,
//       zircar_invoice_no: form.invoiceNo,
//       zircar_invoice_date: form.invoiceDate,
//       product_name: form.product,
//       dealer_code_no: form.codeNo,
//       product_code: form.sapProductCode,
//       product_brand: form.productBrand,
//       application: form.application,
//       fuel: form.fuel,
//       working_frequency_type: form.frequencyType,
//       working_frequency_hz: parseFloat(form.frequencyHz) || 0,
//       metal: form.metal,
//       metal_scrap_type: form.scrapType,
//       fluxes_used: form.fluxesUsed,
//       flux_quantity: parseFloat(form.fluxQuantity) || 0,
//       working_temperature: parseFloat(form.workingTemp) || 0,
//       top_glaze_formation: form.topGlaze,
//       bottom_glaze_formation: form.bottomGlaze,
//       flame_orientation: form.flameOrientation,
//       key_bricks: form.noOfKeyBricks,
//       support_used_at_the_bottom: form.bottomSupport,
//       metal_output_per_charges: parseFloat(form.outputPerCharge) || 0,
//       heats_per_day: form.heatsPerDay,
//       melting_time_per_charge: parseFloat(form.meltingTime) || 0,
//       operating_hours_per_day: parseFloat(form.operatingHours) || 0,
//       type_of_opertion: form.operationType,
//       Installation_date: form.installationDate,
//       failed_date: form.failedDate,
//       life_expected: form.lifeExpected,
//       life_achieved: form.lifeAchieved,
//       competitors_name: form.competitorName,
//       competitors_product: form.competitorProduct,
//       Competitors_Product_Life: form.competitorProductLife,
//       failure_reasons: form.failureReasons.join(", "),
//       zircar_basic_price: parseFloat(form.zircarPrice) || 0,
//       customer_expectations_from_zircar: parseFloat(form.customerExpectation) || 0,
//       RemarksOnFutureBusiness: form.remarksOnComplaint,
//       complaint_added_datetime: new Date().toISOString(),
//       past_sales_performance: past_sales_performance,
//       remarks: remarks
//     };
//     // Now send completeData to backend API
//     console.log("Sending Data", completeData);


//     try {
//       const response = fetch('http://192.168.1.29:5015/add_complaint', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(completeData),
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log('Success:', data.status);
//     } catch (error) {
//       console.error('Error sending data:', error);
//     }

//   }
//   const productFieldOptions = {
//     segment: segment.map((item) => ({ value: item, label: item })),
//     invoiceNo: invoiceNo.map(inv => ({ value: inv.invoiceNo, label: inv.invoiceNo })),
//     invoiceDate: invoiceNo.map(inv => ({ value: inv.invoiceDate, label: new Date(inv.invoiceDate).toLocaleString() })),
//     product: product.map(p => ({ value: p.invoiceDate, label: p.product_name })),
//     codeNo: product.map(p => ({ value: p.product_code, label: p.product_code })),
//     productBrand: product.map(p => ({ value: p.product_brand, label: p.product_brand })),
//   };

//   return (
//     <div className='FileComplaint-layout'>
//       <Sidebar />
//       <main className='FileComplaint-content'>
//         <form className="FileComplaint-form" onSubmit={handleSubmit}>
//           <h1>Register Complaints</h1>
//           {/* Reuse Form Fields Section */}
//           {[
//             {
//               title: "General Details",
//               fields: [
//                 { name: 'ReportID', label: 'Report ID', },
//                 { name: 'Date', label: 'Date', type: 'date' },
//               ]
//             },
//             {
//               title: "Dealer/Branch Details",
//               fields: [
//                 { name: 'DealerBranchCompanyName', label: 'Dealer Company Name' },
//                 { name: 'NameofDealerBranch', label: 'Name of Dealer/Branch' },
//               ]
//             },
//             {
//               title: "Customer Details",
//               fields: [
//                 { name: 'customerCompany', label: 'Customer Company Name' },
//                 { name: 'customerName', label: 'Customer Name' },
//                 { name: 'customerAddress', label: 'Customer Address' },
//                 { name: 'customerMobile', label: 'Customer Mobile' },
//               ]
//             },
//             {
//               title: "Product Details",
//               fields: [
//                 { name: 'segment', label: 'Segment' },
//                 { name: 'invoiceNo', label: `Zircar's Invoice No` },
//                 { name: 'invoiceDate', label: `Zircar's Invoice Date`, type: 'datetime-local' },
//                 { name: 'product', label: 'Product' },
//                 { name: 'codeNo', label: 'Code No.' },
//                 { name: 'productBrand', label: 'Product Brand' },
//                 { name: 'sapProductCode', label: 'SAP Product Code' },
//               ]
//             },
//             {
//               title: "Crucible Application Details",
//               fields: [
//                 { name: 'application', label: 'Application' },
//                 { name: 'fuel', label: 'Fuel' },
//                 { name: 'frequencyType', label: 'Working Frequency Type' },
//                 { name: 'frequencyHz', label: 'Working Frequency (Hz)' },
//                 { name: 'metal', label: 'Metal' },
//                 { name: 'scrapType', label: 'Metal/Scrap Type' },
//                 { name: 'fluxesUsed', label: 'Fluxes Used' },
//                 { name: 'fluxQuantity', label: 'Flux Quantity (Kg per Charge)' },
//                 { name: 'workingTemp', label: 'Working Temperature (°C)' },
//                 { name: 'topGlaze', label: 'Top Glaze Formation' },
//                 { name: 'bottomGlaze', label: 'Bottom Glaze Formation' },
//                 { name: 'flameOrientation', label: 'Flame Orientation' },
//                 { name: 'noOfKeyBricks', label: 'No. of Key Bricks' },
//                 { name: 'bottomSupport', label: 'Support Used at the Bottom of the Crucible' },
//                 { name: 'outputPerCharge', label: 'Metal Output Per Charge (Kg)' },
//                 { name: 'heatsPerDay', label: 'Heats Per Day' },
//                 { name: 'meltingTime', label: 'Melting Time Per Charge (hrs.)' },
//                 { name: 'operatingHours', label: 'Operating Hours/Day' },
//                 { name: 'operationType', label: 'Type of Operation' },
//               ]
//             },
//             {
//               title: "QC Form",
//               fields: [
//                 { name: 'natureOfComplaint', label: 'Nature of Complaint' },
//                 { name: 'qcProduct', label: 'Product' },
//                 { name: 'qcApplication', label: 'Application' },
//                 { name: 'qcCode', label: 'Code' },
//                 { name: 'recipe', label: 'Recipe' },
//                 { name: 'stylingMachine', label: 'Styling Machine' },
//                 { name: 'applicationForProduct', label: 'Application (Metal/Fuel)' },
//                 { name: 'dateOfMoulding', label: 'Date of Moulding', type: 'date' },
//                 { name: 'greenStageDate', label: 'Green Stage Date', type: 'date' },
//                 { name: 'firedStage', label: '1st Fired / Curing Stage' },
//                 { name: 'curingStageDate', label: 'Curing Stage Date', type: 'date' },
//                 { name: 'glazeFiredStage', label: 'Glaze Fired Stage (HT Firing)' },
//                 { name: 'elFireStage', label: 'El fire stage (if any)' },
//                 { name: 'elFireStageDate', label: 'El fire stage Date', type: 'date' },
//                 { name: 'overallRemarks', label: 'Overall Remarks' },
//                 { name: 'remarksOnComplaint', label: 'Remarks on Complaint' },
//               ]
//             },
//             {
//               title: "Attachments",
//               fields: [
//                 { name: 'PointTheProblem', label: 'Point The Problem', type: 'file' },
//                 { name: 'FullViewofProblematicCrucible', label: 'Full View of Problematic Crucible', type: 'file' },
//                 { name: 'CruciblewithReferenceofLocation', label: 'Crucible with Reference of Location', type: 'file' },
//                 { name: 'TopView', label: 'Top View', type: 'file' },
//                 { name: 'BottomView', label: 'Bottom View', type: 'file' },
//               ]
//             },
//             {
//               title: "Inspection Details",
//               fields: [
//                 { name: 'dealerReport', label: 'Visit Report of Dealer' },
//                 { name: 'zircarEmployeeReport', label: 'Visit Report of Zircar Employee' },
//                 { name: 'zircarPrice', label: 'Zircar Basic Price (Rs.)' },
//                 { name: 'customerExpectation', label: 'Customer Expectations from Zircar' },
//               ]
//             },
//             {
//               title: "Product Failure & Required Details",
//               fields: [
//                 { name: 'installationDate', label: 'Installation Date', type: 'datetime-local' },
//                 { name: 'failedDate', label: 'Failed Date', type: 'datetime-local' },
//                 { name: 'lifeExpected', label: 'Life Expected' },
//                 { name: 'lifeAchieved', label: 'Life Achieved' },
//                 { name: 'competitorName', label: `Competitor's Name` },
//                 { name: 'competitorProduct', label: `Competitor's Product` },
//                 { name: 'competitorProductLife', label: `Competitor's Product Life` },
//               ]
//             }
//           ].map(section => (
//             <div key={section.title} className="form-section">
//               <h2 className="section-title">{section.title}</h2>
//               {(section.title === "Attachments") && (
//                 <h1 className='section-title'>Defective Crucible Images</h1>
//               )}

//               <div className="form-grid">
//                 {section.fields.map(({ name, label, type = 'text' }) => (
//                   <div key={name} className="form-group">
//                     <label className="form-label">{label}</label>
//                     {productFieldOptions[name] ? (
//                       <select
//                         name={name}
//                         value={form[name] || ""}
//                         onChange={handleChange}
//                         className="form-input"
//                       >
//                         <option value="" disabled>Select {label}</option>
//                         {productFieldOptions[name].map((opt, idx) => (
//                           <option key={idx} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </select>
//                     ) : (
//                       <input
//                         type={type}
//                         name={name}
//                         value={type === 'datetime-local' && form[name] ? form[name].slice(0, 16) : form[name] || ""}
//                         onChange={handleChange}
//                         className="form-input"
//                         required
//                       />
//                     )}
//                   </div>
//                 ))}
//               </div>
//                 {(section.title === "Attachments") && (
//                   <div className='attechments-last'>
//                   <span>Note: Minimum 5 Images According to instructions mentioned in Annexure-A Photo Guidelines. Please Download it From "Download Forms" Section.</span>
//                   <b>Other Attachments (if any)</b>
//                   <input type="file" className="form-input"/>
//                   </div>
//                 )}
//             </div>
//           ))}
//           {/* // Checkbox Section */}
//           <div className="checkbox-section">
//             <h2 className="section-title">Failure Reasons (Inspection)</h2>
//             <div className="checkbox-grid">
//               {failureOptions.map(option => (
//                 <label key={option} className="checkbox-label">
//                   <input
//                     type="checkbox"
//                     checked={form.failureReasons?.includes(option)}
//                     onChange={() => handleCheckboxChange(option)}
//                   />
//                   <span>{option}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//           <div>
//             <div className="header">
//               <h1 className="header-title">
//                 Past Sales Performance
//                 <div className="header-icon"></div>
//               </h1>
//             </div>
//             <div className="form-content">
//               {/* Table */}
//               <div className="table-container">
//                 <table className="data-table">
//                   <thead>
//                     <tr className="table-header">
//                       <th className="header-cell">
//                         Financial Year
//                       </th>
//                       {financialYears.map(year => (
//                         <th key={year} className="header-cell year-header">
//                           {year}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {metrics.map((metric, index) => (
//                       <tr key={metric.key} className={`table-row ${index % 2 === 0 ? 'row-even' : 'row-odd'}`}>
//                         <td className="label-cell">
//                           {metric.label}
//                         </td>
//                         {financialYears.map(year => (
//                           <td key={`${year}-${metric.key}`} className="input-cell">
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={formData[year][metric.key]}
//                               onChange={(e) => handleInputChange(year, metric.key, e.target.value)}
//                               className="data-input"
//                               placeholder="0.00"
//                             />
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                     {/* Calculated Claim Percentage Row */}
//                     <tr className="calculated-row">
//                       <td className="label-cell">
//                         Claim (%)
//                       </td>
//                       {financialYears.map(year => (
//                         <td key={`${year}-claim`} className="calculated-cell">
//                           <div className="percentage-display">
//                             {calculateClaimPercentage(year)}%
//                           </div>
//                         </td>
//                       ))}
//                     </tr>
//                     {/* Outstanding as on Date Row */}
//                     <tr className="table-row row-even">
//                       <td className="label-cell">
//                         Outstanding as on Date
//                       </td>
//                       {financialYears.map(year => (
//                         <td key={`${year}-outstanding`} className="input-cell">
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={formData[year].outstanding}
//                             onChange={(e) => handleOutstandingChange(year, e.target.value)}
//                             className="data-input"
//                             placeholder="0.00"
//                           />
//                         </td>
//                       ))}
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//               {/* Remarks Section */}
//               <div className="remarks-section">
//                 <label className="remarks-label">
//                   Remarks on Future Business
//                 </label>
//                 <textarea
//                   value={remarks}
//                   onChange={(e) => setRemarks(e.target.value)}
//                   rows={4}
//                   className="remarks-textarea"
//                   placeholder="Enter your remarks about future business plans and strategies..."
//                 />
//               </div>
//             </div>
//           </div>
//           <button type="submit" className="submit-btn">
//             Submit
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// }

// export default FileComplaint;