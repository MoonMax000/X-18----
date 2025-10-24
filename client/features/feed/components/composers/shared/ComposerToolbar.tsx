import React from "react";
import { cn } from "@/lib/utils";

export interface ComposerToolbarProps {
  onMediaClick: () => void;
  onDocumentClick: () => void;
  onVideoClick: () => void;
  onCodeBlockClick: () => void;
  onEmojiClick: () => void;
  onBoldClick: () => void;
  isBoldActive: boolean;
  sentiment: "bullish" | "bearish" | null;
  onSentimentChange: (sentiment: "bullish" | "bearish" | null) => void;
  isPaid: boolean;
  onPaidChange: (isPaid: boolean) => void;
}

export function ComposerToolbar({
  onMediaClick,
  onDocumentClick,
  onVideoClick,
  onCodeBlockClick,
  onEmojiClick,
  onBoldClick,
  isBoldActive,
  sentiment,
  onSentimentChange,
  isPaid,
  onPaidChange,
}: ComposerToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Media Buttons */}
      <button 
        type="button" 
        onClick={onMediaClick} 
        className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" 
        title="Add photos or images"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6.25 7.5C6.94036 7.5 7.5 6.94036 7.5 6.25C7.5 5.55964 6.94036 5 6.25 5C5.55964 5 5 5.55964 5 6.25C5 6.94036 5.55964 7.5 6.25 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.08301 10C2.08301 6.26809 2.08301 4.40212 3.24237 3.24274C4.40175 2.08337 6.26772 2.08337 9.99967 2.08337C13.7316 2.08337 15.5976 2.08337 16.757 3.24274C17.9163 4.40212 17.9163 6.26809 17.9163 10C17.9163 13.732 17.9163 15.598 16.757 16.7574C15.5976 17.9167 13.7316 17.9167 9.99967 17.9167C6.26772 17.9167 4.40175 17.9167 3.24237 16.7574C2.08301 15.598 2.08301 13.732 2.08301 10Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4.16699 17.5C7.81071 13.1458 11.8954 7.40334 17.9149 11.2853" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button 
        type="button" 
        onClick={onDocumentClick} 
        className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" 
        title="Add documents (PDF, DOCX, PPTX, etc.)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M14.5 5H12.5C9.67157 5 8.25736 5 7.37868 5.87868C6.5 6.75736 6.5 8.17157 6.5 11V16C6.5 18.8284 6.5 20.2426 7.37868 21.1213C8.25736 22 9.67157 22 12.5 22H13.8431C14.6606 22 15.0694 22 15.4369 21.8478C15.8045 21.6955 16.0935 21.4065 16.6716 20.8284L19.3284 18.1716C19.9065 17.5935 20.1955 17.3045 20.3478 16.9369C20.5 16.5694 20.5 16.1606 20.5 15.3431V11C20.5 8.17157 20.5 6.75736 19.6213 5.87868C18.7426 5 17.3284 5 14.5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 21.5V20.5C15 18.6144 15 17.6716 15.5858 17.0858C16.1716 16.5 17.1144 16.5 19 16.5H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 19C4.84315 19 3.5 17.6569 3.5 16V8C3.5 5.17157 3.5 3.75736 4.37868 2.87868C5.25736 2 6.67157 2 9.5 2H14.5004C16.1572 2.00001 17.5004 3.34319 17.5004 5.00003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.0011 13H14.0011M10.0011 9H17.0011" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button 
        type="button" 
        onClick={onVideoClick} 
        className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" 
        title="Add videos (MP4, WebM, MOV, etc.)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button 
        type="button" 
        onClick={onCodeBlockClick} 
        className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]"
        title="Add code block"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

      <button 
        type="button" 
        onClick={onEmojiClick} 
        className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF] relative"
        title="Add emoji"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z" fill="currentColor" />
        </svg>
      </button>

      <button 
        type="button" 
        onClick={onBoldClick} 
        className={cn(
          "flex h-8 items-center justify-center gap-1.5 transition-colors", 
          isBoldActive ? "text-[#A06AFF]" : "text-[#6C7280] hover:text-[#A06AFF]"
        )} 
        aria-label="Bold"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15.636 11.671c2.079-.583 3.093-2.18 3.093-3.929 0-2.307-1.471-4.741-5.983-4.741H5.623V21h7.579c4.411 0 6.008-2.484 6.008-4.994 0-2.383-1.343-3.955-3.574-4.335zm-3.295-6.287c2.535 0 3.27 1.319 3.27 2.662 0 1.242-.583 2.611-3.27 2.611H8.69V5.384h3.651zM8.69 18.617v-5.628h4.208c2.231 0 3.194 1.166 3.194 2.738 0 1.547-.887 2.89-3.397 2.89H8.69z" fill="currentColor" />
        </svg>
      </button>

      <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

      {/* Sentiment Buttons */}
      <div className="inline-flex items-center gap-2">
        <button 
          type="button" 
          onClick={() => onSentimentChange(sentiment === "bullish" ? null : "bullish")} 
          className={cn(
            "flex h-6 items-center gap-1 rounded-full px-2 transition-all", 
            sentiment === "bullish" 
              ? "bg-gradient-to-l from-[#2EBD85] to-[#1A6A4A]" 
              : "bg-transparent"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3333 8.66665V5.33331H10" stroke={sentiment === "bullish" ? "white" : "#2EBD85"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.3337 5.33331L10.0003 8.66665C9.41193 9.25505 9.11779 9.54918 8.75673 9.58171C8.69699 9.58711 8.63699 9.58711 8.57726 9.58171C8.21619 9.54918 7.92206 9.25505 7.33366 8.66665C6.74526 8.07825 6.45109 7.78411 6.09004 7.75158C6.03035 7.74618 5.9703 7.74618 5.91061 7.75158C5.54956 7.78411 5.25537 8.07825 4.66699 8.66665L2.66699 10.6666" stroke={sentiment === "bullish" ? "white" : "#2EBD85"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={cn("text-xs font-bold", sentiment === "bullish" ? "text-white" : "text-white")}>Bullish</span>
        </button>

        <div className="h-5 w-px bg-white" />

        <button 
          type="button" 
          onClick={() => onSentimentChange(sentiment === "bearish" ? null : "bearish")} 
          className={cn(
            "flex h-6 items-center gap-1 rounded-full px-2 transition-all", 
            sentiment === "bearish" 
              ? "bg-gradient-to-l from-[#FF2626] to-[#7F1414]" 
              : "bg-transparent"
          )}
        >
          <span className={cn("text-xs font-bold", sentiment === "bearish" ? "text-white" : "text-white")}>Bearish</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.3333 7.33331V10.6666H10" stroke={sentiment === "bearish" ? "white" : "#EF454A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.3337 10.6666L10.0003 7.33331C9.41193 6.74491 9.11779 6.45075 8.75673 6.41823C8.69699 6.41285 8.63699 6.41285 8.57726 6.41823C8.21619 6.45075 7.92206 6.74491 7.33366 7.33331C6.74526 7.92171 6.45109 8.21585 6.09004 8.24838C6.03035 8.25378 5.9703 8.25378 5.91061 8.24838C5.54956 8.21585 5.25537 7.92171 4.66699 7.33331L2.66699 5.33331" stroke={sentiment === "bearish" ? "white" : "#EF454A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Paid Toggle */}
      <button 
        type="button" 
        onClick={() => onPaidChange(!isPaid)} 
        className={cn(
          "ml-2 flex h-6 items-center gap-1 rounded-full px-2 transition-all", 
          isPaid 
            ? "bg-gradient-to-l from-[#A06AFF] to-[#6B46C1]" 
            : "bg-transparent border border-[#A06AFF]/40"
        )}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={isPaid ? "white" : "#A06AFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={cn("text-xs font-bold", isPaid ? "text-white" : "text-[#A06AFF]")}>Paid</span>
      </button>
    </div>
  );
}
