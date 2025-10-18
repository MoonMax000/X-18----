import {
  type CSSProperties,
  ChangeEvent,
  FC,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { defaultProfile } from "@/data/socialProfile";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  ImagePlus,
  Video,
  BarChart3,
  CalendarClock,
  MapPin,
  Smile,
  X,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChosenImage {
  id: string;
  url: string;
  file: File;
  width: number;
  height: number;
}

const MAX_FILES = 4;
const CHAR_LIMIT = 280;
const EMOJI_PRESETS = [
  "😀",
  "😂",
  "😍",
  "🔥",
  "���",
  "🚀",
  "📈",
  "💡",
  "🎯",
  "🙌",
  "💬",
  "⚡️",
];

const fallbackAvatar =
  defaultProfile.avatar && defaultProfile.avatar !== "/placeholder.svg"
    ? defaultProfile.avatar
    : "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const readImageFile = (file: File): Promise<ChosenImage> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.onload = () => {
      const result = reader.result as string;
      const image = new Image();
      image.onload = () =>
        resolve({
          id: makeId(),
          url: result,
          file,
          width: image.width,
          height: image.height,
        });
      image.onerror = () =>
        reject(new Error("Не удалось по��учить параме��ры ��зо��ражения"));
      image.src = result;
    };
    reader.readAsDataURL(file);
  });

const useTextareaAutosize = (value: string) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }, [value]);

  return ref;
};

const useComposerState = (variantLabel: string) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState<ChosenImage[]>([]);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const textareaRef = useTextareaAutosize(text);

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const handleFiles = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const remaining = MAX_FILES - imagesRef.current.length;
      if (remaining <= 0) {
        toast({
          title: "Ограничение",
          description: "Можно прикрепить до 4 изображений.",
        });
        event.target.value = "";
        return;
      }

      const queue = Array.from(files).slice(0, remaining);
      if (queue.length < files.length) {
        toast({
          title: "Ограничение",
          description:
            "Выбрано слишком много файлов. Добавлено максимум 4 изображ��ния.",
        });
      }

      const results: ChosenImage[] = [];
      for (const file of queue) {
        try {
          const chosen = await readImageFile(file);
          results.push(chosen);
        } catch (error) {
          console.error(error);
          toast({
            title: "Ошибка",
            description: "Не удалось обработать изображение.",
          });
        }
      }

      if (results.length) {
        setImages((prev) => [...prev, ...results]);
      }

      event.target.value = "";
    },
    [],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  }, []);

  const reset = useCallback(() => {
    setText("");
    setImages([]);
  }, []);

  const canPost = useMemo(
    () => text.trim().length > 0 || images.length > 0,
    [text, images.length],
  );

  const handleSubmit = useCallback(() => {
    if (!canPost) return;
    toast({
      title: "Пост опубликован",
      description: `Вариант «${variantLabel}» отправлен в общий поток`,
    });
    console.log(`[${variantLabel}] Post`, {
      text,
      attachments: images.map((item) => ({
        name: item.file.name,
        size: item.file.size,
      })),
    });
    reset();
  }, [canPost, images, reset, text, variantLabel]);

  const charactersLeft = CHAR_LIMIT - text.length;

  return {
    text,
    setText,
    textareaRef,
    images,
    handleTextChange,
    handleFiles,
    removeImage,
    handleSubmit,
    canPost,
    charactersLeft,
  };
};

const AvatarBadge: FC<{ size?: number }> = ({ size = 44 }) => (
  <div
    className="overflow-hidden rounded-full bg-[#0D1218]"
    style={{ width: size, height: size }}
  >
    <img
      src={fallbackAvatar}
      alt="Текущий пользователь"
      className="h-full w-full object-cover"
    />
  </div>
);

const IconActionButton: FC<{
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ label, icon, onClick, disabled, className }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={cn(
      "flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10 disabled:opacity-50",
      className,
    )}
  >
    {icon}
  </button>
);

const EmojiPickerButton: FC<{ onSelect: (emoji: string) => void }> = ({
  onSelect,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Добавить эмодзи"
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#9AA0A8] transition-colors hover:bg-[#482090]/10"
      >
        <Smile className="h-5 w-5" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      sideOffset={8}
      className="grid w-[210px] grid-cols-6 gap-2 rounded-2xl border border-[#1F242B] bg-[rgba(12,16,20,0.95)] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
    >
      {EMOJI_PRESETS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors hover:bg-[#482090]/10"
        >
          {emoji}
        </button>
      ))}
    </PopoverContent>
  </Popover>
);

