import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import LogIn from './components/LogIn'
import Logout from "./components/Logout";
import RegistrationForm from './components/RegistrationForm'
import StaffRegistration from './components/StaffRegistration'
import BranchRegistration from './components/BranchRegistration'
import UnderMaintenance from './components/UnderMaintenance';
import Profile from './components/Profile'
import ManageForm from './components/ManageForm'
import ManageStaff from './components/ManageStaff';
import ManageBranch from './components/ManageBranch';
import ManageDealers from './components/ManageDealers';
import Reports from "./components/Reports";
import DealerComplaintList from "./components/DealerComplaintList";
import ManagerClaimView from "./components/ManagerClaimView";
import ViewClaimForm from "./components/ViewClaimForm"; 
import AssignedComplaints from "./components/AssignedComplaints";
import RejectedComplaints from "./components/RejectedComplaints";
import BranchComplaintList from "./components/BranchComplaintList";
import FileComplaint from "./components/FileComplaint"
import ProcessedClaim from "./components/ProcessedClaim";
import UnprocessedClaim from "./components/UnprocessedClaim";
import ApprovedClaim from "./components/ApprovedClaim";
import DirectorClaimView from "./components/DirectorClaimView";


function App() {
  const [maintenance, setMaintenance] = useState(null);
  const [users, setUsers] = useState([]);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isAdmin = currentUser && (currentUser.s_usertype === "1" || currentUser.s_usertype === 1);
  // console.log('Current User:', currentUser);
  console.log('Is Admin:', isAdmin);

  useEffect(() => {
    fetch('http://192.168.1.29:5015/maintenance')
      .then(res => res.json())
      .then(data => setMaintenance(data));
  }, []);

  // Check if current time is within maintenance window
  const now = new Date();
  const inMaintenance =
    maintenance &&
    maintenance.startDate &&
    maintenance.endDate &&
    now >= new Date(maintenance.startDate) &&
    now <= new Date(maintenance.endDate);

  // Replace `isAdmin` with your actual admin check
  if (inMaintenance && !isAdmin) {
    return (
      <div className="maintenance-message">
        <h2>Website Under Maintenance</h2>
        <p>
          The website is under maintenance from <b>{maintenance.startDate}</b> to <b>{maintenance.endDate}</b>.
        </p>
      </div>
    );
  }

  // if (!currentUser) {
  //   return <Navigate to="/Login" />;
  // }

  return (
    <Router>
      <div>
        {/* <Sidebar /> */}
        <Routes>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Login" element={<LogIn />} />
          <Route path="/Logout" element={<Logout/>}/>
          <Route path="/RegistrationForm" element={<RegistrationForm />} />
          <Route path="/StaffRegistration" element={<StaffRegistration />} />
          <Route path="/BranchRegistration" element={<BranchRegistration />} />
          <Route path="/maintenance" element={<UnderMaintenance />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/manageforms" element={<ManageForm />} />
          <Route path="/Managestaff" element={<ManageStaff />} />
          <Route path="/managedealers" element={<ManageDealers />} />
          <Route path="/managebranch" element={<ManageBranch />} />
          <Route path="/Reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/DealerComplaintList" element={<DealerComplaintList/>} />
          <Route path="/DealerComplaintList/ManagerClaimView" element={<ManagerClaimView/>}/>
          <Route path="/DealerComplaintList/ViewClaimForm"element={<ViewClaimForm/>} />
          <Route path="/AssignedComplaints" element={<AssignedComplaints/>}/>
          <Route path="/RejectedComplaints" element={<RejectedComplaints/>}/>
          <Route path="/BranchComplaintList" element={<BranchComplaintList/>}/>
          <Route path="/BranchComplaintList/ManagerClaimView" element={<ManagerClaimView/>}/>
          <Route path="/BranchComplaintList/ViewClaimForm"element={<ViewClaimForm/>} />
          <Route path="/FileComplaint" element={<FileComplaint/>}/>
          <Route path="/ProcessedClaim" element={<ProcessedClaim/>}/>
          <Route path="/UnprocessedClaim" element={<UnprocessedClaim/>}/>
          <Route path="/ApprovedClaim" element={<ApprovedClaim/>}/>
          <Route path="/DirectorClaimView" element={<DirectorClaimView/>}/>
          {/* Add other routes here */}
          <Route path="*" element={<Navigate to="/Login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


{/* <StaffRegistration /> */ }

{/* <BranchRegistration /> */ }

{/* <Profile /> */ }


