import React, {useState, useEffect} from 'react'
import { useNavigate , useLocation, useParams } from 'react-router-dom'
import Header from './Header'
import Timeline from './Timeline'
import { RiFileImageFill } from 'react-icons/ri';
import './FormView.css'
import axios from 'axios';

const CardSection = ({ title, children }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="section-block">
      <h3 onClick={() => setIsOpen(!isOpen)} style={{cursor: 'pointer'}}>
        {title}
      </h3>
      {isOpen && <div className="section-content">{children}</div>}
    </div>
  );
};

const FormView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const claim_id = location.state?.claim_id;
    const email = localStorage.getItem('userEmail');
    const usertype = localStorage.getItem('usertype').toLowerCase();
    const [message , setMessage] = useState('');
    const allowedRoles = ['dealer', 'branch'];
    const staffRoles = ['manager', 'supervisor', 'inspection', 'quality_check', 'sales_head', 'director', 'account']
    // console.log("Claim ID:", claim_id);
    // console.log("Email:", email);
    const [complaintData, setComplaintData] = useState(null);
    const [error, setError] = useState(null);
    const [photos, setPhotos] = useState([]);

  const fetchClaimById = async () => {
    try {
      const response = await axios.post(`http://192.168.1.32:5015/${usertype}/get_claim_data`, { email , claim_id })
        if(response.data.success){
          // console.log(response.data.data)
          setComplaintData(response.data.data);
        }
        else{
          console.log('Error : ',response.data.message)
          setError(response.data.message);
        }
    } 
    catch (err) {
      console.log(err)
    }
  }
  const fetchPhotos = async () => {
    try {
      const response = await axios.post(`http://192.168.1.32:5015/${usertype}/get_photos`, {
        email,
        claim_id,
      });
      if (response.data.success) {
        setPhotos(response.data.photos);
      } else {
        console.log('Error fetching photos:', response.data.error);
      }
    } catch (err) {
      console.log(err);
    }
  };
   useEffect(() => {
    if (claim_id ) {
      fetchClaimById();
      fetchPhotos();
    }
  }, [claim_id, usertype]);

