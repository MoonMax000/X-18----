import { useMemo, useState } from "react";

import type { ComposerBlockState } from "@/components/CreatePostBox/types";
import TestComposer, { type TestComposerSubmitPayload } from "@/components/testLab/TestComposer";
import TestFiltersBar from "@/components/testLab/TestFiltersBar";
import TestRightSidebar from "@/components/testLab/TestRightSidebar";
import TestTimeline from "@/components/testLab/TestTimeline";
import { LAB_CATEGORY_LABELS, type LabCategory } from "@/components/testLab/categoryConfig";
import { LAB_ASSET_MAP } from "@/components/testLab/postMetaConfig";
import type { LabPost } from "@/components/testLab/types";
import { TEST_LAB_POSTS } from "@/data/testLabPosts";

type MonetizationFilter = "all" | "free" | "premium";
type SortOption = "recent" | "likes_desc" | "likes_asc";

const monetizationFilterLabels: Record<MonetizationFilter, string> = {
  all: "Все форматы",
  free: "Только бесплатные",
  premium: "Только платные",
};

const sortOptionLabels: Record<SortOption, string> = {
  recent: "Сначала новые",
  likes_desc: "Больше лайков",
  likes_asc: "Меньше лайков",
};

const CURRENT_AUTHOR = {
  name: "Devid Capital",
  avatar:
    "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200",
  handle: "@devidcapital",
  verified: true,
  isFollowed: true,
  isCurrentUser: true,
};

const getMediaFromBlock = (block: ComposerBlockState) => {
  if (block.media.length === 0) {
    return { type: "article" as const, mediaUrl: undefined, videoUrl: undefined };
  }
  const videoItem = block.media.find((item) => item.type === "video");
  if (videoItem) {
    return { type: "video" as const, mediaUrl: undefined, videoUrl: videoItem.url };
  }
  const firstImage = block.media.find((item) => item.type === "image" || item.type === "gif");
  return { type: "article" as const, mediaUrl: firstImage?.url, videoUrl: undefined };
};

const buildTitleFromText = (text: string) => {
  if (!text) return "Новая публикация";
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
};

const buildPreview = (blocksPreview: string, blockText: string) => {
  const trimmedPreview = blocksPreview.trim();
  if (trimmedPreview.length > 0) {
    return trimmedPreview;
  }
  if (!blockText) return "";
  return blockText.length > 140 ? `${blockText.slice(0, 140)}…` : blockText;
};

