/**
 * Centralized widget styling configuration
 * All widget border colors, backgrounds, and common styles are defined here
 */

export const WIDGET_STYLES = {
  // Border colors
  border: {
    primary: 'rgba(24,27,34,0.95)', // Main widget borders
    secondary: '#2F3240', // Hover state borders
    accent: '#A06AFF', // Active/focus state
  },

  // Background colors
  background: {
    card: 'rgba(12,16,20,0.50)', // Main card background
    cardAlt: 'rgba(12,16,20,0.55)', // Alternative card background
    cardLight: 'rgba(12,16,20,0.40)', // Lighter card background
    cardDark: 'rgba(12,16,20,0.65)', // Darker card background
    hover: 'rgba(18,22,28,0.8)', // Hover state background
    black: '#0B0E13', // Pure black for certain elements
  },

  // Gradient presets
  gradient: {
    primary: 'from-[#A06AFF] to-[#482090]',
    primaryReverse: 'from-[#482090] to-[#A06AFF]',
  },

  // Shadow presets
  shadow: {
    card: '0_24px_60px_-35px_rgba(0,0,0,0.65)',
    button: '0_8px_20px_-8px_rgba(160,106,255,0.7)',
    buttonHover: '0_12px_30px_-18px_rgba(160,106,255,0.8)',
  },
} as const;

/**
 * Common Tailwind class combinations for widgets
 */
export const WIDGET_CLASSES = {
  // Card/Widget containers
  card: `rounded-3xl border border-[${WIDGET_STYLES.border.primary}] bg-[${WIDGET_STYLES.background.card}] backdrop-blur-[50px]`,
  cardSmall: `rounded-2xl border border-[${WIDGET_STYLES.border.primary}] bg-[${WIDGET_STYLES.background.cardAlt}] backdrop-blur-[50px]`,
  
  // Tab buttons (inactive state)
  tabInactive: `border border-[${WIDGET_STYLES.border.primary}] bg-[${WIDGET_STYLES.background.card}] text-white/80 hover:border-[${WIDGET_STYLES.border.secondary}] hover:bg-[${WIDGET_STYLES.background.hover}]`,
  
  // Tab buttons (active state)
  tabActive: `bg-gradient-to-r ${WIDGET_STYLES.gradient.primary} text-white shadow-[${WIDGET_STYLES.shadow.button}]`,

  // Border dividers
  divider: `border-[${WIDGET_STYLES.border.primary}]`,
} as const;

/**
 * Helper function to get widget border class
 */
export const getWidgetBorder = (opacity: number = 0.95) => {
  return `border-[rgba(24,27,34,${opacity})]`;
};

/**
 * Helper function to get widget background class
 */
export const getWidgetBackground = (opacity: number = 0.50) => {
  return `bg-[rgba(12,16,20,${opacity})]`;
};

/**
 * Preset combinations for common widget types
 */
export const WIDGET_PRESETS = {
  standard: {
    container: 'flex w-full flex-col items-center gap-6 self-stretch rounded-3xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]',
    header: 'flex items-baseline self-stretch pb-2',
    title: 'flex-1 text-2xl font-bold leading-normal text-white',
  },
  compact: {
    container: 'flex items-center gap-2 rounded-2xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.55)] px-3 py-2.5 backdrop-blur-[50px] md:px-4 md:py-3',
  },
  empty: {
    container: 'flex flex-col items-center justify-center gap-3 rounded-3xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.40)] p-6 text-center backdrop-blur-[50px]',
  },
} as const;
