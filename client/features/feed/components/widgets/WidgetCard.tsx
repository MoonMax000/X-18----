import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CARD_VARIANTS, WIDGET_VARIANTS } from "../../styles";

interface WidgetCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "compact";
}

export default function WidgetCard({ children, className, variant = "default" }: WidgetCardProps) {
  return (
    <div className={cn(CARD_VARIANTS.widget[variant], className)}>
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
        <h3 className={WIDGET_VARIANTS.header}>{title}</h3>
        {subtitle && <span className={WIDGET_VARIANTS.subtitle}>{subtitle}</span>}
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
    <button type="button" onClick={onClick} className={cn(WIDGET_VARIANTS.showMore, className)}>
      {label}
    </button>
  );
}
