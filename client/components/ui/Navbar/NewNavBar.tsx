import { FC, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutVariant } from '../AppBackground/AppBackground';
import { cn } from '@/lib/utils';
import { navElements, NavElementProps } from './constants';
import { ChevronDown, DoubleArrow, QuillPen } from './icons';
import CreatePostModal from '@/components/CreatePostBox/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  variant?: LayoutVariant;
  isOpen?: boolean;
  onClose?: () => void;
}

const NewNavBar: FC<Props> = ({ variant = 'primal', isOpen = false, onClose }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);

  const toggleGroup = (title: string) => setOpenGroup(openGroup === title ? null : title);

  // Auto-open group if current page is in its children
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    for (const el of navElements) {
      if (el.children && el.children.length > 0) {
        const hasActiveChild = el.children.some(child => {
          if (!child.route) return false;
          // Check both exact match and pathname-only match
          return child.route === currentPath || child.route === location.pathname;
        });
        if (hasActiveChild) {
          setOpenGroup(el.title);
          break;
        }
      }
    }
  }, [location.pathname, location.search]);

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
        <div key={el.title}>
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
                'ml-[5px]': isCollapsed && !isMobile,
              })}
              data-active={isGroupOpen ? 'true' : undefined}
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
          {isGroupOpen && (
            <div id={`${el.title}-submenu`} className={cn('flex flex-col gap-1', isCollapsed && !isMobile ? 'ml-0 items-center' : 'ml-6')}>
              {el.children.map((child) => (
                <NavLink
                  key={child.title}
                  to={child.route ?? '#'}
                  className={cn(isCollapsed && !isMobile ? 'px-0' : 'px-3')}
                  onClick={handleNavClick}
                  title={isCollapsed && !isMobile ? child.title : undefined}
                >
                  {({ isActive }) => (
                    <div
                      className={cn('group flex items-center gap-2 py-2 hover:custom-bg-blur hover:text-white overflow-hidden',
                        isActive ? 'text-white' : 'text-[#B0B0B0]',
                        isCollapsed && !isMobile ? 'justify-center' : 'pl-2 hover:border-l-[2px] hover:border-purple'
                      )}
                      data-active={isActive ? 'true' : undefined}
                    >
                      <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center'>{child.icon}</div>
                      {(!isCollapsed || isMobile) && (
                        <span className='text-[15px] font-semibold whitespace-nowrap'>
                          {child.title}
                        </span>
                      )}
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
      const currentFullPath = location.pathname + location.search;
      const isActiveRoute = el.route === currentFullPath || el.route === location.pathname;

      return (
        <NavLink
          key={el.title}
          to={el.route}
          className={cn('px-3 py-[14px]', {
            'ml-[5px]': isCollapsed && !isMobile,
            'py-3': isMobile
          })}
          onClick={handleNavClick}
        >
          {({ isActive }) => {
            const active = isActiveRoute || isActive;
            return (
              <div
                className={cn('group flex items-center gap-2 pl-2 transition hover:text-white hover:border-l-[2px] hover:border-purple overflow-hidden', active ? 'text-white' : 'text-[#B0B0B0]')}
                data-active={active ? 'true' : undefined}
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
            );
          }}
        </NavLink>
      );
    }

    return (
      <div 
        key={el.title} 
        className={cn('px-3 py-[14px]', { 
          'ml-[5px]': isCollapsed && !isMobile,
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
                {isAuthenticated && navElements.slice(0, 1).map((el) => renderElement(el, false))}
                {isAuthenticated && (
                  <div
                    className={cn('my-[14px] sidebar-divider-gradient mx-auto h-[2px] transition-all duration-300', {
                      'w-[190px]': !isCollapsed,
                      'w-[40px]': isCollapsed,
                    })}
                  />
                )}
                {navElements.slice(1).map((el) => renderElement(el, false))}
              </div>
            </div>
          </div>

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
                {isAuthenticated && navElements.slice(0, 1).map((el) => renderElement(el, true))}
                {isAuthenticated && <div className='my-3 sidebar-divider-gradient h-[2px]' />}
                {navElements.slice(1).map((el) => renderElement(el, true))}
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
