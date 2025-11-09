/**
 * IME-Aware Keyboard Shortcuts Hook
 * Горячие клавиши без конфликтов с IME (китайский, японский и т.д.)
 */

import { useEffect } from 'react';

type Handlers = {
  /** Ctrl/Cmd + Enter */
  onModEnter?: () => void;
  /** Ctrl/Cmd + B */
  onModB?: () => void;
  /** Esc */
  onEsc?: () => void;
};

type Options = {
  /** Включить/выключить хук */
  enabled?: boolean;
  /**
   * Слушать событие на конкретном DOM-элементе.
   * Если не указано — слушает window.
   */
  target?: HTMLElement | null;
};

/**
 * Горячие клавиши без конфликтов с IME:
 * - не срабатывает во время композиции (e.isComposing || keyCode 229)
 * - поддерживает Cmd (macOS) и Ctrl (Windows/Linux)
 * 
 * @example
 * ```tsx
 * useIMEAwareHotkeys({
 *   onModEnter: () => handlePost(),
 *   onModB: () => handleBoldToggle(),
 *   onEsc: () => onClose(),
 * }, { enabled: isOpen })
 * ```
 */
export function useIMEAwareHotkeys(handlers: Handlers, opts: Options = {}) {
  const { enabled = true, target } = opts;

  useEffect(() => {
    if (!enabled) return;

    const el: any = target ?? window;

    const onKeyDown = (e: KeyboardEvent) => {
      // Игнорируем ввод IME
      // @ts-ignore
      if ((e as any).isComposing || (e as any).keyCode === 229) return;

      const mod = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + Enter
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        handlers.onModEnter?.();
        return;
      }

      // Ctrl/Cmd + B
      if (mod && (e.key.toLowerCase?.() === 'b' || e.code === 'KeyB')) {
        e.preventDefault();
        handlers.onModB?.();
        return;
      }

      // Esc (без модификаторов)
      if (!mod && e.key === 'Escape') {
        handlers.onEsc?.();
        return;
      }
    };

    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [enabled, target, handlers]);
}
