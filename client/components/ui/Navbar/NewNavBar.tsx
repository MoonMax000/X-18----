import { FC, useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutVariant } from '../AppBackground/AppBackground';
import { cn } from '@/lib/utils';
import { navElements, NavElementProps } from './constants';
import { ChevronDown, DoubleArrow, QuillPen } from './icons';
import CreatePostModal from '@/components/CreatePostBox/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

interface Props {
  variant?: LayoutVariant;
  isOpen?: boolean;
  onClose?: () => void;
}

const NewNavBar: FC<Props> = ({ variant = 'primal', isOpen = false, onClose }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);

  // Filter navigation elements for unauthenticated users
  const filteredNavElements = useMemo(() => {
    let elements = [...navElements];
    
    // Add admin panel link for admin users
    if (isAuthenticated && user?.role === 'admin') {
      elements.push({
        icon: <ShieldCheck className="h-5 w-5" />,
        title: 'Admin Panel',
        route: '/admin/dashboard'
      });
    }
    
    if (!isAuthenticated) {
      return elements
        .map((el) => {
          // Hide Dashboard for unauthenticated users
          if (el.title === 'Dashboard') return null;

          // Filter children in Social Network
          if (el.title === 'Social Network' && el.children) {
            const filteredChildren = el.children.filter(
              (child) => child.title !== 'Messages' && child.title !== 'Profile'
            );
            return { ...el, children: filteredChildren };
          }

          return el;
        })
        .filter(Boolean) as NavElementProps[];
    }
    return elements;
  }, [isAuthenticated, user?.role]);

  // Определяем активную группу по текущему роуту
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Находим группу, которая содержит текущий роут
    const activeGroup = navElements.find(el => 
      el.children?.some(child => child.route && currentPath.startsWith(child.route))
    );
    
    if (activeGroup && activeGroup.title !== openGroup) {
      setOpenGroup(activeGroup.title);
    }
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    // В компактном режиме не разворачиваем группы
    if (!isCollapsed) {
      setOpenGroup(openGroup === title ? null : title);
    }
  };

  // Закрываем мобильное меню при навигации
  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  // Блокируем скролл body когда мобильное меню открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const renderElement = (el: NavElementProps, isMobile: boolean = false) => {
    if (el.children && el.children.length > 0) {
      const isGroupOpen = openGroup === el.title;
      return (
        <div key={el.title} className="relative group/tooltip">
          <button
            onClick={() => toggleGroup(el.title)}
            className={cn(
              'flex items-center justify-between w-full px-3 py-[14px] rounded-lg transition',
              isMobile && 'py-3'
            )}
            aria-expanded={isGroupOpen}
            aria-controls={`${el.title}-submenu`}
          >
            <div
              className={cn('group flex items-center gap-2 pl-2 hover:text-white hover:border-l-[2px] hover:border-purple overflow-hidden', {
                'text-white border-l-[2px] border-purple': isGroupOpen,
                'text-[#B0B0B0]': !isGroupOpen,
              })}
            >
              <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>{el.icon}</div>
              <span
                className={cn('text-[15px] font-semibold whitespace-nowrap transition-all duration-300', {
                  'opacity-0 w-0': isCollapsed && !isMobile,
                  'opacity-100 w-auto': !isCollapsed || isMobile,
                })}
              >
                {el.title}
              </span>
            </div>
            {(!isCollapsed || isMobile) && <ChevronDown className={cn('h-4 w-4 transition-transform flex-shrink-0', isGroupOpen && 'rotate-180')} />}
          </button>
          {/* Tooltip for collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E1E1E] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#2A2A2A]">
              {el.title}
            </div>
          )}
          {isGroupOpen && (
            <div id={`${el.title}-submenu`} className='flex flex-col gap-1'>
              {el.children.map((child) => (
                <NavLink 
                  key={child.title} 
                  to={child.route ?? '#'} 
                  className={cn('px-3')}
                  onClick={handleNavClick}
                >
                  {({ isActive }) => (
                    <div
                      className={cn('group flex items-center gap-2 pl-2 py-2 hover:custom-bg-blur hover:text-white overflow-hidden', {
                        'text-white': isActive,
                        'text-[#B0B0B0]': !isActive,
                      })}
                    >
                      <div className={cn('flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors', {
                        'bg-purple/20 text-purple': isActive,
                      })}>{child.icon}</div>
                      <span
                        className={cn('text-[15px] font-semibold whitespace-nowrap transition-all duration-300', {
                          'opacity-0 w-0': isCollapsed && !isMobile,
                          'opacity-100 w-auto': !isCollapsed || isMobile,
                        })}
                      >
                        {child.title}
                      </span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (el.route) {
      return (
        <div key={el.title} className="relative group/tooltip">
          <NavLink 
            to={el.route} 
            className={cn('px-3 py-[14px]', { 
              'py-3': isMobile 
            })}
            onClick={handleNavClick}
          >
            {({ isActive }) => (
              <div
                className={cn('group flex items-center gap-2 pl-2 transition hover:text-white hover:border-l-[2px] hover:border-purple overflow-hidden', {
                  'text-white border-l-[2px] border-purple': isActive,
                  'text-[#B0B0B0]': !isActive,
                })}
              >
                <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>{el.icon}</div>
              <span
                className={cn('text-[15px] font-semibold whitespace-nowrap transition-all duration-300', {
                  'opacity-0 w-0': isCollapsed && !isMobile,
                  'opacity-100 w-auto': !isCollapsed || isMobile,
                })}
              >
                {el.title}
              </span>
              </div>
            )}
          </NavLink>
          {/* Tooltip for collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E1E1E] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#2A2A2A]">
              {el.title}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={el.title} className="relative group/tooltip">
        <div 
          className={cn('px-3 py-[14px]', { 
            'py-3': isMobile 
          })}
        >
          <div className='group flex items-center gap-2 pl-2 text-[#B0B0B0] hover:text-white hover:border-l-[2px] hover:border-purple overflow-hidden'>
            <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>{el.icon}</div>
            <span
              className={cn('text-[15px] font-semibold whitespace-nowrap transition-all duration-300', {
                'opacity-0 w-0': isCollapsed && !isMobile,
                'opacity-100 w-auto': !isCollapsed || isMobile,
              })}
            >
              {el.title}
            </span>
          </div>
        </div>
        {/* Tooltip for collapsed state */}
        {isCollapsed && !isMobile && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1E1E1E] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-[#2A2A2A]">
            {el.title}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop версия - как раньше */}
      <div className='relative mt-8 ml-8 hidden lg:block'>
        <div className='flex flex-col gap-6'>
          <div
            className="sidebar-gradient-border relative h-fit rounded-[12px] p-[1px] w-fit"
          >
            <div className={cn('flex flex-col py-4 transition-all duration-300 custom-bg-blur rounded-[12px]', isCollapsed ? 'w-[72px]' : 'w-[222px]')}>
              <div className='absolute right-[-12px] top-[14px]'>
                <button
                  className='w-[26px] h-[26px] rounded-[12px] border border-[#181B22] custom-bg-blur hover:bg-[#1E1E1E] flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md z-20'
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  aria-label='Toggle compact menu'
                  aria-pressed={isCollapsed}
                >
                  <DoubleArrow className={cn('h-4 w-4 transition-transform duration-300', isCollapsed ? '' : 'rotate-180')} />
                </button>
              </div>

              <div className='flex flex-col gap-1'>
                {/* Show logo icon when not authenticated, Dashboard when authenticated */}
                {!isAuthenticated ? (
                  <>
                    <div className={cn('flex items-center justify-center py-4', {
                      'px-3': !isCollapsed,
                      'px-2': isCollapsed
                    })}>
                      <svg
                        className="w-[18px] h-[22px] shrink-0 transition-transform duration-300 hover:rotate-[6deg] hover:scale-110"
                        width="18"
                        height="23"
                        viewBox="0 0 18 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 11.4935L0.000836009 11.5607C1.99496 11.1253 3.99971 10.6706 6.00816 10.215L6.01186 21.0231L12.7689 22.5C12.7689 20.1266 12.7479 13.4405 12.77 11.0677L8.04193 10.0343L7.41266 9.89685C10.9481 9.0969 14.49 8.30751 18 7.62785L17.9988 0.5C12.0625 1.79714 5.95525 3.33041 0 4.43313L0 11.4935Z"
                          fill="url(#paint0_linear_sidebar)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_sidebar"
                            x1="4.37143"
                            y1="24.15"
                            x2="13.044"
                            y2="2.25457"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#A06AFF"/>
                            <stop offset="1" stopColor="#7F57FF"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div
                      className={cn('my-[14px] sidebar-divider-gradient mx-auto h-[2px] transition-all duration-300', {
                        'w-[190px]': !isCollapsed,
                        'w-[40px]': isCollapsed,
                      })}
                    />
                    {filteredNavElements.slice(0, 1).map((el) => renderElement(el, false))}
                    <div
                      className={cn('my-[14px] sidebar-divider-gradient mx-auto h-[2px] transition-all duration-300', {
                        'w-[190px]': !isCollapsed,
                        'w-[40px]': isCollapsed,
                      })}
                    />
                    {filteredNavElements.slice(1).map((el) => renderElement(el, false))}
                  </>
                ) : (
                  <>
                    {filteredNavElements.slice(0, 1).map((el) => renderElement(el, false))}
                    <div
                      className={cn('my-[14px] sidebar-divider-gradient mx-auto h-[2px] transition-all duration-300', {
                        'w-[190px]': !isCollapsed,
                        'w-[40px]': isCollapsed,
                      })}
                    />
                    {filteredNavElements.slice(1, 2).map((el) => renderElement(el, false))}
                    <div
                      className={cn('my-[14px] sidebar-divider-gradient mx-auto h-[2px] transition-all duration-300', {
                        'w-[190px]': !isCollapsed,
                        'w-[40px]': isCollapsed,
                      })}
                    />
                    {filteredNavElements.slice(2).map((el) => renderElement(el, false))}
                  </>
                )}
              </div>
            </div>
          </div>

          {isAuthenticated && (
            <div
              className={cn(
                'flex justify-center transition-all duration-300',
                isCollapsed ? 'w-[72px]' : 'w-[222px]'
              )}
            >
              <button
                type='button'
                onClick={() => setIsPostComposerOpen(true)}
                className={cn(
                  'relative flex items-center justify-center rounded-full bg-transparent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/60 focus-visible:ring-offset-0',
                  isCollapsed ? 'h-12 w-12' : 'h-12 w-full px-3'
                )}
                title="Open advanced Post composer"
              >
                <span className={cn('flex items-center gap-3 text-sm font-semibold text-white', isCollapsed ? 'justify-center' : 'justify-center')}>
                  <span className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.9)]'>
                    <QuillPen className='h-4 w-4' />
                  </span>
                  {!isCollapsed && <span>Tweet</span>}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile версия - overlay снизу */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40',
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out',
            isOpen ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className='sidebar-gradient-border-mobile p-[1px] rounded-t-[20px]'>
            <div className='custom-bg-blur rounded-t-[20px] px-4 pb-6 pt-4 max-h-[75vh] overflow-y-auto'>
              {/* Drag indicator */}
              <div className='flex justify-center mb-3'>
                <div className='w-12 h-1 bg-regaliaPurple rounded-full' />
              </div>

              {/* Navigation items */}
              <div className='flex flex-col gap-1'>
                {filteredNavElements.slice(0, 1).map((el) => renderElement(el, true))}
                <div className='my-3 sidebar-divider-gradient h-[2px]' />
                {filteredNavElements.slice(1).map((el) => renderElement(el, true))}
              </div>
            </div>
          </div>
        </div>
      </>

      <CreatePostModal isOpen={isPostComposerOpen} onClose={() => setIsPostComposerOpen(false)} />
    </>
  );
};

export default NewNavBar;
