import React, { useState } from 'react'
import { useNavigate , useLocation, useSearchParams} from 'react-router-dom'
import Header from './Header'
import './ReuploadDocument.css'
import axios from 'axios'

const ReuploadDocument = () => {
  const [message , setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation()
  const {photo} = location.state || {};
  const [selectedFile , setselectedFile] = useState(null)
  const usertype = localStorage.getItem('usertype');

  const handleFileChange = (e) =>{
        setselectedFile(e.target.files[0]);
  }

  const handleUpdate = async (e) =>{
    e.preventDefault();

    const formData = new FormData()
    formData.append('s_photo_id', photo.s_photo_id)
    formData.append('s_claim_id', photo.s_claim_id)
    formData.append('photo', selectedFile)

    try{
      const response = await axios.post(`http://192.168.1.32:5015/${usertype}/update_photo`,formData,{
        headers : {'Content-Type':'multipart/form-data'},
      });
      if(response.data.success){
        setMessage('Image updated successfully!')
        setTimeout(()=>{
        setMessage('');
        navigate(`/${usertype}/form_view`,{state:{claim_id:photo.s_claim_id}})
      },3000);
      }
      else{
        setMessage('Failed to update Image')
        setTimeout(()=>{
        setMessage('');
      },3000);
      }
    } 
    catch(err){
      console.error(err);
    }
  }

  return (
    <div>
        <Header />
        <main>
        <div className='reupload_document_class'>
            <p id='header-p'>Reupload Document</p>
            <div className='reupload_document_card'>
            <label htmlFor="select_document">Select Document</label>
            <input type="file" name="select_document" id="select_document" onChange={handleFileChange} required/>
            <button type='submit' onClick={handleUpdate}>Update</button>
            {message && (
              <div className="alert-message">
                {message}
              </div>
            )}
        </div>
    </div>
    </main>
    </div>
  )
}

export default ReuploadDocument