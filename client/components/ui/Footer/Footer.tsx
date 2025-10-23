import { FC, useState } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, ArrowRight } from 'lucide-react';

const Footer: FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    // TODO: Implement newsletter subscription
  };

  return (
    <footer className="relative bg-gradient-to-r from-black via-[#181818] to-black py-20">
      {/* Top Gradient Divider */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#3D3D3D] to-transparent" />

      <div className="mx-auto max-w-7xl px-[4%]">
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
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="Twitter"
                >
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                    <path d="M9.54463 6.77491L15.501 0H14.0895L8.91762 5.88256L4.78683 0H0.0224609L6.26902 8.89547L0.0224609 16H1.43401L6.89567 9.78782L11.2581 16H16.0225L9.54429 6.77491H9.54463ZM7.61133 8.97384L6.97842 8.08805L1.94261 1.03974H4.11066L8.17462 6.72795L8.80753 7.61374L14.0902 15.0075H11.9221L7.61133 8.97418V8.97384Z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 text-white" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4 text-white" />
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="peer w-full max-h-[52px] rounded-full border border-[#525252] bg-transparent px-[30px] py-[13px] font-medium text-white transition-all duration-200 placeholder-transparent focus:border-white focus:outline-none"
                />
                <label
                  className="absolute left-[30px] top-3 text-[#E5E5E5] transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-[-8px] peer-focus:text-xs peer-focus:bg-black peer-focus:px-1 peer-[:not(:placeholder-shown)]:top-[-8px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-black peer-[:not(:placeholder-shown)]:px-1"
                >
                  Enter your email
                </label>
              </div>
              <button
                type="submit"
                disabled={!email}
                className="group relative z-20 overflow-hidden flex items-center justify-center gap-2 max-h-[52px] min-w-fit rounded-full px-6 py-3 text-center leading-7 text-white transition-all duration-300 disabled:cursor-not-allowed"
                style={{
                  background: !email
                    ? 'linear-gradient(90deg, #2E2E2E 0%, #151515 52.88%, #0C0C0C 100%)'
                    : 'linear-gradient(90deg, #583E68 0%, #060507 52.88%, #33253D 100%)',
                  border: !email
                    ? '1px solid #525252'
                    : '1px solid #DE9DFF'
                }}
              >
                <span className="text-white font-medium">Subscribe to newsletter</span>
                <ArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
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
              <div className="mb-8">
                <div className="relative inline-block">
                  <select
                    className="appearance-none bg-transparent border-2 border-white rounded-full px-6 py-3 pr-12 text-white font-semibold text-sm uppercase cursor-pointer transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                    defaultValue="en"
                  >
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="pt">Português</option>
                    <option value="zh">简体中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="ar">العربية</option>
                    <option value="th">ภาษาไทย</option>
                    <option value="tr">Türkçe</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
            {/* Column 1: Platform */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Platform</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/feed" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Market Feed
                  </a>
                </li>
                <li>
                  <a href="/signals" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Trading Signals
                  </a>
                </li>
                <li>
                  <a href="/analysis" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Market Analysis
                  </a>
                </li>
                <li>
                  <a href="/portfolio" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Portfolio Tracker
                  </a>
                </li>
                <li>
                  <a href="/pricing" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Crypto Assets */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Crypto Assets</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/crypto/bitcoin" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Bitcoin (BTC)
                  </a>
                </li>
                <li>
                  <a href="/crypto/ethereum" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Ethereum (ETH)
                  </a>
                </li>
                <li>
                  <a href="/crypto/solana" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Solana (SOL)
                  </a>
                </li>
                <li>
                  <a href="/crypto/all" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    All Cryptocurrencies
                  </a>
                </li>
                <li>
                  <a href="/markets" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Market Overview
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Community */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Community</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/support" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Support Center
                  </a>
                </li>
                <li>
                  <a href="/referrals" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Referral Program
                  </a>
                </li>
                <li>
                  <a href="/academy" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Trading Academy
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/status" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Platform Status
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div>
              <h4 className="mb-4 text-white font-semibold text-base">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/about" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/careers" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-[13px] text-[#949494] hover:text-white transition-colors duration-200">
                    Contact Us
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
