import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import { VerificationModal } from './VerificationModal';
import { useAuth } from '@/contexts/AuthContext';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 12 characters',
    test: (pwd) => pwd.length >= 12,
  },
  {
    id: 'case',
    label: 'Uppercase and lowercase',
    test: (pwd) => /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'A number',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    id: 'special',
    label: 'A special character',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

export const SignUpModal: FC<SignUpModalProps> = ({ isOpen, onClose }) => {
  const { register: registerUser } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
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
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRequirementStatus = (requirement: PasswordRequirement) => {
    if (!password) return 'neutral';
    return requirement.test(password) ? 'valid' : 'invalid';
  };

  const validateEmail = (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    // Mock check for existing email
    if (value.toLowerCase() === 'example@gmail.com') {
      return 'This email is already registered';
    }
    return '';
  };

  const validatePhone = (value: string) => {
    if (!value) return '';
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
      return 'Invalid phone number';
    }
    // Mock check for existing phone
    if (value === '89743531212') {
      return 'This phone number is already in use.';
    }
    return '';
  };

  const validatePassword = () => {
    if (!password) return '';
    const allMet = passwordRequirements.every((req) => req.test(password));
    if (!allMet) {
      return 'Password doesn\'t meet requirements';
    }
    return '';
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) return '';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  const allRequirementsMet = passwordRequirements.every((req) => req.test(password));
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const canSubmit = allRequirementsMet && passwordsMatch && (authMethod === 'email' ? email && !emailError : phone && !phoneError);

  const handleSignUp = async () => {
    console.log('=== SignUp Button Clicked ===');
    console.log('Auth method:', authMethod);
    console.log('Email:', email);
    console.log('Phone:', phone);

    // Validate all fields
    const emailErr = authMethod === 'email' ? validateEmail(email) : '';
    const phoneErr = authMethod === 'phone' ? validatePhone(phone) : '';
    const passErr = validatePassword();
    const confirmErr = validateConfirmPassword();

    setEmailError(emailErr);
    setPhoneError(phoneErr);
    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);

    if (emailErr || phoneErr || passErr || confirmErr) {
      console.log('❌ Validation errors:', { emailErr, phoneErr, passErr, confirmErr });
      return;
    }

    setIsLoading(true);
    console.log('🔄 [SIGNUP] Starting registration process...');

    try {
      // Generate username from email or phone
      const username = authMethod === 'email'
        ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
        : `user_${phone.replace(/\D/g, '').slice(-8)}`;

      console.log('🔄 [SIGNUP] Calling registerUser with:', {
        username,
        email: authMethod === 'email' ? email : `${phone}@phone.temp`,
      });
      
      // Register using useAuth hook (будет вызван register из AuthContext)
      await registerUser(
        username,
        authMethod === 'email' ? email : `${phone}@phone.temp`,
        password,
        username
      );

      // После успешной регистрации показываем verification modal
      console.log('✅ [SIGNUP] Registration completed successfully!');
      console.log('🔄 [SIGNUP] Setting showVerification to true...');
      setShowVerification(true);
      console.log('✅ [SIGNUP] showVerification state updated!');
    } catch (error) {
      console.error('❌ [SIGNUP] Registration error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      if (errorMessage.includes('already') || errorMessage.includes('taken') || errorMessage.includes('exists')) {
        setEmailError('This email or username is already registered');
      } else {
        setEmailError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 [SIGNUP] Registration process finished, isLoading:', false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError(validateEmail(value));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (phoneError) {
      setPhoneError(validatePhone(value));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordError) {
      setConfirmPasswordError('');
    }
  };

  if (!isOpen) return null;

  // Show verification modal if signup was successful
  if (showVerification) {
    console.log('🎯 [SIGNUP] Rendering VerificationModal, showVerification:', showVerification);
    return (
      <VerificationModal
        isOpen={showVerification}
        onClose={onClose}
        onBack={() => {
          console.log('⬅️ [SIGNUP] Back button clicked in verification modal');
          setShowVerification(false);
        }}
        method={authMethod}
        contact={authMethod === 'email' ? email : phone}
      />
    );
  }

  console.log('📝 [SIGNUP] Rendering SignUp form, showVerification:', showVerification);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[800px] overflow-hidden rounded-[25px]">
        {/* Left Panel - Form */}
        <div className="flex w-full md:w-[393px] flex-col justify-center items-center gap-3 px-[26px] py-8 bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] min-h-[569px]">
          <div className="w-full max-w-[341px] flex flex-col justify-between items-start gap-6 flex-1">
            {/* Title */}
            <h2 className="w-full text-center text-white text-2xl font-bold">Sign Up</h2>

            <div className="w-full flex flex-col gap-8">
              {/* Email/Phone Tabs */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={cn(
                    "flex-1 h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-300",
                    authMethod === 'phone'
                      ? "bg-primary text-white"
                      : "bg-[rgba(11,14,17,0.5)] text-webGray border border-[#181B22] hover:border-primary/50"
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 15.833H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.2499 1.66699H8.74992C6.78574 1.66699 5.80364 1.66699 5.19344 2.27718C4.58325 2.88738 4.58325 3.86948 4.58325 5.83366V14.167C4.58325 16.1312 4.58325 17.1132 5.19344 17.7235C5.80364 18.3337 6.78574 18.3337 8.74992 18.3337H11.2499C13.2141 18.3337 14.1962 18.3337 14.8064 17.7235C15.4166 17.1132 15.4166 16.1312 15.4166 14.167V5.83366C15.4166 3.86948 15.4166 2.88738 14.8064 2.27718C14.1962 1.66699 13.2141 1.66699 11.2499 1.66699Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Phone
                </button>
                <button
                  onClick={() => setAuthMethod('email')}
                  className={cn(
                    "flex-1 h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-300",
                    authMethod === 'email'
                      ? "bg-primary text-white"
                      : "bg-[rgba(11,14,17,0.5)] text-webGray border border-[#181B22] hover:border-primary/50"
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M1.67989 11.2297C1.73436 13.7844 1.76161 15.0617 2.70421 16.0079C3.64681 16.9541 4.95869 16.987 7.58244 17.0529C9.1995 17.0936 10.8007 17.0936 12.4177 17.0529C15.0415 16.987 16.3533 16.9541 17.296 16.0079C18.2386 15.0617 18.2658 13.7844 18.3202 11.2297C18.3378 10.4083 18.3378 9.59183 18.3202 8.77042C18.2658 6.2158 18.2386 4.93849 17.296 3.9923C16.3533 3.04611 15.0415 3.01315 12.4177 2.94722C10.8007 2.90659 9.1995 2.90659 7.58243 2.94722C4.95869 3.01313 3.64681 3.04609 2.70421 3.99229C1.7616 4.93848 1.73436 6.21579 1.67988 8.77042C1.66236 9.59183 1.66237 10.4083 1.67989 11.2297Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  Email
                </button>
              </div>

              {/* Email/Phone Input */}
              <div className="relative">
                <div className={cn(
                  "flex h-11 px-[10px] py-3 items-center gap-2 rounded-[8px] border backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]",
                  authMethod === 'email' && emailError ? "border-[#EF454A]" : authMethod === 'phone' && phoneError ? "border-[#EF454A]" : "border-[#181B22]"
                )}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    {authMethod === 'phone' ? (
                      <>
                        <path d="M10 15.833H10.0083" stroke={phoneError ? "#EF4444" : phone ? "#FFFFFF" : "#B0B0B0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11.2499 1.66699H8.74992C6.78574 1.66699 5.80364 1.66699 5.19344 2.27718C4.58325 2.88738 4.58325 3.86948 4.58325 5.83366V14.167C4.58325 16.1312 4.58325 17.1132 5.19344 17.7235C5.80364 18.3337 6.78574 18.3337 8.74992 18.3337H11.2499C13.2141 18.3337 14.1962 18.3337 14.8064 17.7235C15.4166 17.1132 15.4166 16.1312 15.4166 14.167V5.83366C15.4166 3.86948 15.4166 2.88738 14.8064 2.27718C14.1962 1.66699 13.2141 1.66699 11.2499 1.66699Z" stroke={phoneError ? "#EF4444" : phone ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5" stroke={emailError ? "#EF4444" : email ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M1.67989 11.2297C1.73436 13.7844 1.76161 15.0617 2.70421 16.0079C3.64681 16.9541 4.95869 16.987 7.58244 17.0529C9.1995 17.0936 10.8007 17.0936 12.4177 17.0529C15.0415 16.987 16.3533 16.9541 17.296 16.0079C18.2386 15.0617 18.2658 13.7844 18.3202 11.2297C18.3378 10.4083 18.3378 9.59183 18.3202 8.77042C18.2658 6.2158 18.2386 4.93849 17.296 3.9923C16.3533 3.04611 15.0415 3.01315 12.4177 2.94722C10.8007 2.90659 9.1995 2.90659 7.58243 2.94722C4.95869 3.01313 3.64681 3.04609 2.70421 3.99229C1.7616 4.93848 1.73436 6.21579 1.67988 8.77042C1.66236 9.59183 1.66237 10.4083 1.67989 11.2297Z" stroke={emailError ? "#EF4444" : email ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                  <input
                    type={authMethod === 'email' ? 'email' : 'tel'}
                    value={authMethod === 'email' ? email : phone}
                    onChange={(e) => authMethod === 'email' ? handleEmailChange(e.target.value) : handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      if (authMethod === 'email') {
                        setEmailError(validateEmail(email));
                      } else {
                        setPhoneError(validatePhone(phone));
                      }
                    }}
                    placeholder={authMethod === 'email' ? 'example@gmail.com' : '89743531212'}
                    className="flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-[#B0B0B0]"
                  />
                </div>

                {/* Email/Phone Error */}
                {(emailError || phoneError) && (
                  <p className="absolute -bottom-5 right-0 text-red-500 text-[12px] font-bold text-right">
                    {authMethod === 'email' ? emailError : phoneError}
                  </p>
                )}
              </div>

              {/* Password Section */}
              <div className="flex flex-col gap-3">
                {/* Password Input */}
                <div className={cn(
                  "flex h-11 px-[10px] py-3 justify-between items-center rounded-[8px] border backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]",
                  passwordError ? "border-[#EF454A]" : "border-widget-border"
                )}>
                  <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M12.9166 12.083C15.678 12.083 17.9166 9.84442 17.9166 7.08301C17.9166 4.32158 15.678 2.08301 12.9166 2.08301C10.1552 2.08301 7.91659 4.32158 7.91659 7.08301C7.91659 7.81668 8.0746 8.51342 8.3585 9.14109L2.08325 15.4163V17.9163H4.58325V16.2497H6.24992V14.583H7.91659L10.8585 11.6411C11.4862 11.925 12.1829 12.083 12.9166 12.083Z" stroke={passwordError ? "#EF4444" : password ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14.5833 5.41699L13.75 6.25033" stroke={passwordError ? "#EF4444" : password ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {showPassword ? (
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        className="bg-transparent text-white text-[15px] outline-none"
                        style={{ width: '180px' }}
                      />
                    ) : (
                      <div className="flex items-center gap-[2px]">
                        {Array.from({ length: Math.min(password.length, 12) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full bg-white" />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#B0B0B0] hover:text-white transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="flex flex-col gap-2">
                  <p className="text-[#B0B0B0] text-[15px] font-bold">Your password needs to:</p>
                  <div className="flex flex-col gap-1">
                    {passwordRequirements.map((req) => {
                      const status = getRequirementStatus(req);
                      return (
                        <div key={req.id} className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.33325 9.66699C3.33325 9.66699 4.33325 9.66699 5.66659 12.0003C5.66659 12.0003 9.37245 5.88921 12.6666 4.66699" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="text-[#B0B0B0] text-[15px]">{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <div className={cn(
                    "flex h-11 px-[10px] py-3 justify-between items-center rounded-[8px] border backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)]",
                    confirmPasswordError ? "border-[#EF454A]" : "border-[#181B22]"
                  )}>
                    <div className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.9166 12.083C15.678 12.083 17.9166 9.84442 17.9166 7.08301C17.9166 4.32158 15.678 2.08301 12.9166 2.08301C10.1552 2.08301 7.91659 4.32158 7.91659 7.08301C7.91659 7.81668 8.0746 8.51342 8.3585 9.14109L2.08325 15.4163V17.9163H4.58325V16.2497H6.24992V14.583H7.91659L10.8585 11.6411C11.4862 11.925 12.1829 12.083 12.9166 12.083Z" stroke={confirmPasswordError ? "#EF4444" : confirmPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.5833 5.41699L13.75 6.25033" stroke={confirmPasswordError ? "#EF4444" : confirmPassword ? "#FFFFFF" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {showConfirmPassword ? (
                        <input
                          type="text"
                          value={confirmPassword}
                          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                          onBlur={() => setConfirmPasswordError(validateConfirmPassword())}
                          placeholder="Confirm password"
                          className="bg-transparent text-white text-[15px] outline-none placeholder:text-[#B0B0B0]"
                          style={{ width: '180px' }}
                        />
                      ) : confirmPassword ? (
                        <div className="flex items-center gap-[2px]">
                          {Array.from({ length: Math.min(confirmPassword.length, 12) }).map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#B0B0B0] text-[15px]">Confirm password</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#B0B0B0] hover:text-white transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  </div>

                  {/* Confirm Password Error */}
                  {confirmPasswordError && (
                  <p className="absolute -bottom-5 right-0 text-red-500 text-[12px] font-bold text-right">
                    {confirmPasswordError}
                  </p>
                )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onClick={handleSignUp}
                disabled={!canSubmit || isLoading}
                className={cn(
                  "w-full py-[10px] flex items-center justify-center gap-2 rounded-[8px] text-[15px] font-bold transition-all duration-300",
                  canSubmit && !isLoading
                    ? "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40"
                    : "bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0] opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
              
              <p className="text-[15px] text-center">
                <span className="text-[#B0B0B0]">Already have an account? </span>
                <button
                  onClick={onClose}
                  className="text-primary underline hover:text-purple-400 transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Logo & Animation (hidden on mobile) */}
        <div className="hidden md:flex w-[393px] items-center justify-center bg-gradient-to-br from-primary/20 to-purple-900/20 backdrop-blur-[50px]">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">✨</div>
            <h3 className="text-2xl font-bold text-white">Join Us</h3>
            <p className="text-[#B0B0B0] mt-2">Create your account today</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
