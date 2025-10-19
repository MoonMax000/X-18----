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
    title: 'Правовая ��нформация',
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
  { code: 'zh', name: '���体中文', label: '中文' },
  { code: 'es', name: 'Español', label: 'ES' },
  { code: 'fr', name: 'Français', label: 'FR' },
  { code: 'de', name: 'Deutsch', label: 'DE' },
  { code: 'ja', name: '日本語', label: 'JA' },
  { code: 'ko', name: '한국어', label: 'KO' },
  { code: 'ar', name: 'العربية', label: 'AR' },
];

const Footer: FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <footer className="border-t border-[#181B22] bg-[#000000] text-white">
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

        {/* Bottom Bar: Social Links */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#181B22] pt-8 sm:flex-row">
          <div className="flex items-center gap-6">
            <a
              href="https://twitter.com/tyriantrade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8E92A0] transition-colors hover:text-[#A06AFF]"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/tyriantrade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8E92A0] transition-colors hover:text-[#A06AFF]"
              aria-label="GitHub"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
          <p className="text-xs text-[#8E92A0]">
            Создано с ❤️ для трейдеров
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
