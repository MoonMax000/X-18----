import { FC } from 'react';

const Footer: FC = () => {
  return (
    <footer className="border-t border-[#181B22] bg-background/60 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-webGray">
            © {new Date().getFullYear()} TTT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
