import { FC, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  charCount: number;
  charLimit: number;
  className?: string;
}

/**
 * Компонент визуализации лимита символов
 * - Круговой прогресс-бар как в Twitter
 * - Меняет цвет при приближении к лимиту
 * - Показывает оставшиеся символы при превышении
 */
export const CharacterCounter: FC<CharacterCounterProps> = ({
  charCount,
  charLimit,
  className,
}) => {
  const ratio = charCount / charLimit;
  const remaining = charLimit - charCount;
  const isNearLimit = remaining < 20 && remaining >= 0;
  const isOverLimit = remaining < 0;

  // Цвет круга в зависимости от заполненности
  const circleColor = useMemo(() => {
    if (isOverLimit) return "#F4212E"; // Красный - превышен лимит
    if (isNearLimit) return "#FFD400"; // Желтый - близко к лимиту
    return "#1D9BF0"; // Синий - нормальное состояние
  }, [isOverLimit, isNearLimit]);

  // Размеры SVG круга
  const radius = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(ratio, 1));

  // Показываем счетчик только когда:
  // 1. Близко к лимиту (< 20 символов осталось)
  // 2. Превышен лимит
  const showCounter = isNearLimit || isOverLimit;

  // Если не нужно показывать - возвращаем null
  if (charCount === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Круговой прогресс */}
      <div className="relative flex items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="transform -rotate-90"
        >
          {/* Фоновый круг */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke="rgba(239, 243, 244, 0.2)"
            strokeWidth="2"
          />
          {/* Прогресс круг */}
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke={circleColor}
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-200 ease-out"
          />
        </svg>
      </div>

      {/* Текстовый счетчик (показываем только когда близко к лимиту или превышен) */}
      {showCounter && (
        <span
          className={cn(
            "text-xs font-medium tabular-nums transition-colors",
            isOverLimit
              ? "text-[#F4212E]"
              : isNearLimit
                ? "text-[#FFD400]"
                : "text-[#71767B]"
          )}
        >
          {isOverLimit ? remaining : remaining}
        </span>
      )}
    </div>
  );
};

export default CharacterCounter;
