import React, { useEffect , useState} from 'react'
import Header from './Header'
import './ActiveComplaintList.css'
import { useParams , useNavigate} from 'react-router-dom'

const QC_Complaint_List = () => {

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const { usertype } = useParams();
  const [selectedYear, setSelectedYear] = useState('');
  const navigate = useNavigate();

useEffect(() => {

  const isManager = usertype.toLowerCase() === 'manager';
  const email = localStorage.getItem('userEmail'); // must be set at login
  const payload = isManager ? {} : { email };

  fetch(`http://192.168.1.32:5015/${usertype}/all_complaint_list`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {

      if (data.success) {
        const withReportNo = data.complaints.map(c => ({
          ...c,
          report_no: c.claim_id,
          claim_id: c.claim_id,
        }));
        setComplaints(withReportNo);
      } else {
        console.error('Failed to fetch complaints:', data.message || data.error_msg);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}, [usertype]);


    const filteredComplaints = complaints
  .filter((complaint) =>
    (complaint.dealer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )
  .filter((complaint) => {
    if (!selectedYear) return true;

    const [startYear, endYear] = selectedYear.split('-').map(Number);
    const claimDate = new Date(complaint.claim_date);
    const claimMonth = claimDate.getMonth(); // Jan=0, Apr=3

    // If month is April (3) to December (11), check startYear
    // If month is Jan (0) to March (2), check endYear
    if (claimMonth >= 3) {
      return claimDate.getFullYear() === startYear;
    } else {
      return claimDate.getFullYear() === endYear;
    }
  });

  const paginatedComplaints =
    entriesPerPage === 'All'
      ? filteredComplaints : filteredComplaints.slice(0, entriesPerPage);

  return (
    <div>
      <Header />
      <main id='QC_all_complaints'>
        <div className="complaint-header">
          <h2>Complaints</h2>
          <p>Home / Complaint List</p>
        </div>
        <br />

        <div className='complaint-table'>
            <p id='complaint-table-p'>All Complaints | List</p>
            <div className="financial-year">
                <label htmlFor="financial-year">Select Financial Year:</label>
                <select
                  name="financial-year"
                  id="financial-year"
                  style={{ marginLeft: '10px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2024-2025">2024-2025</option>
                  <option value="2023-2024">2023-2024</option>
                </select>
              </div>

            <br />
            <div className="entries-per-page">
            <label className="entries-label">Entries per page:</label>
            <select className="entries-select" value={entriesPerPage} 
            onChange={(e) => setEntriesPerPage(e.target.value === 'All' ? 'All':parseInt(e.target.value))}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="All">All</option>
              </select>

              <div className="search-bar">
                <input type="text"
                  style={{ width: '240px' }}
                  className="search-input"
                  placeholder="Search by customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              </div>

              <div className="complaint-table-wrapper">
                    <table className='complaint-data-table'>
                        <thead>
                              <tr>
                                <th>Claim Id</th>
                                <th>Claim Date</th>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                <th>Customer Number</th>
                                <th>View Details</th>
                              </tr>
                            </thead>
                            <tbody>
                                {paginatedComplaints.length > 0 ? (
                                    paginatedComplaints.map((complaint, index) => (
                                        <tr key={index}>
                                        <td>{complaint.report_no}</td>
                                        <td>{complaint.claim_date}</td>
                                        <td>{complaint.dealer_name || 'N/A'}</td>
                                        <td>{complaint.dealer_email || 'N/A'}</td>
                                        <td>{complaint.dealer_mobile || 'N/A'}</td>
                                        <td>  
                                            <button
                                              onClick={() => {
                                                if (complaint.claim_id) {
                                                  navigate(`/${usertype}/form_view`, {
                                                    state: { claim_id: complaint.report_no }
                                                  });
                                                } else {
                                                  console.error('Claim ID is undefined!');
                                                }
                                              }}
                                            className="view-details-btn">
                                            View
                                        </button>
                                        </td>
                                        </tr>
                                    ))
                                    ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center' }}>
                                        No complaints found
                                        </td>
                                    </tr>
                                    )}
                            </tbody>
                    </table>
              </div>
            <div className="pagination-info">
            <span>
              Showing{' '}
              {filteredComplaints.length > 0
                ? `1 to ${paginatedComplaints.length}`
                : '0'}{' '}
              of {filteredComplaints.length} entries
            </span>
          </div>
        </div>
      </main>
      <br />
        <p id="complaint-footer">
            <b>@ Zircar Refractories.</b> All Rights Reserved
      </p>
    </div>
  )
}

export default QC_Complaint_List
