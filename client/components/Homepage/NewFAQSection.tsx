import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

const faqData: FAQItem[] = [
  {
    question: "What is a crypto wallet?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          A crypto wallet is a digital tool that allows users to store, manage, and interact with cryptocurrencies such as Bitcoin, Ethereum, and many others. It plays a crucial role in the cryptocurrency ecosystem, enabling users to securely manage their digital assets and perform various transactions.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Crypto wallets come in various types, each offering different levels of security, convenience, and functionality.
        </p>
        <p className="mb-5 leading-[25.6px]">
          The most secure crypto wallets are physical devices called{" "}
          <a href="https://shop.ledger.com/pages/hardware-wallet" className="underline hover:opacity-80 transition-opacity duration-200">
            hardware wallets
          </a>
          , designed to enhance the security of your private keys by securely storing them offline. These crypto wallets physically store your private keys within a chip inside the device itself.
        </p>
      </>
    ),
  },
  {
    question: "What is a Web3 wallet?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          A Web3 wallet is essentially your digital keychain for the new internet era—Web3. It's your all access pass to the decentralized world. Instead of relying on classic institutions like banks to manage your online currencies, a Web3 wallet puts you, and you alone, in control.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Beyond holding your cryptocurrencies, it also lets you interact with cool decentralized apps. Want to trade unique digital items or play games without a middleman? Your Web3 wallet is the go-to tool.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Web3 wallets are extremely user friendly, letting you log in and navigate decentralized apps with ease all while keeping your private keys safe. Think of it as your digital superhero cape—giving you power and security in the wild, wild Web3.
        </p>
      </>
    ),
  },
  {
    question: "What is a non-custodial wallet?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          A non-custodial wallet, also known as a self-custodial wallet (enter the infamous crypto term 'self-custody') is a crypto wallet that puts you in complete control of your public and private keys.
        </p>
        <p className="mb-5 leading-[25.6px]">
          How so? Instead of entrusting your keys to a third-party, non-custodial wallets give you, the wallet's owner, the exclusive responsibility of securing your private keys and wallet.
        </p>
        <p className="mb-5 leading-[25.6px]">
          A non-custodial wallet is a direct link to your blockchain address without any dependence on another entity, eliminating the possibility of asset confiscation.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Non-custodial wallets are completely controlled by you and you alone, meaning they are censorship-resistant and also have no transaction limits. In other words, a non-custodial wallet is your one-way ticket to financial freedom.
        </p>
      </>
    ),
  },
  {
    question: "How do you use a crypto wallet app?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          Ledger hardware wallets use applications to manage your cryptocurrencies. These apps can be installed onto your crypto wallet by connecting it to Ledger Live.
          <br />
          Follow these simple steps to start using apps with your Ledger crypto wallet:
        </p>
        <p className="mb-5 leading-[25.6px]">
          <strong className="font-bold">1. Make sure you have Ledger Live installed.</strong> If you don't, you can download it from the official Ledger website.
          <br />
          <strong className="font-bold">2. Connect Your Ledger Device.</strong> Use the provided USB cable to connect your Ledger crypto wallet to your computer or mobile device.
          <br />
          <strong className="font-bold">3. Unlock Your Ledger Device.</strong> Enter your PIN code to unlock your Ledger device.
          <br />
          <strong className="font-bold">4. Open Ledger Live.</strong> Open the Ledger Live application on your computer or mobile device.
          <br />
          <strong className="font-bold">5. Access the Manager.</strong> In Ledger Live, go to the "Manager" section. This is where you can manage and install apps on your Ledger device.
          <br />
          <strong className="font-bold">6. Choose the App.</strong> Find and choose the app for the cryptocurrency or service you want to use. For example, if you want to use a Bitcoin wallet, select the Bitcoin app.
          <br />
          <strong className="font-bold">7. Install the App.</strong> Click on "Install" to install the selected app on your Ledger device. Follow the on-screen instructions.
          <br />
          <strong className="font-bold">8. Open the App on Your Device.</strong> After installation, navigate to the app on your Ledger device and open it.
          <br />
          <strong className="font-bold">9. Interact with the App.</strong> Use the buttons on your Ledger device to navigate and interact with the app. For example, you can send or receive transactions, check balances, and perform other actions depending on the app's functionality.
          <br />
          <strong className="font-bold">10. Disconnect Safely.</strong> Once you're done using the app, safely disconnect your Ledger device from your computer or mobile device.
        </p>
      </>
    ),
  },
  {
    question: "What is the best crypto wallet for mobile phones?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          The best crypto wallet for mobile phones is the Ledger crypto wallet. This is thanks to the fact that Ledger Live is designed to work seamlessly with Ledger hardware wallets plugged into your mobile phone using the provided USB cable.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Ledger Live is the official mobile app for users of Ledger hardware wallets. It provides a secure way to manage and view cryptocurrency balances on the go directly from your mobile device.
        </p>
      </>
    ),
  },
  {
    question: "What is the best crypto wallet for desktops?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          Ledger crypto wallets are widely known as the best crypto wallets for desktop users, particularly due to the uncompromising value they place on both security and user-friendliness.
        </p>
        <p className="mb-5 leading-[25.6px]">
          The Ledger Live crypto wallet application has a user-friendly interface that makes it easy for users to manage their cryptocurrency portfolios, providing a seamless integration for Ledger hardware wallets.
        </p>
        <p className="mb-5 leading-[25.6px]">
          The application is designed to be intuitive, providing clear options for viewing balances and managing accounts.
        </p>
      </>
    ),
  },
  {
    question: "What is Ledger Live?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          The Ledger Live app is a safe and easy interface for managing your cryptocurrencies using your Ledger device.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Unlike most apps, the Ledger Live crypto wallet app keeps your data directly on your phone or computer, so there's no need to sign in using an email and password. All that's required is your Ledger device and of course, you.
        </p>
      </>
    ),
  },
  {
    question: "How does the Ledger Live wallet app work?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          Ledger Live is designed as the trusted companion for your Ledger crypto wallet device. It serves as a user-friendly interface where you can seamlessly manage all your crypto assets and currencies in one secure place.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Get started by simply connecting your Ledger device to your desktop or mobile phone using the provided USB cable. Once you're connected, you'll have a clear view of your cryptocurrency portfolio and access to account management and transaction histories. Within the Ledger Live wallet app, you can also send and receive crypto currencies, track your portfolio and access all sorts of nifty decentralized apps.
        </p>
      </>
    ),
  },
  {
    question: "How do I download and install the Ledger Live wallet app?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          To download and install the Ledger Live app, follow the steps below. Do please keep in mind however that some specific steps may vary slightly according to your your operating system (Windows, macOS, Linux) or device (computer or mobile).
        </p>
        <p className="mb-5 leading-[25.6px]">
          Go to the official Ledger website and click on Ledger Live.
          <br />
          Click on the "Download Ledger Live" button, which will redirect you to the download page, and click "Download."
        </p>
        <p className="mb-5 leading-[25.6px]">
          Select Your Operating System, choosing the appropriate version for your operating system (Windows, macOS, or Linux).
          <br />
          Download the installer file and run it, following the on-screen instructions until complete.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Connect you Ledger device to your computer using the provided USB cable.
          <br />
          Open Ledger Live, launching the Ledger Live application on your computer.
          <br />
          Complete your setup by following the on-screen instructions to set up and configure Ledger Live. Here you will have the opportunity to either create a new account or restore an existing one.
        </p>
        <p className="mb-5 leading-[25.6px]">
          Now it's time to install Apps on your Ledger device! In Ledger Live, navigate to the "Manager" section. Install the apps for the cryptocurrencies you wish to manage on your Ledger device.
        </p>
        <p className="mb-5 leading-[25.6px]">Have fun!</p>
      </>
    ),
  },
  {
    question: "Which coins does the Ledger Live wallet app support?",
    answer: (
      <>
        <p className="mb-5 leading-[25.6px]">
          Coins refer to any cryptocurrency that has an independent blockchain — like Bitcoin. Put simply, if the cryptocurrency runs on its own blockchain, then it is a coin. This native coin is what you use for paying transaction fees and participating in the network, and what network participants receive in return for keeping that network secure.
        </p>
        <p className="mb-5 leading-[25.6px]">
          The Ledger Live crypto wallet app supports Bitcoin (BTC), Ethereum (ETH), Ripple (XRP), Litecoin (LTC), Bitcoin Cash (BCH), Polkadot (DOT), Chainlink (LINK), Cardano (ADA), Stellar (XLM), Solana (SOL), Tezos (XTZ) and more. It also supports various ERC-20 tokens and other popular cryptocurrencies.
        </p>
        <p className="mb-5 leading-[25.6px]">
          The Ledger Live crypto wallet app platform is regularly updated to include support for new coins and tokens, so it's a good idea to check for the latest information on the official Ledger website or within the Ledger Live application itself.
        </p>
        <p className="mb-5 leading-[25.6px]">
          For a comprehensive list of supported coins, networks and tokens, feel free to click{" "}
          <a href="https://www.ledger.com/supported-crypto-assets" className="underline hover:opacity-80 transition-opacity duration-200">
            here
          </a>
        </p>
      </>
    ),
  },
];

