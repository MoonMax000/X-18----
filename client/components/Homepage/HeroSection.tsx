export function HeroSection() {
  const platforms = [
    {
      name: 'Windows',
      url: 'https://download.live.ledger.com/latest/win',
      icon: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/windows.svg',
    },
    {
      name: 'macOS',
      url: 'https://download.live.ledger.com/latest/mac',
      icon: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/macos.svg',
    },
    {
      name: 'Linux',
      url: 'https://download.live.ledger.com/latest/linux',
      icon: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/linux.svg',
    },
    {
      name: 'iOS',
      url: 'https://apps.apple.com/fr/app/ledger-live-app-crypto-nft/id1361671700',
      icon: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/ios.svg',
    },
    {
      name: 'Android',
      url: 'https://play.google.com/store/apps/details?id=com.ledger.live',
      icon: 'https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/android.svg',
    },
  ];

  return (
    <section className="bg-black text-white pt-[86px]">
      <div className="max-w-[1440px] mx-auto px-[4%] relative">
        <div className="flex flex-wrap gap-6 justify-center py-14 px-[4%] max-w-[1440px] mx-auto relative">
          <div className="flex-1 basis-0 py-16">
            <h1 className="text-[50px] font-semibold tracking-[-2.25px] leading-[56px] mb-5">
              Ledger Live™&nbsp;your all-in-one crypto wallet app
            </h1>
            <p className="text-2xl font-semibold tracking-[-1.08px] leading-8 text-left">
              Build and manage your cross-chain portfolio. Explore DeFi Dapps and more.
            </p>
            <div className="flex items-center gap-2.5 bg-[#171717] rounded-lg py-2 px-4 w-fit mt-10">
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-4 h-4"
                  >
                    <path
                      d="M8.79818 1.57644C8.64545 1.27206 8.334 1.07996 7.99345 1.08008C7.6529 1.0802 7.34159 1.27253 7.18907 1.57701L5.52429 4.90067L1.88107 5.3605C1.54215 5.40327 1.25667 5.63424 1.14407 5.95676C1.03147 6.27928 1.11117 6.63775 1.34983 6.88217L3.94565 9.54069L3.23659 13.1569C3.17122 13.4903 3.29916 13.8321 3.56738 14.0406C3.83559 14.2491 4.19838 14.2889 4.50536 14.1433L8.00216 12.4853L11.4837 14.1213C11.7907 14.2655 12.1527 14.225 12.4201 14.0163C12.6875 13.8077 12.8149 13.4664 12.7496 13.1336L12.0408 9.51836L14.6359 6.86998C14.8754 6.6256 14.9556 6.26657 14.8428 5.94352C14.7301 5.62047 14.4439 5.3893 14.1044 5.34699L10.4624 4.89314L8.79818 1.57644Z"
                      fill="white"
                    />
                  </svg>
                ))}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.57473 1.68856C8.46442 1.46873 8.23949 1.32999 7.99354 1.33008C7.74758 1.33017 7.52274 1.46907 7.4126 1.68898L5.68803 5.13199L1.91237 5.60853C1.6676 5.63942 1.46141 5.80623 1.38009 6.03917C1.29877 6.2721 1.35633 6.53099 1.5287 6.70751L4.21624 9.45996L3.48191 13.205C3.4347 13.4458 3.5271 13.6926 3.72081 13.8432C3.91453 13.9938 4.17654 14.0225 4.39824 13.9174L8.00168 12.2089L11.59 13.895C11.8117 13.9992 12.0731 13.9699 12.2663 13.8192C12.4594 13.6685 12.5514 13.4221 12.5043 13.1817L11.7701 9.43736L14.4574 6.69501C14.6303 6.51851 14.6882 6.25921 14.6068 6.0259C14.5254 5.79259 14.3187 5.62562 14.0735 5.59507L10.2989 5.1247L8.57473 1.68856ZM8.00041 10.8401C8.09485 10.8401 8.1893 10.8606 8.27687 10.9018L10.9817 12.1728L10.4286 9.35181C10.3874 9.14169 10.4523 8.92475 10.6022 8.77181L12.6101 6.72276L9.79339 6.37176C9.57796 6.34491 9.39016 6.21229 9.2928 6.01826L8.00041 3.44263V10.8401Z"
                    fill="white"
                  />
                </svg>
              </div>
              <p className="text-[13px] font-medium leading-[22px]">
                Trusted by over 8 million customers
              </p>
            </div>
          </div>
          <div className="flex-1 basis-0 relative">
            <img
              loading="lazy"
              src="https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/08/hero-ll.webp"
              alt="Ledger Live App"
              className="absolute bottom-0 w-full h-full max-w-full object-cover object-[50%_100%]"
            />
          </div>
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(208px,1fr))] justify-center py-12 px-[4%] max-w-[1440px] mx-auto relative">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[rgba(230,230,230,0.2)] to-[rgba(230,230,230,0.05)] border border-[#525252] rounded py-4 max-h-[90px] transition-all duration-300 ease-out hover:border-white hover:from-[rgba(230,230,230,0.3)] hover:to-[rgba(230,230,230,0.1)]"
            >
              <img
                src={platform.icon}
                alt={`${platform.name} logo`}
                className="w-14 h-14"
                height="56"
                loading="lazy"
              />
              <div className="text-left">
                <p className="text-[13px] font-medium leading-[22px]">Download for</p>
                <p className="text-2xl font-semibold tracking-[-1.08px] leading-8">
                  {platform.name}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="hidden gap-4 grid-cols-[repeat(auto-fill,minmax(208px,1fr))] justify-center py-12 px-[4%] max-w-[1440px] mx-auto relative">
          <a href="https://apps.apple.com/fr/app/ledger-live-app-crypto-nft/id1361671700">
            <img
              src="https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/app-store.png"
              alt="App Store"
              height="45"
              loading="lazy"
              className="h-[45px]"
            />
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.ledger.live">
            <img
              src="https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger-live/download-buttons/google-play.png"
              alt="Google Play"
              height="45"
              loading="lazy"
              className="h-[45px]"
            />
          </a>
        </div>

        <p className="hidden text-[13px] font-medium leading-[22px] text-center">
          Also available on desktop
        </p>
      </div>
    </section>
  );
}
