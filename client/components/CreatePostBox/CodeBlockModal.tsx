import { FC, useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface CodeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string, language: string) => void;
}

const languages = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "json", label: "JSON" },
  { id: "bash", label: "Bash" },
];

export const CodeBlockModal: FC<CodeBlockModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setLanguage("javascript");
    }
  }, [isOpen]);

  const handleInsert = () => {
    if (code.trim()) {
      console.log('[CodeBlockModal] Inserting code block:', {
        language,
        codeLength: code.length,
        code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
      });
      onInsert(code, language);
      onClose();
    } else {
      console.log('[CodeBlockModal] Cannot insert - code is empty');
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#181B22] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#482090]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Insert Code Block</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#E7E9EA]">
              Language
            </label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-4 py-3 pr-10 text-sm text-white outline-none backdrop-blur-[50px] transition-colors focus:border-[#A06AFF]"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="#A06AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#E7E9EA]">
              Code
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="h-64 w-full resize-none rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 font-mono text-sm text-[#E7E9EA] placeholder:text-[#808283] outline-none backdrop-blur-[50px] transition-colors focus:border-[#A06AFF] scrollbar whitespace-pre-wrap break-words"
              style={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word'
              }}
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#181B22] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-[#181B22] bg-transparent px-5 py-2 text-sm font-semibold text-[#E7E9EA] transition-all hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!code.trim()}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
              code.trim()
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                : "cursor-not-allowed bg-[#A06AFF]/20 text-white/40"
            }`}
          >
            Insert Code
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
