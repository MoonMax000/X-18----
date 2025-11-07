import { FC, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { use2FALogin } from '@/hooks/useSecurity';

interface TwoFactorFormProps {
  email: string;
  maskedEmail: string;
  onBack: () => void;
  onSuccess: () => void;
}

const TwoFactorForm: FC<TwoFactorFormProps> = ({ email, maskedEmail, onBack, onSuccess }) => {
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked2FA, setIsBlocked2FA] = useState(false);
  const [isCodeExpired, setIsCodeExpired] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const { verify2FACode } = use2FALogin();

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  const handle2FAKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify2FACode = async () => {
    if (isBlocked2FA || isCodeExpired) return;

    const code = twoFactorCode.join('');

    try {
      await verify2FACode(email, code);
      setTwoFactorError('');
      onSuccess();
    } catch (error) {
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

  const resend2FACode = async () => {
    if (!canResend || isBlocked2FA) return;

    try {
      await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setTwoFactorCode(['', '', '', '', '', '']);
      setTwoFactorError('');
      setIsCodeExpired(false);
      setFailedAttempts(0);
      inputRefs[0].current?.focus();
      setCanResend(false);
      setResendTimer(60);
    } catch (error) {
      setTwoFactorError('Failed to resend code. Please try again.');
    }
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Code expiration timer (60 seconds)
  useEffect(() => {
    const expirationTimer = setTimeout(() => {
      setIsCodeExpired(true);
      setTwoFactorError('Code expired. Request a new one.');
    }, 60000);

    return () => clearTimeout(expirationTimer);
  }, []);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (twoFactorCode.every((digit) => digit !== '')) {
      handleVerify2FACode();
    }
  }, [twoFactorCode]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  return (
    <div className="flex flex-col justify-between flex-1">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white text-center">Two-Factor Authentication</h2>

          <p className="text-[15px] text-[#B0B0B0] text-center">
            We've sent a 6-digit code to your email: <span className="underline">{maskedEmail}</span>
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
                  'w-11 h-11 text-center text-white text-xl font-semibold bg-[rgba(12,16,20,0.5)] rounded-xl border backdrop-blur-md outline-none transition-[border-color,box-shadow] duration-300',
                  twoFactorError
                    ? 'border-[#EF454A]'
                    : digit
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-[#181B22] focus:border-primary focus:shadow-lg focus:shadow-primary/20'
                )}
                disabled={isBlocked2FA}
              />
            ))}
          </div>

          {twoFactorError && (
            <p className="text-[15px] font-normal text-red-500 text-center">{twoFactorError}</p>
          )}
        </div>
      </div>

      {!isBlocked2FA && (
        <button
          onClick={resend2FACode}
          disabled={!canResend}
          className={cn(
            'text-[15px] font-normal transition-colors duration-300 text-center',
            canResend ? 'text-primary underline cursor-pointer' : 'text-[#808283] cursor-not-allowed'
          )}
        >
          {canResend ? 'Resend Code' : `Resend Code (${resendTimer}s)`}
        </button>
      )}
    </div>
  );
};

export default TwoFactorForm;
