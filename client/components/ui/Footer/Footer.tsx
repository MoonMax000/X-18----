import { FC, useState, useRef, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, ArrowRight, Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  label: string;
}

const LANGUAGES: Language[] = [
  { code: 'ru', name: 'Русский', label: 'RU' },
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'zh', name: '简体中文', label: '中文' },
  { code: 'es', name: 'Español', label: 'ES' },
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'de', name: 'Deutsch', label: 'DE' },
  { code: 'ja', name: '日本語', label: 'JA' },
  { code: 'ko', name: '한국어', label: 'KO' },
  { code: 'ar', name: 'العربية', label: 'AR' },
  { code: 'pt', name: 'Português', label: 'PT' },
  { code: 'th', name: 'ภาษาไทย', label: 'TH' },
  { code: 'tr', name: 'Türkçe', label: 'TR' },
];

const Footer: FC = () => {
  const [email, setEmail] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    // TODO: Implement newsletter subscription
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
    };

    if (isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageOpen]);

  return (
    <footer className="relative bg-gradient-to-r from-black via-[#181818] to-black py-20">
      {/* Top Gradient Divider */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#3D3D3D] to-transparent" />

      <div className="container mx-auto px-2 sm:px-3 md:px-4">
        <div className="flex flex-wrap justify-between gap-12 md:gap-16">
          {/* Stay in touch section */}
          <div className="flex-1 min-w-[300px] mb-15">
            <h3 className="mb-3 text-[38px] font-semibold leading-[42px] tracking-[-1.71px] text-white">
              Stay in touch
            </h3>
            <p className="leading-7 text-[#E5E5E5]">
              Announcements can be found in our blog. Press contact:
              <br />
              <a 
                href="mailto:media@tyriantrade.com" 
                className="text-[#E5E5E5] underline transition-opacity duration-200 hover:opacity-80"
              >
                media@tyriantrade.com
              </a>
            </p>

            {/* Social Icons */}
            <ul className="mt-5 flex flex-wrap gap-2">
              <li>
                <a
                  href="https://twitter.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all duration-300 hover:bg-gradient-to-br hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:ring-2 hover:ring-[#A06AFF]/50 hover:shadow-lg hover:shadow-[#A06AFF]/30"
                  aria-label="Twitter"
                >
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 fill-white transition-all duration-300 group-hover:fill-[#A06AFF] group-hover:scale-110">
                    <path d="M9.54463 6.77491L15.501 0H14.0895L8.91762 5.88256L4.78683 0H0.0224609L6.26902 8.89547L0.0224609 16H1.43401L6.89567 9.78782L11.2581 16H16.0225L9.54429 6.77491H9.54463ZM7.61133 8.97384L6.97842 8.08805L1.94261 1.03974H4.11066L8.17462 6.72795L8.80753 7.61374L14.0902 15.0075H11.9221L7.61133 8.97418V8.97384Z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all duration-300 hover:bg-gradient-to-br hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:ring-2 hover:ring-[#A06AFF]/50 hover:shadow-lg hover:shadow-[#A06AFF]/30"
                  aria-label="Instagram"
                >
                  <Instagram className="relative z-10 h-4 w-4 text-white transition-all duration-300 group-hover:text-[#A06AFF] group-hover:scale-110" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent transition-all duration-300 hover:bg-gradient-to-br hover:from-[#A06AFF]/30 hover:via-[#A06AFF]/15 hover:to-transparent hover:ring-2 hover:ring-[#A06AFF]/50 hover:shadow-lg hover:shadow-[#A06AFF]/30"
                  aria-label="YouTube"
                >
                  <Youtube className="relative z-10 h-4 w-4 text-white transition-all duration-300 group-hover:text-[#A06AFF] group-hover:scale-110" />
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter section */}
          <div className="flex-1 min-w-[300px]">
            <h3 className="mb-3 text-[38px] font-semibold leading-[42px] tracking-[-1.71px] text-white">
              Subscribe to our
              <br className="hidden sm:inline" />
              {' '}newsletter
            </h3>
            <p className="leading-7 text-[#E5E5E5]">
              New coins supported, blog updates and exclusive offers directly in your inbox
            </p>

            <form onSubmit={handleSubmit} className="mt-4 mb-5 flex flex-col sm:flex-row gap-4">
              <div className="relative w-full max-w-[400px]">
                <input
                  id="footer-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full max-h-[52px] rounded-full border border-[#525252] bg-transparent px-[30px] py-[13px] font-medium text-white transition-all duration-300 placeholder-transparent focus:border-[#A06AFF] focus:outline-none focus:ring-2 focus:ring-[#A06AFF]/50 focus:shadow-lg focus:shadow-[#A06AFF]/30"
                />
                <label
                  htmlFor="footer-email-input"
                  className="absolute left-[30px] top-3 cursor-text text-[#E5E5E5] transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-xs peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:top-[-8px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1"
                >
                  Enter your email
                </label>
              </div>
              <button
                type="submit"
                disabled={!email}
                className="group relative z-20 overflow-hidden flex items-center justify-center gap-2 max-h-[52px] min-w-fit rounded-full border px-6 py-3 text-center leading-7 transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  background: email
                    ? 'linear-gradient(90deg, rgba(230, 230, 230, 0.2) 0%, rgba(230, 230, 230, 0.05) 50%, transparent 100%)'
                    : 'linear-gradient(90deg, #2E2E2E 0%, #151515 52.88%, #0C0C0C 100%)',
                  borderColor: email ? '#A06AFF' : '#525252',
                  boxShadow: email ? '0 10px 25px -5px rgba(160, 106, 255, 0.3)' : 'none',
                }}
              >
                {/* Animated shine effect - only show when email is entered */}
                {email && (
                  <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                )}

                <span className="relative z-10 font-medium text-white">Subscribe to newsletter</span>
                <ArrowRight className="relative z-10 h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>

            <div className="text-[13px] leading-[19.5px] text-[#A3A3A3]">
              <p className="mb-5 text-[11px] font-medium leading-4">
                Your email address will only be used to send you our newsletter, as well as updates and offers. You can unsubscribe at any time using the link included in the newsletter.
                {' '}
                <a
                  href="/privacy"
                  className="text-[#A3A3A3] underline transition-opacity duration-200 hover:opacity-80"
                >
                  Learn more about how we manage your data and your rights.
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Menu - Logo + 4 Columns */}
        <div className="relative mt-16">
          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#3D3D3D] to-transparent" />
        </div>
        <nav className="pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mb-12">
            {/* Left Section: Logo + Language + Copyright */}
            <div className="flex flex-col">
              {/* Logo */}
              <a href="/" className="inline-flex gap-3 items-center mb-10 transition-opacity duration-200 hover:opacity-80">
                <svg
                  className="w-[22px] h-[27px] shrink-0"
                  width="18"
                  height="23"
                  viewBox="0 0 18 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 11.4935L0.000836009 11.5607C1.99496 11.1253 3.99971 10.6706 6.00816 10.215L6.01186 21.0231L12.7689 22.5C12.7689 20.1266 12.7479 13.4405 12.77 11.0677L8.04193 10.0343L7.41266 9.89685C10.9481 9.0969 14.49 8.30751 18 7.62785L17.9988 0.5C12.0625 1.79714 5.95525 3.33041 0 4.43313L0 11.4935Z"
                    fill="url(#paint0_linear_footer)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_footer"
                      x1="4.37143"
                      y1="24.15"
                      x2="13.044"
                      y2="2.25457"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#A06AFF"/>
                      <stop offset="1" stopColor="#7F57FF"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white text-2xl font-bold">TyrianTrade</span>
              </a>

              {/* Language Selector */}
              <div className="relative mb-8" ref={languageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex w-[140px] items-center justify-between rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-4 py-2.5 text-sm font-medium text-[#E5E7EB] transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#A06AFF]" />
                    <span className="text-white">{selectedLanguage.label}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLanguageOpen && (
                  <div className="absolute bottom-full left-0 z-[9999] mb-2 w-[180px] overflow-hidden rounded-2xl border border-[#525252] bg-[#0A0D12] shadow-lg">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setIsLanguageOpen(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent ${
                          currentLanguage === lang.code ? 'bg-gradient-to-r from-[#A06AFF]/20 via-[#A06AFF]/10 to-transparent text-white' : 'text-[#E5E7EB]'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Copyright */}
              <div className="text-[13px] text-[#949494] leading-[22px]">
                <div className="flex items-start gap-3 mb-5">
                  <img
                    src="/logo.svg"
                    alt="TyrianTrade"
                    className="h-6 mt-0.5 brightness-0 invert opacity-70"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="flex-1">
                    Copyright © {new Date().getFullYear()} TyrianTrade. All rights reserved.
                    TyrianTrade is a registered trademark.
                  </p>
                </div>
                <p className="mb-3 font-medium">Payment methods</p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-white/5 rounded text-xs">Visa</div>
                  <div className="px-3 py-1 bg-white/5 rounded text-xs">Mastercard</div>
                  <div className="px-3 py-1 bg-white/5 rounded text-xs">PayPal</div>
                  <div className="px-3 py-1 bg-white/5 rounded text-xs">Crypto</div>
                </div>
              </div>
            </div>

            {/* Right Section: 4 Columns Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Продукты */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Продукты</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/social" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Социальная сеть
                  </a>
                </li>
                <li>
                  <a href="/marketplace" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Маркетплейс
                  </a>
                </li>
                <li>
                  <a href="/streaming" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Live Streaming
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Начать */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Начать</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/signup" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Создать аккаунт
                  </a>
                </li>
                <li>
                  <a href="/community" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Присоединиться к сообществу
                  </a>
                </li>
                <li>
                  <a href="/beginner-guide" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Гайд для новичков
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Ресурсы */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Ресурсы</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/support" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Центр поддержки
                  </a>
                </li>
                <li>
                  <a href="/roadmap" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Дорожная карта
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Блог ��ообщества
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Компания */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Компания</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    О платформе
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Контакты
                  </a>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
