import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact";
}

export default function WidgetCard({ children, className, variant = "default" }: WidgetCardProps) {
  return (
    <div
      className={cn(
        "border bg-[#000000]",
        variant === "default" && "rounded-[24px] border-widget-border p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]",
        variant === "compact" && "rounded-2xl border-widget-border p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface WidgetHeaderProps {
  title: string | ReactNode;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function WidgetHeader({ title, icon, subtitle, className }: WidgetHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon}
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <span className="text-xs text-[#6C7280]">{subtitle}</span>}
      </div>
    </div>
  );
}

interface WidgetShowMoreProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function WidgetShowMore({ label = "Show more", onClick, className }: WidgetShowMoreProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white",
        className
      )}
    >
      {label}
    </button>
  );
}