export function NewFAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));

  const toggleAccordion = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section
      itemScope
      itemType="https://schema.org/FAQPage"
      className="py-20"
      style={{
        backgroundImage: "radial-gradient(80.07% 46.93% at 50% 50%, rgb(53, 43, 61) 0px, rgb(0, 0, 0) 100%)",
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 2.396px 2.396px 0px",
      }}
    >
      <div className="mx-[4%] max-w-[1440px] relative">
        <div className="mb-20 mx-[4%] max-w-[1440px] relative">
          <h2 className="text-white text-[28px] font-semibold leading-8 mb-5 tracking-[-2.25px] text-left">
            FAQs
          </h2>
          <p className="text-white text-xl leading-7 mb-10 text-left">
            about the Ledger Live crypto wallet app
          </p>

          <div>
            {faqData.map((item, index) => {
              const isOpen = openItems.has(index);
              
              return (
                <div
                  key={index}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                  className="pb-4 mx-[4%] max-w-[1440px] relative"
                >
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={() => toggleAccordion(index)}
                    className="absolute left-0 top-0 h-0 invisible"
                    aria-label={`Toggle ${item.question}`}
                  />
                  
                  <button
                    itemProp="name"
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between px-6 py-3 text-white font-semibold leading-7 cursor-pointer overflow-hidden relative transition-all duration-[600ms] ease-in-out"
                    style={{
                      backgroundImage: isOpen
                        ? "linear-gradient(90deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))"
                        : "linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
                      backgroundSize: "101% 101%",
                    }}
                  >
                    <span className="text-left">{item.question}</span>
                    <div
                      className="w-6 h-6 flex items-center justify-center transition-transform duration-300 ease-in-out z-[1]"
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <svg
                        width="25"
                        height="25"
                        viewBox="0 0 48 48"
                        fill="none"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        xmlns="http://www.w3.org/2000/svg"
                        className={isOpen ? "stroke-white" : "stroke-neutral-400"}
                        style={{
                          display: "inline",
                          overflow: "hidden",
                        }}
                      >
                        <path d="M16 20L24 28L32 20"></path>
                      </svg>
                    </div>
                  </button>

                  <div
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                    className="overflow-hidden transition-all"
                    style={{
                      maxHeight: isOpen ? "fit-content" : "0px",
                      opacity: isOpen ? 1 : 0,
                      marginTop: isOpen ? "20px" : "0px",
                      transitionProperty: isOpen ? "none" : "none",
                    }}
                  >
                    <div itemProp="text" className="text-white leading-7">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-20">
          <p className="text-[#e5e5e5] text-[11px] font-medium leading-4 text-center">
            * Crypto transaction services are provided by third-party providers. Ledger provides no advice or recommendations on use of these third-party services.
          </p>
        </div>
      </div>
    </section>
  );
}
