export function TopBanner() {
  return (
    <a
      href="https://shop.ledger.com/pages/ledger-flex"
      className="block bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <p className="text-white text-sm md:text-base font-medium text-center flex-1">
            Review and sign transactions from a single secure screen with Ledger Flex™
          </p>
          <span className="text-white text-sm font-semibold ml-4 whitespace-nowrap">
            Discover now →
          </span>
        </div>
      </div>
    </a>
  );
}
