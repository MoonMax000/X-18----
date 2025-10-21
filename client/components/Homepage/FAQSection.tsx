import { useState } from 'react';

const faqs = [
  {
    question: 'What is a crypto wallet?',
    answer: 'A crypto wallet is a digital tool that allows users to store, manage, and interact with cryptocurrencies such as Bitcoin, Ethereum, and many others. It plays a crucial role in the cryptocurrency ecosystem, enabling users to securely manage their digital assets and perform various transactions.',
  },
  {
    question: 'What is a Web3 wallet?',
    answer: 'A Web3 wallet is essentially your digital keychain for the new internet era—Web3. It\'s your all access pass to the decentralized world. Instead of relying on classic institutions like banks to manage your online currencies, a Web3 wallet puts you, and you alone, in control.',
  },
  {
    question: 'What is a non-custodial wallet?',
    answer: 'A non-custodial wallet, also known as a self-custodial wallet is a crypto wallet that puts you in complete control of your public and private keys. Instead of entrusting your keys to a third-party, non-custodial wallets give you, the wallet\'s owner, the exclusive responsibility of securing your private keys and wallet.',
  },
  {
    question: 'What is the best crypto wallet for mobile phones?',
    answer: 'The best crypto wallet for mobile phones is the Ledger crypto wallet. This is thanks to the fact that Ledger Live is designed to work seamlessly with Ledger hardware wallets plugged into your mobile phone using the provided USB cable.',
  },
  {
    question: 'What is Ledger Live?',
    answer: 'The Ledger Live app is a safe and easy interface for managing your cryptocurrencies using your Ledger device. Unlike most apps, the Ledger Live crypto wallet app keeps your data directly on your phone or computer, so there\'s no need to sign in using an email and password.',
  },
  {
    question: 'Which coins does the Ledger Live wallet app support?',
    answer: 'The Ledger Live crypto wallet app supports Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Litecoin (LTC), Bitcoin Cash (BCH), Polkadot (DOT), Chainlink (LINK), Cardano (ADA), Stellar (XLM), Solana (SOL), Tezos (XTZ) and more. It also supports various ERC-20 tokens and other popular cryptocurrencies.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-800 rounded-lg overflow-hidden bg-[#0a0a0a]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#111] transition-colors"
              >
                <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
