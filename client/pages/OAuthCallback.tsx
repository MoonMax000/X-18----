import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Callback Handler
 * This page handles the redirect from OAuth providers (Google, Apple)
 * after successful authentication.
 */
const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const requires2FA = searchParams.get('requires_2fa');
      const email = searchParams.get('email');

      console.log('=== OAuth Callback Handler ===');
      console.log('Success:', success);
      console.log('Token present:', !!token);
      console.log('Error:', errorParam);
      console.log('Requires 2FA:', requires2FA);

      // Handle 2FA requirement
      if (requires2FA === 'true') {
        console.log('⚠️ 2FA verification required');
        setError(`Two-factor authentication is enabled for ${email || 'this account'}. Please log in with your email and password to verify.`);
        setIsLoading(false);
        return;
      }

      // Handle error case
      if (errorParam) {
        console.error('❌ OAuth error:', errorParam);
        setError(decodeURIComponent(errorParam));
        setIsLoading(false);
        return;
      }

      // Handle success case
      if (success === 'true') {
        try {
          console.log('✅ OAuth successful! Tokens are in httpOnly cookies');
          
          // PURE COOKIE-BASED AUTH: Tokens are in httpOnly cookies (access_token, refresh_token)
          // We only fetch and save user data for UI
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
          const response = await fetch(`${apiUrl}/api/users/me`, {
            credentials: 'include', // Send httpOnly cookies (access_token)
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          console.log('✅ User data fetched:', userData.username);
          
          // Save ONLY user data to localStorage (for UI display)
          localStorage.setItem('custom_user', JSON.stringify(userData));
          
          // Redirect to home page
          console.log('🚀 Redirecting to home...');
          window.location.href = '/';
        } catch (err) {
          console.error('❌ Error processing OAuth callback:', err);
          setError('Authentication successful, but failed to load user data. Please try logging in again.');
          setIsLoading(false);
        }
      } else {
        console.error('❌ Invalid callback parameters');
        setError('Invalid authentication response. Please try again.');
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Authentication Failed
                </h3>
                <p className="text-sm text-gray-300 mb-4">{error}</p>
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg text-white">
          {isLoading ? 'Completing authentication...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
