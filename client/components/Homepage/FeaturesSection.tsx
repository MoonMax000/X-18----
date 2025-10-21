import { useState, useEffect, useRef } from 'react';

const features = [
  {
    id: 'manage',
    title: 'Stay on top',
    subtitle: 'of your assets',
    description:
      'Monitor your portfolio across multiple networks and accounts from a single, intuitive dashboard. Identify trends and areas for improvement. Take advantage of opportunities to enhance your holdings with a diverse range of coins and tokens.',
    image: 'https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/09/manage-1.webp',
  },
  {
    id: 'buy',
    title: 'Buy & sell crypto',
    subtitle: 'simply & securely',
    description:
      'Compare rates, payment methods & service providers. Choose the options that work best for each transaction. Buy via renowned providers such as Revolut, Paypal, Coinbase, MoonPay or Uphold. Sell via BTC Direct, Transak, Moonpay, Coinify and more.',
    image: 'https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/09/buy-1.webp',
  },
  {
    id: 'swap',
    title: 'Swap crypto',
    subtitle: 'quickly & easily',
    description:
      'Save precious time and money by swaping one crypto for another without having to sell one and then buy another using fiat currencies & payment methods. Conveniently diversify your portfolio while protecting your crypto from market volatility.',
    image: 'https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/09/swap-1.webp',
  },
  {
    id: 'stake',
    title: 'Stake crypto',
    subtitle: '& earn rewards',
    description:
      'Put your crypto to work for you and grow your portfolio by staking a vast range of coins via dependable service providers like Lido, Kiln and Figment. Customize your earning strategy and compare staking opportunities in the Earn section.',
    image: 'https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/09/stake-1.webp',
  },
  {
    id: 'monitor',
    title: 'Monitor',
    subtitle: 'market trends & insights',
    description:
      'Get a 360° view of how the market is evolving in real time. Make informed decisions to optimize your portfolio. Choose just the right moment for each and every transaction. Take full control of your financial freedom.',
    image: 'https://ledger-wp-website-s3-prd.ledger.com/uploads/2025/09/monitor-1.webp',
  },
];

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const windowHeight = window.innerHeight;

      featureRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = windowHeight / 2;

        if (
          elementCenter > viewportCenter - 200 &&
          elementCenter < viewportCenter + 200
        ) {
          setActiveFeature((current) => {
            if (current !== index) {
              setImageKey((prev) => prev + 1);
              return index;
            }
            return current;
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative py-20"
      style={{
        background:
          'radial-gradient(80.07% 46.93% at 50% 50%, rgb(69, 57, 92) 0%, rgb(0, 0, 0) 94.27%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-semibold text-white mb-5 tracking-tight">
            Do more with your crypto, all from one secure space*
          </h3>
          <p className="text-xl text-white">via the Ledger Live crypto wallet app</p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row-reverse gap-8 lg:gap-12 relative">
          {/* Features list */}
          <div className="flex-1 space-y-5">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                ref={(el) => (featureRefs.current[index] = el)}
                onClick={() => {
                  setActiveFeature(index);
                  setImageKey((prev) => prev + 1);
                }}
                className={`bg-black/50 backdrop-blur-sm rounded-lg p-6 md:p-8 transition-all duration-300 cursor-pointer ${
                  activeFeature === index
                    ? 'opacity-100 scale-[1.02]'
                    : 'opacity-50 hover:opacity-75'
                }`}
              >
                <h4 className="text-xl md:text-2xl font-semibold text-purple-300 mb-3 tracking-tight">
                  <span className="text-purple-300">{feature.title}</span>{' '}
                  {feature.subtitle}
                </h4>
                <p className="text-gray-200 leading-7">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Sticky image */}
          <div className="lg:sticky lg:top-[20%] h-fit lg:min-w-[50%] flex justify-center">
            <div className="relative w-full max-w-[525px] h-[400px] lg:h-[500px] flex items-center justify-center">
              <img
                key={imageKey}
                src={features[activeFeature].image}
                alt={features[activeFeature].title}
                className="max-w-full h-auto object-contain animate-fadeIn"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