export default function TestovayaPage() {
  const [posts, setPosts] = useState<LabPost[]>(() => TEST_LAB_POSTS.map((post) => ({ ...post })));
  const [feedMode, setFeedMode] = useState<"forYou" | "following">("forYou");
  const [activeCategory, setActiveCategory] = useState<LabCategory | "all">("all");
  const [savedCategories, setSavedCategories] = useState<LabCategory[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [monetizationFilter, setMonetizationFilter] = useState<MonetizationFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const effectiveCategories = useMemo<LabCategory[]>(() => {
    if (savedCategories.length > 0) {
      return savedCategories;
    }
    if (activeCategory === "all") {
      return [];
    }
    return [activeCategory];
  }, [activeCategory, savedCategories]);

  const filteredPosts = useMemo(() => {
    const hasAssetFilter = selectedAssets.length > 0;

    const filtered = posts.filter((post) => {
      const matchesFeed = feedMode === "forYou" || Boolean(post.author.isFollowed);
      const matchesCategory = effectiveCategories.length === 0 || effectiveCategories.includes(post.category);
      const matchesAssets = !hasAssetFilter || post.assets.some((asset) => selectedAssets.includes(asset));
      const isPremium = Boolean(post.isPremium);
      const matchesMonetization =
        monetizationFilter === "all" ||
        (monetizationFilter === "premium" ? isPremium : !isPremium);

      return matchesFeed && matchesCategory && matchesAssets && matchesMonetization;
    });

    if (sortOption === "likes_desc") {
      return [...filtered].sort((a, b) => b.likes - a.likes);
    }
    if (sortOption === "likes_asc") {
      return [...filtered].sort((a, b) => a.likes - b.likes);
    }

    return filtered;
  }, [posts, feedMode, effectiveCategories, selectedAssets, monetizationFilter, sortOption]);

  const createPostsFromBlocks = (payload: TestComposerSubmitPayload) => {
    const createdPosts: LabPost[] = [];
    payload.blocks.forEach((block, index) => {
      const trimmedText = block.text.trim();
      const hasMedia = block.media.length > 0;
      if (!trimmedText && !hasMedia && block.codeBlocks.length === 0) {
        return;
      }

      const { type, mediaUrl, videoUrl } = getMediaFromBlock(block);
      const preview = buildPreview(payload.preview, trimmedText);
      const newPost: LabPost = {
        id: `test-post-${Date.now()}-${index}`,
        type,
        author: { ...CURRENT_AUTHOR },
        timestamp: new Date().toLocaleString(),
        title: buildTitleFromText(trimmedText || preview),
        preview: preview || undefined,
        body: trimmedText || undefined,
        mediaUrl,
        videoUrl,
        sentiment: "bullish",
        likes: 0,
        comments: 0,
        views: 0,
        hashtags: [],
        category: payload.category,
        isPremium: payload.isPremium,
        price: payload.price ?? undefined,
        subscriptionPrice: payload.subscriptionPrice ?? undefined,
        unlocked: !payload.isPremium,
        audience: payload.audience,
        assets: payload.assets.length > 0 ? payload.assets : [],
      };
      createdPosts.push(newPost);
    });

    return createdPosts;
  };

  const handleCreatePost = (payload: TestComposerSubmitPayload) => {
    const newPosts = createPostsFromBlocks(payload);
    if (newPosts.length === 0) {
      return;
    }
    setPosts((prev) => [...newPosts, ...prev]);
  };

  const handleUnlock = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              unlocked: true,
            }
          : post,
      ),
    );
  };

  const handleSubscribe = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              unlocked: true,
            }
          : post,
      ),
    );
  };

  const handleSaveCurrentFilter = () => {
    if (activeCategory === "all") {
      setSavedCategories([]);
      return;
    }
    setSavedCategories([activeCategory]);
  };

  const handleApplyQuickFilter = (categories: LabCategory[]) => {
    setSavedCategories(categories);
    setActiveCategory("all");
  };

  const handleResetSaved = () => {
    setSavedCategories([]);
  };

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSavedCategories([]);
    setSelectedAssets([]);
    setMonetizationFilter("all");
    setSortOption("recent");
  };

  const activeCategoryLabels = effectiveCategories.map((category) => LAB_CATEGORY_LABELS[category]);
  const activeAssetLabels = selectedAssets.map((asset) => LAB_ASSET_MAP[asset]?.label ?? asset);

  return (
    <div className="flex w-full gap-4">
      <div className="flex-1 w-full max-w-[720px]">
        <div className="mx-auto w-full max-w-[680px]">
          <TestFiltersBar
            feedMode={feedMode}
            onFeedModeChange={setFeedMode}
            activeCategory={activeCategory}
            onCategoryChange={(value) => {
              setActiveCategory(value);
              setSavedCategories([]);
            }}
            selectedAssets={selectedAssets}
            onAssetsChange={setSelectedAssets}
            monetizationFilter={monetizationFilter}
            onMonetizationFilterChange={setMonetizationFilter}
            sortOption={sortOption}
            onSortOptionChange={setSortOption}
            onResetFilters={handleResetFilters}
          />

          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#A3A6B4]">
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Активные рубрики: {activeCategoryLabels.length === 0 ? "Все" : activeCategoryLabels.join(", ")}
            </span>
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Активы: {activeAssetLabels.length === 0 ? "Все" : activeAssetLabels.join(", ")}
            </span>
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Формат: {monetizationFilterLabels[monetizationFilter]}
            </span>
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Сортировка: {sortOptionLabels[sortOption]}
            </span>
            <button
              type="button"
              className="rounded-full border border-[#A06AFF]/40 px-3 py-1 text-xs font-semibold text-[#A06AFF] transition hover:bg-[#A06AFF]/10"
              onClick={handleSaveCurrentFilter}
            >
              Сохранить текущий фильтр
            </button>
            {savedCategories.length > 0 ? (
              <span className="inline-flex flex-wrap items-center gap-1 text-[#CDBAFF]">
                {savedCategories.map((category) => (
                  <span key={category} className="rounded-full bg-[#482090]/20 px-2 py-0.5">
                    {LAB_CATEGORY_LABELS[category]}
                  </span>
                ))}
              </span>
            ) : null}
          </div>

          <div className="mb-6">
            <TestComposer onSubmit={handleCreatePost} userAvatar={CURRENT_AUTHOR.avatar} userName={CURRENT_AUTHOR.name} />
          </div>

          <TestTimeline posts={filteredPosts} onUnlock={handleUnlock} onSubscribe={handleSubscribe} />
        </div>
      </div>

      <TestRightSidebar onApplyQuickFilter={handleApplyQuickFilter} savedCategories={savedCategories} onResetSaved={handleResetSaved} />
    </div>
  );
}
