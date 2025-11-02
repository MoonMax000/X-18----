import { FC, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { customAuth } from '@/services/auth/custom-backend-auth';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  method: 'email' | 'phone';
  contact: string; // email address or phone number
}

type VerificationError = 
  | 'invalid' 
  | 'expired' 
  | 'too_many_attempts' 
  | null;

export const VerificationModal: FC<VerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onBack, 
  method, 
  contact 
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<VerificationError>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const title = method === 'email' ? 'Verify Your Email' : 'Verify Your Phone';
  const description = method === 'email' 
    ? "We've sent a 6-digit verification code to your email address. Enter the code below to complete your registrastion."
    : "We've sent a 6-digit verification code to your phone number. Enter the code below to complete your registration.";

  const errorMessages: Record<Exclude<VerificationError, null>, string> = {
    invalid: 'Invalide code. Please try again.',
    expired: 'Code expired. Request a new one.',
    too_many_attempts: 'Too many failed attempts. Try again later.',
  };

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Clear error when user starts typing
    if (error) setError(null);

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newCode = [...code];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i];
      }
    }
    
    setCode(newCode);
    
    // Focus last filled input or first empty
    const lastFilledIndex = newCode.findIndex(digit => !digit);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const navigate = useNavigate();

  const handleVerify = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('invalid');
      return;
    }

    try {
      console.log('🔄 Verifying email with code:', fullCode);
      
      // Call verifyEmail from customAuth service
      await customAuth.verifyEmail(contact, fullCode);
      
      console.log('✅ Email verified successfully! Redirecting to dashboard...');
      
      // Navigate to dashboard after successful verification
      navigate('/dashboard');
      onClose();
    } catch (error) {
      console.error('❌ Verification error:', error);
      
      const errorMessage = error instanceof Error ? error.message : '';
      
      if (errorMessage.includes('expired')) {
        setError('expired');
      } else if (errorMessage.includes('Invalid')) {
        setError('invalid');
      } else {
        setError('invalid');
      }
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    inputRefs.current[0]?.focus();

    try {
      console.log('🔄 Resending verification code to:', contact);
      
      // Call resend verification endpoint
      // Note: This requires user to be authenticated first
      // For new registrations, we might need a different approach
      const response = await fetch(`${customAuth['baseUrl']}/auth/resend-verification`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          type: 'email',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      console.log('✅ Verification code resent successfully');
    } catch (error) {
      console.error('❌ Resend error:', error);
      // Show error to user (можно добавить toast notification)
    }
  };

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex w-full max-w-[800px] overflow-hidden rounded-[25px]">
        {/* Verification Panel */}
        <div className="flex w-full md:w-[393px] flex-col justify-center items-center gap-3 px-[26px] py-[72px] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] min-h-[569px]">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute top-6 left-6 w-6 h-6 flex items-center justify-center text-[#B0B0B0] hover:text-white transition-colors rotate-90"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.99996 7.00002C8.99996 7.00002 4.00001 10.6824 4 12C3.99999 13.3176 9 17 9 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="w-full max-w-[341px] flex flex-col justify-between items-center gap-12 flex-1">
            <div className="flex flex-col items-center gap-12 w-full">
              {/* Header */}
              <div className="flex flex-col items-start gap-2 w-full">
                <h2 className="w-full text-center text-white text-2xl font-bold">{title}</h2>
                <p className="w-full text-center text-[#B0B0B0] text-[15px]">{description}</p>
              </div>

              {/* Code Inputs */}
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex justify-between items-center w-full gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={cn(
                        "w-11 h-11 flex items-center justify-center text-center rounded-lg border backdrop-blur-[50px] bg-[rgba(12,16,20,0.5)] text-white text-[19px] font-bold outline-none transition-colors",
                        error ? "border-[#EF454A]" : "border-[#181B22] focus:border-primary"
                      )}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-red-500 text-center text-[15px] mt-2">
                    {errorMessages[error]}
                  </p>
                )}
              </div>
            </div>

            {/* Resend Code */}
            <button
              onClick={handleResendCode}
              className="text-primary text-center text-[15px] hover:text-purple-400 transition-colors"
            >
              Resend Code
            </button>
          </div>
        </div>

        {/* Right Panel - Logo & Animation (hidden on mobile) */}
        <div className="hidden md:flex w-[393px] items-center justify-center bg-gradient-to-br from-primary/20 to-purple-900/20 backdrop-blur-[50px]">
          <div className="text-center">
            <div className="text-6xl font-bold text-white mb-4">🔐</div>
            <h3 className="text-2xl font-bold text-white">Verify Identity</h3>
            <p className="text-[#B0B0B0] mt-2">Check your {method === 'email' ? 'inbox' : 'messages'}</p>
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
