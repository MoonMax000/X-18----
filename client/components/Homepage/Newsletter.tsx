import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
  };

  return (
    <section className="bg-[#0a0a0a] text-white py-16 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Stay in touch</h3>
            <p className="text-gray-400 mb-6">
              Announcements can be found in our blog. Press contact:
              <br />
              <a href="mailto:media@ledger.com" className="text-purple-400 hover:text-purple-300">
                media@ledger.com
              </a>
            </p>
            
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: '𝕏', label: 'Twitter', href: 'https://twitter.com/Ledger' },
                { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/Ledger/' },
                { icon: '📷', label: 'Instagram', href: 'https://www.instagram.com/ledger/' },
                { icon: '▶', label: 'YouTube', href: 'https://www.youtube.com/Ledger' },
                { icon: '💼', label: 'LinkedIn', href: 'https://www.linkedin.com/company/ledgerhq' },
                { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@ledger' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">
              Subscribe to our newsletter
            </h3>
            <p className="text-gray-400 mb-6">
              New coins supported, blog updates and exclusive offers directly in your inbox
            </p>
            
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              Your email address will only be used to send you our newsletter, as well as updates and offers. 
              You can unsubscribe at any time using the link included in the newsletter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
