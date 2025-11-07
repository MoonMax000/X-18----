import { FC, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface EmailVerificationFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const EmailVerificationForm: FC<EmailVerificationFormProps> = ({ 
  email, 
  onSuccess,
  onBack 
}) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyEmail } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return; // Only digits
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    if (error) setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
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
    
    const lastFilledIndex = newCode.findIndex(digit => !digit);
    const focusIndex = lastFilledIndex === -1 ? 5 : lastFilledIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      console.log('🔄 Verifying email with code:', fullCode);
      await verifyEmail(email, fullCode);
      console.log('✅ Email verified successfully!');
      onSuccess();
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError('Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-verify when all digits entered
  useEffect(() => {
    if (code.every(d => d !== '')) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="flex flex-col gap-6 flex-1 justify-center">
      <div className="flex justify-between gap-2">
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
            disabled={isVerifying}
            className={cn(
              "w-11 h-11 text-center rounded-lg border bg-[rgba(12,16,20,0.5)] text-white text-xl font-bold outline-none transition-all",
              error 
                ? "border-red-500" 
                : "border-widget-border focus:border-primary",
              isVerifying && "opacity-50 cursor-not-allowed"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {isVerifying && (
        <div className="flex items-center justify-center gap-2 text-[#B0B0B0] text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying...
        </div>
      )}

      <button
        onClick={onBack}
        className="text-primary text-sm text-center hover:underline transition-colors"
        disabled={isVerifying}
      >
        Back to Sign Up
      </button>
    </div>
  );
};

export default EmailVerificationForm;
