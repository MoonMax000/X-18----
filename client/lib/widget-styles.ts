/**
 * Centralized widget styling configuration
 * All widget border colors, backgrounds, and common styles are defined here
 * 
 * Usage:
 * import { WIDGET_PRESETS, WIDGET_CLASSES } from '@/lib/widget-styles';
 * 
 * <div className={WIDGET_PRESETS.standard.container}>...</div>
 */

/**
 * Common Tailwind class combinations for widgets
 */
export const WIDGET_CLASSES = {
  // Card/Widget containers
  card: 'rounded-3xl border border-widget-border bg-widget-bg backdrop-blur-[50px]',
  cardSmall: 'rounded-2xl border border-widget-border bg-widget-bg-alt backdrop-blur-[50px]',
  
  // Tab buttons (inactive state)
  tabInactive: 'border border-widget-border bg-widget-bg text-white/80 hover:border-widget-border-hover hover:bg-widget-bg-hover',
  
  // Tab buttons (active state)  
  tabActive: 'bg-gradient-to-r from-primary to-tyrian-dark text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]',

  // Border dividers
  divider: 'border-widget-border',
  
  // Action buttons
  buttonPrimary: 'bg-gradient-to-r from-primary to-tyrian-dark text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]',
  buttonSecondary: 'border border-widget-border bg-transparent text-white hover:bg-widget-bg-hover',
} as const;

/**
 * Preset combinations for common widget types
 * These are complete className strings ready to use
 */
export const WIDGET_PRESETS = {
  // Standard widget (like ActivityCard, ProductsCard, PortfolioCard)
  standard: {
    container: 'flex w-full flex-col items-center gap-6 self-stretch rounded-3xl border border-widget-border bg-widget-bg p-4 backdrop-blur-[50px]',
    header: 'flex items-baseline self-stretch pb-2',
    title: 'flex-1 text-2xl font-bold leading-normal text-white',
  },
  
  // Compact widget (like UserInfoCards items)
  compact: {
    container: 'flex items-center gap-2 rounded-2xl border border-widget-border bg-widget-bg-alt px-3 py-2.5 backdrop-blur-[50px] md:px-4 md:py-3',
    containerVertical: 'rounded-2xl border border-widget-border bg-widget-bg-alt px-3 py-3 backdrop-blur-[50px] md:px-4 md:py-4',
  },
  
  // Empty state widget
  empty: {
    container: 'flex flex-col items-center justify-center gap-3 rounded-3xl border border-widget-border bg-widget-bg-light p-6 text-center backdrop-blur-[50px]',
    title: 'text-lg font-bold text-white',
    description: 'text-sm text-[#B0B0B0]',
  },

  // Post/Article card
  post: {
    container: 'mx-auto flex w-full max-w-full flex-col gap-3 rounded-3xl border border-widget-border bg-background p-5 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.65)] backdrop-blur-[32px] transition-colors duration-200 hover:border-primary/60',
    divider: 'border-t border-widget-border pt-3',
  },

  // Tab navigation
  tab: {
    container: 'flex flex-wrap items-center gap-1 sm:gap-1',
    button: 'group flex items-center justify-center gap-2 rounded-[32px] px-2.5 py-3 text-[15px] font-bold transition backdrop-blur-[58px]',
    buttonActive: 'bg-gradient-to-r from-primary to-tyrian-dark text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]',
    buttonInactive: 'border border-widget-border bg-widget-bg text-[#B0B0B0] hover:border-widget-border-hover hover:bg-widget-bg-hover hover:text-white',
  },

  // Pagination controls
  pagination: {
    control: 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border border-widget-border bg-widget-bg p-2.5 backdrop-blur-[50px] transition hover:border-widget-border-hover hover:bg-widget-bg-hover disabled:cursor-not-allowed disabled:opacity-40',
    pageButton: 'flex h-11 w-11 items-center justify-center rounded p-2 text-[15px] font-bold transition',
    pageActive: 'bg-gradient-to-r from-primary to-tyrian-dark text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]',
    pageInactive: 'border border-widget-border bg-widget-bg text-[#B0B0B0] backdrop-blur-[50px] hover:border-widget-border-hover hover:bg-widget-bg-hover hover:text-white',
  },
} as const;

/**
 * Helper functions for dynamic opacity values
 */
export const getWidgetBorderClass = (opacity: number = 0.95) => {
  return `border-[rgba(24,27,34,${opacity})]`;
};

export const getWidgetBgClass = (opacity: number = 0.50) => {
  return `bg-[rgba(12,16,20,${opacity})]`;
};

/**
 * Color values for direct use
 */
export const WIDGET_COLORS = {
  border: {
    primary: 'rgba(24,27,34,0.95)',
    hover: '#2F3240',
    accent: '#A06AFF',
  },
  background: {
    card: 'rgba(12,16,20,0.50)',
    cardAlt: 'rgba(12,16,20,0.55)',
    cardLight: 'rgba(12,16,20,0.40)',
    cardDark: 'rgba(12,16,20,0.65)',
    hover: 'rgba(18,22,28,0.8)',
  },
} as const;
