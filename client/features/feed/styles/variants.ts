/**
 * Варианты стилей для переиспользуемых компонентов
 * Используйте эти классы вместо дублирования
 */

import { COLORS, GRADIENTS, SHADOWS, RADIUS, SPACING, BACKDROP, TRANSITIONS } from "./tokens";

// ============ КНОПКИ ============
export const BUTTON_VARIANTS = {
  // Primary кнопки (фиолетовые)
  primary: "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200",

  primaryDisabled: "rounded-full cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]",
  
  // Outline кнопки
  outline: `${RADIUS.button.default} border border-[#A06AFF]/40 bg-transparent text-[#A06AFF] hover:bg-[#1C1430] ${TRANSITIONS.colors}`,
  
  // Ghost кнопки
  ghost: "text-[#6C7280] hover:text-[#A06AFF] transition-colors",
  
  // Follow/Following кнопки
  follow: `${RADIUS.button.default} px-3 py-1 text-xs font-semibold ${GRADIENTS.primary} text-white hover:${GRADIENTS.primaryHover} ${TRANSITIONS.colors}`,
  
  following: `${RADIUS.button.default} px-3 py-1 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 ${TRANSITIONS.colors}`,
  
  // Sentiment toggles
  bullish: (active: boolean) => 
    `flex h-6 items-center gap-1 ${RADIUS.button.default} px-2 ${TRANSITIONS.default} ${
      active ? GRADIENTS.bullish + " text-white" : "bg-transparent text-white"
    }`,
  
  bearish: (active: boolean) => 
    `flex h-6 items-center gap-1 ${RADIUS.button.default} px-2 ${TRANSITIONS.default} ${
      active ? GRADIENTS.bearish + " text-white" : "bg-transparent text-white"
    }`,
  
  // Paid toggle
  paid: (active: boolean) => 
    `ml-2 flex h-6 items-center gap-1 ${RADIUS.button.default} px-2 ${TRANSITIONS.default} ${
      active ? GRADIENTS.paid + " text-white" : "bg-transparent border border-[#A06AFF]/40 text-[#A06AFF]"
    }`,
} as const;

// ============ КАРТОЧКИ ============
export const CARD_VARIANTS = {
  // Виджеты
  widget: {
    default: `${RADIUS.widget.default} border border-widget-border bg-[#000000] ${SPACING.widget.default} ${SHADOWS.widget} ${BACKDROP.blur}`,
    compact: `${RADIUS.widget.compact} border border-widget-border bg-[#000000] ${SPACING.widget.compact}`,
  },
  
  // Composer
  composer: `${RADIUS.widget.compact} border border-widget-border bg-[#000000] p-4`,
  
  // Dropdown меню
  dropdown: `${RADIUS.dropdown} border border-widget-border/70 bg-[#0F131A]/95 ${SPACING.dropdown} text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] ${BACKDROP.blurXl}`,
  
  // Modal overlay
  modal: `fixed ${Z_INDEX.modal} ${RADIUS.dropdown} border border-[#181B22] bg-black shadow-2xl ${BACKDROP.blurHeavy}`,
} as const;

// ============ ТАБЫ ============
export const TAB_VARIANTS = {
  container: `mb-3 flex items-center overflow-x-auto ${RADIUS.button.default} border border-[#181B22] bg-[#000000] p-0.5`,
  
  item: (isActive: boolean, isAll: boolean = false) => 
    `${isAll ? "flex-none min-w-[60px]" : "flex-1 min-w-[120px]"} px-3 py-1 text-xs sm:text-sm font-semibold ${RADIUS.button.default} ${TRANSITIONS.default} ${
      isActive
        ? `${GRADIENTS.primary} text-white`
        : "text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20"
    }`,
} as const;

// ============ ФИЛЬТРЫ ============
export const FILTER_VARIANTS = {
  label: "text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]",
  
  trigger: `inline-flex h-[26px] items-center gap-2 ${RADIUS.button.input} border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] ${TRANSITIONS.colors} hover:border-[#A06AFF]/50 hover:bg-[#1C1430]`,
  
  option: (isActive: boolean) => 
    `flex items-center gap-2 ${RADIUS.button.card} border px-3 py-1.5 text-left font-medium ${TRANSITIONS.colors} ${
      isActive
        ? "border-[#A06AFF]/70 bg-[#1C1430] text-white " + SHADOWS.glow
        : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
    }`,
  
  toggle: (isActive: boolean, variant: "hot" | "recent") => 
    `flex items-center gap-1.5 ${RADIUS.button.default} px-3 py-1 text-xs font-semibold ${TRANSITIONS.default} ${
      isActive
        ? variant === "hot" 
          ? GRADIENTS.hot + " text-white shadow-lg"
          : GRADIENTS.recent + " text-white shadow-lg"
        : "text-[#9CA3AF] hover:text-white"
    }`,
} as const;

// ============ INPUTS ============
export const INPUT_VARIANTS = {
  textarea: "!min-h-[80px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0",
  
  fileInput: "hidden",
} as const;

// ============ CODE BLOCKS ============
export const CODE_BLOCK_VARIANTS = {
  container: `relative group ${RADIUS.codeBlock} ${GRADIENTS.codeBlock} border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 ${TRANSITIONS.default}`,
  
  header: `flex items-center justify-between gap-2 px-4 py-3 ${GRADIENTS.codeHeader} border-b border-[#6B46C1]/20`,
  
  language: "text-xs font-bold text-[#B299CC] uppercase tracking-wider",
  
  removeButton: "p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]",
  
  content: "px-4 py-3 text-xs text-[#D4B5FD] overflow-x-auto max-h-40 font-mono bg-[#05030A]",
} as const;

// ============ REPLY MENU ============
export const REPLY_MENU_VARIANTS = {
  button: "inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10",
  
  option: (isActive: boolean) => 
    `flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs ${isActive ? "ring-1 ring-[#1D9BF0]" : ""}`,
} as const;

// ============ WIDGET СПЕЦИФИЧНЫЕ ============
export const WIDGET_VARIANTS = {
  header: "text-lg font-bold text-white",
  subtitle: "text-xs text-[#6C7280]",
  showMore: "mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white",
  
  ticker: (isSelected: boolean) => 
    `flex w-full items-center justify-between rounded-lg p-2 transition ${
      isSelected ? "bg-blue-500/20" : "hover:bg-[#1B1F27]"
    }`,
} as const;
