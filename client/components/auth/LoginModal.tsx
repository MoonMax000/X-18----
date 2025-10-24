import { FC, useState, useRef, useEffect, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ScreenType = 'login' | '2fa' | 'forgot-email' | 'forgot-sent' | 'create-password' | 'password-reset' | 'signup';

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [baseContentHeight, setBaseContentHeight] = useState<number | null>(null);
  const [baseContentWidth, setBaseContentWidth] = useState<number | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [twoFactorError, setTwoFactorError] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [isBlocked2FA, setIsBlocked2FA] = useState(false);
  
  // Forgot Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // SignUp states
  const [signupAuthMethod, setSignupAuthMethod] = useState<'email' | 'phone'>('email');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupEmailError, setSignupEmailError] = useState('');
  const [signupPhoneError, setSignupPhoneError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [signupConfirmPasswordError, setSignupConfirmPasswordError] = useState('');

  const contentContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Password requirements
  const passwordRequirements = [
    {
      id: 'length',
      label: 'At least 12 characters',
      test: (pwd: string) => pwd.length >= 12,
    },
    {
      id: 'case',
      label: 'Uppercase and lowercase',
      test: (pwd: string) => /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'A number',
      test: (pwd: string) => /\d/.test(pwd),
    },
    {
      id: 'special',
      label: 'A special character',
      test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  const getRequirementStatus = (requirement: typeof passwordRequirements[0]) => {
    if (!newPassword) return 'neutral';
    return requirement.test(newPassword) ? 'valid' : 'invalid';
  };

  const getSignupRequirementStatus = (requirement: typeof passwordRequirements[0]) => {
    if (!signupPassword) return 'neutral';
    return requirement.test(signupPassword) ? 'valid' : 'invalid';
  };

  // Format international phone number as user types
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^+\d]/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    if (cleaned.length > 16) {
      cleaned = cleaned.substring(0, 16);
    }
    return cleaned;
  };

  // Validate international phone number
  const validatePhone = (value: string) => {
    if (value.length === 0) {
      setPhoneError('');
      return false;
    }
    if (!value.startsWith('+')) {
      setPhoneError('Phone number must start with + and country code');
      return false;
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Phone number is too short');
      return false;
    }
    if (digits.length > 15) {
      setPhoneError('Phone number is too long');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // Validate email
  const validateEmail = (value: string) => {
    if (value.length === 0) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    validatePhone(formatted);
    setAuthError('');
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setAuthError('');
    validateEmail(value);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setAuthError('');
  };

  const validateSignupPhone = (value: string) => {
    if (value.length === 0) {
      setSignupPhoneError('');
      return false;
    }
    if (!value.startsWith('+')) {
      setSignupPhoneError('Phone number must start with + and country code');
      return false;
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10) {
      setSignupPhoneError('Phone number is too short');
      return false;
    }
    if (digits.length > 15) {
      setSignupPhoneError('Phone number is too long');
      return false;
    }
    setSignupPhoneError('');
    return true;
  };

  const handleSignupPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setSignupPhone(formatted);
    validateSignupPhone(formatted);
  };

  const handleSignupEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignupEmail(value);

    if (!value) {
      setSignupEmailError('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setSignupEmailError('Please enter a valid email address');
    } else {
      setSignupEmailError('');
    }
  };

  const handleSignupPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignupPassword(value);

    if (!value) {
      setSignupPasswordError('');
    } else if (!passwordRequirements.every(req => req.test(value))) {
      setSignupPasswordError('Password does not meet all requirements');
    } else {
      setSignupPasswordError('');
    }

    if (signupConfirmPassword) {
      setSignupConfirmPasswordError(value === signupConfirmPassword ? '' : 'Passwords do not match');
    }
  };

  const handleSignupConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignupConfirmPassword(value);

    if (!value) {
      setSignupConfirmPasswordError('');
      return;
    }

    setSignupConfirmPasswordError(value === signupPassword ? '' : 'Passwords do not match');
  };

  // Handle 2FA code input
  const handle2FACodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    if (twoFactorError) {
      setTwoFactorError('');
    }

    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace in 2FA inputs
  const handle2FAKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  // Verify 2FA code (mock)
  const verify2FACode = () => {
    if (isBlocked2FA || isCodeExpired) return;

    const code = twoFactorCode.join('');
    console.log('Verifying 2FA code:', code);

    if (code === '123456') {
      console.log('2FA verification successful!');
      setTwoFactorError('');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsBlocked2FA(true);
        setTwoFactorError('Too many failed attempts. Try again later.');
      } else {
        setTwoFactorError('Invalid code. Please try again.');
        setTimeout(() => {
          setTwoFactorCode(['', '', '', '', '', '']);
          inputRefs[0].current?.focus();
        }, 1000);
      }
    }
  };

  // Resend 2FA code (mock)
  const resend2FACode = () => {
    if (!canResend || isBlocked2FA) return;

    console.log('Resending 2FA code to:', maskedEmail);
    setTwoFactorCode(['', '', '', '', '', '']);
    setTwoFactorError('');
    setIsCodeExpired(false);
    setFailedAttempts(0);
    inputRefs[0].current?.focus();
    setCanResend(false);
    setResendTimer(60);
  };

  // Go back from 2FA to login
  const goBackToLogin = () => {
    setTwoFactorCode(['', '', '', '', '', '']);
    setCurrentScreen('login');
  };

  // Forgot Password handlers
  const handleSendResetLink = () => {
    if (!forgotEmail) return;
    console.log('Sending reset link to:', forgotEmail);
    setCurrentScreen('forgot-sent');
  };

  const handleResendCode = () => {
    console.log('Resending code to:', forgotEmail);
  };

  const handleResetPassword = () => {
    const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
    const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;
    
    if (!allRequirementsMet || !passwordsMatch) return;
    
    console.log('Resetting password');
    setCurrentScreen('password-reset');
  };

  const handleReturnToSignIn = () => {
    setCurrentScreen('login');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotEmail('');
  };

  const handleBackNavigation = () => {
    if (currentScreen === 'forgot-sent' || currentScreen === 'create-password') {
      setCurrentScreen('forgot-email');
    } else if (currentScreen === 'forgot-email') {
      setCurrentScreen('login');
    } else if (currentScreen === '2fa') {
      goBackToLogin();
    } else if (currentScreen === 'signup') {
      setCurrentScreen('login');
    }
  };

  // Handle login - simulates different error scenarios
  const handleLogin = () => {
    setAuthError('');
    setAttemptsRemaining(null);

    const isPhoneValid = authMethod === 'phone' ? validatePhone(phoneNumber) : true;
    const isEmailValid = authMethod === 'email' ? validateEmail(email) : true;

    if (!password) {
      setAuthError('Password is required');
      return;
    }

    if (authMethod === 'phone' && !isPhoneValid) {
      return;
    }

    if (authMethod === 'email' && !isEmailValid) {
      return;
    }

    console.log('Login attempt:', { authMethod, phoneNumber, email, password });

    // Mock login validation - simulate different scenarios
    // For demo: password 'wrongpassword' triggers attempt counter
    if (password === 'wrongpassword') {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 10) {
        setIsBlocked(true);
        setAuthError('Too many failed attempts. Account locked for 30 minutes.');
        return;
      } else if (newFailedAttempts >= 5) {
        setAuthError('Too many failed attempts. IP blocked for 15 minutes.');
        setIsBlocked(true);
        return;
      } else {
        const remaining = 10 - newFailedAttempts;
        setAttemptsRemaining(remaining);
        setAuthError('Invalid login or password.');
        return;
      }
    }

    // Mock: Show 2FA screen on successful login
    const userEmail = authMethod === 'email' ? email : 'example@gmail.com';
    const masked = userEmail.replace(/(.{1})(.*)(@.*)/, '$1***$3');
    setMaskedEmail(masked);
    setCurrentScreen('2fa');
  };

  useEffect(() => {
    const element = contentContainerRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const { height, width } = element.getBoundingClientRect();
      setBaseContentHeight(prev => {
        if (height === 0) {
          return prev;
        }
        return prev === null ? height : Math.max(prev, height);
      });
      setBaseContentWidth(prev => {
        if (width === 0) {
          return prev;
        }
        return prev === null ? width : Math.max(prev, width);
      });
    };

    updateHeight();

    if (typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new window.ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentScreen]);

  // Resend timer countdown
  useEffect(() => {
    if (currentScreen !== '2fa') return;

    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer, currentScreen]);

  // Reset resend timer when 2FA screen appears
  useEffect(() => {
    if (currentScreen === '2fa') {
      setCanResend(false);
      setResendTimer(60);
    }
  }, [currentScreen]);

  // Code expiration timer (60 seconds)
  useEffect(() => {
    if (currentScreen !== '2fa') return;

    const expirationTimer = setTimeout(() => {
      setIsCodeExpired(true);
      setTwoFactorError('Code expired. Request a new one.');
    }, 60000);

    return () => clearTimeout(expirationTimer);
  }, [currentScreen]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (twoFactorCode.every(digit => digit !== '')) {
      verify2FACode();
    }
  }, [twoFactorCode]);

  // Auto-focus first input when 2FA screen appears
  useEffect(() => {
    if (currentScreen === '2fa') {
      inputRefs[0].current?.focus();
    }
  }, [currentScreen]);

  // Reset all form data when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset to initial state
      setCurrentScreen('login');
      setAuthMethod('email');
      setShowPassword(false);
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setPhoneError('');
      setEmailError('');
      setAuthError('');
      setAttemptsRemaining(null);
      setIsBlocked(false);
      setMaskedEmail('');
      setTwoFactorCode(['', '', '', '', '', '']);
      setCanResend(false);
      setResendTimer(60);
      setTwoFactorError('');
      setFailedAttempts(0);
      setIsCodeExpired(false);
      setIsBlocked2FA(false);
      setForgotEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowNewPassword(false);
      setShowConfirmNewPassword(false);
      setSignupAuthMethod('email');
      setSignupEmail('');
      setSignupPhone('');
      setSignupPassword('');
      setSignupConfirmPassword('');
      setShowSignupPassword(false);
      setShowSignupConfirmPassword(false);
      setSignupEmailError('');
      setSignupPhoneError('');
      setSignupPasswordError('');
      setSignupConfirmPasswordError('');
    }
  }, [isOpen]);

  const containerStyles = {
    minHeight: baseContentHeight ?? '569px',
    minWidth: baseContentWidth ?? '341px',
  } satisfies CSSProperties;

  const isSignupPasswordValid = signupPassword.length > 0 && passwordRequirements.every(req => req.test(signupPassword));
  const doSignupPasswordsMatch = signupConfirmPassword.length > 0 && signupPassword === signupConfirmPassword;
  const isSignupFormComplete = Boolean(
    ((signupAuthMethod === 'email' && signupEmail && !signupEmailError) ||
     (signupAuthMethod === 'phone' && signupPhone && !signupPhoneError)) &&
    isSignupPasswordValid &&
    doSignupPasswordsMatch &&
    !signupPasswordError &&
    !signupConfirmPasswordError
  );

  const handleSignupSubmit = () => {
    if (!isSignupFormComplete) {
      if (signupAuthMethod === 'email' && !signupEmail) {
        setSignupEmailError('Email is required');
      }
      if (signupAuthMethod === 'phone' && !signupPhone) {
        setSignupPhoneError('Phone number is required');
      }
      if (!signupPassword) {
        setSignupPasswordError('Password does not meet all requirements');
      }
      if (!signupConfirmPassword) {
        setSignupConfirmPasswordError('Please confirm your password');
      }
      if (signupConfirmPassword && signupPassword !== signupConfirmPassword) {
        setSignupConfirmPasswordError('Passwords do not match');
      }
      return;
    }

    console.log('Creating account', {
      authMethod: signupAuthMethod,
      email: signupAuthMethod === 'email' ? signupEmail : undefined,
      phone: signupAuthMethod === 'phone' ? signupPhone : undefined,
    });
  };

  const renderBackButton = () => {
    if (currentScreen === 'password-reset' || currentScreen === 'login' || currentScreen === 'signup') return null;

    return (
      <button
        type="button"
        onClick={handleBackNavigation}
        className="absolute top-4 left-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#B0B0B0] hover:text-white transition-colors z-20 cursor-pointer touch-manipulation"
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="pointer-events-none">
          <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.99996 7.00002C8.99996 7.00002 4.00001 10.6824 4 12C3.99999 13.3176 9 17 9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    );
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <div className="flex flex-col flex-1">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Sign In
              </h2>

              <div className="inline-flex self-start items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
                <button
                  onClick={() => {
                    setAuthMethod('email');
                    setPhoneError('');
                    setEmailError('');
                    setAuthError('');
                  }}
                  className={cn(
                    'flex items-center justify-center h-8 px-4 rounded-[32px] text-[15px] font-bold transition-all duration-300',
                    authMethod === 'email'
                      ? 'bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white backdrop-blur-[58.333px]'
                      : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white backdrop-blur-[58.333px]'
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
                    'flex items-center justify-center h-8 px-4 rounded-[32px] text-[15px] font-bold transition-all duration-300',
                    authMethod === 'phone'
                      ? 'bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white backdrop-blur-[58.333px]'
                      : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white backdrop-blur-[58.333px]'
                  )}
                >
                  Phone
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "flex items-center gap-2 h-11 px-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-all duration-300",
                    (authMethod === 'phone' && phoneError) || authError
                      ? "border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20"
                      : (authMethod === 'email' && emailError) || authError
                      ? "border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20"
                      : "border-[#181B22] focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 hover:border-primary/50"
                  )}>
                    {authMethod === 'phone' ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 15.8334H10.0083" stroke={(phoneError || authError) ? "#EF4444" : phoneNumber ? "#FFFFFF" : "#B0B0B0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.2497 1.66663H8.74967C6.78549 1.66663 5.8034 1.66663 5.1932 2.27682C4.58301 2.88702 4.58301 3.86911 4.58301 5.83329V14.1666C4.58301 16.1308 4.58301 17.1129 5.1932 17.7231C5.8034 18.3333 6.78549 18.3333 8.74967 18.3333H11.2497C13.2138 18.3333 14.1959 18.3333 14.8062 17.7231C15.4163 17.1129 15.4163 16.1308 15.4163 14.1666V5.83329C15.4163 3.86911 15.4163 2.88702 14.8062 2.27682C14.1959 1.66663 13.2138 1.66663 11.2497 1.66663Z" stroke={(phoneError || authError) ? "#EF4444" : phoneNumber ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className="flex items-center flex-1 relative">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            placeholder="+1234567890"
                            className="flex-1 bg-transparent text-[15px] text-white placeholder:text-webGray outline-none"
                          />
                          <div className="w-[1px] h-5 bg-white/50 absolute right-0 animate-pulse" style={{ display: phoneNumber.length > 0 ? 'none' : 'block' }} />
                        </div>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke={(emailError || authError) ? "#EF4444" : email ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M1.67989 11.2296C1.73436 13.7843 1.76161 15.0615 2.70421 16.0078C3.64681 16.954 4.95869 16.9869 7.58244 17.0528C9.1995 17.0935 10.8007 17.0935 12.4177 17.0528C15.0415 16.9869 16.3533 16.954 17.296 16.0078C18.2386 15.0615 18.2658 13.7843 18.3202 11.2296C18.3378 10.4082 18.3378 9.59171 18.3202 8.77029C18.2658 6.21568 18.2386 4.93837 17.296 3.99218C16.3533 3.04599 15.0415 3.01303 12.4177 2.9471C10.8007 2.90647 9.1995 2.90647 7.58243 2.94709C4.95869 3.01301 3.64681 3.04597 2.70421 3.99217C1.7616 4.93836 1.73436 6.21567 1.67988 8.77029C1.66236 9.59171 1.66237 10.4082 1.67989 11.2296Z" stroke={(emailError || authError) ? "#EF4444" : email ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
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

                <div className={cn(
                  "flex items-center justify-between gap-2 h-11 px-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-all duration-300",
                  authError
                    ? "border-red-500 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/20"
                    : "border-[#181B22] focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20 hover:border-primary/50"
                )}>
                  <div className="flex items-center gap-2 flex-1">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.9166 12.0834C15.678 12.0834 17.9166 9.84479 17.9166 7.08337C17.9166 4.32195 15.678 2.08337 12.9166 2.08337C10.1552 2.08337 7.91659 4.32195 7.91659 7.08337C7.91659 7.81705 8.0746 8.51379 8.3585 9.14146L2.08325 15.4167V17.9167H4.58325V16.25H6.24992V14.5834H7.91659L10.8585 11.6415C11.4862 11.9254 12.1829 12.0834 12.9166 12.0834Z" stroke={authError ? "#EF4444" : password ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.5833 5.41663L13.75 6.24996" stroke={authError ? "#EF4444" : password ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
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
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                        <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M15 13.5L16.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20 11L22 13" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 13L4 11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 13.5L7.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleLogin}
                    disabled={isBlocked}
                    className={cn(
                      "w-full py-[5px] flex items-center justify-center gap-[10px] rounded-[8px] text-[15px] font-bold text-white transition-all duration-300",
                      isBlocked
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-l from-[#482090] to-[#A06AFF] hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98]"
                    )}
                  >
                    Sign In
                  </button>

                  {authError && (
                    <p className="text-xs text-red-500 text-center">
                      {authError}
                      {attemptsRemaining !== null && ` You have ${attemptsRemaining} attempts remaining.`}
                    </p>
                  )}

                  <button
                    onClick={() => setCurrentScreen('forgot-email')}
                    className="text-[15px] text-primary hover:underline transition-all duration-300 hover:text-purple-400"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-6 pt-10">
              <div className="flex items-center justify-center gap-6">
                <button className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:bg-[rgba(12,16,20,0.7)] hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300">
                  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
                    <g clipPath="url(#clip0_google)">
                      <path d="M12.4998 9.81812V14.4654H18.9579C18.6743 15.9599 17.8233 17.2254 16.547 18.0763L20.4415 21.0982C22.7106 19.0037 24.0197 15.9273 24.0197 12.2728C24.0197 11.4219 23.9433 10.6036 23.8015 9.81825L12.4998 9.81812Z" fill="#4285F4"/>
                      <path d="M5.77461 14.2839L4.89625 14.9563L1.78711 17.3781C3.76165 21.2944 7.80862 23.9999 12.4995 23.9999C15.7394 23.9999 18.4557 22.9308 20.4412 21.0981L16.5467 18.0763C15.4776 18.7963 14.114 19.2327 12.4995 19.2327C9.37951 19.2327 6.72868 17.1273 5.77952 14.2909L5.77461 14.2839Z" fill="#34A853"/>
                      <path d="M1.78718 6.62183C0.969042 8.23631 0.5 10.0581 0.5 11.9999C0.5 13.9417 0.969042 15.7636 1.78718 17.378C1.78718 17.3889 5.77997 14.2799 5.77997 14.2799C5.53998 13.5599 5.39812 12.7963 5.39812 11.9998C5.39812 11.2033 5.53998 10.4398 5.77997 9.71976L1.78718 6.62183Z" fill="#FBBC05"/>
                      <path d="M12.4997 4.77818C14.267 4.77818 15.8379 5.38907 17.0925 6.56727L20.5288 3.13095C18.4452 1.18917 15.7398 0 12.4997 0C7.80887 0 3.76165 2.69454 1.78711 6.62183L5.77978 9.72001C6.72882 6.88362 9.37976 4.77818 12.4997 4.77818Z" fill="#EA4335"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_google">
                        <rect width="24" height="24" fill="white" transform="translate(0.5)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </button>

                <button className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:bg-[rgba(12,16,20,0.7)] hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300">
                  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
                    <g clipPath="url(#clip0_apple)">
                      <path d="M22.292 18.7035C21.929 19.542 21.4994 20.3139 21.0016 21.0235C20.3231 21.9908 19.7676 22.6605 19.3395 23.0323C18.6758 23.6426 17.9647 23.9552 17.2032 23.973C16.6566 23.973 15.9973 23.8175 15.23 23.5019C14.4601 23.1878 13.7525 23.0323 13.1056 23.0323C12.4271 23.0323 11.6994 23.1878 10.9211 23.5019C10.1415 23.8175 9.51355 23.9819 9.03342 23.9982C8.30322 24.0293 7.57539 23.7078 6.8489 23.0323C6.38521 22.6279 5.80523 21.9345 5.11043 20.9524C4.36498 19.9035 3.75211 18.6872 3.27198 17.3006C2.75777 15.8029 2.5 14.3526 2.5 12.9484C2.5 11.3401 2.84754 9.95284 3.54367 8.79035C4.09076 7.8566 4.81859 7.12003 5.72953 6.57931C6.64046 6.03858 7.62473 5.76304 8.68469 5.74541C9.26467 5.74541 10.0252 5.92481 10.9704 6.27739C11.9129 6.63116 12.5181 6.81056 12.7834 6.81056C12.9817 6.81056 13.654 6.60079 14.7937 6.18258C15.8714 5.79474 16.781 5.63415 17.5262 5.69741C19.5454 5.86037 21.0624 6.65634 22.0712 8.09037C20.2654 9.18456 19.3721 10.7171 19.3898 12.6831C19.4061 14.2145 19.9617 15.4888 21.0535 16.5006C21.5483 16.9703 22.1009 17.3332 22.7156 17.591C22.5823 17.9776 22.4416 18.348 22.292 18.7035ZM17.661 0.480381C17.661 1.68066 17.2225 2.80135 16.3484 3.83865C15.2937 5.0718 14.0179 5.78437 12.6343 5.67193C12.6167 5.52793 12.6065 5.37638 12.6065 5.21713C12.6065 4.06487 13.1081 2.83172 13.9989 1.82345C14.4436 1.31295 15.0092 0.888472 15.6951 0.54986C16.3796 0.216299 17.0269 0.0318332 17.6358 0.000244141C17.6536 0.160702 17.661 0.32117 17.661 0.480365V0.480381Z" fill="white"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_apple">
                        <rect width="24" height="24" fill="white" transform="translate(0.5)"/>
                      </clipPath>
                    </defs>
                  </svg>
                </button>

                <button className="flex items-center justify-center w-11 h-11 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:bg-[rgba(12,16,20,0.7)] hover:border-white hover:shadow-lg hover:shadow-white/30 hover:scale-110 active:scale-95 transition-all duration-300">
                  <svg width="24" height="24" viewBox="0 0 25 24" fill="none">
                    <path d="M18.8263 1.90381H22.1998L14.8297 10.3273L23.5 21.7898H16.7112L11.394 14.8378L5.30995 21.7898H1.93443L9.81743 12.7799L1.5 1.90381H8.46111L13.2674 8.25814L18.8263 1.90381ZM17.6423 19.7706H19.5116L7.44539 3.81694H5.43946L17.6423 19.7706Z" fill="white"/>
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
                  onClick={() => setCurrentScreen('signup')}
                  className="text-primary underline hover:no-underline hover:text-purple-400 transition-colors duration-300"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        );

      case '2fa':
        return (
          <div className="flex flex-col justify-between flex-1">
            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white text-center">
                  Two-Factor Authentication
                </h2>

                <p className="text-[15px] text-[#B0B0B0] text-center">
                  We've sent a 6-digit code to your email:{' '}
                  <span className="underline">{maskedEmail}</span>
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex justify-between w-full">
                  {twoFactorCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={inputRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handle2FACodeChange(index, e.target.value)}
                      onKeyDown={(e) => handle2FAKeyDown(index, e)}
                      className={cn(
                        "w-11 h-11 text-center text-white text-xl font-semibold bg-[rgba(12,16,20,0.5)] rounded-xl border backdrop-blur-[50px] outline-none transition-all duration-300",
                        twoFactorError
                          ? "border-[#EF454A]"
                          : digit
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "border-[#181B22] focus:border-primary focus:shadow-lg focus:shadow-primary/20"
                      )}
                      disabled={isBlocked2FA}
                    />
                  ))}
                </div>

                {twoFactorError && (
                  <p className="text-[15px] font-normal text-red-500 text-center">
                    {twoFactorError}
                  </p>
                )}
              </div>
            </div>

            {!isBlocked2FA && (
              <button
                onClick={resend2FACode}
                disabled={!canResend}
                className={cn(
                  "text-[15px] font-normal transition-all duration-300 text-center",
                  canResend
                    ? "text-primary underline cursor-pointer"
                    : "text-[#808283] cursor-not-allowed"
                )}
              >
                {canResend ? 'Resend Code' : `Resend Code (${resendTimer}s)`}
              </button>
            )}
          </div>
        );

      case 'forgot-email':
        return (
          <>
            <div className="flex flex-col items-start gap-4 w-full mt-12 mb-12">
              <h2 className="w-full text-center text-white text-2xl font-bold">
                Forgot Password
              </h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className={cn(
              "flex h-11 px-[10px] py-3 items-center gap-2 w-full rounded-xl border backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]",
              "border-widget-border"
            )}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke={forgotEmail ? "white" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M1.67989 11.229C1.73436 13.7837 1.76161 15.0609 2.70421 16.0072C3.64681 16.9533 4.95869 16.9863 7.58244 17.0522C9.1995 17.0929 10.8007 17.0929 12.4177 17.0522C15.0415 16.9863 16.3533 16.9533 17.296 16.0072C18.2386 15.0609 18.2658 13.7837 18.3202 11.229C18.3376 10.4076 18.3376 9.5911 18.3202 8.76968C18.2658 6.21507 18.2386 4.93776 17.296 3.99157C16.3533 3.04537 15.0415 3.01242 12.4177 2.94649C10.8007 2.90586 9.19925 2.90586 7.58219 2.94648C4.95845 3.0124 3.64657 3.04536 2.70396 3.99156C1.76135 4.93775 1.73412 6.21506 1.67964 8.76968C1.66212 9.5911 1.66213 10.4076 1.67965 11.229Z" stroke={forgotEmail ? "white" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Email/Subaccount"
                className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-[#B0B0B0]"
              />
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleSendResetLink}
                disabled={!forgotEmail}
                className={cn(
                  "w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-[50px]",
                  forgotEmail
                    ? "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40"
                    : "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]"
                )}
              >
                <span className="text-[15px] font-bold">Send reset link</span>
              </button>
            </div>
          </>
        );

      case 'forgot-sent':
        return (
          <>
            <div className="flex flex-col items-start gap-2 w-full">
              <h2 className="w-full text-center text-white text-2xl font-bold">
                Forgot Password
              </h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="flex h-11 px-[10px] py-3 items-center gap-2 w-full rounded-[8px] border border-[#181B22] backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke="#B0B0B0" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M1.67989 11.229C1.73436 13.7837 1.76161 15.0609 2.70421 16.0072C3.64681 16.9533 4.95869 16.9863 7.58244 17.0522C9.1995 17.0929 10.8007 17.0929 12.4177 17.0522C15.0415 16.9863 16.3533 16.9533 17.296 16.0072C18.2386 15.0609 18.2658 13.7837 18.3202 11.229C18.3376 10.4076 18.3376 9.5911 18.3202 8.76968C18.2658 6.21507 18.2386 4.93776 17.296 3.99157C16.3533 3.04537 15.0415 3.01242 12.4177 2.94649C10.8007 2.90586 9.19925 2.90586 7.58219 2.94648C4.95845 3.0124 3.64657 3.04536 2.70396 3.99156C1.76135 4.93775 1.73412 6.21506 1.67964 8.76968C1.66212 9.5911 1.66213 10.4076 1.67965 11.229Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#B0B0B0] text-[15px]">{forgotEmail || 'example@gmail.com'}</span>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleResendCode}
                className="text-primary text-[15px] hover:text-purple-400 transition-colors"
              >
                Resend Code
              </button>
            </div>
          </>
        );

      case 'create-password':
        return (
          <>
            <div className="flex flex-col items-start gap-2 w-full">
              <h2 className="w-full text-center text-white text-2xl font-bold">
                Create a New Password
              </h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Your identity has been verified. Now set a new strong password to protect your account.
              </p>
            </div>

            <div className="flex flex-col items-start gap-[10px] w-full">
              <div className="flex h-11 px-[10px] py-3 justify-between items-center w-full rounded-xl border border-[#181B22] backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.9166 12.084C15.678 12.084 17.9166 9.8454 17.9166 7.08398C17.9166 4.32256 15.678 2.08398 12.9166 2.08398C10.1552 2.08398 7.91659 4.32256 7.91659 7.08398C7.91659 7.81766 8.0746 8.5144 8.3585 9.14207L2.08325 15.4173V17.9173H4.58325V16.2507H6.24992V14.584H7.91659L10.8585 11.6421C11.4862 11.926 12.1829 12.084 12.9166 12.084Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.5833 5.41602L13.75 6.24935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {showNewPassword ? (
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password"
                      className="bg-transparent text-white text-[15px] outline-none placeholder:text-[#B0B0B0]"
                      style={{ width: '180px' }}
                    />
                  ) : newPassword ? (
                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: Math.min(newPassword.length, 12) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#B0B0B0] text-[15px]">Password</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-[#B0B0B0] hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>

              <div className="flex flex-col items-start gap-2 w-full">
                <p className="text-[#B0B0B0] text-[15px] font-bold">Your password needs to:</p>
                <div className="flex flex-col items-start gap-1">
                  {passwordRequirements.map((req) => {
                    const status = getRequirementStatus(req);
                    return (
                      <div key={req.id} className="flex justify-center items-center gap-2">
                        {status === 'valid' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.33325 9.66602C3.33325 9.66602 4.33325 9.66602 5.66659 11.9993C5.66659 11.9993 9.37245 5.88824 12.6666 4.66602" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : status === 'invalid' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L8 8M8 8L4 12M8 8L12 12M8 8L4 4" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M7.99984 11.3327C9.84079 11.3327 11.3332 9.8403 11.3332 7.99935C11.3332 6.1584 9.84079 4.66602 7.99984 4.66602C6.15889 4.66602 4.6665 6.1584 4.6665 7.99935C4.6665 9.8403 6.15889 11.3327 7.99984 11.3327Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                        )}
                        <span className="text-[#B0B0B0] text-center text-[15px]">{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex h-11 px-[10px] py-3 justify-between items-center w-full rounded-xl border border-[#181B22] backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.9166 12.084C15.678 12.084 17.9166 9.8454 17.9166 7.08398C17.9166 4.32256 15.678 2.08398 12.9166 2.08398C10.1552 2.08398 7.91659 4.32256 7.91659 7.08398C7.91659 7.81766 8.0746 8.5144 8.3585 9.14207L2.08325 15.4173V17.9173H4.58325V16.2507H6.24992V14.584H7.91659L10.8585 11.6421C11.4862 11.926 12.1829 12.084 12.9166 12.084Z" stroke={confirmNewPassword ? "white" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.5833 5.41602L13.75 6.24935" stroke={confirmNewPassword ? "white" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {showConfirmNewPassword ? (
                    <input
                      type="text"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="bg-transparent text-white text-[15px] outline-none placeholder:text-[#B0B0B0]"
                      style={{ width: '180px' }}
                    />
                  ) : confirmNewPassword ? (
                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: Math.min(confirmNewPassword.length, 12) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#B0B0B0] text-[15px]">Confirm password</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="text-[#B0B0B0] hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleResetPassword}
                disabled={!passwordRequirements.every(req => req.test(newPassword)) || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                className={cn(
                  "w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-[50px]",
                  passwordRequirements.every(req => req.test(newPassword)) && newPassword && confirmNewPassword && newPassword === confirmNewPassword
                    ? "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40"
                    : "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]"
                )}
              >
                <span className="text-[15px] font-bold">Reset Password</span>
              </button>
            </div>
          </>
        );

      case 'password-reset':
        return (
          <>
            <div className="flex flex-col items-start gap-2 w-full">
              <h2 className="w-full text-center text-white text-2xl font-bold">
                Password Reset
              </h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Your new password has been saved and you've been logged out of all active sessions for security reasons.
              </p>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleReturnToSignIn}
                className="w-full py-[5px] flex items-center justify-center rounded-[8px] bg-gradient-to-l from-[#482090] to-[#A06AFF] backdrop-blur-[50px] text-white hover:shadow-xl hover:shadow-primary/40"
              >
                <span className="text-[15px] font-bold">Return to Sign In</span>
              </button>
            </div>
          </>
        );

      case 'signup':
        return (
          <div className="flex flex-col justify-between flex-1">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white text-center">
                Sign Up
              </h2>

              <div className="inline-flex self-start items-center gap-3 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] shadow-lg shadow-black/20">
                <button
                  onClick={() => {
                    setSignupAuthMethod('email');
                    setSignupPhoneError('');
                    setSignupEmailError('');
                  }}
                  className={cn(
                    'flex items-center justify-center h-8 px-4 rounded-[32px] text-[15px] font-bold transition-all duration-300',
                    signupAuthMethod === 'email'
                      ? 'bg-gradient-to-r from-primary to-[#482090] text-white shadow-lg shadow-primary/30'
                      : 'border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white shadow-md'
                  )}
                >
                  Email
                </button>
                <button
                  onClick={() => {
                    setSignupAuthMethod('phone');
                    setSignupPhoneError('');
                    setSignupEmailError('');
                  }}
                  className={cn(
                    'flex items-center justify-center h-8 px-4 rounded-[32px] text-[15px] font-bold transition-all duration-300',
                    signupAuthMethod === 'phone'
                      ? 'bg-gradient-to-r from-primary to-[#482090] text-white shadow-lg shadow-primary/30'
                      : 'text-white hover:text-primary'
                  )}
                >
                  Phone
                </button>
              </div>

              <div className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "flex items-center gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-all duration-300",
                    (signupAuthMethod === 'phone' && signupPhoneError) || (signupAuthMethod === 'email' && signupEmailError)
                      ? "border-[#EF454A]"
                      : "border-widget-border"
                  )}>
                    {signupAuthMethod === 'phone' ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 15.8334H10.0083" stroke={(signupPhoneError) ? "#EF4444" : signupPhone ? "#FFFFFF" : "#B0B0B0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.2497 1.66663H8.74967C6.78549 1.66663 5.8034 1.66663 5.1932 2.27682C4.58301 2.88702 4.58301 3.86911 4.58301 5.83329V14.1666C4.58301 16.1308 4.58301 17.1129 5.1932 17.7231C5.8034 18.3333 6.78549 18.3333 8.74967 18.3333H11.2497C13.2138 18.3333 14.1959 18.3333 14.8062 17.7231C15.4163 17.1129 15.4163 16.1308 15.4163 14.1666V5.83329C15.4163 3.86911 15.4163 2.88702 14.8062 2.27682C14.1959 1.66663 13.2138 1.66663 11.2497 1.66663Z" stroke={(signupPhoneError) ? "#EF4444" : signupPhone ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={handleSignupPhoneChange}
                          placeholder="+1234567890"
                          className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                        />
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke={signupEmailError ? "#EF4444" : signupEmail ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                          <path d="M1.67989 11.2295C1.73436 13.7842 1.76161 15.0614 2.70421 16.0077C3.64681 16.9538 4.95869 16.9868 7.58244 17.0527C9.1995 17.0933 10.8007 17.0933 12.4177 17.0527C15.0415 16.9868 16.3533 16.9538 17.296 16.0077C18.2386 15.0614 18.2658 13.7842 18.3202 11.2295C18.3378 10.4081 18.3378 9.59159 18.3202 8.77017C18.2658 6.21555 18.2386 4.93825 17.296 3.99205C16.3533 3.04586 15.0415 3.0129 12.4177 2.94698C10.8007 2.90635 9.1995 2.90635 7.58243 2.94697C4.95869 3.01289 3.64681 3.04585 2.70421 3.99205C1.7616 4.93824 1.73436 6.21555 1.67988 8.77017C1.66236 9.59159 1.66237 10.4081 1.67989 11.2295Z" stroke={signupEmailError ? "#EF4444" : signupEmail ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={handleSignupEmailChange}
                          placeholder="Email/Subaccount"
                          className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                        />
                      </>
                    )}
                  </div>
                  <div className="h-4 px-1">
                    {signupAuthMethod === 'phone' && signupPhoneError && (
                      <p className="text-xs text-[#EF454A] leading-none">{signupPhoneError}</p>
                    )}
                    {signupAuthMethod === 'email' && signupEmailError && (
                      <p className="text-xs text-[#EF454A] leading-none">{signupEmailError}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      "flex items-center justify-between gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-all duration-300",
                      signupPasswordError
                        ? "border-[#EF454A]"
                        : "border-widget-border"
                    )}>
                      <div className="flex items-center gap-2 flex-1">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M12.9166 12.0835C15.678 12.0835 17.9166 9.84491 17.9166 7.0835C17.9166 4.32207 15.678 2.0835 12.9166 2.0835C10.1552 2.0835 7.91659 4.32207 7.91659 7.0835C7.91659 7.81717 8.0746 8.51391 8.3585 9.14158L2.08325 15.4168V17.9168H4.58325V16.2502H6.24992V14.5835H7.91659L10.8585 11.6416C11.4862 11.9255 12.1829 12.0835 12.9166 12.0835Z" stroke={signupPasswordError ? "#EF4444" : signupPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14.5833 5.4165L13.75 6.24984" stroke={signupPasswordError ? "#EF4444" : signupPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={handleSignupPasswordChange}
                          placeholder="Password"
                          className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="hover:opacity-70 transition-opacity"
                        aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      >
                        {showSignupPassword ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                            <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M15 13.5L16.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20 11L22 13" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 13L4 11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 13.5L7.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="h-4 px-1">
                      {signupPasswordError && (
                        <p className="text-xs text-[#EF454A] leading-none">{signupPasswordError}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-[#B0B0B0] text-[15px] font-bold">Your password needs to:</p>
                    <div className="flex flex-col gap-1">
                      {passwordRequirements.map((req) => {
                        const status = getSignupRequirementStatus(req);
                        return (
                          <div key={req.id} className="flex items-center gap-2">
                            {status === 'valid' ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3.3335 9.6665C3.3335 9.6665 4.3335 9.6665 5.66683 11.9998C5.66683 11.9998 9.3727 5.88872 12.6668 4.6665" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : status === 'invalid' ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L8 8M8 8L4 12M8 8L12 12M8 8L4 4" stroke="#EF454A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8.00008 11.3332C9.84103 11.3332 11.3334 9.84079 11.3334 7.99984C11.3334 6.15889 9.84103 4.6665 8.00008 4.6665C6.15913 4.6665 4.66675 6.15889 4.66675 7.99984C4.66675 9.84079 6.15913 11.3332 8.00008 11.3332Z" stroke="#B0B0B0" strokeWidth="1.5" strokeLinejoin="round"/>
                              </svg>
                            )}
                            <span className="text-[#B0B0B0] text-[15px]">{req.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      "flex items-center justify-between gap-2 h-11 px-[10px] py-3 rounded-xl border bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] transition-all duration-300",
                      signupConfirmPasswordError
                        ? "border-[#EF454A]"
                        : "border-widget-border"
                    )}>
                    <div className="flex items-center gap-2 flex-1">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.9166 12.0835C15.678 12.0835 17.9166 9.84491 17.9166 7.0835C17.9166 4.32207 15.678 2.0835 12.9166 2.0835C10.1552 2.0835 7.91659 4.32207 7.91659 7.0835C7.91659 7.81717 8.0746 8.51391 8.3585 9.14158L2.08325 15.4168V17.9168H4.58325V16.2502H6.24992V14.5835H7.91659L10.8585 11.6416C11.4862 11.9255 12.1829 12.0835 12.9166 12.0835Z" stroke={signupConfirmPasswordError ? "#EF4444" : signupConfirmPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.5833 5.4165L13.75 6.24984" stroke={signupConfirmPasswordError ? "#EF4444" : signupConfirmPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type={showSignupConfirmPassword ? "text" : "password"}
                        value={signupConfirmPassword}
                        onChange={handleSignupConfirmPasswordChange}
                        placeholder="Confirm password"
                        className="flex-1 bg-transparent text-[15px] text-[#B0B0B0] placeholder:text-[#B0B0B0] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={showSignupConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupConfirmPassword ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                          <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#B0B0B0" strokeWidth="1.5"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M22 8C22 8 18 14 12 14C6 14 2 8 2 8" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M15 13.5L16.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M20 11L22 13" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 13L4 11" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 13.5L7.5 16" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="h-4 px-1">
                    {signupConfirmPasswordError && (
                      <p className="text-xs text-[#EF454A] leading-none">{signupConfirmPasswordError}</p>
                    )}
                  </div>
                </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleSignupSubmit}
                disabled={!isSignupFormComplete}
                className={cn(
                  "w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-[50px] transition-all duration-300",
                  isSignupFormComplete
                    ? "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40"
                    : "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]"
                )}
              >
                <span className="text-[15px] font-bold">Create account</span>
              </button>

              <p className="text-center text-[15px]">
                <span className="text-[#B0B0B0]">Already have an account? </span>
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="text-primary underline hover:no-underline hover:text-purple-400 transition-colors duration-300"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-stretch justify-center max-w-[786px] w-full md:min-h-[560px] rounded-[25px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(160,106,255,0.25)]">
        <div className="w-full md:flex-1 md:max-w-[393px] flex flex-col items-center justify-center p-6 md:p-8 md:rounded-l-[25px] bg-[rgba(12,16,20,0.8)] backdrop-blur-[50px] border border-[#181B22] md:border-r-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-600/20 opacity-50 pointer-events-none" />

          {renderBackButton()}

          <div className="md:hidden mb-6 relative z-10">
            <div className="logo-anim-unit logo-effect-outline">
              <svg width="80" height="92" viewBox="0 0 113 128" fill="none" className="logo-svg">
                <g clipPath="url(#clip0_logo_mobile)">
                  <path
                    className="logo-shape"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.748047 63.9619L0.753226 64.3533C13.1061 61.8201 25.5249 59.1745 37.9666 56.5237L37.9895 119.407L79.8468 128C79.8468 114.191 79.7174 75.2902 79.8542 61.485L50.5652 55.4724L46.667 54.6726C68.5682 50.0183 90.5085 45.4255 112.252 41.4711L112.245 0C75.4715 7.54699 37.6389 16.4678 0.748047 22.8836L0.748047 63.9619Z"
                    fill="url(#paint0_linear_logo_mobile)"
                  />
                </g>
                <defs>
                  <linearGradient id="paint0_linear_logo_mobile" x1="27.8276" y1="137.6" x2="75.9893" y2="8.13923" gradientUnits="userSpaceOnUse">
                    <stop className="logo-stop-primary" stopColor="#181A20" />
                    <stop className="logo-stop-accent" offset="1" stopColor="#A06AFF" />
                  </linearGradient>
                  <clipPath id="clip0_logo_mobile">
                    <rect width="111.504" height="128" fill="white" transform="translate(0.748047)" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
          
          <div
            ref={contentContainerRef}
            style={containerStyles}
            className="w-full max-w-[341px] flex flex-col gap-4 relative z-10"
          >
            {renderContent()}
          </div>
        </div>

        <div className="hidden md:flex md:flex-1 md:max-w-[393px] flex-col items-center justify-center gap-10 p-6 md:p-8 rounded-r-[25px] bg-[rgba(11,14,17,0.72)] backdrop-blur-[50px] border border-[#181B22] md:border-l-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-purple-600/20 opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="logo-anim-unit logo-effect-outline">
              <svg width="112" height="128" viewBox="0 0 113 128" fill="none" className="logo-svg">
                <g clipPath="url(#clip0_logo)">
                  <path
                    className="logo-shape"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.748047 63.9619L0.753226 64.3533C13.1061 61.8201 25.5249 59.1745 37.9666 56.5237L37.9895 119.407L79.8468 128C79.8468 114.191 79.7174 75.2902 79.8542 61.485L50.5652 55.4724L46.667 54.6726C68.5682 50.0183 90.5085 45.4255 112.252 41.4711L112.245 0C75.4715 7.54699 37.6389 16.4678 0.748047 22.8836L0.748047 63.9619Z"
                    fill="url(#paint0_linear_logo)"
                  />
                </g>
                <defs>
                  <linearGradient id="paint0_linear_logo" x1="27.8276" y1="137.6" x2="75.9893" y2="8.13923" gradientUnits="userSpaceOnUse">
                    <stop className="logo-stop-primary" stopColor="#181A20" />
                    <stop className="logo-stop-accent" offset="1" stopColor="#A06AFF" />
                  </linearGradient>
                  <clipPath id="clip0_logo">
                    <rect width="111.504" height="128" fill="white" transform="translate(0.748047)" />
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center relative z-10">
            <h3 className="text-2xl font-bold text-white max-w-[318px]">
              Join One and Only Ecosystem for Trading
            </h3>
            <p className="text-[15px] text-webGray">
              We shape the next generation of successful trading for everyone. We invite you to be a part of this journey with us. Let's empower everyone to succeed one lesson, one trade, one success story of their life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
