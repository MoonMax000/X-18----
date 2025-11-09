/**
 * Composer Text Utilities
 * Корректная работа с текстом, эмодзи и форматированием
 */

export const CHAR_LIMIT = 300;

/**
 * Корректный подсчёт длины с учётом эмодзи и суррогатных пар
 * Использует Intl.Segmenter для правильного подсчёта графем
 */
export function countGraphemes(str: string): number {
  if (!str) return 0;
  
  try {
    // Самый точный способ (поддерживается в современных браузерах)
    if ('Segmenter' in Intl) {
      // @ts-ignore - Intl.Segmenter не во всех типах
      const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
      return [...seg.segment(str)].length;
    }
  } catch (e) {
    // Fallthrough к фолбэку
  }
  
  // Фолбэк: близко к правде, лучше чем .length
  return Array.from(str).length;
}

/**
 * Вставка строки в текущую позицию каретки textarea
 * Возвращает новый текст и позицию каретки после вставки
 */
export function insertAtCaret(
  ta: HTMLTextAreaElement,
  insert: string
): { next: string; caret: number } {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const next = value.slice(0, s) + insert + value.slice(e);
  const caret = s + insert.length;
  return { next, caret };
}

/**
 * Тоггл Bold на выделении в textarea через Markdown-обёртку **…**
 * Поддерживает снятие жирного при повторном вызове
 */
export function toggleBoldSelection(ta: HTMLTextAreaElement): {
  next: string;
  range: readonly [number, number];
} {
  const { value, selectionStart: s, selectionEnd: e } = ta;
  const sel = value.slice(s, e);
  const isWrapped = sel.startsWith('**') && sel.endsWith('**') && sel.length > 4;

  let next: string;
  let start = s;
  let end = e;

  if (isWrapped) {
    // Снимаем Bold
    const unwrapped = sel.slice(2, -2);
    next = value.slice(0, s) + unwrapped + value.slice(e);
    end = start + unwrapped.length;
  } else {
    // Добавляем Bold
    const wrapped = sel ? `**${sel}**` : '**bold**';
    next = value.slice(0, s) + wrapped + value.slice(e);
    end = start + wrapped.length;
  }

  return { next, range: [start, end] as const };
}

/**
 * Проверка, есть ли выделение в textarea
 */
export function hasSelection(ta: HTMLTextAreaElement): boolean {
  return ta.selectionStart !== ta.selectionEnd;
}

/**
 * Выделить текст в textarea
 */
export function selectRange(
  ta: HTMLTextAreaElement,
  start: number,
  end: number
): void {
  ta.setSelectionRange(start, end);
  ta.focus();
}
