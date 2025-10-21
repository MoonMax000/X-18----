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
      <div className="absolute top-0 left-0 right-0 mx-auto max-w-7xl px-[4%]">
        <div className="h-1 w-full" style={{
          backgroundImage: 'linear-gradient(90deg, rgba(23, 23, 23, 0), rgb(23, 23, 23) 25%, rgb(23, 23, 23) 75%, rgba(23, 23, 23, 0))',
          boxShadow: 'rgba(255, 255, 255, 0.1) 0px -2px 1px 0px inset'
        }} />
      </div>

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
                  href="https://www.reddit.com/r/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="Reddit"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                    <path d="M6.16625 8.00002C5.70777 8.00002 5.3335 8.37429 5.3335 8.83277C5.3335 9.29125 5.70777 9.66552 6.16625 9.66552C6.62473 9.66552 6.999 9.29125 6.999 8.83277C6.999 8.37429 6.62473 8.00002 6.16625 8.00002Z"/>
                    <path d="M8.00952 11.6398C8.32765 11.6398 9.41303 11.6024 9.98379 11.0316C10.068 10.9474 10.068 10.8164 10.0025 10.7228C9.9183 10.6386 9.77795 10.6386 9.69373 10.7228C9.32882 11.0784 8.57093 11.2094 8.01888 11.2094C7.46683 11.2094 6.69958 11.0784 6.34403 10.7228C6.25982 10.6386 6.11946 10.6386 6.03525 10.7228C5.95104 10.807 5.95104 10.9474 6.03525 11.0316C6.59666 11.593 7.69139 11.6398 8.00952 11.6398Z"/>
                    <path d="M9.00134 8.83277C9.00134 9.29125 9.37561 9.66552 9.83409 9.66552C10.2926 9.66552 10.6668 9.29125 10.6668 8.83277C10.6668 8.37429 10.2926 8.00002 9.83409 8.00002C9.37561 8.00002 9.00134 8.37429 9.00134 8.83277Z"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM12.1639 6.83043C12.8095 6.83043 13.3335 7.35441 13.3335 8.00002C13.3335 8.47722 13.0434 8.88891 12.6598 9.07605C12.6785 9.18833 12.6879 9.30061 12.6879 9.42225C12.6879 11.2187 10.6013 12.669 8.01888 12.669C5.43642 12.669 3.34987 11.2187 3.34987 9.42225C3.34987 9.30061 3.35923 9.17897 3.37794 9.06669C2.96625 8.87956 2.68555 8.47722 2.68555 8.00002C2.68555 7.35441 3.20952 6.83043 3.85514 6.83043C4.16391 6.83043 4.45397 6.96143 4.65982 7.15792C5.46449 6.56845 6.57795 6.20353 7.82239 6.16611L8.41186 3.3778C8.43058 3.32166 8.45865 3.27488 8.50543 3.24681C8.55221 3.21874 8.60835 3.20938 8.66449 3.21874L10.6013 3.63043C10.7323 3.34973 11.013 3.1626 11.3405 3.1626C11.799 3.1626 12.1733 3.53687 12.1733 3.99535C12.1733 4.45383 11.799 4.82809 11.3405 4.82809C10.8914 4.82809 10.5265 4.47254 10.5078 4.03277L8.77677 3.66786L8.24344 6.16611C9.45982 6.21289 10.5639 6.58716 11.3592 7.15792C11.5651 6.95207 11.8458 6.83043 12.1639 6.83043Z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4 text-white" />
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
                  href="https://www.youtube.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="YouTube"
                >
                  <Youtube className="h-4 w-4 text-white" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4 text-white" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="TikTok"
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                    <path d="M11.9089 3.20711C11.0442 2.64503 10.4199 1.74608 10.2253 0.698056C10.1832 0.471515 10.1602 0.238563 10.1602 0H7.40007L7.39551 11.0241C7.34914 12.2586 6.32974 13.2494 5.07982 13.2494C4.69142 13.2494 4.32553 13.1527 4.0036 12.9836C3.26512 12.5963 2.75985 11.8248 2.75985 10.937C2.75985 9.66192 3.80069 8.62459 5.07982 8.62459C5.31865 8.62459 5.54757 8.66386 5.76442 8.73145V5.9232C5.54006 5.89274 5.31222 5.87377 5.07982 5.87377C2.27896 5.87404 0 8.14533 0 10.937C0 12.65 0.858833 14.1658 2.1688 15.0823C2.99385 15.6597 3.9977 16 5.08009 16C7.88122 16 10.1602 13.7287 10.1602 10.937V5.34696C11.2426 6.12142 12.5689 6.57771 14 6.57771V3.82689C13.2291 3.82689 12.511 3.59848 11.9089 3.20711Z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/5 transition-all duration-200 hover:bg-white/10"
                  aria-label="Discord"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                    <path d="M13.5535 1.42123C12.5023 0.984667 11.3925 0.674952 10.2526 0.5C10.0966 0.752955 9.95547 1.01321 9.82976 1.27968C8.6155 1.1137 7.38067 1.1137 6.16641 1.27968C6.04063 1.01324 5.89949 0.752985 5.74357 0.5C4.60289 0.676429 3.4924 0.986879 2.44013 1.42352C0.351096 4.22717 -0.215207 6.96119 0.0679444 9.65639C1.29133 10.4763 2.66066 11.0999 4.11639 11.5C4.44417 11.1001 4.73422 10.6758 4.98346 10.2317C4.51007 10.0714 4.05317 9.87348 3.61804 9.64041C3.73256 9.56507 3.84456 9.48744 3.95279 9.4121C5.21891 9.95222 6.60083 10.2323 7.99997 10.2323C9.39912 10.2323 10.781 9.95222 12.0472 9.4121C12.1566 9.49315 12.2686 9.57078 12.3819 9.64041C11.9459 9.87386 11.4882 10.0721 11.014 10.2329C11.2629 10.6768 11.553 11.1007 11.881 11.5C13.338 11.1015 14.7084 10.4782 15.932 9.65753C16.2642 6.53196 15.3644 3.82306 13.5535 1.42123ZM5.34212 7.99886C4.55307 7.99886 3.90119 7.34931 3.90119 6.55023C3.90119 5.75114 4.53042 5.09589 5.3396 5.09589C6.14879 5.09589 6.79563 5.75114 6.78179 6.55023C6.76795 7.34931 6.14627 7.99886 5.34212 7.99886ZM10.6578 7.99886C9.86752 7.99886 9.21815 7.34931 9.21815 6.55023C9.21815 5.75114 9.84738 5.09589 10.6578 5.09589C11.4683 5.09589 12.1101 5.75114 12.0962 6.55023C12.0824 7.34931 11.462 7.99886 10.6578 7.99886Z"/>
                  </svg>
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
                style={{
                  backgroundImage: !email
                    ? 'linear-gradient(90deg, rgba(230, 230, 230, 0.15), rgba(230, 230, 230, 0.05) 75.8%)'
                    : 'linear-gradient(90deg, rgba(230, 230, 230, 0.3), rgba(230, 230, 230, 0.1) 75.8%)'
                }}
                className="group relative z-10 flex items-center justify-center gap-2 max-h-[52px] min-w-fit rounded-full border border-[#525252] bg-black/20 px-6 py-3 text-center leading-7 text-white transition-all duration-300 hover:border-[#DE9DFF] hover:shadow-[0_0_20px_rgba(222,157,255,0.6)] disabled:cursor-not-allowed disabled:opacity-30"
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
        <div className="mt-16 relative">
          <div className="h-1 w-full" style={{
            backgroundImage: 'linear-gradient(90deg, rgba(23, 23, 23, 0), rgb(23, 23, 23) 25%, rgb(23, 23, 23) 75%, rgba(23, 23, 23, 0))',
            boxShadow: 'rgba(255, 255, 255, 0.1) 0px -2px 1px 0px inset'
          }} />
        </div>
        <nav className="pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12 mb-12">
            {/* Left Section: Logo + Language + Copyright */}
            <div className="flex flex-col">
              {/* Logo */}
              <a href="/" className="inline-flex gap-3 items-center mb-10 transition-opacity duration-200 hover:opacity-80">
                <img
                  src="/logo.svg"
                  alt="TyrianTrade"
                  className="h-10 brightness-0 invert"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex gap-3 items-center">
                  <svg
                    className="w-[18px] h-[22px] shrink-0"
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
                </div>
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
