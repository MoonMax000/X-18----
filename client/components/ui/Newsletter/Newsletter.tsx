import { FC, FormEvent, useState } from 'react';
import { Send } from 'lucide-react';

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
    <section className="border-t border-[#181B22] bg-gradient-to-b from-[#0A0D12] to-[#000000] py-16">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8">
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
              {/* Reddit */}
              <li>
                <a
                  href="https://www.reddit.com/r/tyriantrade/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="Reddit"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.16625 8.00002C5.70777 8.00002 5.3335 8.37429 5.3335 8.83277C5.3335 9.29125 5.70777 9.66552 6.16625 9.66552C6.62473 9.66552 6.999 9.29125 6.999 8.83277C6.999 8.37429 6.62473 8.00002 6.16625 8.00002Z" />
                    <path d="M8.00952 11.6398C8.32765 11.6398 9.41303 11.6024 9.98379 11.0316C10.068 10.9474 10.068 10.8164 10.0025 10.7228C9.9183 10.6386 9.77795 10.6386 9.69373 10.7228C9.32882 11.0784 8.57093 11.2094 8.01888 11.2094C7.46683 11.2094 6.69958 11.0784 6.34403 10.7228C6.25982 10.6386 6.11946 10.6386 6.03525 10.7228C5.95104 10.807 5.95104 10.9474 6.03525 11.0316C6.59666 11.593 7.69139 11.6398 8.00952 11.6398Z" />
                    <path d="M9.00134 8.83277C9.00134 9.29125 9.37561 9.66552 9.83409 9.66552C10.2926 9.66552 10.6668 9.29125 10.6668 8.83277C10.6668 8.37429 10.2926 8.00002 9.83409 8.00002C9.37561 8.00002 9.00134 8.37429 9.00134 8.83277Z" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8ZM12.1639 6.83043C12.8095 6.83043 13.3335 7.35441 13.3335 8.00002C13.3335 8.47722 13.0434 8.88891 12.6598 9.07605C12.6785 9.18833 12.6879 9.30061 12.6879 9.42225C12.6879 11.2187 10.6013 12.669 8.01888 12.669C5.43642 12.669 3.34987 11.2187 3.34987 9.42225C3.34987 9.30061 3.35923 9.17897 3.37794 9.06669C2.96625 8.87956 2.68555 8.47722 2.68555 8.00002C2.68555 7.35441 3.20952 6.83043 3.85514 6.83043C4.16391 6.83043 4.45397 6.96143 4.65982 7.15792C5.46449 6.56845 6.57795 6.20353 7.82239 6.16611L8.41186 3.3778C8.43058 3.32166 8.45865 3.27488 8.50543 3.24681C8.55221 3.21874 8.60835 3.20938 8.66449 3.21874L10.6013 3.63043C10.7323 3.34973 11.013 3.1626 11.3405 3.1626C11.799 3.1626 12.1733 3.53687 12.1733 3.99535C12.1733 4.45383 11.799 4.82809 11.3405 4.82809C10.8914 4.82809 10.5265 4.47254 10.5078 4.03277L8.77677 3.66786L8.24344 6.16611C9.45982 6.21289 10.5639 6.58716 11.3592 7.15792C11.5651 6.95207 11.8458 6.83043 12.1639 6.83043Z" />
                  </svg>
                </a>
              </li>

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

              {/* Telegram */}
              <li>
                <a
                  href="https://t.me/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="Telegram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                  </svg>
                </a>
              </li>

              {/* Discord */}
              <li>
                <a
                  href="https://discord.gg/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="Discord"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                    <path d="M13.5535 1.42123C12.5023 0.984667 11.3925 0.674952 10.2526 0.5C10.0966 0.752955 9.95547 1.01321 9.82976 1.27968C8.6155 1.1137 7.38067 1.1137 6.16641 1.27968C6.04063 1.01324 5.89949 0.752985 5.74357 0.5C4.60289 0.676429 3.4924 0.986879 2.44013 1.42352C0.351096 4.22717 -0.215207 6.96119 0.0679444 9.65639C1.29133 10.4763 2.66066 11.0999 4.11639 11.5C4.44417 11.1001 4.73422 10.6758 4.98346 10.2317C4.51007 10.0714 4.05317 9.87348 3.61804 9.64041C3.73256 9.56507 3.84456 9.48744 3.95279 9.4121C5.21891 9.95222 6.60083 10.2323 7.99997 10.2323C9.39912 10.2323 10.781 9.95222 12.0472 9.4121C12.1566 9.49315 12.2686 9.57078 12.3819 9.64041C11.9459 9.87386 11.4882 10.0721 11.014 10.2329C11.2629 10.6768 11.553 11.1007 11.881 11.5C13.338 11.1015 14.7084 10.4782 15.932 9.65753C16.2642 6.53196 15.3644 3.82306 13.5535 1.42123ZM5.34212 7.99886C4.55307 7.99886 3.90119 7.34931 3.90119 6.55023C3.90119 5.75114 4.53042 5.09589 5.3396 5.09589C6.14879 5.09589 6.79563 5.75114 6.78179 6.55023C6.76795 7.34931 6.14627 7.99886 5.34212 7.99886ZM10.6578 7.99886C9.86752 7.99886 9.21815 7.34931 9.21815 6.55023C9.21815 5.75114 9.84738 5.09589 10.6578 5.09589C11.4683 5.09589 12.1101 5.75114 12.0962 6.55023C12.0824 7.34931 11.462 7.99886 10.6578 7.99886Z" />
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

              {/* LinkedIn */}
              <li>
                <a
                  href="https://www.linkedin.com/company/tyriantrade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white transition-all hover:bg-[#A06AFF]/20 hover:text-[#A06AFF]"
                  aria-label="LinkedIn"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M14.2222 16H1.77778C0.795938 16 0 15.2041 0 14.2222V1.77778C0 0.795938 0.795938 0 1.77778 0H14.2222C15.2041 0 16 0.795938 16 1.77778V14.2222C16 15.2041 15.2041 16 14.2222 16ZM11.4035 13.7778H13.7778V8.90031C13.7778 6.83659 12.608 5.83876 10.9739 5.83876C9.33916 5.83876 8.65117 7.11181 8.65117 7.11181V6.07412H6.36301V13.7778H8.65117V9.73385C8.65117 8.65029 9.14996 8.0055 10.1046 8.0055C10.9822 8.0055 11.4035 8.6251 11.4035 9.73385V13.7778ZM2.22227 3.64382C2.22227 4.42886 2.85383 5.06538 3.63323 5.06538C4.41263 5.06538 5.04382 4.42886 5.04382 3.64382C5.04382 2.85879 4.41263 2.22227 3.63323 2.22227C2.85383 2.22227 2.22227 2.85879 2.22227 3.64382ZM4.83769 13.7778H2.45172V6.07412H4.83769V13.7778Z" />
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
                      className="w-full rounded-lg border border-[#181B22] bg-[#0A0D12] px-4 py-3 text-white placeholder-[#6C7280] transition-colors focus:border-[#A06AFF] focus:outline-none focus:ring-1 focus:ring-[#A06AFF]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-[#A06AFF] bg-transparent px-6 py-3 font-medium text-white transition-all hover:bg-[#A06AFF] hover:shadow-lg hover:shadow-[#A06AFF]/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {/* Animated shine effect */}
                    <span className="absolute inset-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      {isSubmitting ? (
                        <span>Subscribing...</span>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Subscribe to newsletter</span>
                          <span className="sm:hidden">Subscribe</span>
                        </>
                      )}
                    </span>
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
