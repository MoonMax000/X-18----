/**
 * Централизованные токены стилей для Feed компонентов
 * Здесь собраны все цвета, градиенты, тени и размеры
 */

// ============ ЦВЕТА ============
export const COLORS = {
  // Основные цвета
  background: {
    primary: "#000000",
    secondary: "#0A0D12",
    tertiary: "#1B1F27",
    hover: "#1C1430",
  },
  
  // Текст
  text: {
    primary: "#FFFFFF",
    secondary: "#C5C9D3",
    muted: "#6C7280",
    disabled: "#9CA3AF",
  },
  
  // Акцен��ные цвета
  accent: {
    purple: {
      light: "#A06AFF",
      DEFAULT: "#7F57FF",
      dark: "#482090",
      darker: "#6B46C1",
    },
    blue: {
      light: "#4D7CFF",
      DEFAULT: "#1D9BF0",
      dark: "#0EA5E9",
    },
  },
  
  // Сентимент
  sentiment: {
    bullish: {
      light: "#2EBD85",
      DEFAULT: "#16C784",
      dark: "#1A6A4A",
    },
    bearish: {
      light: "#EF454A",
      DEFAULT: "#FF2626",
      dark: "#7F1414",
    },
    neutral: "#F3D42F",
  },
  
  // Границы
  border: {
    DEFAULT: "#181B22",
    widget: "var(--widget-border, #16C784)", // из tailwind.config.ts
    hover: "#A06AFF",
  },
} as const;

// ============ ГРАДИЕНТЫ ============
export const GRADIENTS = {
  primary: "bg-gradient-to-r from-[#A06AFF] to-[#482090]",
  primaryHover: "bg-gradient-to-r from-[#B17AFF] to-[#5820A0]",
  
  bullish: "bg-gradient-to-l from-[#2EBD85] to-[#1A6A4A]",
  bearish: "bg-gradient-to-l from-[#FF2626] to-[#7F1414]",
  
  hot: "bg-gradient-to-r from-[#FF6B35] to-[#F7931E]",
  recent: "bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9]",
  
  paid: "bg-gradient-to-l from-[#A06AFF] to-[#6B46C1]",
  
  codeBlock: "bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E]",
  codeHeader: "bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12]",
} as const;

// ============ ТЕНИ ============
export const SHADOWS = {
  widget: "shadow-[0_24px_48px_rgba(10,12,16,0.45)]",
  purple: "shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]",
  purpleHover: "shadow-[0_16px_40px_-12px_rgba(160,106,255,1)]",
  purpleButton: "shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]",
  glow: "shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]",
} as const;

// ============ РАДИУСЫ ============
export const RADIUS = {
  widget: {
    default: "rounded-[24px]",
    compact: "rounded-2xl",
  },
  button: {
    default: "rounded-full",
    card: "rounded-[14px]",
    input: "rounded-[24px]",
  },
  dropdown: "rounded-[18px]",
  codeBlock: "rounded-2xl",
} as const;

// ============ ОТСТУПЫ ============
export const SPACING = {
  widget: {
    default: "p-5",
    compact: "p-4",
  },
  dropdown: "p-3",
} as const;

// ============ BACKDROP ============
export const BACKDROP = {
  blur: "backdrop-blur-[20px]",
  blurXl: "backdrop-blur-xl",
  blurHeavy: "backdrop-blur-[100px]",
} as const;

// ============ TRANSITIONS ============
export const TRANSITIONS = {
  default: "transition-all duration-200",
  fast: "transition-all duration-150",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
} as const;

// ============ Z-INDEX ============
export const Z_INDEX = {
  sticky: "z-30",
  modal: "z-[2300]",
} as const;
