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
      container: "bg-red-500/10 border-red-500/20 text-red-400",
      icon: "text-red-400",
    },
    warning: {
      container: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
      icon: "text-yellow-400",
    },
    info: {
      container: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      icon: "text-blue-400",
    },
  }[severity];

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 text-sm animate-in fade-in-50 slide-in-from-top-2 duration-200",
        styles.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", styles.icon)} />
      <span className="flex-1">{message}</span>
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
