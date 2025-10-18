import { type ChangeEvent, type FC, useEffect, useMemo, useRef, useState } from "react";

import { CalendarClock, Image as ImageIcon, MapPin, Smile } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ComposerMedia {
  id: string;
  url: string;
  file?: File;
}

const MAX_LENGTH = 280;
const MAX_MEDIA = 4;

const TweetComposer: FC = () => {
  const [text, setText] = useState<string>("");
  const [media, setMedia] = useState<ComposerMedia[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRef = useRef<ComposerMedia[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const charactersLeft = MAX_LENGTH - text.length;
  const isOverLimit = charactersLeft < 0;
  const canSubmit = useMemo(() => {
    if (isOverLimit) return false;
    if (text.trim().length > 0) return true;
    return media.length > 0;
  }, [isOverLimit, media.length, text]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleSelectMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowed = Math.max(0, MAX_MEDIA - media.length);
    if (allowed <= 0) {
      toast({
        title: "Лимит достигнут",
        description: "Можно прикрепить не более четырёх изображений.",
      });
      return;
    }

    const next = Array.from(files)
      .slice(0, allowed)
      .map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        url: URL.createObjectURL(file),
        file,
      }));

    setMedia((prev) => [...prev, ...next]);
    event.target.value = "";
  };

  const handleRemoveMedia = (id: string) => {
    setMedia((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      toast({
        title: "Пост опубликован",
        description: "Черновик сохранён и готов к интеграции с бэкендом.",
      });
      setText("");
      setMedia((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-[#181B22] bg-black p-6 text-white shadow-[0_24px_60px_-40px_rgba(12,16,20,0.9)]">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Что происходит?</h1>
        <p className="text-sm text-[#8B98A5]">
          Создайте пост в стиле Twitter: поддерживаем текст до 280 символов и до четырёх изобра��ений.
        </p>
      </header>

      <div className="flex gap-4">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#A06AFF]/30">
          <img src="/placeholder.svg" alt="Аватар" className="h-full w-full object-cover" />
        </div>

        <div className="flex w-full flex-col gap-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="Поделитесь новостью или идеей…"
            maxLength={MAX_LENGTH + 40}
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-white placeholder:text-[#5A6675] focus:outline-none"
          />

          {media.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {media.map((item) => (
                <div key={item.id} className="relative overflow-hidden rounded-2xl border border-[#1F242B]">
                  <img src={item.url} alt="Выбранное медиа" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-semibold text-white transition hover:bg-black/90"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8B98A5]">
            <span>��имволов осталось: {Math.max(charactersLeft, 0)}</span>
            {isOverLimit ? <span className="text-[#EF454A]">Превышен лимит на {Math.abs(charactersLeft)} символов</span> : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1F242B] pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition hover:bg-white/5 hover:text-white"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition hover:bg-white/5 hover:text-white"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent sideOffset={8} className="w-[90vw] sm:w-80 max-w-[350px] p-0">
                  <div className="h-[60vh] sm:h-80 max-h-[400px] p-3">
                    <EmojiPicker onSelect={(emoji) => setText((prev) => prev + emoji)} />
                  </div>
                </PopoverContent>
              </Popover>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition hover:bg-white/5 hover:text-white sm:flex"
              >
                <CalendarClock className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition hover:bg-white/5 hover:text-white sm:flex"
              >
                <MapPin className="h-5 w-5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSelectMedia} />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={cn(
                "inline-flex h-11 min-w-[90px] sm:min-w-[120px] items-center justify-center rounded-full px-4 sm:px-6 text-sm font-semibold transition",
                canSubmit && !isSubmitting
                  ? "bg-sky-500 text-white hover:brightness-110"
                  : "cursor-not-allowed bg-white/5 text-white/40"
              )}
            >
              {isSubmitting ? "Публикуем…" : "Опубликовать"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TweetComposer;
