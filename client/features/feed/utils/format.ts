// features/feed/utils/format.ts
export const highlightTextHtml = (input: string) =>
  input
    .replace(/(\$[A-Z]{2,5})/g, '<span class="text-blue-400 font-semibold">$1</span>')
    .replace(/(#\w+)/g, '<span class="text-purple-400">$1</span>')
    .replace(/(@\w+)/g, '<span class="text-green-400">$1</span>');

export const dot = "·";
export const warn = "⚠️";
