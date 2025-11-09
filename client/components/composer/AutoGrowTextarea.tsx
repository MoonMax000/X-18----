/**
 * Auto-Growing Textarea Component
 * Автоматически изменяет высоту по мере ввода текста (как в Twitter)
 */

import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxRows?: number;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
};

/**
 * Textarea с автоматической регулировкой высоты
 * Растёт/сжимается по мере ввода, не ломая прокрутку
 * 
 * @example
 * ```tsx
 * <AutoGrowTextarea
 *   minRows={2}
 *   maxRows={12}
 *   textareaRef={myRef}
 *   value={text}
 *   onChange={(e) => setText(e.target.value)}
 *   placeholder="What's happening?"
 * />
 * ```
 */
export default function AutoGrowTextarea({
  minRows = 2,
  maxRows = 12,
  textareaRef,
  style,
  onChange,
  className = '',
  ...rest
}: Props) {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? innerRef;

  const resize = React.useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    
    // Сброс → измерение → ограничение по строкам
    ta.style.height = '0px';
    const border = ta.offsetHeight - ta.clientHeight;
    const lineHeight = parseFloat(
      window.getComputedStyle(ta).lineHeight || '20'
    );
    const contentH = ta.scrollHeight;
    const minH = minRows * lineHeight;
    const maxH = maxRows * lineHeight;
    const next = Math.max(minH, Math.min(contentH, maxH));
    ta.style.height = `${Math.ceil(next + border)}px`;
  }, [minRows, maxRows, ref]);

  // Инициируем и пересчитываем при value/resize
  React.useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    const ta = ref.current;
    if (ta) ro.observe(ta);
    return () => ro.disconnect();
  }, [resize, ref]);

  return (
    <textarea
      ref={ref}
      rows={minRows}
      onChange={(e) => {
        onChange?.(e);
        // defer, чтобы дождаться value в состоянии
        requestAnimationFrame(resize);
      }}
      style={{ ...style, overflowY: 'auto', resize: 'none' }}
      className={`
        w-full bg-transparent leading-relaxed
        placeholder:text-white/40 focus:outline-none
        break-words min-w-0
        ${className}
      `}
      {...rest}
    />
  );
}
