import React,{useState, useEffect, useRef, useContext} from 'react'
import axios from 'axios';
import image1 from '../assets/images/image1.png'
import image2 from '../assets/images/image2.png'
import image3 from '../assets/images/image3.png'
import image4 from '../assets/images/image4.png'
import image5 from '../assets/images/image5.png'
import Header from "./Header.jsx"
import './RegisterComplaint.css';
import { UserContext } from './UserContext.jsx'
import { useNavigate , useParams} from 'react-router-dom';

const RegisterComplaint = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [rawReportId, setRawReportId] = useState('');
    const {usertype} = useParams();
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
        usertype : usertype
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
  customer_company:'',
  dealer_name:'',
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

  if(name === "extra_images") {
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
      setTimeout(()=> navigate(`/${usertype}/dashboard`),2000)
      // clear form if needed
      setFormData({
      report_id: data.report_id,
      todays_date:today,
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
    <div className='register_complaint'>
        <Header />
        <main id='main-id'>
            <div className="registerClass">
                 <h2>Register Complaints</h2>
                 <h4>Home / Register Complaints</h4>
            </div>

            <center>
                <div className="form-card">
             <form className='complaint-form' onSubmit={handleSubmit}>
                <div className="general">
                    <p style={{'color':'#012970', textAlign:'left'}}>Fill the form to Register Complaint</p>
                    <h4 style={{textAlign: "left"}}>A. General Details</h4>
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
                    <h4 style={{textAlign: "left"}}>B. Dealer/Branch Details</h4>
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
                    <h4 style={{textAlign: "left"}}>C. Customer Details</h4>
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
                        <h4 style={{textAlign: "left"}}>D. Product Details</h4>
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
                        <h4 style={{textAlign: "left"}}>E. Crucible Application Details</h4>

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
                <input type="text" id="finished-product" name='finished_product' value={formData.finished_product} onChange={handleChange}  required />
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
            <h4 style={{textAlign: "left"}}>F. Product Failure & Required Details</h4>

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
            <h4 style={{textAlign: "left"}}>G. Inspection Details</h4>

            <p id="failure-reasons" style={{textAlign:'left'}}>Failure Reasons (Based on observation)</p>
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
                <label><input type="checkbox" name="others"  checked={formData.failure_reasons.includes("others")} onChange={handleCheckboxChange}/> Others</label>
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
                <h4 style={{textAlign: "left"}}>H. Attachments</h4>

                <p style={{textAlign:'left'}}>Defective Crucible Images</p>
                <div className="attachment-row">
                <div className="attachment-group">
                    
                    <label htmlFor='point_image'>Point The Problem</label>
                    <input type="file" id="point_image" name="point_image" onChange={handleFileChange} ref={pointImageRef} required />
                    <img src={image1} alt="Point Problem" className="attachment-img" />
                </div>

                <div className="attachment-group">
                    <label htmlFor='full_view_image'>Full View of Problematic Crucible</label>
                    <input type="file" id="full_view_image" name="full_view_image" onChange={handleFileChange} ref={fullViewImageRef} required />
                    <img src={image2} alt="Full View" className="attachment-img" />
                </div>
                </div>

                <div className="attachment-row">
                <div className="attachment-group">
                    <label htmlFor='reference_location_image'>Crucible with Reference of Location</label>
                    <input type="file" id="reference_location_image" name="reference_location_image" onChange={handleFileChange} ref={referenceLocationImageRef} required />
                    <img src={image3} alt="Reference Location" className="attachment-img" />
                </div>

                <div className="attachment-group">
                    <label htmlFor='top_view_image'>Top View</label>
                    <input type="file" id="top_view_image" name="top_view_image" onChange={handleFileChange} ref={topViewImageRef} required />
                    <img src={image4} alt="Top View" className="attachment-img" />
                </div>
                </div>

                <div className="attachment-row">
                <div className="attachment-group">
                    <label htmlFor='bottom_view_image'>Bottom View</label>
                    <input type="file" id="bottom_view_image" name="bottom_view_image" onChange={handleFileChange} ref={bottomViewImageRef} required />
                    <img src={image5} alt="Bottom View" className="attachment-img" />
                </div>
                </div>

                <p style={{textAlign:'left'}}><b>Note: </b>Minimum 5 Images According to instructions mentioned in Annexure-A Photo Guidelines. Please Download it From "Download Forms" Section.</p>

                <div className="attachment-row">
                <div className="attachment-group">
                    <label>Other Attachments (if any)</label>
                    <input type="file" id="extra_images" name="extra_images" multiple onChange={handleFileChange} ref={extraImagesRef} />
                </div>
                </div>
            </div>

            <hr />
             <div className="past-sales-performance">
                <h4 style={{textAlign: "left"}}>J. Past Sales Performance</h4>
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
        <p className='footer'><b>@ Zircar Refactories.</b> All rights Reserved</p>
    </div>
    );
}

export default RegisterComplaint