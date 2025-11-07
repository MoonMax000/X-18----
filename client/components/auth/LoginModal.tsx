import { FC, useState, useEffect } from 'react';
import LoginForm from './forms/LoginForm';
import TwoFactorForm from './forms/TwoFactorForm';
import SignUpForm from './forms/SignUpForm';
import ForgotPasswordForm from './forms/ForgotPasswordForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScreen?: 'login' | 'signup';
}

type ScreenType =
  | 'login'
  | '2fa'
  | 'forgot-email'
  | 'forgot-sent'
  | 'create-password'
  | 'password-reset'
  | 'signup';

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose, initialScreen = 'login' }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreen);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [tempAuthData, setTempAuthData] = useState<{ email: string; requires_2fa: boolean } | null>(
    null
  );

  // Reset to initial state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentScreen(initialScreen);
      setMaskedEmail('');
      setTempAuthData(null);
    }
  }, [isOpen, initialScreen]);

  const renderBackButton = () => {
    const showBackButton =
      currentScreen !== 'password-reset' && currentScreen !== 'login' && currentScreen !== 'signup';

    if (!showBackButton) return null;

    const handleBackNavigation = () => {
      if (currentScreen === 'forgot-sent' || currentScreen === 'create-password') {
        setCurrentScreen('forgot-email');
      } else if (currentScreen === 'forgot-email') {
        setCurrentScreen('login');
      } else if (currentScreen === '2fa') {
        setCurrentScreen('login');
        setTempAuthData(null);
      }
    };

    return (
      <button
        type="button"
        onClick={handleBackNavigation}
        className="absolute top-4 left-4 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#B0B0B0] hover:text-white transition-colors cursor-pointer touch-manipulation"
        aria-label="Go back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="pointer-events-none">
          <path
            d="M4 12H20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.99996 7.00002C8.99996 7.00002 4.00001 10.6824 4 12C3.99999 13.3176 9 17 9 17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginForm
            onSwitchToSignup={() => setCurrentScreen('signup')}
            onSwitchToForgotPassword={() => setCurrentScreen('forgot-email')}
            on2FARequired={(email) => {
              setMaskedEmail(email.replace(/(.{2})(.*)(@.*)/, '$1****$3'));
              setTempAuthData({ email, requires_2fa: true });
              setCurrentScreen('2fa');
            }}
            onSuccess={() => {
              onClose();
              window.location.reload();
            }}
          />
        );

      case '2fa':
        return (
          <TwoFactorForm
            email={tempAuthData?.email || ''}
            maskedEmail={maskedEmail}
            onBack={() => {
              setCurrentScreen('login');
              setTempAuthData(null);
            }}
            onSuccess={() => {
              onClose();
              window.location.reload();
            }}
          />
        );

      case 'signup':
        return (
          <SignUpForm
            onSwitchToLogin={() => setCurrentScreen('login')}
            onSuccess={() => {
              onClose();
              window.location.reload();
            }}
          />
        );

      case 'forgot-email':
      case 'forgot-sent':
      case 'create-password':
      case 'password-reset':
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentScreen('login')}
            onSuccess={() => setCurrentScreen('login')}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Background overlay - Layer 0 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal container - Layer 1 */}
      <div className="relative flex flex-col md:flex-row items-stretch justify-center max-w-[786px] w-full md:min-h-[560px] rounded-[25px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(160,106,255,0.25)]">
        {/* Left panel - Auth forms */}
        <div
          className="w-full md:flex-1 md:max-w-[393px] flex flex-col items-center justify-center p-6 md:p-8 md:rounded-l-[25px] bg-[rgba(12,16,20,0.8)] backdrop-blur-md border border-[#181B22] md:border-r-0 relative"
          style={{
            willChange: 'opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Decorative gradient - naturally above background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-600/20 opacity-50 pointer-events-none" />

          {/* Back button - naturally above gradient */}
          {renderBackButton()}

          {/* Mobile logo - naturally above gradient */}
          <div className="md:hidden mb-6 relative">
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
                  <linearGradient
                    id="paint0_linear_logo_mobile"
                    x1="27.8276"
                    y1="137.6"
                    x2="75.9893"
                    y2="8.13923"
                    gradientUnits="userSpaceOnUse"
                  >
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

          {/* Content - naturally above all */}
          <div
            className="w-full max-w-[341px] min-h-[600px] flex flex-col gap-4 relative"
            style={{
              willChange: 'opacity',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            {renderContent()}
          </div>
        </div>

        {/* Right panel - Branding */}
        <div
          className="hidden md:flex md:flex-1 md:max-w-[393px] flex-col items-center justify-center gap-10 p-6 md:p-8 rounded-r-[25px] bg-[rgba(11,14,17,0.72)] backdrop-blur-md border border-[#181B22] md:border-l-0 relative overflow-hidden"
          style={{
            willChange: 'opacity',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Decorative gradient - naturally above background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-purple-600/20 opacity-60 pointer-events-none" />

          {/* Logo - naturally above gradient */}
          <div className="relative">
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
                  <linearGradient
                    id="paint0_linear_logo"
                    x1="27.8276"
                    y1="137.6"
                    x2="75.9893"
                    y2="8.13923"
                    gradientUnits="userSpaceOnUse"
                  >
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

          {/* Text content - naturally above gradient */}
          <div className="flex flex-col items-center gap-4 text-center relative">
            <h3 className="text-2xl font-bold text-white max-w-[318px]">
              Join One and Only Ecosystem for Trading
            </h3>
            <p className="text-[15px] text-webGray">
              We shape the next generation of successful trading for everyone. We invite you to be a part of
              this journey with us. Let's empower everyone to succeed one lesson, one trade, one success story
              of their life.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
