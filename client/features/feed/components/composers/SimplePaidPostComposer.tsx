import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { customBackendAPI } from "@/services/api/custom-backend";

export default function SimplePaidPostComposer({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState(""); // Заголовок/описание (открытый текст)
  const [content, setContent] = useState(""); // Платный контент (закрытый текст)
  const [price, setPrice] = useState(5);
  const [isPosting, setIsPosting] = useState(false);

  const canPost = preview.trim().length > 0 && content.trim().length > 0 && price > 0;

  const handlePost = async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);

    try {
      console.log('[SimplePaidPostComposer] Creating paid post:', {
        preview: preview.substring(0, 50),
        content: content.substring(0, 50),
        price,
      });

      const payload = {
        content: content.trim(),
        previewText: preview.trim(), // Открытый текст (заголовок)
        accessLevel: "pay-per-post" as const,
        replyPolicy: "everyone" as const,
        priceCents: Math.round(price * 100),
        metadata: {
          category: "Education"
        }
      };

      console.log('[SimplePaidPostComposer] Payload:', payload);

      const createdPost = await customBackendAPI.createPost(payload);
      
      console.log('[SimplePaidPostComposer] Post created:', createdPost);

      toast({
        title: "Платный пост создан!",
        description: `Пост опубликован с ценой $${price}`,
      });

      setPreview("");
      setContent("");
      setPrice(5);
      onPostCreated?.();

    } catch (error) {
      console.error('[SimplePaidPostComposer] Failed to create post:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать пост",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[#181B22] bg-black p-4 mb-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={user?.avatar_url || ""} />
          <AvatarFallback>{user?.display_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-[#A06AFF]" />
              <span className="text-xs font-semibold text-white">Простой платный пост</span>
              <span className="text-xs text-[#6C7280]">(только текст)</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {/* Поле 1: Заголовок/Preview (открытый текст) */}
            <div>
              <label className="text-xs font-medium text-[#A06AFF] mb-1 block">
                Заголовок (видно всем)
              </label>
              <textarea
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                placeholder="Краткое описание или заголовок поста..."
                disabled={isPosting}
                className="w-full min-h-[60px] resize-none rounded-xl border border-[#1B1F27] bg-[#0A0D12] px-3 py-2 text-sm text-white placeholder:text-[#6C7280] focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
              />
            </div>

            {/* Поле 2: Платный контент (закрытый текст) */}
            <div>
              <label className="text-xs font-medium text-[#FF6B6B] mb-1 block flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Платный контент (виден после покупки)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Полный текст поста, доступный после оплаты..."
                disabled={isPosting}
                className="w-full min-h-[80px] resize-none rounded-xl border border-[#FF6B6B]/30 bg-[#0A0D12] px-3 py-2 text-sm text-white placeholder:text-[#6C7280] focus:border-[#FF6B6B] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-white">Цена:</label>
              <div className="flex items-center gap-1 rounded-xl border border-[#A06AFF]/40 bg-[#000000] px-3 py-1.5">
                <span className="text-sm font-bold text-[#A06AFF]">$</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  disabled={isPosting}
                  className="w-16 bg-transparent text-sm font-semibold text-[#A06AFF] outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={handlePost}
              disabled={!canPost || isPosting}
              className="rounded-xl bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPosting ? "Публикуется..." : "Опубликовать"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
