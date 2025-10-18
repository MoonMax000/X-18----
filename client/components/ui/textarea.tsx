import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const mergedRef = React.useMemo(
      () =>
        ref instanceof Function
          ? (node: HTMLTextAreaElement | null) => {
              ref(node);
              internalRef.current = node;
            }
          : (node: HTMLTextAreaElement | null) => {
              if (ref) ref.current = node;
              internalRef.current = node;
            },
      [ref],
    );

    const handleInput = React.useCallback(() => {
      const textarea = internalRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    React.useEffect(() => {
      const textarea = internalRef.current;
      if (textarea) {
        handleInput();
        textarea.addEventListener("input", handleInput);
        return () => textarea.removeEventListener("input", handleInput);
      }
    }, [handleInput]);

    return (
      <textarea
        className={cn(
          "flex min-h-[40px] w-full rounded-md border border-input bg-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden",
          className,
        )}
        ref={mergedRef}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
