import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import { customAuth } from '@/services/auth/custom-backend-auth';
import {
  AuthMethod,
  formatPhoneNumber,
  validatePhone,
  validateEmail,
  passwordRequirements,
} from './types';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

const SignUpForm: FC<SignUpFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    const error = validatePhone(formatted);
    setPhoneError(error || '');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!value) {
      setEmailError('');
      return;
    }

    const error = validateEmail(value);
    setEmailError(error || '');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (!value) {
      setPasswordError('');
    } else if (!passwordRequirements.every((req) => req.test(value))) {
      setPasswordError('Password does not meet all requirements');
    } else {
      setPasswordError('');
    }

    if (confirmPassword) {
      setConfirmPasswordError(value === confirmPassword ? '' : 'Passwords do not match');
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (!value) {
      setConfirmPasswordError('');
      return;
    }

    setConfirmPasswordError(value === password ? '' : 'Passwords do not match');
  };

  const getRequirementStatus = (requirement: typeof passwordRequirements[0]) => {
    if (!password) return 'neutral';
    return requirement.test(password) ? 'valid' : 'invalid';
  };

  const isPasswordValid = password.length > 0 && passwordRequirements.every((req) => req.test(password));
  const doPasswordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isFormComplete = Boolean(
    ((authMethod === 'email' && email && !emailError) ||
      (authMethod === 'phone' && phone && !phoneError)) &&
      isPasswordValid &&
      doPasswordsMatch &&
      !passwordError &&
      !confirmPasswordError
  );

  const handleSubmit = async () => {
    if (!isFormComplete) {
      if (authMethod === 'email' && !email) {
        setEmailError('Email is required');
      }
      if (authMethod === 'phone' && !phone) {
        setPhoneError('Phone number is required');
      }
      if (!password) {
        setPasswordError('Password does not meet all requirements');
      }
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password');
      }
      if (confirmPassword && password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      }
      return;
    }

    setIsLoading(true);

    try {
      const username =
        authMethod === 'email'
          ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
          : `user_${phone.replace(/\D/g, '').slice(-8)}`;

      await customAuth.register({
        username,
        email: authMethod === 'email' ? email : `${phone}@phone.temp`,
        password,
      });

      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';

      if (errorMessage.includes('already') || errorMessage.includes('taken') || errorMessage.includes('exists')) {
        setEmailError('This email or username is already registered');
      } else {
        setEmailError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between flex-1">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white text-center">Sign Up</h2>

        <div className="inline-flex self-start items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-md shadow-lg shadow-black/20">
          <button
            onClick={() => {
              setAuthMethod('email');
              setPhoneError('');
              setEmailError('');
            }}
            className={cn(
              'flex items-center justify-center min-h-[44px] md:h-8 px-4 rounded-[32px] text-[15px] font-bold transition-[background-color,box-shadow,color] duration-300',
              authMethod === 'email'
                ? 'bg-gradient-to-r from-primary to-[#482090] text-white shadow-lg shadow-primary/30'
                : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white shadow-md'
            )}
          >
            Email
          </button>
          <button
            onClick={() => {
              setAuthMethod('phone');
              setPhoneError('');
              setEmailError('');
            }}
            className={cn(
              'flex items-center justify-center min-h-[44px] md:h-8 px-4 rounded-[32px] text-[15px] font-bold transition-[background-color,box-shadow,color] duration-300',
              authMethod === 'phone'
                ? 'bg-gradient-to-r from-primary to-[#482090] text-white shadow-lg shadow-primary/30'
                : 'text-white hover:text-primary'
            )}
          >
            Phone
          </button>
        </div>

        <div className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-1">
            <div
              className={cn(
                'flex items-center gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-300',
                (authMethod === 'phone' && phoneError) || (authMethod === 'email' && emailError)
                  ? 'border-[#EF454A]'
                  : 'border-widget-border'
              )}
            >
              {authMethod === 'phone' ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 15.8334H10.0083"
                      stroke={phoneError ? '#EF4444' : phone ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.2497 1.66663H8.74967C6.78549 1.66663 5.8034 1.66663 5.1932 2.27682C4.58301 2.88702 4.58301 3.86911 4.58301 5.83329V14.1666C4.58301 16.1308 4.58301 17.1129 5.1932 17.7231C5.8034 18.3333 6.78549 18.3333 8.74967 18.3333H11.2497C13.2138 18.3333 14.1959 18.3333 14.8062 17.7231C15.4163 17.1129 15.4163 16.1308 15.4163 14.1666V5.83329C15.4163 3.86911 15.4163 2.88702 14.8062 2.27682C14.1959 1.66663 13.2138 1.66663 11.2497 1.66663Z"
                      stroke={phoneError ? '#EF4444' : phone ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+1234567890"
                    className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                  />
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5"
                      stroke={emailError ? '#EF4444' : email ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.67989 11.2295C1.73436 13.7842 1.76161 15.0614 2.70421 16.0077C3.64681 16.9538 4.95869 16.9868 7.58244 17.0527C9.1995 17.0933 10.8007 17.0933 12.4177 17.0527C15.0415 16.9868 16.3533 16.9538 17.296 16.0077C18.2386 15.0614 18.2658 13.7842 18.3202 11.2295C18.3378 10.4081 18.3378 9.59159 18.3202 8.77017C18.2658 6.21555 18.2386 4.93825 17.296 3.99205C16.3533 3.04586 15.0415 3.0129 12.4177 2.94698C10.8007 2.90635 9.1995 2.90635 7.58243 2.94697C4.95869 3.01289 3.64681 3.04585 2.70421 3.99205C1.7616 4.93824 1.73436 6.21555 1.67988 8.77017C1.66236 9.59159 1.66237 10.4081 1.67989 11.2295Z"
                      stroke={emailError ? '#EF4444' : email ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Email/Subaccount"
                    className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                  />
                </>
              )}
            </div>
            <div className="h-4 px-1">
              {authMethod === 'phone' && phoneError && (
                <p className="text-xs text-[#EF454A] leading-none">{phoneError}</p>
              )}
              {authMethod === 'email' && emailError && (
                <p className="text-xs text-[#EF454A] leading-none">{emailError}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-col gap-1">
              <div
                className={cn(
                  'flex items-center justify-between gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-300',
                  passwordError ? 'border-[#EF454A]' : 'border-widget-border'
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.9166 12.0835C15.678 12.0835 17.9166 9.84491 17.9166 7.0835C17.9166 4.32207 15.678 2.0835 12.9166 2.0835C10.1552 2.0835 7.91659 4.32207 7.91659 7.0835C7.91659 7.81717 8.0746 8.51391 8.3585 9.14158L2.08325 15.4168V17.9168H4.58325V16.2502H6.24992V14.5835H7.91659L10.8585 11.6416C11.4862 11.9255 12.1829 12.0835 12.9166 12.0835Z"
                      stroke={passwordError ? '#EF4444' : password ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5833 5.4165L13.75 6.24984"
                      stroke={passwordError ? '#EF4444' : password ? '#FFFFFF' : '#B0B0B0'}
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
                    className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
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
                      <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M15 13.5L16.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 11L22 13" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 13L4 11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 13.5L7.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="h-4 px-1">
                {passwordError && <p className="text-xs text-[#EF454A] leading-none">{passwordError}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[#B0B0B0] text-[15px] font-bold">Your password needs to:</p>
              <div className="flex flex-col gap-1">
                {passwordRequirements.map((req) => {
                  const status = getRequirementStatus(req);
                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      {status === 'valid' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M3.3335 9.6665C3.3335 9.6665 4.3335 9.6665 5.66683 11.9998C5.66683 11.9998 9.3727 5.88872 12.6668 4.6665"
                            stroke="#2EBD85"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : status === 'invalid' ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M12 4L8 8M8 8L4 12M8 8L12 12M8 8L4 4"
                            stroke="#EF454A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8.00008 11.3332C9.84103 11.3332 11.3334 9.84079 11.3334 7.99984C11.3334 6.15889 9.84103 4.6665 8.00008 4.6665C6.15913 4.6665 4.66675 6.15889 4.66675 7.99984C4.66675 9.84079 6.15913 11.3332 8.00008 11.3332Z"
                            stroke="#B0B0B0"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span className="text-[#B0B0B0] text-[15px]">{req.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={cn(
                  'flex items-center justify-between gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-md transition-[border-color,box-shadow] duration-300',
                  confirmPasswordError ? 'border-[#EF454A]' : 'border-widget-border'
                )}
              >
                <div className="flex items-center gap-2 flex-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.9166 12.0835C15.678 12.0835 17.9166 9.84491 17.9166 7.0835C17.9166 4.32207 15.678 2.0835 12.9166 2.0835C10.1552 2.0835 7.91659 4.32207 7.91659 7.0835C7.91659 7.81717 8.0746 8.51391 8.3585 9.14158L2.08325 15.4168V17.9168H4.58325V16.2502H6.24992V14.5835H7.91659L10.8585 11.6416C11.4862 11.9255 12.1829 12.0835 12.9166 12.0835Z"
                      stroke={confirmPasswordError ? '#EF4444' : confirmPassword ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5833 5.4165L13.75 6.24984"
                      stroke={confirmPasswordError ? '#EF4444' : confirmPassword ? '#FFFFFF' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm password"
                    className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
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
                      <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M15 13.5L16.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 11L22 13" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 13L4 11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 13.5L7.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="h-4 px-1">
                {confirmPasswordError && <p className="text-xs text-[#EF454A] leading-none">{confirmPasswordError}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleSubmit}
          disabled={!isFormComplete}
          className={cn(
            'w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-md transition-[background-color,box-shadow] duration-300',
            isFormComplete
              ? 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40'
              : 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]'
          )}
        >
          <span className="text-[15px] font-bold">Create account</span>
        </button>

        <p className="text-center text-[15px]">
          <span className="text-[#B0B0B0]">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary underline hover:no-underline hover:text-purple-400 transition-colors duration-300"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
