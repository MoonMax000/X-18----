"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[5vh]"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-[600px] bg-black border border-[#2F3336] rounded-2xl shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center gap-8 px-4 py-3 border-b border-[#2F3336] bg-black/95 backdrop-blur-sm rounded-t-2xl">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-white" />
          </button>
          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
