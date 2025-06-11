import React from 'react'
import LogIn from './components/LogIn'
import Profile from './components/Profile'
import RegisterComplaint from './components/RegisterComplaint'
import Contact from './components/Contact'
import NeedHelp from './components/NeedHelp'
import Dashboard from './components/Dashboard'
import ReuploadDocument from './components/ReuploadDocument'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import ActiveComplaintList from './components/ActiveComplaintList'
import RejectedComplaintList from './components/RejectedComplaintList'
import ClaimPassed from './components/ClaimPassed'
import { UserProvider } from './components/UserContext'
import FormView from './components/FormView'
import BranchRegistration from './components/BranchRegistration'
import StaffRegistration from './components/StaffRegistration'
import RegistrationForm from './components/RegistrationForm'
import QC_Complaint_List from './components/QC_Complaint_List'
function App() {

  return(
    // <>
    // <StaffRegistration />
    // </>
    
    <UserProvider>
    <Router>
            <Routes>
                <Route path='/' element={<LogIn/>} />
                <Route path='/:usertype/dashboard' element={<Dashboard />} />

                <Route path='/:usertype/profile' element={<Profile />} />

                <Route path='/:usertype/need-help' element={<NeedHelp />} />

                <Route path='/:usertype/register-complaint' element={<RegisterComplaint/>} />

                <Route path='/:usertype/complaints/active-claim' element={<ActiveComplaintList/>} />
                <Route path='/:usertype/complaints/rejected-claims' element={<RejectedComplaintList />} />
                <Route path='/:usertype/complaints/claim-passed' element={<ClaimPassed/>} />

                <Route path='/:usertype/contact' element={<Contact />} />
                <Route path='/:usertype/form_view' element={<FormView />} />
                <Route path='/:usertype/reupload_document' element={<ReuploadDocument />} /> 
                <Route path='/:usertype/all_complaint_list' element={<QC_Complaint_List />} />
            </Routes>
    
    </Router>
    </UserProvider>
  
  )
}

export default App