const handleOpenBase64Image = (base64String, mimeType = 'image/jpeg') => {
  // Remove base64 header if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};

const handleDelete = async (s_photo_id) => {
  try {
    const response = await axios.post(`http://192.168.1.32:5015/${usertype}/delete_photo`, {
      s_photo_id,
      s_claim_id: claim_id,
    });

    if (response.data.success) {
      // Remove photo from UI
      setMessage('Image deleted successfully.');
      setPhotos(prev => prev.filter(photo => photo.s_photo_id !== s_photo_id));
    } else {
      setMessage('Failed to delete Image.');
    }
  } catch (error) {
    console.error('Error occured while deleting Image:', error);
  }
    setTimeout( ()=> setMessage('') , 3000);
};
const finalizedStatusCodes = new Set([ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ]);

const statusMap = {
  manager: { accept: 2, reject: 3 },
  supervisor: { accept: 4, reject: 5 },
  inspection: { accept: 6, reject: 7 },
  quality_check: { accept: 8, reject: 9 },
  sales_head: { accept: 10, reject: 11 },
  director: { accept: 12, reject: 13 },
  account: { accept: 14, reject: 15 }
};


const handlePhotoAction = async (photoId, actionType) => {
  if (!statusMap[usertype]) return;

  const statusCode = statusMap[usertype][actionType];
  let reason = '';
  try {
    const response = await axios.post(`http://192.168.1.32:5015/${usertype}/update_photo_status`, {
      s_photo_id: photoId,
      status_code: statusCode,
    });

    if (response.data.success) {
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo.s_photo_id === photoId
            ? { ...photo, s_photo_status: statusCode, _statusChanged: true }
            : photo
        )
      );
      setMessage(`Photo ${actionType}d successfully.`);
    } else {
      setMessage(`Failed to ${actionType} photo.`);
    }
  } catch (err) {
    console.error(err);
    setMessage(`Error while trying to ${actionType} photo.`);
  }

  setTimeout(() => setMessage(''), 2000);
};

  const { table_data = [], outstanding, remarks } = complaintData || {};
  return (
    <div className='form-view-wrapper'>
      <Header />
      <main className='form-view-main'>
        <div className="claim-header">
            <p>Claim Details</p>
            <p style={{fontSize:'14px'}}>Dealer / claim details</p>
        </div>
        <div>
          <Timeline claim_id={claim_id} usertype={usertype}/>
        </div>
            <div className="form-details-group">
                    <CardSection title="Claim Details">
                        <div className="two-column-row">
                          <div className="form-group-form">
                            <label htmlFor='report_id'>Report ID</label>
                            <input type="text" id='report_id' value={complaintData?.report_no || ''} readOnly />
                          </div>
                          <div className="form-group-form">
                            <label htmlFor='report_date'>Date</label>
                            <input type='text' id='report_date' value={complaintData?.complaint_added_datetime || ''} readOnly />
                          </div>
                        </div>

                        <div className="two-column-row">
                          <div className="form-group-form">
                            <label htmlFor='dealer_name'>Name of Dealer/Branch</label>
                            <input type="text" id='dealer_name' value={complaintData?.dealer_name || ''} readOnly />
                          </div>
                          <div className="form-group-form">
                            <label htmlFor='dealer_company_name'>Dealer Company Name</label>
                            <input type="text" id='dealer_company_name' value={complaintData?.dealer_company || ''} readOnly />
                          </div>
                        </div>

                        <div className="two-column-row">
                          <div className="form-group-form">
                            <label htmlFor='customer_company_name'>Customer Company Name</label>
                            <input type="text" id='customer_company_name' value={complaintData?.customer_company || ''} readOnly />
                          </div>
                          <div className="form-group-form">
                            <label  htmlFor='customer_name'>Customer Name</label>
                            <input type="text" id='customer_name' value={complaintData?.customer_name || ''} readOnly />
                          </div>
                        </div>

                        <div className="two-column-row">
                          <div className="form-group-form">
                            <label htmlFor='customer_address'>Customer Address</label>
                            <input type="text" id='customer_address' value={complaintData?.customer_address || ''} readOnly />
                          </div>
                          <div className="form-group-form">
                            <label htmlFor='customer_mobile'>Customer Mobile</label>
                            <input type="text" id='customer_mobile' value={complaintData?.customer_mobile || ''} readOnly />
                          </div>
                        </div>
                      </CardSection>

                  <CardSection title="Product Details">
                    <div className="two-column-row">
                          <div className="form-group-form">
                        <label htmlFor="segment">Segment</label>
                        <input type="text" id='segment' value={complaintData?.segment || ''} readOnly/>
                        </div>
                        <div className="form-group-form">
                        <label htmlFor="zircar_invoice_no">Zircar's Invoice No.</label>
                        <input type="text" id='zircar_invoice_no' value={complaintData?.zircar_invoice_no || ''} readOnly/>
                        </div>
                      </div>
                      <div className="two-column-row">
                          <div className="form-group-form">
                        <label htmlFor="zircar_invoice_date">Zircar's Invoice Date</label>
                        <input type="text" id='zircar_invoice_date' value={complaintData?.zircar_invoice_date || ''} readOnly/>
                        </div>
                        <div className="form-group-form">
                        <label htmlFor="product">Product</label>
                        <input type="text" id='product' value={complaintData?.product_name || ''} readOnly/>
                        </div>
                        </div>
                        <div className="two-column-row">
                          <div className="form-group-form">
                        <label htmlFor="code_no">Code No.</label>
                        <input type="text" id='code_no' value={complaintData?.product_code || ''} readOnly/>
                        </div>
                        <div className="form-group-form">
                        <label htmlFor="product_brand">Product Brand</label>
                        <input type="text" id='product_brand' value={complaintData?.product_brand || ''} readOnly/>
                        </div>
                        </div>
                  </CardSection>
      
              <CardSection title="Crucible Application Details">
                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='application'>Application</label>
                      <input type="text" id='application' value={complaintData?.application || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='fuel'>Fuel</label>
                      <input type="text" id='fuel' value={complaintData?.fuel || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='working_frequency_type'>Working Frequency Type</label>
                      <input type="text" id='working_frequency_type' value={complaintData?.working_frequency_type || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='working_frequency_hz'>Working Frequency(Hz)</label>
                      <input type="text" id='working_frequency_hz' value={complaintData?.working_frequency_hz || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='metal'>Metal</label>
                      <input type="text" id='metal' value={complaintData?.metal || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='metal_scrap_type'>Metal/Scrap Type</label>
                      <input type="text" id='metal_scrap_type' value={complaintData?.metal_scrap_type || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='fluxes_used'>Fluxes Used</label>
                      <input type="text" id='fluxes_used' value={complaintData?.fluxes_used || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='flux_quantity'>Flux Quantity (Kg per Charge)</label>
                      <input type="text" id='flux_quantity' value={complaintData?.flux_quantity || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='working_temperature'>Working Temperature (Celsius)</label>
                      <input type="text" id='working_temperature' value={complaintData?.working_temperature || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='top_glaze_information'>Top Glaze Formation</label>
                      <input type="text" id='top_glaze_information' value={complaintData?.top_glaze_formation || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='bottom_glaze_information'>Bottom Glaze Formation</label>
                      <input type="text" id='bottom_glaze_information' value={complaintData?.bottom_glaze_formation || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='flame_orientation'>Flame Orientation</label>
                      <input type="text" id='flame_orientation' value={complaintData?.flame_orientation || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='key_bricks'>No.of Key Bricks</label>
                      <input type="text" id='key_bricks' value={complaintData?.key_bricks || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='support_at_bottom'>Support Used at the Bottom of the Crucible</label>
                      <input type="text" id='support_at_bottom' value={complaintData?.support_used_at_the_bottom || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='metal_output'>Metal Output Per Charges(Kg)</label>
                      <input type="text" id='metal_output' value={complaintData?.metal_output_per_charges || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='heats_per_day'>Heats Per day</label>
                      <input type="text" id='heats_per_day' value={complaintData?.heats_per_day || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='melting_time'>Melting Time Per Charge(hrs.)</label>
                      <input type="text" id='melting_time' value={complaintData?.melting_time_per_charge || ''} readOnly />
                    </div>
                    <div className="form-group-form">
                      <label htmlFor='operating_hours'>Operating Hours/Day</label>
                      <input type="text" id='operating_hours' value={complaintData?.operating_hours_per_day || ''} readOnly />
                    </div>
                  </div>

                  <div className="two-column-row">
                    <div className="form-group-form">
                      <label htmlFor='operation_type'>Type of Operation</label>
                      <input type="text" id='operation_type' value={complaintData?.type_of_opertion || ''} readOnly />
                    </div>
                  </div>
                </CardSection>

                <CardSection title="Product Failure & Required Details">
                    <div className="two-column-row">
                      <div className="form-group-form">
                        <label htmlFor='installation_date'>Installation Date</label>
                        <input type='text' id='installation_date' value={complaintData?.Installation_date || ''} readOnly />
                      </div>
                      <div className="form-group-form">
                        <label htmlFor='failed_date'>Failed Date</label>
                        <input type='text' id='failed_date' value={complaintData?.failed_date || ''} readOnly />
                      </div>
                    </div>

                    <div className="two-column-row">
                      <div className="form-group-form">
                        <label htmlFor='life_expected'>Life Expected</label>
                        <input type='text' id='life_expected' value={complaintData ? `${complaintData.life_expected_data} - ${complaintData.life_expected}` : ''} readOnly />
                      </div>
                      <div className="form-group-form">
                        <label htmlFor='life_achieved'>Life Achieved</label>
                        <input type='text' id='life_achieved' value={complaintData ? `${complaintData.life_achieved_data} - ${complaintData.life_achieved}` : ''} readOnly />
                      </div>
                    </div>

                    <div className="two-column-row">
                      <div className="form-group-form">
                        <label htmlFor='competitors_name'>Competitor's Name</label>
                        <input type='text' id='competitors_name' value={complaintData?.competitors_name || ''} readOnly />
                      </div>
                      <div className="form-group-form">
                        <label htmlFor='competitors_product'>Competitor's Product</label>
                        <input type='text' id='competitors_product' value={complaintData?.competitors_product || ''} readOnly />
                      </div>
                    </div>

                    <div className="two-column-row">
                      <div className="form-group-form">
                        <label htmlFor='competitors_product_life'>Competitor's Product Life</label>
                        <input type='text' id='competitors_product_life' value={complaintData ? `${complaintData.Competitors_Product_Life_data} - ${complaintData.Competitors_Product_Life}` : ''} readOnly />
                      </div>
                    </div>
                  </CardSection>

                  <CardSection title="Inspection Details">

                      <div className="two-column-row">
                        <div className="form-group-form">
                          <label htmlFor='failure_reasons'>Failure Reasons (Based on observation)</label>
                          <input type="text" id='failure_reasons' value={complaintData?.failure_reasons || ''} readOnly />
                          </div>
                        <div className="form-group-form">
                          <label htmlFor='inspected_by_dealer'>Whether Inspected by Dealer</label>
                          <input type="text" id='inspected_by_dealer' value={complaintData?.whether_inspected_by_dealer || ''} readOnly />
                        </div>
                        </div>
                        <div className="two-column-row">
                        <div className="form-group-form">
                          <label htmlFor='inspected_by_zircar'>Whether Inspected by Zircar</label>
                          <input type="text" id='inspected_by_zircar' value={complaintData?.whether_inspected_by_zircar || ''} readOnly />
                        </div>

                        <div className="form-group-form">
                          <label htmlFor='name_of_inspector'>Name of Inspector</label>
                          <input type="text" id='name_of_inspector' value={complaintData?.name_of_inspector || ''} readOnly />
                        </div>
                        </div>

                        <div className="two-column-row">
                        <div className="form-group-form">
                          <label htmlFor='dealer_report'>Visit Report of Dealer</label>
                          <input type="text" id='dealer_report' value={complaintData?.visit_reports_of_dealer || ''} readOnly />
                        </div>

                        <div className="form-group-form">
                          <label htmlFor='employee_report'>Visit Report of Zircar Employee</label>
                          <input type="text" id='employee_report' value={complaintData?.visit_reports_of_zircar_employee || ''} readOnly />
                        </div>
                        </div>

                        <div className="two-column-row">
                        <div className="form-group-form">
                          <label htmlFor='basic_price'>Zircar Basic Price(Rs.)</label>
                          <input type="text" id='basic_price' value={complaintData?.zircar_basic_price || ''} readOnly />
                        </div>

                        <div className="form-group-form">
                          <label htmlFor='customer_expectation'>Customer Expectations from Zircar</label>
                          <input type="text" id='customer_expectation' value={complaintData?.customer_expectations_from_zircar ? `${complaintData.customer_expectations_from_zircar}%` : ''} readOnly />
                        </div>
                      </div>
                    </CardSection>

                    <CardSection title="Past Sales Performance">
                            <table className="form-table">
                              <thead>
                                <tr>
                                  <th>Financial Year</th>
                                  <th>2022-23</th>
                                  <th>2023-24</th>
                                  <th>2024-25</th>
                                  <th>2025-26</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Sales (Lacs)</td>
                                  {table_data.map((row) => (
                                    <td key={`sales_${row.FinancialYear}`}>{row.Sales || '-'}</td>
                                  ))}
                                </tr>
                                <tr>
                                  <td>Settled Claim (Lacs)</td>
                                  {table_data.map((row) => (
                                    <td key={`settled_${row.FinancialYear}`}>{row.SettledClaim || '-'}</td>
                                  ))}
                                </tr>
                                <tr>
                                  <td>Claim (%)</td>
                                  {table_data.map((row) => (
                                    <td key={`claim_${row.FinancialYear}`}>{row.ClaimPercentage || '-'}</td>
                                  ))}
                                </tr>
                                <tr>
                                  <td>Outstanding as on Date</td>
                                  <td colSpan={4} style={{ textAlign: 'center' }}>{outstanding || '-'}</td>
                                </tr>
                                <tr>
                                  <td>Remarks on Future Business</td>
                                  <td colSpan={4} style={{ textAlign: 'center' }}>{remarks || '-'}</td>
                                </tr>
                              </tbody>
                            </table>
                          </CardSection>
                  </div>

            <div>
                    <p id="photo-header">Defective Crucible Photos</p>
                          <div className="form-image-card-container">
                          {photos.map((photo) => (
                            <div className="form-image-card" key={photo.s_photo_id}>
                              <p id="form-image-name">{photo.s_photo_name}</p>
                              <p id="weight-id">Status: {photo.status_name || 'N/A'}</p>
                              <p id="weight-id">Remarks: {photo.ns_remarks || 'N/A'}</p>
                              <div className="action-row">
                                    <RiFileImageFill
                                      size={30}
                                      color="#4154f1"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleOpenBase64Image(photo.s_photo_base64)}
                                    />
                    {allowedRoles.includes(usertype) ? (
                            <>
                              <button
                                id="edit-button"
                                onClick={() =>
                            navigate(`/${usertype}/reupload_document`, {
                                      state: { photo: { ...photo, s_claim_id: claim_id } },
                                    })
                                  }
                                  disabled={finalizedStatusCodes.has(Number(photo.s_photo_status))}
                                  title={finalizedStatusCodes.has(Number(photo.s_photo_status)) ? 'Locked by staff action' : ''}>
                                  Edit
                                </button>
                                <button
                                  id="delete-button"
                                  onClick={() => handleDelete(photo.s_photo_id)}
                                  disabled={finalizedStatusCodes.has(Number(photo.s_photo_status))}
                                  title={finalizedStatusCodes.has(Number(photo.s_photo_status)) ? 'Locked by staff action' : ''}>
                                Delete
                              </button>
                            </>
                          ) : staffRoles.includes(usertype) ? (
                            <>
                              <button
                                id="approve-button"
                                onClick={() => handlePhotoAction(photo.s_photo_id, 'accept')}
                                disabled={finalizedStatusCodes.has(Number(photo.s_photo_status))}
                              >
                                Approve
                              </button>
                              <button
                                id="reject-button"
                                onClick={() => handlePhotoAction(photo.s_photo_id, 'reject')}
                                disabled={finalizedStatusCodes.has(Number(photo.s_photo_status))}
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                    </div>
                  </div>
                ))}

          </div>
        </div>
        {message && (
          <div className="alert-message">
            {message}
          </div>
        )}
      </main>
 
      <p className='form_view_footer' style={{color:"#012970", textAlign:'center'}}><b>@ Zircar Refractories.</b> All Rights Reserved</p>
    </div>
  )
}
export default FormView