const ChosenMediaGrid: FC<{
  items: ChosenImage[];
  onRemove: (id: string) => void;
  tone?: "default" | "minimal";
}> = ({ items, onRemove, tone = "default" }) => {
  if (items.length === 0) return null;

  const containerClass =
    items.length === 1
      ? "grid grid-cols-1 gap-3"
      : items.length === 2
        ? "grid grid-cols-2 gap-3"
        : "grid grid-cols-2 gap-3 md:grid-cols-2";

  const gridAreas =
    items.length === 3
      ? "'first second' 'first third'"
      : items.length === 4
        ? "'first second' 'third fourth'"
        : undefined;

  const areaForIndex = (index: number) => {
    if (items.length === 3) {
      return index === 0 ? "first" : index === 1 ? "second" : "third";
    }
    if (items.length === 4) {
      return ["first", "second", "third", "fourth"][index];
    }
    return undefined;
  };

  const aspectForIndex = (index: number) => {
    if (items.length === 1) return "1.9 / 1";
    if (items.length === 2) return "1 / 1";
    if (items.length === 3) return index === 0 ? "0.85 / 1" : "1.76 / 1";
    if (items.length === 4) return "1.76 / 1";
    return undefined;
  };

  return (
    <div
      className={cn(containerClass, tone === "minimal" && "gap-2")}
      style={
        gridAreas
          ? ({ gridTemplateAreas: gridAreas } as CSSProperties)
          : undefined
      }
    >
      {items.map((image, index) => (
        <div
          key={image.id}
          style={{
            gridArea: areaForIndex(index),
            aspectRatio: aspectForIndex(index),
          }}
          className="group relative overflow-hidden rounded-2xl border border-[#1F242B] bg-[#0D1218]"
        >
          <button
            type="button"
            aria-label="У��алить изображение"
            onClick={() => onRemove(image.id)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={image.url}
            alt="Предпрос��отр"
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const VariantClassic: FC = () => {
  const composer = useComposerState("Classic");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.65)] p-4 shadow-[0_24px_60px_-38px_rgba(12,16,20,0.9)]">
      <div className="flex items-start gap-4">
        <AvatarBadge size={48} />
        <div className="flex-1">
          <textarea
            ref={composer.textareaRef}
            value={composer.text}
            onChange={composer.handleTextChange}
            maxLength={CHAR_LIMIT}
            placeholder="What's happening?"
            className="w-full resize-none bg-transparent text-[15px] font-medium text-white placeholder:text-[#8B98A5] outline-none"
          />
          <ChosenMediaGrid
            items={composer.images}
            onRemove={composer.removeImage}
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <IconActionButton
                label="Видео или GIF"
                icon={<Video className="h-5 w-5" />}
              />
              <IconActionButton
                label="Опрос"
                icon={<BarChart3 className="h-5 w-5" />}
              />
              <IconActionButton
                label="Добавить медиа"
                onClick={openFilePicker}
                icon={<ImageIcon className="h-5 w-5" />}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={composer.handleFiles}
              />
              <EmojiPickerButton
                onSelect={(emoji) => composer.setText((prev) => prev + emoji)}
              />
              <IconActionButton
                label="Запланировать"
                icon={<CalendarClock className="h-5 w-5" />}
              />
              <IconActionButton
                label="Локация"
                icon={<MapPin className="h-5 w-5" />}
              />
            </motion.div>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-semibold",
                  composer.charactersLeft < 20
                    ? "text-[#FF7A7A]"
                    : "text-[#8B98A5]",
                )}
              >
                {composer.charactersLeft}
              </span>
              <button
                type="button"
                onClick={composer.handleSubmit}
                disabled={!composer.canPost}
                className={cn(
                  "inline-flex min-w-[96px] items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition",
                  composer.canPost
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                    : "bg-white/5 text-[#9AA0A8]",
                )}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VariantToolbar: FC = () => {
  const composer = useComposerState("Focus");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="rounded-2xl border border-[#1F242B] bg-[rgba(8,11,15,0.8)] p-4">
      <div className="flex items-start gap-3">
        <AvatarBadge size={44} />
        <div className="flex-1">
          <textarea
            ref={composer.textareaRef}
            value={composer.text}
            onChange={composer.handleTextChange}
            maxLength={CHAR_LIMIT}
            placeholder="Share an insight with the community..."
            className="w-full resize-none bg-transparent text-[15px] font-medium text-white placeholder:text-[#6C7080] outline-none"
          />

          <ChosenMediaGrid
            items={composer.images}
            onRemove={composer.removeImage}
            tone="minimal"
          />

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#1F242B] bg-[rgba(12,16,20,0.65)] px-3 py-2">
              <div className="flex items-center gap-2">
                <IconActionButton
                  label="Видео или GIF"
                  icon={<Video className="h-5 w-5" />}
                />
                <IconActionButton
                  label="Опрос"
                  icon={<BarChart3 className="h-5 w-5" />}
                />
                <IconActionButton
                  label="Добавить изоб��ажение"
                  onClick={openFilePicker}
                  icon={<ImagePlus className="h-5 w-5" />}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={composer.handleFiles}
                />
                <EmojiPickerButton
                  onSelect={(emoji) => composer.setText((prev) => prev + emoji)}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8B98A5]">
                {composer.charactersLeft} symbols left
              </span>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#151A22] px-4 py-2 text-xs font-semibold text-[#E0E3EB]"
              >
                <Sparkles className="h-4 w-4 text-[#A06AFF]" />
                AI summary
              </button>
              <button
                type="button"
                onClick={composer.handleSubmit}
                disabled={!composer.canPost}
                className={cn(
                  "inline-flex min-w-[92px] items-center justify-center rounded-full px-5 py-2 text-sm font-semibold",
                  composer.canPost
                    ? "bg-[#482090] text-white shadow-[0_16px_40px_-24px_rgba(72,32,144,0.8)]"
                    : "bg-white/5 text-[#7C8291]",
                )}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VariantMinimal: FC = () => {
  const composer = useComposerState("Minimal");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="rounded-2xl border border-[#0F1419] bg-[#05080D] p-4">
      <div className="flex items-start gap-3 pb-4">
        <AvatarBadge size={40} />
        <div className="flex-1 bg-transparent">
          <textarea
            ref={composer.textareaRef}
            value={composer.text}
            onChange={composer.handleTextChange}
            maxLength={CHAR_LIMIT}
            placeholder="What's happening?"
            className="w-full resize-none bg-transparent focus:bg-transparent text-[15px] font-medium text-white placeholder:text-[#4E5A66] outline-none"
          />
          <ChosenMediaGrid
            items={composer.images}
            onRemove={composer.removeImage}
            tone="minimal"
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-3">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-1.5 text-sm font-semibold text-[#1D9BF0] transition-colors hover:bg-transparent"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 2v1.5M12 20.5V22M4.5 12H2M22 12h-2.5M7.05 4.05l1.06 1.06M15.89 17.95l1.06 1.06M5.56 18.44l1.06-1.06M17.38 6.62l1.06-1.06"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M8.75 17.5 8 14l-1-3-2.2-1.27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m17 14-.5-3-1-3 2.5-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Everyone can reply</span>
          </button>

          <div className="flex items-center gap-3 text-[#A06AFF]">
            <IconActionButton
              label="Видео или GIF"
              icon={<Video className="h-4 w-4" />}
              className="text-[#A06AFF] hover:bg-[#482090]/10"
            />
            <IconActionButton
              label="Опрос"
              icon={<BarChart3 className="h-4 w-4" />}
              className="text-[#A06AFF] hover:bg-[#482090]/10"
            />
            <IconActionButton
              label="Добавить изображение"
              onClick={() => fileInputRef.current?.click()}
              icon={<ImageIcon className="h-4 w-4" />}
              className="text-[#A06AFF] hover:bg-[#482090]/10"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={composer.handleFiles}
            />
            <EmojiPickerButton
              onSelect={(emoji) => composer.setText((prev) => prev + emoji)}
            />
            <IconActionButton
              label="Локация"
              icon={<MapPin className="h-4 w-4" />}
              className="text-[#A06AFF] hover:bg-[#482090]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 self-end">
          {composer.text.length > 0 && (
            <>
              <div className="h-8 w-px bg-white/15" />
              <div className="flex h-8 w-8 items-center justify-center">
                <svg className="-rotate-90" width="32" height="32" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="rgba(113, 118, 123, 0.3)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="rgb(29, 155, 240)"
                    strokeWidth="3"
                    strokeDasharray={`${(Math.min(composer.text.length / CHAR_LIMIT, 1) * 87.96).toFixed(2)} 87.96`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={composer.handleSubmit}
                aria-label="Quick add post"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-[#1D9BF0] transition-colors hover:bg-white/15 hover:border-white/30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 5v14M5 12h14" stroke="#1D9BF0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={composer.handleSubmit}
            disabled={!composer.canPost}
            className={cn(
              "inline-flex min-w-[78px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold",
              composer.canPost
                ? "bg-[#482090] text-white"
                : "bg-[#1A2834] text-[#3C5870]",
            )}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

const CreatePostVariants: FC = () => (
  <div className="flex w-full flex-col gap-5">
    <VariantMinimal />
  </div>
);

export default CreatePostVariants;
