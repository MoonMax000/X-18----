import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountLinkingModal from '../components/auth/AccountLinkingModal';

/**
 * OAuth Callback Handler
 * This page handles the redirect from OAuth providers (Google, Apple)
 * after successful authentication.
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State for account linking modal
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [linkingData, setLinkingData] = useState<{
    email: string;
    provider: string;
    linkingToken: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      
      // Check for account linking parameters
      const requiresLinking = searchParams.get('requires_account_linking');
      const email = searchParams.get('email');
      const provider = searchParams.get('provider');
      const linkingToken = searchParams.get('linking_token');
      const message = searchParams.get('message');

      console.log('=== OAuth Callback Handler ===');
      console.log('Success:', success);
      console.log('Token present:', !!token);
      console.log('Error:', error);
      console.log('Requires linking:', requiresLinking);

      // Handle account linking case
      if (requiresLinking === 'true' && email && provider && linkingToken) {
        console.log('🔗 Account linking required for:', email);
        setLinkingData({
          email,
          provider,
          linkingToken,
          message: message || 'An account with this email already exists.',
        });
        setShowLinkingModal(true);
        return;
      }

      // Handle error case
      if (error) {
        console.error('❌ OAuth error:', error);
        alert(`OAuth authentication failed: ${error}`);
        navigate('/login', { replace: true });
        return;
      }

      // Handle success case
      if (success === 'true') {
        try {
          console.log('✅ OAuth successful! Tokens are in httpOnly cookies');
          
          // SECURITY FIX: Tokens are now in httpOnly cookies (access_token, refresh_token)
          // No need to save to localStorage - cookies are automatically sent with requests
          
          // Fetch user data - cookies will be sent automatically
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          const response = await fetch(`${apiUrl}/api/users/me`, {
            credentials: 'include', // Include httpOnly cookies (access_token, refresh_token)
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          console.log('✅ User data fetched:', userData.username);
          
          // Save user data to localStorage (NOT tokens, only user info for UI)
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

  const handleLinkAccount = async (password: string) => {
    if (!linkingData) {
      throw new Error('Linking data not available');
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/oauth/link/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          linking_token: linkingData.linkingToken,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link accounts');
      }

      const data = await response.json();
      console.log('✅ Accounts linked successfully');

      // Save tokens and user data
      localStorage.setItem('custom_token', data.access_token);
      localStorage.setItem('custom_user', JSON.stringify(data.user));

      // Close modal and redirect
      setShowLinkingModal(false);
      window.location.href = '/';
    } catch (err) {
      console.error('❌ Failed to link accounts:', err);
      throw err;
    }
  };

  const handleCloseLinkingModal = () => {
    setShowLinkingModal(false);
    setLinkingData(null);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-lg text-white">
            {showLinkingModal ? 'Checking account...' : 'Completing authentication...'}
          </p>
        </div>
      </div>

      {linkingData && (
        <AccountLinkingModal
          isOpen={showLinkingModal}
          onClose={handleCloseLinkingModal}
          email={linkingData.email}
          provider={linkingData.provider}
          linkingToken={linkingData.linkingToken}
          message={linkingData.message}
          onLinkAccount={handleLinkAccount}
        />
      )}
    </>
  );
};

export default OAuthCallback;
