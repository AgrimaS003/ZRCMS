import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    // Redirect to login page (or wherever you want)
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      Logging out...
    </div>
  );
}

export default Logout;
