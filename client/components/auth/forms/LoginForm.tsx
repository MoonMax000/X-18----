import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import { customAuth } from '@/services/auth/custom-backend-auth';
import { AuthMethod, formatPhoneNumber, validatePhone, validateEmail } from './types';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  on2FARequired: (email: string) => void;
  onSuccess: () => void;
}

const LoginForm: FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSwitchToForgotPassword,
  on2FARequired,
  onSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [authError, setAuthError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    const error = validatePhone(formatted);
    setPhoneError(error || '');
    setAuthError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const error = validateEmail(value);
    setEmailError(error || '');
    setAuthError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setAuthError('');
  };

  const handleLogin = async () => {
    setAuthError('');
    setAttemptsRemaining(null);

    const phoneValid = authMethod === 'phone' ? !validatePhone(phoneNumber) : true;
    const emailValid = authMethod === 'email' ? !validateEmail(email) : true;

    if (!password) {
      setAuthError('Password is required');
      return;
    }

    if (!phoneValid || !emailValid) return;

    setIsLoading(true);

    try {
      const loginData = {
        email: authMethod === 'email' ? email : `${phoneNumber}@phone.temp`,
        password,
      };

      const data = await customAuth.login(loginData);

      if (data.requires_2fa) {
        on2FARequired(loginData.email);
      } else {
        onSuccess();
      }
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 10) {
        setIsBlocked(true);
        setAuthError('Too many failed attempts. Account locked for 30 minutes.');
      } else if (newFailedAttempts >= 5) {
        setAuthError('Too many failed attempts. IP blocked for 15 minutes.');
        setIsBlocked(true);
      } else {
        const remaining = 10 - newFailedAttempts;
        setAttemptsRemaining(remaining);
        setAuthError(error instanceof Error ? error.message : 'Invalid login or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple' | 'twitter') => {
    try {
      setIsLoading(true);
      setAuthError('');

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/auth/${provider}`);
      const data = await response.json();

      if (data.error) {
        setAuthError(data.error);
        setIsLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      setAuthError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Sign In</h2>

        <div className="inline-flex self-start items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-md">
          <button
            onClick={() => {
              setAuthMethod('email');
              setPhoneError('');
              setEmailError('');
              setAuthError('');
            }}
            className={cn(
              'flex items-center justify-center min-h-[44px] md:h-8 px-4 rounded-[32px] text-[15px] font-bold transition-[background-color,box-shadow,color] duration-300',
              authMethod === 'email'
                ? 'bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white backdrop-blur-md'
                : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white backdrop-blur-md'
            )}
          >
            Email
          </button>
          <button
            onClick={() => {
              setAuthMethod('phone');
              setPhoneError('');
              setEmailError('');
              setAuthError('');
            }}
            className={cn(
              'flex items-center justify-center min-h-[44px] md:h-8 px-4 rounded-[32px] text-[15px] font-bold transition-[background-color,box-shadow,color] duration-300',
              authMethod === 'phone'
                ? 'bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white backdrop-blur-md'
                : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white backdrop-blur-md'
            )}
          >
            Phone
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                'flex items-center gap-2 h-11 px-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-300',
                (authMethod === 'phone' && phoneError) || authError
                  ? 'border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20'
                  : (authMethod === 'email' && emailError) || authError
                  ? 'border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20'
                  : 'border-[#181B22] focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 hover:border-primary/50'
              )}
            >
              {authMethod === 'phone' ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 15.8334H10.0083"
                      stroke={phoneError || authError ? '#EF4444' : phoneNumber ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.2497 1.66663H8.74967C6.78549 1.66663 5.8034 1.66663 5.1932 2.27682C4.58301 2.88702 4.58301 3.86911 4.58301 5.83329V14.1666C4.58301 16.1308 4.58301 17.1129 5.1932 17.7231C5.8034 18.3333 6.78549 18.3333 8.74967 18.3333H11.2497C13.2138 18.3333 14.1959 18.3333 14.8062 17.7231C15.4163 17.1129 15.4163 16.1308 15.4163 14.1666V5.83329C15.4163 3.86911 15.4163 2.88702 14.8062 2.27682C14.1959 1.66663 13.2138 1.66663 11.2497 1.66663Z"
                      stroke={phoneError || authError ? '#EF4444' : phoneNumber ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+1234567890"
                    className="flex-1 bg-transparent text-[15px] text-white placeholder:text-webGray outline-none"
                  />
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5"
                      stroke={emailError || authError ? '#EF4444' : email ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.67989 11.2296C1.73436 13.7843 1.76161 15.0615 2.70421 16.0078C3.64681 16.954 4.95869 16.9869 7.58244 17.0528C9.1995 17.0935 10.8007 17.0935 12.4177 17.0528C15.0415 16.9869 16.3533 16.954 17.296 16.0078C18.2386 15.0615 18.2658 13.7843 18.3202 11.2296C18.3378 10.4082 18.3378 9.59171 18.3202 8.77029C18.2658 6.21568 18.2386 4.93837 17.296 3.99218C16.3533 3.04599 15.0415 3.01303 12.4177 2.9471C10.8007 2.90647 9.1995 2.90647 7.58243 2.94709C4.95869 3.01301 3.64681 3.04597 2.70421 3.99217C1.7616 4.93836 1.73436 6.21567 1.67988 8.77029C1.66236 9.59171 1.66237 10.4082 1.67989 11.2296Z"
                      stroke={emailError || authError ? '#EF4444' : email ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email/Subaccount"
                    className="flex-1 bg-transparent text-[15px] text-white placeholder:text-webGray outline-none"
                  />
                </>
              )}
            </div>
            {authMethod === 'phone' && phoneError && (
              <p className="text-xs text-red-500 px-3">{phoneError}</p>
            )}
            {authMethod === 'email' && emailError && (
              <p className="text-xs text-red-500 px-3">{emailError}</p>
            )}
          </div>

          <div
            className={cn(
              'flex items-center justify-between gap-2 h-11 px-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-300',
              authError
                ? 'border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20'
                : 'border-[#181B22] focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 hover:border-primary/50'
            )}
          >
            <div className="flex items-center gap-2 flex-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12.9166 12.0834C15.678 12.0834 17.9166 9.84479 17.9166 7.08337C17.9166 4.32195 15.678 2.08337 12.9166 2.08337C10.1552 2.08337 7.91659 4.32195 7.91659 7.08337C7.91659 7.81705 8.0746 8.51379 8.3585 9.14146L2.08325 15.4167V17.9167H4.58325V16.25H6.24992V14.5834H7.91659L10.8585 11.6415C11.4862 11.9254 12.1829 12.0834 12.9166 12.0834Z"
                  stroke={authError ? '#EF4444' : password ? '#FFFFFF' : '#B0B0B0'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.5833 5.41663L13.75 6.24996"
                  stroke={authError ? '#EF4444' : password ? '#FFFFFF' : '#B0B0B0'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Password"
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-webGray outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="hover:opacity-70 transition-opacity"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                  />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15 13.5L16.5 16"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 11L22 13"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 13L4 11"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 13.5L7.5 16"
                    stroke="#B0B0B0"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleLogin}
              disabled={isBlocked || isLoading}
              className={cn(
                'w-full py-[5px] flex items-center justify-center gap-[10px] rounded-[8px] text-[15px] font-bold text-white transition-all duration-300',
                isBlocked || isLoading
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-l from-[#482090] to-[#A06AFF] hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {authError && (
              <p className="text-xs text-red-500 text-center">
                {authError}
                {attemptsRemaining !== null && ` You have ${attemptsRemaining} attempts remaining.`}
              </p>
            )}

            <button
              onClick={onSwitchToForgotPassword}
              className="text-[15px] text-primary hover:underline transition-all duration-300 hover:text-purple-400"
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-6 pt-10">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-md hover:bg-[rgba(12,16,20,0.7)] hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 transition-[background-color,border-color,box-shadow,transform] duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
              <g clipPath="url(#clip0_google)">
                <path
                  d="M12.4998 9.81812V14.4654H18.9579C18.6743 15.9599 17.8233 17.2254 16.547 18.0763L20.4415 21.0982C22.7106 19.0037 24.0197 15.9273 24.0197 12.2728C24.0197 11.4219 23.9433 10.6036 23.8015 9.81825L12.4998 9.81812Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.77461 14.2839L4.89625 14.9563L1.78711 17.3781C3.76165 21.2944 7.80862 23.9999 12.4995 23.9999C15.7394 23.9999 18.4557 22.9308 20.4412 21.0981L16.5467 18.0763C15.4776 18.7963 14.114 19.2327 12.4995 19.2327C9.37951 19.2327 6.72868 17.1273 5.77952 14.2909L5.77461 14.2839Z"
                  fill="#34A853"
                />
                <path
                  d="M1.78718 6.62183C0.969042 8.23631 0.5 10.0581 0.5 11.9999C0.5 13.9417 0.969042 15.7636 1.78718 17.378C1.78718 17.3889 5.77997 14.2799 5.77997 14.2799C5.53998 13.5599 5.39812 12.7963 5.39812 11.9998C5.39812 11.2033 5.53998 10.4398 5.77997 9.71976L1.78718 6.62183Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.4997 4.77818C14.267 4.77818 15.8379 5.38907 17.0925 6.56727L20.5288 3.13095C18.4452 1.18917 15.7398 0 12.4997 0C7.80887 0 3.76165 2.69454 1.78711 6.62183L5.77978 9.72001C6.72882 6.88362 9.37976 4.77818 12.4997 4.77818Z"
                  fill="#EA4335"
                />
              </g>
              <defs>
                <clipPath id="clip0_google">
                  <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('apple')}
            disabled={isLoading}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-md hover:bg-[rgba(12,16,20,0.7)] hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 transition-[background-color,border-color,box-shadow,transform] duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
              <g clipPath="url(#clip0_apple)">
                <path
                  d="M22.292 18.7035C21.929 19.542 21.4994 20.3139 21.0016 21.0235C20.3231 21.9908 19.7676 22.6605 19.3395 23.0323C18.6758 23.6426 17.9647 23.9552 17.2032 23.973C16.6566 23.973 15.9973 23.8175 15.23 23.5019C14.4601 23.1878 13.7525 23.0323 13.1056 23.0323C12.4271 23.0323 11.6994 23.1878 10.9211 23.5019C10.1415 23.8175 9.51355 23.9819 9.03342 23.9982C8.30322 24.0293 7.57539 23.7078 6.8489 23.0323C6.38521 22.6279 5.80523 21.9345 5.11043 20.9524C4.36498 19.9035 3.75211 18.6872 3.27198 17.3006C2.75777 15.8029 2.5 14.3526 2.5 12.9484C2.5 11.3401 2.84754 9.95284 3.54367 8.79035C4.09076 7.8566 4.81859 7.12003 5.72953 6.57931C6.64046 6.03858 7.62473 5.76304 8.68469 5.74541C9.26467 5.74541 10.0252 5.92481 10.9704 6.27739C11.9129 6.63116 12.5181 6.81056 12.7834 6.81056C12.9817 6.81056 13.654 6.60079 14.7937 6.18258C15.8714 5.79474 16.781 5.63415 17.5262 5.69741C19.5454 5.86037 21.0624 6.65634 22.0712 8.09037C20.2654 9.18456 19.3721 10.7171 19.3898 12.6831C19.4061 14.2145 19.9617 15.4888 21.0535 16.5006C21.5483 16.9703 22.1009 17.3332 22.7156 17.591C22.5823 17.9776 22.4416 18.348 22.292 18.7035ZM17.661 0.480381C17.661 1.68066 17.2225 2.80135 16.3484 3.83865C15.2937 5.0718 14.0179 5.78437 12.6343 5.67193C12.6167 5.52793 12.6065 5.37638 12.6065 5.21713C12.6065 4.06487 13.1081 2.83172 13.9989 1.82345C14.4436 1.31295 15.0092 0.888472 15.6951 0.54986C16.3796 0.216299 17.0269 0.0318332 17.6358 0.000244141C17.6536 0.160702 17.661 0.32117 17.661 0.480365V0.480381Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_apple">
                  <rect width="24" height="24" fill="white" transform="translate(0.5)" />
                </clipPath>
              </defs>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin('twitter')}
            disabled={isLoading}
            className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-md hover:bg-[rgba(12,16,20,0.7)] hover:border-white hover:shadow-lg hover:shadow-white/30 hover:scale-110 active:scale-95 transition-[background-color,border-color,box-shadow,transform] duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
              <path
                d="M18.8263 1.90381H22.1998L14.8297 10.3273L23.5 21.7898H16.7112L11.394 14.8378L5.30995 21.7898H1.93443L9.81743 12.7799L1.5 1.90381H8.46111L13.2674 8.25814L18.8263 1.90381ZM17.6423 19.7706H19.5116L7.44539 3.81694H5.43946L17.6423 19.7706Z"
                fill="white"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <div className="h-px flex-1 bg-gradient-to-r from-[#482090] to-[#A06AFF]" />
          <span className="text-[15px] font-bold text-[#B0B0B0]">or</span>
          <div className="h-px flex-1 bg-gradient-to-r from-[#A06AFF] to-[#482090]" />
        </div>

        <p className="text-center text-[15px]">
          <span className="text-webGray">New here? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-primary underline hover:no-underline hover:text-purple-400 transition-colors duration-300"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
