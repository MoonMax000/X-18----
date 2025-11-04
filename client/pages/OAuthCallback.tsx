import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Callback Handler
 * This page handles the redirect from OAuth providers (Google, Apple)
 * after successful authentication.
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      console.log('=== OAuth Callback Handler ===');
      console.log('Success:', success);
      console.log('Token present:', !!token);
      console.log('Error:', error);

      // Handle error case
      if (error) {
        console.error('❌ OAuth error:', error);
        alert(`OAuth authentication failed: ${error}`);
        navigate('/login', { replace: true });
        return;
      }

      // Handle success case
      if (success === 'true' && token) {
        try {
          console.log('✅ OAuth successful, saving token...');
          
          // Save access token to localStorage
          localStorage.setItem('custom_token', token);
          
          // Fetch user data with the token
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          const response = await fetch(`${apiUrl}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include', // Include refresh token cookie
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          console.log('✅ User data fetched:', userData.username);
          
          // Save user data to localStorage
          localStorage.setItem('custom_user', JSON.stringify(userData));
          
          // Redirect to home page
          console.log('🚀 Redirecting to home...');
          window.location.href = '/';
        } catch (err) {
          console.error('❌ Error processing OAuth callback:', err);
          alert('Authentication successful, but failed to load user data. Please try logging in again.');
          navigate('/login', { replace: true });
        }
      } else {
        console.error('❌ Invalid callback parameters');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
