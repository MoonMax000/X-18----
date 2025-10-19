import { FC, FormEvent, useState } from 'react';

const Newsletter: FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubscribed(true);
    setEmail('');
    setIsSubmitting(false);

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubscribed(false), 5000);
  };

  return (
    <section className="relative overflow-hidden bg-[#000000] py-16">
      {/* Middle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#171717] to-[#000000]" />

      {/* Top gradient line - more visible */}
      <div className="absolute left-0 top-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#3D3D3D] to-transparent" />

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 z-10 h-[2px] w-full bg-gradient-to-r from-transparent via-[#3D3D3D] to-transparent" />

      <div className="relative z-20 mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left Column: Stay in Touch */}
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">Stay in touch</h3>
            <p className="mb-6 text-base text-[#A3A3A3]">
              Announcements can be found in our blog. Press contact:{' '}
              <a
                href="mailto:media@tyriantrade.com"
                className="text-[#A06AFF] transition-colors hover:text-[#2EBD85]"
              >
                media@tyriantrade.com
              </a>
            </p>

            {/* Social Icons */}
            <ul className="flex flex-wrap items-center gap-4">
              {/* Twitter/X */}
              <li>
                <a
                  href="https://twitter.com/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="Twitter"
                >
                  <svg width="17" height="16" viewBox="0 0 17 16" fill="currentColor">
                    <path d="M9.54463 6.77491L15.501 0H14.0895L8.91762 5.88256L4.78683 0H0.0224609L6.26902 8.89547L0.0224609 16H1.43401L6.89567 9.78782L11.2581 16H16.0225L9.54429 6.77491H9.54463ZM7.61133 8.97384L6.97842 8.08805L1.94261 1.03974H4.11066L8.17462 6.72795L8.80753 7.61374L14.0902 15.0075H11.9221L7.61133 8.97418V8.97384Z" />
                  </svg>
                </a>
              </li>

              {/* YouTube */}
              <li>
                <a
                  href="https://www.youtube.com/@tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="YouTube"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.2522 0.35842C14.9411 0.555974 15.4824 1.13594 15.6668 1.87394H15.6655C16 3.21025 16 6 16 6C16 6 16 8.78975 15.6655 10.1261C15.4811 10.8641 14.9397 11.444 14.2509 11.6416C13.0036 12 8 12 8 12C8 12 2.99638 12 1.74909 11.6416C1.06026 11.444 0.518933 10.8641 0.334541 10.1261C0 8.78975 0 6 0 6C0 6 0 3.21025 0.334541 1.87394C0.518933 1.13594 1.06026 0.555974 1.74909 0.35842C2.99638 0 8 0 8 0C8 0 13.0036 0 14.2522 0.35842ZM10.5578 5.92865L6.39972 3.35763V8.49968L10.5578 5.92865Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column: Newsletter Subscription */}
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">
              Subscribe to our <br /> newsletter
            </h3>
            <p className="mb-6 text-base text-[#A3A3A3]">
              New coins supported, blog updates and exclusive offers directly in your inbox
            </p>

            {isSubscribed ? (
              <div className="rounded-lg border border-[#2EBD85]/50 bg-[#2EBD85]/10 p-4">
                <p className="text-sm font-medium text-[#2EBD85]">
                  ✓ Successfully subscribed! Check your email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      id="footer-mail"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="w-full rounded-full border border-[#525252] bg-[#0A0D12] px-6 py-3 text-white placeholder-[#6C7280] transition-all duration-300 hover:border-white focus:border-[#A06AFF] focus:outline-none focus:ring-1 focus:ring-[#A06AFF]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="newsletter-subscribe-btn group relative flex w-fit items-center gap-1 overflow-hidden rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-6 py-3 text-sm font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* Animated shine effect */}
                    <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {isSubmitting ? (
                      <span className="relative z-10 whitespace-nowrap text-[#E5E7EB] transition-colors duration-300">
                        Subscribing...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10 whitespace-nowrap text-[#E5E7EB] transition-colors duration-300">
                          <span className="hidden sm:inline">Subscribe to newsletter</span>
                          <span className="sm:hidden">Subscribe</span>
                        </span>
                        <span className="newsletter-arrow relative z-10 text-[#E5E7EB] transition-all duration-300">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 48 48"
                            fill="none"
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="stroke-current"
                          >
                            <path d="M38 24H10M38 24L28 34M38 24L28 14" />
                          </svg>
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#6C7280]">
                  Your email address will only be used to send you our newsletter, as well as updates and
                  offers. You can unsubscribe at any time using the link included in the newsletter.{' '}
                  <a
                    href="/privacy"
                    className="text-[#A06AFF] transition-colors hover:text-[#2EBD85]"
                  >
                    Learn more about how we manage your data and your rights.
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
