import { FC } from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ValidationSeverity = "error" | "warning" | "info";

interface ValidationMessageProps {
  message: string;
  severity?: ValidationSeverity;
  className?: string;
}

/**
 * Компонент для отображения сообщений валидации
 * - Поддерживает разные уровни severity
 * - Иконки и цвета в зависимости от типа
 * - Анимация появления
 */
export const ValidationMessage: FC<ValidationMessageProps> = ({
  message,
  severity = "error",
  className,
}) => {
  const Icon = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[severity];

  const styles = {
    error: {
      container: "bg-red-500/5 text-red-300/90",
      icon: "text-red-500",
    },
    warning: {
      container: "border-l-2 border-l-yellow-400/60 bg-yellow-500/5 text-yellow-300/90",
      icon: "text-yellow-400/80",
    },
    info: {
      container: "border-l-2 border-l-blue-400/60 bg-blue-500/5 text-blue-300/90",
      icon: "text-blue-400/80",
    },
  }[severity];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md pl-2.5 pr-3 py-2 text-xs animate-in fade-in-50 slide-in-from-top-1 duration-150",
        styles.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", styles.icon)} />
      <span className="flex-1 leading-snug">{message}</span>
    </div>
  );
};

/**
 * Контейнер для множественных сообщений валидации
 */
interface ValidationMessagesProps {
  violations: string[];
  severity?: ValidationSeverity;
  className?: string;
}

export const ValidationMessages: FC<ValidationMessagesProps> = ({
  violations,
  severity = "error",
  className,
}) => {
  if (violations.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {violations.map((violation, index) => (
        <ValidationMessage
          key={index}
          message={violation}
          severity={severity}
        />
      ))}
    </div>
  );
};

export default ValidationMessage;
