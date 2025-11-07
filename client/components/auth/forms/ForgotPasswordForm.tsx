import { FC, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAccountRecovery } from '@/hooks/useSecurity';
import { passwordRequirements } from './types';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

type ForgotPasswordScreen = 'forgot-email' | 'forgot-sent' | 'create-password' | 'password-reset';

const ForgotPasswordForm: FC<ForgotPasswordFormProps> = ({ onBack, onSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<ForgotPasswordScreen>('forgot-email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { requestPasswordReset, confirmPasswordReset } = useAccountRecovery();

  const getRequirementStatus = (requirement: typeof passwordRequirements[0]) => {
    if (!newPassword) return 'neutral';
    return requirement.test(newPassword) ? 'valid' : 'invalid';
  };

  const handleSendResetLink = async () => {
    if (!forgotEmail) return;

    const success = await requestPasswordReset(forgotEmail);
    if (success) {
      console.log('Reset link sent to:', forgotEmail);
      setCurrentScreen('forgot-sent');
    } else {
      setEmailError('Failed to send reset email. Please try again.');
    }
  };

  const handleResendCode = () => {
    console.log('Resending code to:', forgotEmail);
    // In real app, call API to resend code
  };

  const handleResetPassword = async () => {
    const allRequirementsMet = passwordRequirements.every((req) => req.test(newPassword));
    const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;

    if (!allRequirementsMet || !passwordsMatch) return;

    // In real app, you'd get the reset code from URL params or previous screen
    const resetCode = ''; // This should be obtained from the reset link

    const success = await confirmPasswordReset(resetCode, newPassword);
    if (success) {
      console.log('Password reset successful');
      setCurrentScreen('password-reset');
    } else {
      alert('Failed to reset password. Please try again.');
    }
  };

  const handleReturnToSignIn = () => {
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotEmail('');
    onSuccess();
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'forgot-email':
        return (
          <>
            <div className="flex flex-col items-start gap-4 w-full mt-12 mb-12">
              <h2 className="w-full text-center text-white text-2xl font-bold">Forgot Password</h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div
              className={cn(
                'flex h-11 px-[10px] py-3 items-center gap-2 w-full rounded-xl border backdrop-blur-md bg-[rgba(12,16,20,0.5)]',
                'border-widget-border'
              )}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5"
                  stroke={forgotEmail ? 'white' : '#B0B0B0'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.67989 11.229C1.73436 13.7837 1.76161 15.0609 2.70421 16.0072C3.64681 16.9533 4.95869 16.9863 7.58244 17.0522C9.1995 17.0929 10.8007 17.0929 12.4177 17.0522C15.0415 16.9863 16.3533 16.9533 17.296 16.0072C18.2386 15.0609 18.2658 13.7837 18.3202 11.229C18.3376 10.4076 18.3376 9.5911 18.3202 8.76968C18.2658 6.21507 18.2386 4.93776 17.296 3.99157C16.3533 3.04537 15.0415 3.01242 12.4177 2.94649C10.8007 2.90586 9.19925 2.90586 7.58219 2.94648C4.95845 3.0124 3.64657 3.04536 2.70396 3.99156C1.76135 4.93775 1.73412 6.21506 1.67964 8.76968C1.66212 9.5911 1.66213 10.4076 1.67965 11.229Z"
                  stroke={forgotEmail ? 'white' : '#B0B0B0'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
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
                  'w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-md',
                  forgotEmail
                    ? 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40'
                    : 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]'
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
              <h2 className="w-full text-center text-white text-2xl font-bold">Forgot Password</h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <div className="flex h-11 px-[10px] py-3 items-center gap-2 w-full rounded-[8px] border border-[#181B22] backdrop-blur-md bg-[rgba(12,16,20,0.5)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M1.66675 5L7.4276 8.26414C9.55141 9.4675 10.4487 9.4675 12.5726 8.26414L18.3334 5"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.67989 11.229C1.73436 13.7837 1.76161 15.0609 2.70421 16.0072C3.64681 16.9533 4.95869 16.9863 7.58244 17.0522C9.1995 17.0929 10.8007 17.0929 12.4177 17.0522C15.0415 16.9863 16.3533 16.9533 17.296 16.0072C18.2386 15.0609 18.2658 13.7837 18.3202 11.229C18.3376 10.4076 18.3376 9.5911 18.3202 8.76968C18.2658 6.21507 18.2386 4.93776 17.296 3.99157C16.3533 3.04537 15.0415 3.01242 12.4177 2.94649C10.8007 2.90586 9.19925 2.90586 7.58219 2.94648C4.95845 3.0124 3.64657 3.04536 2.70396 3.99156C1.76135 4.93775 1.73412 6.21506 1.67964 8.76968C1.66212 9.5911 1.66213 10.4076 1.67965 11.229Z"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
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
              <h2 className="w-full text-center text-white text-2xl font-bold">Create a New Password</h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Your identity has been verified. Now set a new strong password to protect your account.
              </p>
            </div>

            <div className="flex flex-col items-start gap-[10px] w-full">
              <div className="flex h-11 px-[10px] py-3 justify-between items-center w-full rounded-xl border border-[#181B22] backdrop-blur-md bg-[rgba(12,16,20,0.5)]">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.9166 12.084C15.678 12.084 17.9166 9.8454 17.9166 7.08398C17.9166 4.32256 15.678 2.08398 12.9166 2.08398C10.1552 2.08398 7.91659 4.32256 7.91659 7.08398C7.91659 7.81766 8.0746 8.5144 8.3585 9.14207L2.08325 15.4173V17.9173H4.58325V16.2507H6.24992V14.584H7.91659L10.8585 11.6421C11.4862 11.926 12.1829 12.084 12.9166 12.084Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5833 5.41602L13.75 6.24935"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                    <path
                      d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
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
                            <path
                              d="M3.33325 9.66602C3.33325 9.66602 4.33325 9.66602 5.66659 11.9993C5.66659 11.9993 9.37245 5.88824 12.6666 4.66602"
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
                              d="M7.99984 11.3327C9.84079 11.3327 11.3332 9.8403 11.3332 7.99935C11.3332 6.1584 9.84079 4.66602 7.99984 4.66602C6.15889 4.66602 4.6665 6.1584 4.6665 7.99935C4.6665 9.8403 6.15889 11.3327 7.99984 11.3327Z"
                              stroke="#B0B0B0"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <span className="text-[#B0B0B0] text-center text-[15px]">{req.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex h-11 px-[10px] py-3 justify-between items-center w-full rounded-xl border border-[#181B22] backdrop-blur-md bg-[rgba(12,16,20,0.5)]">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M12.9166 12.084C15.678 12.084 17.9166 9.8454 17.9166 7.08398C17.9166 4.32256 15.678 2.08398 12.9166 2.08398C10.1552 2.08398 7.91659 4.32256 7.91659 7.08398C7.91659 7.81766 8.0746 8.5144 8.3585 9.14207L2.08325 15.4173V17.9173H4.58325V16.2507H6.24992V14.584H7.91659L10.8585 11.6421C11.4862 11.926 12.1829 12.084 12.9166 12.084Z"
                      stroke={confirmNewPassword ? 'white' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.5833 5.41602L13.75 6.24935"
                      stroke={confirmNewPassword ? 'white' : '#B0B0B0'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                    <path
                      d="M21.544 11.045C21.848 11.4713 22 11.6845 22 12C22 12.3155 21.848 12.5287 21.544 12.955C20.1779 14.8706 16.6892 19 12 19C7.31078 19 3.8221 14.8706 2.45604 12.955C2.15201 12.5287 2 12.3155 2 12C2 11.6845 2.15201 11.4713 2.45604 11.045C3.8221 9.12944 7.31078 5 12 5C16.6892 5 20.1779 9.12944 21.544 11.045Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleResetPassword}
                disabled={
                  !passwordRequirements.every((req) => req.test(newPassword)) ||
                  !newPassword ||
                  !confirmNewPassword ||
                  newPassword !== confirmNewPassword
                }
                className={cn(
                  'w-full py-[5px] flex items-center justify-center rounded-[8px] backdrop-blur-md',
                  passwordRequirements.every((req) => req.test(newPassword)) &&
                    newPassword &&
                    confirmNewPassword &&
                    newPassword === confirmNewPassword
                    ? 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-white hover:shadow-xl hover:shadow-primary/40'
                    : 'bg-gradient-to-l from-[#482090] to-[#A06AFF] text-[#B0B0B0]'
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
              <h2 className="w-full text-center text-white text-2xl font-bold">Password Reset</h2>
              <p className="w-full text-center text-[#B0B0B0] text-[15px]">
                Your new password has been saved and you've been logged out of all active sessions for security
                reasons.
              </p>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col items-center gap-2 w-full">
              <button
                onClick={handleReturnToSignIn}
                className="w-full py-[5px] flex items-center justify-center rounded-[8px] bg-gradient-to-l from-[#482090] to-[#A06AFF] backdrop-blur-md text-white hover:shadow-xl hover:shadow-primary/40"
              >
                <span className="text-[15px] font-bold">Return to Sign In</span>
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return <div className="flex flex-col flex-1">{renderContent()}</div>;
};

export default ForgotPasswordForm;
