import { FC, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ComposerDraft } from "./types";

interface DraftsListProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: (draft: ComposerDraft) => void;
  onDelete: (draftId: string) => void;
}

export const DraftsList: FC<DraftsListProps> = ({ isOpen, onClose, onOpen, onDelete }) => {
  const [drafts, setDrafts] = useState<ComposerDraft[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const savedDrafts = localStorage.getItem("composer-drafts");
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
      }
    }
  }, [isOpen]);

  const handleDelete = (draftId: string) => {
    const updated = drafts.filter((d) => d.id !== draftId);
    setDrafts(updated);
    localStorage.setItem("composer-drafts", JSON.stringify(updated));
    onDelete(draftId);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#181B22] px-5 py-4">
          <h2 className="text-lg font-bold text-white">Drafts</h2>
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

        <div className="max-h-[60vh] overflow-y-auto p-5 scrollbar">
          {drafts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#808283]">No drafts saved</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const firstBlock = draft.blocks[0];
                const preview = firstBlock?.text || "Empty draft";
                const isThread = draft.blocks.length > 1;

                return (
                  <div
                    key={draft.id}
                    className="rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[50px] transition-colors hover:bg-[rgba(12,16,20,0.7)]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <p className="flex-1 text-sm text-[#E7E9EA] line-clamp-2">{preview}</p>
                      {isThread && (
                        <span className="rounded-full bg-[#A06AFF]/20 px-2 py-0.5 text-xs font-semibold text-[#A06AFF]">
                          Thread ({draft.blocks.length})
                        </span>
                      )}
                    </div>
                    <div className="mb-3 text-xs text-[#808283]">
                      {new Date(draft.updatedAt).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onOpen(draft);
                          onClose();
                        }}
                        className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="rounded-full border border-[#181B22] px-4 py-1.5 text-xs font-semibold text-[#EF454A] transition-colors hover:bg-[#EF454A]/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
