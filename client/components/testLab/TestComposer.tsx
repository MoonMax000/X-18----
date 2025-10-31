import { type FC, useMemo, useState } from "react";
import { ChevronDown, DollarSign, Sparkles } from "lucide-react";

import InlineComposer from "@/components/socialComposer/InlineComposer";
import type { ComposerBlockState } from "@/components/CreatePostBox/types";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  DEFAULT_LAB_CATEGORY,
  LAB_CATEGORY_CONFIG,
  type LabCategory,
  LAB_CATEGORY_LABELS,
} from "./categoryConfig";
import {
  DEFAULT_LAB_AUDIENCE,
  DEFAULT_LAB_ASSET,
  LAB_AUDIENCE_OPTIONS,
  LAB_ASSET_MAP,
  LAB_ASSET_OPTIONS,
} from "./postMetaConfig";
import type { LabAudience } from "./types";

export interface TestComposerSubmitPayload {
  blocks: ComposerBlockState[];
  category: LabCategory;
  preview: string;
  isPremium: boolean;
  price: number | null;
  subscriptionPrice: number | null;
  audience: LabAudience;
  assets: string[];
}

interface TestComposerProps {
  userAvatar?: string;
  userName?: string;
  onSubmit?: (payload: TestComposerSubmitPayload) => Promise<void> | void;
}

