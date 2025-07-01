import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GoogleCallbackPage = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        await checkAuth(); // check if user is now authenticated via cookie
        navigate('/user/dashboard');
      } catch (error) {
        console.error('Google authentication failed:', error);
        navigate('/login');
      }
    };

    handleGoogleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h2>Signing you in with Google...</h2>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
