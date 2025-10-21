/**
 * Варианты стилей для переиспользуемых компонентов
 * Используйте эти классы вместо дублирования
 */

// ============ КНОПКИ ============
export const BUTTON_VARIANTS = {
  // Primary кнопки (фиолетовые)
  primary: "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200",
  
  primaryDisabled: "rounded-full cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]",
  
  // Outline кнопки
  outline: "rounded-full border border-[#A06AFF]/40 bg-transparent text-[#A06AFF] hover:bg-[#1C1430] transition-colors duration-200",
  
  // Ghost кнопки
  ghost: "text-[#6C7280] hover:text-[#A06AFF] transition-colors",
  
  // Follow/Following кнопки
  follow: "rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:from-[#B17AFF] hover:to-[#5820A0] transition-colors duration-200",
  
  following: "rounded-full px-3 py-1 text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors duration-200",
  
  // Sentiment toggles
  bullish: (active: boolean) => 
    active 
      ? "flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-gradient-to-l from-[#2EBD85] to-[#1A6A4A] text-white" 
      : "flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-transparent text-white",
  
  bearish: (active: boolean) => 
    active 
      ? "flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-gradient-to-l from-[#FF2626] to-[#7F1414] text-white" 
      : "flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-transparent text-white",
  
  // Paid toggle
  paid: (active: boolean) => 
    active 
      ? "ml-2 flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-gradient-to-l from-[#A06AFF] to-[#6B46C1] text-white" 
      : "ml-2 flex h-6 items-center gap-1 rounded-full px-2 transition-all duration-200 bg-transparent border border-[#A06AFF]/40 text-[#A06AFF]",
} as const;

// ============ КАРТОЧКИ ============
export const CARD_VARIANTS = {
  // Виджеты
  widget: {
    default: "rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]",
    compact: "rounded-2xl border border-widget-border bg-[#000000] p-4",
  },
  
  // Composer
  composer: "rounded-2xl border border-widget-border bg-[#000000] p-4",
  
  // Dropdown меню
  dropdown: "rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl",
  
  // Modal overlay
  modal: "fixed z-[2300] rounded-[18px] border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px]",
} as const;

// ============ ТАБЫ ============
export const TAB_VARIANTS = {
  container: "mb-3 flex items-center overflow-x-auto rounded-full border border-widget-border bg-[#000000] p-0.5",
  
  item: (isActive: boolean, isAll: boolean = false) => {
    const base = isAll ? "flex-none min-w-[56px]" : "flex-none min-w-[90px]";
    const styles = "px-2.5 py-1 text-xs font-semibold rounded-full transition-all duration-200 whitespace-nowrap";
    const activeStyles = isActive
      ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
      : "text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20";
    return `${base} ${styles} ${activeStyles}`;
  },
} as const;

// ============ ФИЛЬТРЫ ============
export const FILTER_VARIANTS = {
  label: "text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]",
  
  trigger: "inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors duration-200 hover:border-[#A06AFF]/50 hover:bg-[#1C1430]",
  
  option: (isActive: boolean) => 
    isActive
      ? "flex items-center gap-2 rounded-[14px] border border-[#A06AFF]/70 bg-[#1C1430] text-white px-3 py-1.5 text-left font-medium transition-colors duration-200 shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
      : "flex items-center gap-2 rounded-[14px] border border-transparent bg-white/5 text-[#C4C7D4] px-3 py-1.5 text-left font-medium transition-colors duration-200 hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
  
  toggle: (isActive: boolean, variant: "hot" | "recent") => {
    const base = "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200";
    if (!isActive) return `${base} text-[#9CA3AF] hover:text-white`;
    
    const activeStyles = variant === "hot" 
      ? "bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg"
      : "bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] text-white shadow-lg";
    return `${base} ${activeStyles}`;
  },
} as const;

// ============ INPUTS ============
export const INPUT_VARIANTS = {
  textarea: "!min-h-[80px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0",
  
  fileInput: "hidden",
} as const;

// ============ CODE BLOCKS ============
export const CODE_BLOCK_VARIANTS = {
  container: "relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all duration-200",
  
  header: "flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20",
  
  language: "text-xs font-bold text-[#B299CC] uppercase tracking-wider",
  
  removeButton: "p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]",
  
  content: "px-4 py-3 text-xs text-[#D4B5FD] overflow-x-auto max-h-40 font-mono bg-[#05030A]",
} as const;

// ============ REPLY MENU ============
export const REPLY_MENU_VARIANTS = {
  button: "inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10",
  
  option: (isActive: boolean) => 
    isActive
      ? "flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs ring-1 ring-[#1D9BF0]"
      : "flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs",
} as const;

// ============ WIDGET СПЕЦИФИЧНЫЕ ============
export const WIDGET_VARIANTS = {
  header: "text-lg font-bold text-white",
  subtitle: "text-xs text-[#6C7280]",
  showMore: "mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white",
  
  ticker: (isSelected: boolean) => 
    isSelected
      ? "flex w-full items-center justify-between rounded-lg p-2 transition bg-blue-500/20"
      : "flex w-full items-center justify-between rounded-lg p-2 transition hover:bg-[#1B1F27]",
} as const;
