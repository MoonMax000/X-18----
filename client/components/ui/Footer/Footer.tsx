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
      { label: 'Торговые сигналы', href: '/home' },
      { label: 'Аналитика', href: '/analytics' },
      { label: 'Обучение', href: '/academy' },
      { label: 'Маркетплейс', href: '/marketplace' },
      { label: 'Live Streaming', href: '/streaming' },
    ],
  },
  {
    title: 'Криптовалюты',
    links: [
      { label: 'Bitcoin', href: '/coin/bitcoin' },
      { label: 'Ethereum', href: '/coin/ethereum' },
      { label: 'Solana', href: '/coin/solana' },
      { label: 'Cardano', href: '/coin/cardano' },
      { label: 'XRP', href: '/coin/xrp' },
      { label: 'Все активы', href: '/coins' },
    ],
  },
  {
    title: 'Сервисы',
    links: [
      { label: 'Цены криптовалют', href: '/prices' },
      { label: 'Покупка крипты', href: '/buy' },
      { label: 'Стейкинг', href: '/staking' },
      { label: 'Обмен', href: '/swap' },
      { label: 'Портфолио', href: '/portfolio' },
    ],
  },
  {
    title: 'Для би��неса',
    links: [
      { label: 'Корпоративные решения', href: '/enterprise' },
      { label: 'Партнёрская программа', href: '/affiliates' },
      { label: 'API для разработчиков', href: '/api' },
    ],
  },
  {
    title: 'Начать',
    links: [
      { label: 'Регистрация', href: '/signup' },
      { label: 'Как купить Bitcoin', href: '/buy-bitcoin' },
      { label: 'Руководства', href: '/guides' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Ресурсы',
    links: [
      { label: 'Поддержка', href: '/support' },
      { label: 'Академия', href: '/academy' },
      { label: 'Блог', href: '/blog' },
      { label: 'Статус системы', href: '/status' },
      { label: 'Пресс-кит', href: '/press' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О нас', href: '/about' },
      { label: 'Команда', href: '/team' },
      { label: 'Карьера', href: '/careers' },
      { label: 'Контакты', href: '/contact' },
    ],
  },
  {
    title: 'Правовая информация',
    links: [
      { label: 'Условия использования', href: '/terms' },
      { label: 'Политика конфиденциальности', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Дискле��меры', href: '/disclaimers' },
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

const Footer: FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

  return (
    <footer className="border-t border-[#181B22] bg-[#000000] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Left Column: Logo, Language Selector, Copyright */}
          <div className="lg:max-w-[300px]">
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
                className="flex w-full items-center justify-between rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-6 py-3 text-sm font-medium text-[#E5E7EB] transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#A06AFF]" />
                  <span className="text-white">{selectedLanguage.label}</span>
                  <span className="text-[#A3A3A3]">{selectedLanguage.name}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLanguageOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-2xl border border-[#525252] bg-[#0A0D12] shadow-lg">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setCurrentLanguage(lang.code);
                        setIsLanguageOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 px-6 py-3 text-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent ${
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
              <p>Москва, Россия</p>
              <p className="text-[10px] leading-relaxed">
                ⚠️ Торговля криптовалютами связана с рисками. Инвестируйте ответственно.
              </p>
            </div>
          </div>

          {/* Right Columns: Navigation */}
          <nav className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
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
              href="https://t.me/tyriantrade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8E92A0] transition-colors hover:text-[#A06AFF]"
              aria-label="Telegram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
              </svg>
            </a>
            <a
              href="https://discord.gg/tyriantrade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8E92A0] transition-colors hover:text-[#A06AFF]"
              aria-label="Discord"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
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
