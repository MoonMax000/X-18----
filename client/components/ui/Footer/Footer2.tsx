import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Продукты',
    links: [
      { label: 'Социальная сеть', href: '/social' },
      { label: 'Маркетплейс', href: '/marketplace' },
      { label: 'Live Streaming', href: '/streaming' },
    ],
  },
  {
    title: 'Начать',
    links: [
      { label: 'Создать аккаунт', href: '/signup' },
      { label: 'Присоединиться к сообществу', href: '/community' },
      { label: 'Гайд для новичков', href: '/beginner-guide' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Ресурсы',
    links: [
      { label: 'Центр поддержки', href: '/support' },
      { label: 'Дорожная карта', href: '/roadmap' },
      { label: 'Блог сообщества', href: '/blog' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О платформе', href: '/about' },
      { label: 'Контакты', href: '/contact' },
    ],
  },
  {
    title: 'Правовая информация',
    links: [
      { label: 'Пользовательское соглашение', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Правила сообщества', href: '/community-guidelines' },
    ],
  },
];

const LANGUAGES = [
  { code: 'ru', name: 'Русский', label: 'RU' },
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'zh', name: '简体中文', label: '中文' },
  { code: 'es', name: 'Español', label: 'ES' },
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'de', name: 'Deutsch', label: 'DE' },
  { code: 'ja', name: '日本語', label: 'JA' },
  { code: 'ko', name: '한국어', label: 'KO' },
  { code: 'ar', name: 'العربية', label: 'AR' },
];

const Footer2: FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <footer className="border-t border-[#5E5E5E] bg-[#000000] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Left Column: Logo, Language Selector, Copyright */}
          <div className="lg:max-w-[240px]">
            {/* Logo */}
            <Link to="/" className="mb-6 inline-flex items-center gap-2">
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
                  fill="url(#paint0_linear_footer2)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_footer2"
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
              <div className="text-2xl font-bold">
                <span className="text-[#FFFFFF]">
                  Tyrian Trade
                </span>
              </div>
            </Link>

            {/* Language Selector */}
            <div className="relative mb-8">
              <button
                type="button"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex w-[140px] items-center justify-between rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-4 py-2.5 text-sm font-medium text-[#E5E7EB] transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
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

            {/* Copyright & Company Info */}
            <div className="space-y-4 text-xs text-[#8E92A0]">
              <p>
                Copyright © Tyrian Trade. Все права защищены. Tyrian Trade является торговой маркой.
              </p>
              <p>Dubai, UAE</p>
              <p className="text-[10px] leading-relaxed">
                ⚠️ Торговля криптовалютами связана с рисками. Инвестируйте ответственно.
              </p>
            </div>
          </div>

          {/* Navigation Row */}
          <nav className="flex flex-wrap gap-6 lg:gap-8">
            {FOOTER_SECTIONS.map((section, idx) => (
              <div key={idx}>
                <h3 className="mb-4 text-sm font-semibold text-white">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        to={link.href}
                        className="text-sm text-[#8E92A0] transition-colors hover:text-[#A06AFF]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

      </div>
    </footer>
  );
};

export default Footer2;
