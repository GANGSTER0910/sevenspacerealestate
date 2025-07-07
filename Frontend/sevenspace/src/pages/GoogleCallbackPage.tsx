import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GoogleCallbackPage = () => {
  const { checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('OAuth error:', error);
          navigate('/login?error=Authentication failed');
          return;
        }
        await checkAuth(); // check if user is now authenticated via cookie
        navigate('/user/dashboard');
      } catch (error) {
        console.error('Google authentication failed:', error);
        navigate('/login');
      }
    };

    handleGoogleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, navigate, searchParams]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h2>Signing you in with Google...</h2>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