const TestComposer: FC<TestComposerProps> = ({ userAvatar, userName, onSubmit }) => {
  const [category, setCategory] = useState<LabCategory>(DEFAULT_LAB_CATEGORY);
  const [preview, setPreview] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("9");
  const [subscriptionPrice, setSubscriptionPrice] = useState("29");
  const [audience, setAudience] = useState<LabAudience>(DEFAULT_LAB_AUDIENCE);
  const [selectedAssets, setSelectedAssets] = useState<string[]>(
    DEFAULT_LAB_ASSET ? [DEFAULT_LAB_ASSET] : [],
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [assetOpen, setAssetOpen] = useState(false);

  const selectedCategoryConfig = useMemo(
    () =>
      LAB_CATEGORY_CONFIG.find((item) => item.value === category) ??
      LAB_CATEGORY_CONFIG.find((item) => item.value === DEFAULT_LAB_CATEGORY) ??
      LAB_CATEGORY_CONFIG[0],
    [category],
  );

  const isSubmitDisabled = useMemo(
    () => isPremium && price.trim().length === 0 && subscriptionPrice.trim().length === 0,
    [isPremium, price, subscriptionPrice],
  );

  const showPriceError = isSubmitDisabled;

  const toggleAsset = (value: string) => {
    setSelectedAssets((prev) => {
      if (prev.includes(value)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleComposerSubmit = async (blocks: ComposerBlockState[]) => {
    if (blocks.length === 0 || isSubmitDisabled) return;

    const assetsToSubmit = selectedAssets.length > 0 ? selectedAssets : DEFAULT_LAB_ASSET ? [DEFAULT_LAB_ASSET] : [];

    await onSubmit?.({
      blocks,
      category,
      preview: preview.trim(),
      isPremium,
      price: isPremium ? Number(price) || null : null,
      subscriptionPrice: isPremium ? Number(subscriptionPrice) || null : null,
      audience,
      assets: assetsToSubmit,
    });

    setPreview("");
    setIsPremium(false);
    setPrice("9");
    setSubscriptionPrice("29");
    setAudience(DEFAULT_LAB_AUDIENCE);
    setSelectedAssets(DEFAULT_LAB_ASSET ? [DEFAULT_LAB_ASSET] : []);
  };

  return (
    <div className="space-y-4">
      <InlineComposer userAvatar={userAvatar} userName={userName} onSubmit={handleComposerSubmit} />

      <section className="rounded-3xl border border-[#16C784] bg-background/90 p-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-[30px]">
        <div className="space-y-5">
          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Рубрика</span>
            <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-[#1B1F27] bg-[#0C101480] px-4 py-3 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        selectedCategoryConfig?.badgeClassName,
                      )}
                    >
                      {selectedCategoryConfig ? (
                        <selectedCategoryConfig.icon className="h-5 w-5" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block font-semibold text-white">
                        {selectedCategoryConfig?.label ?? LAB_CATEGORY_LABELS[category]}
                      </span>
                      <span className="block text-xs text-[#8E92A0]">
                        {selectedCategoryConfig?.description ?? "Выберите подходящий формат"}
                      </span>
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[360px] space-y-3 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)]"
              >
                <div className="grid gap-2">
                  {LAB_CATEGORY_CONFIG.map((item) => {
                    const Icon = item.icon;
                    const isActive = category === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          setCategory(item.value);
                          setCategoryOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                          isActive
                            ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            item.badgeClassName,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <span className="block text-sm font-semibold text-white">{item.label}</span>
                          <span className="block text-xs text-[#8E92A0]">{item.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Аудитория</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {LAB_AUDIENCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = option.value === audience;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAudience(option.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                      isActive
                        ? "border-[#2EBD85]/60 bg-[#19392A] text-white shadow-[0_12px_28px_-16px_rgba(28,163,104,0.5)]"
                        : "border-[#1B1F27] bg-[#0C101480] text-[#C5C9D3] hover:border-[#2EBD85]/40 hover:bg-[#1B2A1F]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                        isActive ? option.badgeClassName : "",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{option.label}</span>
                      <span className="block text-xs text-[#8E92A0]">{option.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <label className="text-sm font-semibold text-white" htmlFor="lab-preview">
              Превью для всех
              <span className="ml-2 text-xs font-normal text-[#8E92A0]">
                Показывается до оплаты (оставьте пустым, чтобы использовать начало текста)
              </span>
            </label>
            <textarea
              id="lab-preview"
              value={preview}
              onChange={(event) => setPreview(event.target.value)}
              rows={2}
              className="min-h-[56px] rounded-2xl border border-[#16C784] bg-[#0C101480] px-4 py-3 text-sm text-white placeholder:text-[#6C7280] focus:border-[#A06AFF] focus:outline-none"
              placeholder="Короткий тизер, который увидят все"
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Монетизация поста</span>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsPremium(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  !isPremium
                    ? "border-[#3B82F6]/60 bg-[#14243A] text-white shadow-[0_12px_28px_-16px_rgba(59,130,246,0.5)]"
                    : "border-[#1B1F27] bg-[#0C101480] text-[#C5C9D3] hover:border-[#3B82F6]/40 hover:bg-[#112032]",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                    !isPremium ? "border-[#3B82F6]/60 bg-[#365986]/20" : "",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Free</span>
                  <span className="block text-xs text-[#8E92A0]">Открыто для всех пользователей</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsPremium(true)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  isPremium
                    ? "border-[#A06AFF] bg-[#2A1C3F] text-white shadow-[0_12px_28px_-16px_rgba(160,106,255,0.5)]"
                    : "border-[#1B1F27] bg-[#0C101480] text-[#C5C9D3] hover:border-[#A06AFF]/40 hover:bg-[#1B1230]",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                    isPremium ? "border-[#A06AFF] bg-[#A06AFF]/15" : "",
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Pay</span>
                  <span className="block text-xs text-[#8E92A0]">Откроется после оплаты или подписки</span>
                </span>
              </button>
            </div>
            {isPremium ? (
              <div className="grid gap-3 rounded-2xl border border-[#281C39] bg-[#180F25] p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-[#CDBAFF]"
                      htmlFor="lab-price"
                    >
                      Цена за единичный доступ ($)
                    </label>
                    <input
                      id="lab-price"
                      type="number"
                      min={1}
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      className={cn(
                        "rounded-xl border bg-[#0C101480] px-3 py-2 text-sm text-white focus:border-[#A06AFF] focus:outline-none",
                        showPriceError && price.trim().length === 0 ? "border-[#EF454A]" : "border-[#281C39]",
                      )}
                      placeholder="9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-[#CDBAFF]"
                      htmlFor="lab-subscription"
                    >
                      Цена подписки ($/мес)
                    </label>
                    <input
                      id="lab-subscription"
                      type="number"
                      min={1}
                      value={subscriptionPrice}
                      onChange={(event) => setSubscriptionPrice(event.target.value)}
                      className={cn(
                        "rounded-xl border bg-[#0C101480] px-3 py-2 text-sm text-white focus:border-[#A06AFF] focus:outline-none",
                        showPriceError && subscriptionPrice.trim().length === 0 ? "border-[#EF454A]" : "border-[#281C39]",
                      )}
                      placeholder="29"
                    />
                  </div>
                </div>
                <p className="rounded-2xl bg-[#241537] px-3 py-2 text-xs text-[#CDBAFF]">
                  Заполните хотя бы одно поле. Можно оставить только единичную оплату или только подписку.
                </p>
                <p className="text-xs text-[#8E92A0]">
                  Аудитория: {audience === "everyone" ? "всем пользователям" : "только подписчикам"}. Предпросмотр увидят все.
                </p>
              </div>
            ) : (
              <p className="rounded-2xl bg-[#11161E] px-3 py-2 text-xs text-[#8E92A0]">
                Пост будет открыт {audience === "everyone" ? "для всех пользователей" : "только для ваших подписчиков"}. Категория: {LAB_CATEGORY_LABELS[category]}.
              </p>
            )}
          </div>
          {isPremium && showPriceError ? (
            <p className="text-xs text-[#EF454A]">Заполните хотя бы одно ценовое поле.</p>
          ) : null}

          <div className="grid gap-2">
            <span className="text-sm font-semibold text-white">Активы</span>
            <Popover open={assetOpen} onOpenChange={setAssetOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full flex-col gap-2 rounded-2xl border border-[#1B1F27] bg-[#0C101480] px-4 py-3 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C7280]">
                    Выбранные активы
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAssets.map((asset) => {
                      const option = LAB_ASSET_MAP[asset];
                      const Icon = option?.icon ?? Sparkles;
                      return (
                        <Badge
                          key={asset}
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1.5 rounded-xl border-[#2A2F3A] bg-[#11161E] px-2.5 py-1 text-xs text-white",
                            option?.accentClassName,
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{asset}</span>
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#8E92A0]">
                    <span>Нажмите, чтобы изменить подборку активов</span>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[320px] space-y-3 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)]"
              >
                <div className="space-y-2">
                  {LAB_ASSET_OPTIONS.map((asset) => {
                    const Icon = asset.icon;
                    const isActive = selectedAssets.includes(asset.value);
                    return (
                      <button
                        key={asset.value}
                        type="button"
                        onClick={() => toggleAsset(asset.value)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                          isActive
                            ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5",
                            isActive ? "border-[#A06AFF] bg-[#A06AFF]/20" : "",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1">
                          <span className="block text-sm font-semibold text-white">{asset.label}</span>
                          <span className="block text-xs text-[#8E92A0]">Тикер: {asset.value}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#CDBAFF]">
                          {isActive ? "Выбрано" : "Добавить"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="rounded-2xl bg-[#11161E] px-3 py-2 text-xs text-[#8E92A0]">
                  Можно выбрать несколько а��тивов. Минимум один актив должен быть указан, чтобы пользователи быстро находили аналитику по своим интересам.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TestComposer;
