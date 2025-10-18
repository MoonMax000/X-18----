import { FC, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  isCollapsed: boolean;
  onClose?: () => void;
}

const WidgetCard: FC<{ title: string; children?: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="container-card p-4 rounded-[16px]">
    <h3 className="text-white font-semibold text-[15px] mb-3">{title}</h3>
    {children || (
      <div className="text-webGray text-sm">Widget content coming soon...</div>
    )}
  </div>
);

export const RightMenu: FC<Props> = ({ isCollapsed, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Блокируем скролл body когда мобильное меню открыто
  useEffect(() => {
    if (isCollapsed && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCollapsed]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // TODO: Implement theme switching logic
    console.log('Theme switched to:', !isDarkMode ? 'dark' : 'light');
  };

  return (
    <>
      {/* Desktop версия - как раньше */}
      <section
        className={cn(
          "hidden lg:flex flex-col gap-6 min-h-full overflow-hidden transition-all duration-500 ease-in-out",
          {
            "h-0 w-0 p-0 opacity-0": !isCollapsed,
            "w-full sm:min-w-[280px] md:min-w-[312px] pr-3 sm:pr-4 md:pr-6 opacity-100": isCollapsed,
          },
        )}
      >
        <WidgetCard title="Quick Search">
          <input
            className="w-full h-9 rounded-lg border border-[#181B22] bg-[#0C101480] px-3 text-white text-sm placeholder:text-webGray outline-none"
            placeholder="Search markets..."
          />
        </WidgetCard>

        <WidgetCard title="Theme">
          <div className="flex items-center justify-between">
            <span className="text-webGray text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            <button
              onClick={toggleTheme}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isDarkMode ? "bg-[#A06AFF]" : "bg-[#6D6D6D]"
              )}
              aria-label="Toggle theme"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </WidgetCard>

        <WidgetCard title="Trading Psychology">
          <div className="flex items-center justify-between">
            <span className="text-webGray text-sm">Fear & Greed Index</span>
            <span className="text-green text-lg font-bold">72</span>
          </div>
          <div className="mt-2 h-2 bg-[#181B22] rounded-full overflow-hidden">
            <div className="h-full bg-green w-[72%] transition-all" />
          </div>
        </WidgetCard>

        <WidgetCard title="Sector Movers">
          <div className="flex flex-col gap-2">
            {["Technology", "Healthcare", "Finance"].map((sector) => (
              <div
                key={sector}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-white">{sector}</span>
                <span className="text-green">+2.4%</span>
              </div>
            ))}
          </div>
        </WidgetCard>

        <WidgetCard title="Portfolio" />
        <WidgetCard title="Watch List" />
        <WidgetCard title="Latest News" />
        <WidgetCard title="Calendar" />
      </section>

      {/* Mobile версия - overlay снизу */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40',
            isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out',
            isCollapsed ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className='bg-transparent p-[1px] rounded-t-[20px] bg-[linear-gradient(170.22deg,#523A83_0.01%,rgba(82,58,131,0)_15%),linear-gradient(350.89deg,#523A83_0%,rgba(82,58,131,0)_15%)]'>
            <div className='custom-bg-blur rounded-t-[20px] px-4 pb-6 pt-4 max-h-[75vh] overflow-y-auto'>
              {/* Drag indicator */}
              <div className='flex justify-center mb-3'>
                <div className='w-12 h-1 bg-[#523A83] rounded-full' />
              </div>

              {/* Widgets */}
              <div className="flex flex-col gap-4">
                <WidgetCard title="Quick Search">
                  <input
                    className="w-full h-9 rounded-lg border border-[#181B22] bg-[#0C101480] px-3 text-white text-sm placeholder:text-webGray outline-none"
                    placeholder="Search markets..."
                  />
                </WidgetCard>

                <WidgetCard title="Theme">
                  <div className="flex items-center justify-between">
                    <span className="text-webGray text-sm">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    <button
                      onClick={toggleTheme}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        isDarkMode ? "bg-[#A06AFF]" : "bg-[#6D6D6D]"
                      )}
                      aria-label="Toggle theme"
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          isDarkMode ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                </WidgetCard>

                <WidgetCard title="Trading Psychology">
                  <div className="flex items-center justify-between">
                    <span className="text-webGray text-sm">Fear & Greed Index</span>
                    <span className="text-green text-lg font-bold">72</span>
                  </div>
                  <div className="mt-2 h-2 bg-[#181B22] rounded-full overflow-hidden">
                    <div className="h-full bg-green w-[72%] transition-all" />
                  </div>
                </WidgetCard>

                <WidgetCard title="Sector Movers">
                  <div className="flex flex-col gap-2">
                    {["Technology", "Healthcare", "Finance"].map((sector) => (
                      <div
                        key={sector}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-white">{sector}</span>
                        <span className="text-green">+2.4%</span>
                      </div>
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Portfolio" />
                <WidgetCard title="Watch List" />
                <WidgetCard title="Latest News" />
                <WidgetCard title="Calendar" />
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};
