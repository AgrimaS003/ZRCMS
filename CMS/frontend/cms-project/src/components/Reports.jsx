import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import './Reports.css'
import { useNavigate } from 'react-router-dom';

function Reports() {
  const [dealers, setDealers] = useState([]);
  const [product,setProduct] = useState([]);
  const [status, setStatus] = useState([]);
  const [year, setYear] = useState('');
  const [selectedDealer, setSelectedDealer] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [tableData, setTableData] = useState(null); // For filtered table results
  const [summary, setSummary] = useState(null);
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
    fetch('http://192.168.1.29:5015/dropdowns')
      .then(response => response.json())
      .then(data => {
        setDealers(data.dealers || []);
        setProduct(data.products || []);
        setStatus(data.statuses || []);
      })
      .catch(error => {
        console.error('Error fetching dropdown data:', error);
      });
  }, []);

  useEffect(() => {
    fetch('http://192.168.1.29:5015/reports')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
      });
  }, []);
  const handleFilter = (e) => {
    e.preventDefault();
    fetch(`http://192.168.1.29:5015/reports?year=${year}&dealer=${selectedDealer}&product=${selectedProduct}&status=${selectedStatus}`)
      .then(response => response.json())
      .then(data => {
        setSummary(data); // <-- THIS IS THE FIX
      })
      .catch(error => {
        console.error('Error fetching reports:', error);
      });
  }
  // console,log("Table Data From Report", tableData);
  // console.log("Summary Data", summary);
  // console.log("Selected Year:", year);
  // console.log("Selected Dealer:", selectedDealer);  
  // console.log("Selected Product:", selectedProduct);
  // console.log("Selected Status:", selectedStatus);

  return (
    <div className='reports-layout'>
      <Sidebar />
      <div className='reports-content'>
        <header className='reports-hero'>
          <h1>
            <span className='reports-gradient-text'>Reports</span>
          </h1>
        </header>
        <div className="reports-body-flex">
          <form className="reports-form-glass">
            <div className="reports-export-row">
              <button type="button" className="reports-export-btn">PDF</button>
              <button type="button" className="reports-export-btn">Excel</button>
              <button type="button" className="reports-export-btn">CSV</button>
            </div>
            <div className="reports-field">
              <label>Select financial Year</label>
              <select value={year} onChange={e => setYear(e.target.value)}>
                <option value="" disabled>Select</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
                <option value="2022-23">2022-23</option>
              </select>
            </div>
            <div className="reports-field">
              <label>Dealer</label>
              <select value={selectedDealer} onChange={e => setSelectedDealer(e.target.value)}>
                <option value="" disabled>Select</option>
                {dealers.length > 0 ? (
                  dealers.map((dealer, index) => (
                    <option key={index} value={dealer.s_dealer_id}>{dealer.s_dealer_name}</option>
                  ))
                ) : (
                  <option value="" disabled>No Dealers Available</option>
                )}
              </select>
            </div>
            <div className="reports-field">
              <label>Product Name</label>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                <option value="" disabled>Select</option>
                {product.length > 0 ? (
                  product.map((prod, index) => (
                    <option key={index} value={prod.prod_id}>{prod.prod_name}</option>
                  ))
                ) : (
                  <option value="" disabled>No Products Available</option>
                )}
              </select>
            </div>
            <div className="reports-field">
              <label>Status</label>
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="" disabled>Select</option>
                {status.length > 0 ? (
                  status.map((stat, index) => (
                    <option key={index} value={stat.status_code}>{stat.status_name}</option>
                  ))
                ) : (
                  <option value="" disabled>No Status Available</option>
                )}
              </select>
            </div>
            <button className="reports-filter-btn" type="button" onClick={(e)=>{handleFilter(e)}}>Filter</button>
          </form>
          <div className="reports-table-section">
            <div className="reports-table-title">
              <div className="reports-table-heading">Complaints Summary – Financial Year 2024-25</div>
              <div className="reports-table-date">As on Date: 28/05/2025</div>
            </div>
            <table className="reports-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Number of Complaints</th>
                  <th>Claim Amount<br/>(Rs.)</th>
                  <th>Approved Amount<br/>(Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {summary ? (
                  <>
                    <tr>
                      <td><b>Total</b></td>
                      <td>{summary.total_complaints}</td>
                      <td>{summary.total_claim_amount}</td>
                      <td>{summary.total_approved_amount}</td>
                    </tr>
                    <tr>
                      <td><span className="reports-link blue">Settled</span></td>
                      <td><span className="blue">{summary.settled_complaints}</span></td>
                      <td><span className="blue">{summary.settled_claim_amount}</span></td>
                      <td><span className="blue">{summary.settled_approved_amount}</span></td>
                    </tr>
                    <tr>
                      <td><span className="reports-link green">Accepted</span></td>
                      <td><span className="green">{summary.accepted_complaints}</span></td>
                      <td><span className="green">{summary.accepted_claim_amount}</span></td>
                      <td><span className="green">{summary.accepted_approved_amount}</span></td>
                    </tr>
                    <tr>
                      <td><span className="reports-link red">Rejected</span></td>
                      <td><span className="red">{summary.rejected_complaints}</span></td>
                      <td><span className="red">{summary.rejected_claim_amount}</span></td>
                      <td><span className="red">{summary.rejected_approved_amount}</span></td>
                    </tr>
                    <tr>
                      <td><span className="reports-link">Pending</span></td>
                      <td>{summary.pending_complaints || 0}</td>
                      <td>{summary.pending_claim_amount || ''}</td>
                      <td>{summary.pending_approved_amount || ''}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan={4}>Loading...</td>
                  </tr>
                )}
              </tbody>
            </table>
            
          </div>
        </div>
        {!summary && (
          <div className="reports-no-data">
            <b>No data available!</b> Adjust your filters and try again.
          </div>
        )}
        <div className="reports-footer-spacer"></div>
        <div className="reports-footer">
          <span>
            <b>@ Zircar Refractories.</b> All Rights Reserved
          </span>
        </div>
      </div>
    </div>
  )
}

export default Reports