import type { FC } from "react";
import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

import SuggestedProfilesWidget, {
  type SuggestedProfile,
} from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, {
  type NewsItem,
} from "@/components/SocialFeedWidgets/TrendingTopicsWidget";

interface ExploreCollection {
  id: string;
  title: string;
  description: string;
  accent: string;
  topics: string[];
}

interface ExploreStory {
  id: string;
  category: string;
  title: string;
  summary: string;
  author: string;
  readTime: string;
  tags: string[];
}

const categories = [
  "Все",
  "Криптовалюты",
  "Рынки",
  "AI",
  "IPO",
  "NFT",
  "Фьючерсы",
  "Мировые новости",
] as const;

type ExploreCategory = (typeof categories)[number];

const exploreCollections: ExploreCollection[] = [
  {
    id: "macro-playbook",
    title: "Макростратегии 2025",
    description: "14 подборок аналитики по макроэкономике и валютам",
    accent: "from-[#A06AFF] to-[#482090]",
    topics: ["Рынки", "Мировые новости", "Фьючерсы"],
  },
  {
    id: "ai-alpha",
    title: "AI Alpha Insider",
    description: "Лучшие трейды на пересечении техно��огий и рынков",
    accent: "from-[#4FC3F7] to-[#8057FF]",
    topics: ["AI", "Рынки"],
  },
  {
    id: "pro-traders",
    title: "Профессиональные трейдеры",
    description: "Сигналы, живые сессии и менторские комнаты",
    accent: "from-[#2EBD85] to-[#0F6D40]",
    topics: ["Рынки", "Фьючерсы"],
  },
  {
    id: "weekends",
    title: "Выходные с трейдерами",
    description: "Топовые разборы графиков и математики опционов",
    accent: "from-[#FF8A65] to-[#C96BFF]",
    topics: ["Криптовалюты", "NFT", "Фьючерсы"],
  },
];

const featuredStories: ExploreStory[] = [
  {
    id: "hedge-funds",
    category: "Trending",
    title: "Фонды страхуют риск через опционы на золото — что это значит",
    summary:
      "Опционы на золото снова в фокусе: фонды страхуют портфели от волатильности доходностей. Разбираем ключевые уровни, сценарии и влияние на в��люты.",
    author: "@macroclub",
    readTime: "6 мин",
    tags: ["Рынки", "Мировые новости", "Фьючерсы"],
  },
  {
    id: "ai-trading",
    category: "AI",
    title: "Как применить GPT-индикаторы в дейтрейдинге без переобучения",
    summary:
      "Команда AI Alpha делится готовым пайплайном: от чистки данных до стратегии выхода. Плюс — список проверенных подсказок.",
    author: "@quantum",
    readTime: "8 мин",
    tags: ["AI", "Рынки"],
  },
  {
    id: "crypto-infra",
    category: "Крипто",
    title: "Инфраструктурные токены: кто выживет после халвинга",
    summary:
      "Проекты, решающие задачи L2 и дата-доставки, держатся лучше рынка. Три идеи с низкой корреляцией к BTC.",
    author: "@chainpulse",
    readTime: "5 мин",
    tags: ["Криптовалюты", "NFT"],
  },
  {
    id: "ipo-radar",
    category: "Рынки",
    title: "IPO-радар: какие компании выходят в ближайшие м��сяцы",
    summary:
      "Топ-7 флагманских размещений с оценкой мультипликаторов, спроса и ближайших локапов.",
    author: "@dealflow",
    readTime: "7 мин",
    tags: ["IPO", "Рынки"],
  },
];

const recommendedProfiles: SuggestedProfile[] = [
  {
    id: "market-maria",
    name: "Мария Власова",
    handle: "@optionsmaria",
    avatar: "https://i.pravatar.cc/120?img=18",
    verified: true,
  },
  {
    id: "crypto-scout",
    name: "Crypto Scout",
    handle: "@scout_io",
    avatar: "https://i.pravatar.cc/120?img=33",
  },
  {
    id: "macro-sensei",
    name: "Macro Sensei",
    handle: "@macroSensei",
    avatar: "https://i.pravatar.cc/120?img=41",
    verified: true,
  },
];

const exploreNews: NewsItem[] = [
  {
    id: "eth-staking",
    category: "Криптовалюты",
    title: "ETH staking",
    publishedAgo: "сейчас",
    engagement: "212K постов",
    commentCount: 540,
  },
  {
    id: "ai-traders",
    category: "AI",
    title: "AI traders",
    publishedAgo: "12 мин назад",
    engagement: "176K постов",
    commentCount: 312,
  },
  {
    id: "usd-jpy",
    category: "Рынки",
    title: "USD/JPY",
    publishedAgo: "25 мин назад",
    engagement: "41K постов",
    commentCount: 118,
  },
  {
    id: "oil-range",
    category: "Фьючерсы",
    title: "Brent 95$",
    publishedAgo: "38 мин назад",
    engagement: "28K постов",
    commentCount: 0,
  },
  {
    id: "ipo-watch",
    category: "IPO",
    title: "Stripe S-1",
    publishedAgo: "1 час назад",
    engagement: "64K постов",
    commentCount: 86,
  },
];

const DEFAULT_CATEGORY = categories[0];

const SocialExplore: FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ExploreCategory>(DEFAULT_CATEGORY);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [followingTopics, setFollowingTopics] = useState<Set<string>>(new Set());

  const filteredCollections = useMemo(() => {
    let collections = exploreCollections;

    // Filter by category
    if (activeCategory !== DEFAULT_CATEGORY) {
      const matching = collections.filter((collection) =>
        collection.topics.includes(activeCategory),
      );
      collections = matching.length > 0 ? matching : collections;
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      collections = collections.filter((collection) =>
        collection.title.toLowerCase().includes(query) ||
        collection.description.toLowerCase().includes(query) ||
        collection.topics.some(topic => topic.toLowerCase().includes(query))
      );
    }

    return collections;
  }, [activeCategory, debouncedSearch]);

  const filteredStories = useMemo(() => {
    let stories = featuredStories;

    // Filter by category
    if (activeCategory !== DEFAULT_CATEGORY) {
      stories = stories.filter((story) => story.tags.includes(activeCategory));
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      stories = stories.filter((story) =>
        story.title.toLowerCase().includes(query) ||
        story.summary.toLowerCase().includes(query) ||
        story.tags.some(tag => tag.toLowerCase().includes(query)) ||
        story.author.toLowerCase().includes(query)
      );
    }

    return stories;
  }, [activeCategory, debouncedSearch]);

  const highlightedNews = useMemo(() => {
    let news = exploreNews;

    // Filter by category
    if (activeCategory !== DEFAULT_CATEGORY) {
      const matching = news.filter((item) => item.category === activeCategory);
      news = matching.length > 0 ? matching : news;
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      news = news.filter((item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return news;
  }, [activeCategory, debouncedSearch]);

  const handleFollowTopic = useCallback((topicId: string) => {
    setFollowingTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
    // TODO: Call API to follow/unfollow topic
    console.log('Following topic:', topicId);
  }, []);

  const handleOpenCollection = useCallback((collectionId: string) => {
    // TODO: Navigate to collection detail page
    console.log('Opening collection:', collectionId);
    // navigate(`/social/collection/${collectionId}`);
  }, [navigate]);

  const handleOpenStory = useCallback((storyId: string) => {
    // TODO: Navigate to story detail page
    console.log('Opening story:', storyId);
    // navigate(`/social/story/${storyId}`);
  }, [navigate]);

  const handleCreateList = useCallback(() => {
    // TODO: Open create list modal
    console.log('Creating new list');
  }, []);

  const hasResults = filteredCollections.length > 0 || filteredStories.length > 0 || highlightedNews.length > 0;

  return (
    <div className="flex w-full justify-center pb-12">
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,720px)_minmax(0,320px)]">
        <section className="flex min-h-screen flex-col gap-6">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск тем, людей и списков"
              className="w-full rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.8)] py-3 pl-12 pr-4 text-sm font-medium text-white placeholder:text-[#6C7080] shadow-[0_14px_30px_rgba(10,12,16,0.35)] transition focus:border-[#A06AFF] focus:outline-none focus:ring-2 focus:ring-[#A06AFF]/40"
            />
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6C7080]"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M15 15L18 18" strokeLinecap="round" />
            </svg>
          </div>

          <CategoryFilters
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {!debouncedSearch && <SpotlightCard />}

          {!hasResults && debouncedSearch ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#181B22] bg-[rgba(12,16,20,0.4)] p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M20 20L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Ничего не найдено по запросу "{debouncedSearch}"</h3>
              <p className="max-w-[360px] text-sm text-[#B0B0B0]">
                Попробуйте изменить поисковый запрос или выбрать другую категорию
              </p>
            </div>
          ) : (
            <>
              {filteredCollections.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredCollections.map((collection) => (
                    <CollectionCard 
                      key={collection.id} 
                      collection={collection}
                      onOpen={() => handleOpenCollection(collection.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {highlightedNews.length > 0 && (
            <div className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-5">
              <h3 className="text-lg font-semibold text-white">Что в фокусе</h3>
              <div className="mt-4 flex flex-col divide-y divide-white/5">
                {highlightedNews.map((item, index) => {
                  const isFollowing = followingTopics.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleFollowTopic(item.id)}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <span className="text-sm font-medium text-white/40">{index + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-[0.2em] text-white/40">{item.category}</span>
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                        <span className="text-xs text-white/50">
                          {item.publishedAgo}
                          {item.engagement ? ` · ${item.engagement}` : ""}
                        </span>
                      </div>
                      <span className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                        isFollowing 
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-white/10 text-white/60 hover:border-primary hover:text-primary"
                      )}>
                        {isFollowing ? 'Отслеживается' : 'Следить'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredStories.length > 0 && (
            <div className="flex flex-col gap-4">
              {filteredStories.map((story) => (
                <StoryCard 
                  key={story.id} 
                  story={story}
                  onOpen={() => handleOpenStory(story.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="hidden w-full max-w-[320px] flex-col gap-5 lg:flex">
          <SuggestedProfilesWidget profiles={recommendedProfiles} title="Кого читать" />
          <NewsWidget items={highlightedNews} title="Актуальные темы" />
          <div className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-5">
            <h3 className="text-lg font-semibold text-white">Профессиональные списки</h3>
            <p className="mt-2 text-sm text-[#B0B0B0]">
              Сохраните curated-листы, чтобы следить за инсайтами фондов, крипто-аналитиков и частных трейдеров.
            </p>
            <button
              type="button"
              onClick={handleCreateList}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:shadow-[0_12px_30px_-20px_rgba(160,106,255,0.9)]"
            >
              Создать список
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

interface CategoryFiltersProps {
  categories: readonly ExploreCategory[];
  activeCategory: ExploreCategory;
  onSelect: (category: ExploreCategory) => void;
}

const CategoryFilters: FC<CategoryFiltersProps> = ({ categories, activeCategory, onSelect }) => (
  <div className="flex flex-wrap gap-3 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-3">
    {categories.map((category) => {
      const isActive = category === activeCategory;

      return (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          aria-pressed={isActive}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            isActive
              ? "border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
              : "border-transparent bg-[rgba(160,106,255,0.1)] text-[#E3D8FF] hover:border-[#A06AFF] hover:bg-[#A06AFF]/20 hover:text-white"
          }`}
        >
          {category}
        </button>
      );
    })}
  </div>
);

const SpotlightCard: FC = () => (
  <div className="overflow-hidden rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)]">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#482090]/90 via-[#0F172A]/70 to-transparent" />
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F7ee0e08331ad4de59dd7fa404556ca59%2Fd0b32e8bde594d2bbb1c4b0c038e29ee?format=webp&width=1200"
        alt="Macro board"
        className="h-64 w-full object-cover"
      />
      <div className="relative flex flex-col gap-3 px-6 pb-6 pt-8 text-white sm:max-w-[420px]">
        <span className="inline-flex w-max items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
          Spotlight
        </span>
        <h2 className="text-2xl font-bold leading-tight">
          "Три сигнала, что риск-сентимент меняется и как успеть"
        </h2>
        <p className="text-sm text-white/80">
          Дайджест ключевых индикаторов, тепловые карты волатильности и разбор сделок институционалов за последние 48 часов.
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
          <span>Собрано Tyrian Research</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Обновлено 15 минут назад</span>
        </div>
      </div>
    </div>
  </div>
);

interface CollectionCardProps {
  collection: ExploreCollection;
  onOpen: () => void;
}

const CollectionCard: FC<CollectionCardProps> = ({ collection, onOpen }) => (
  <article className="flex h-full flex-col justify-between rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-5 shadow-[0_14px_30px_rgba(10,12,16,0.35)] transition-all hover:border-[#A06AFF]/50 hover:shadow-[0_14px_30px_rgba(160,106,255,0.25)] cursor-pointer group">
    <div className="flex flex-col gap-3">
      <span
        className={`inline-flex w-max items-center gap-2 rounded-full bg-gradient-to-r ${collection.accent} px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90`}
      >
        Плейлист
      </span>
      <h3 className="text-lg font-bold text-white">{collection.title}</h3>
      <p className="text-sm text-[#B0B0B0]">{collection.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-white/50">
        {collection.topics.map((topic) => (
          <span key={topic} className="rounded-full border border-white/10 px-2 py-0.5">
            #{topic}
          </span>
        ))}
      </div>
    </div>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      className="mt-6 inline-flex w-max items-center gap-2 rounded-full border border-transparent bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/30 hover:bg-white/20 group-hover:bg-gradient-to-r group-hover:from-[#A06AFF] group-hover:to-[#482090]"
    >
      Открыть подборку
    </button>
  </article>
);

interface StoryCardProps {
  story: ExploreStory;
  onOpen: () => void;
}

const StoryCard: FC<StoryCardProps> = ({ story, onOpen }) => (
  <article 
    onClick={onOpen}
    className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-6 transition-all hover:border-[#A06AFF]/50 hover:shadow-[0_14px_30px_rgba(160,106,255,0.25)] cursor-pointer"
  >
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#6C7080]">
      <span>{story.category}</span>
      <span className="h-[2px] w-8 rounded-full bg-[#6C7080]/50" />
      <span>{story.readTime}</span>
    </div>
    <h3 className="mt-3 text-xl font-bold text-white">{story.title}</h3>
    <p className="mt-2 text-sm text-[#B0B0B0]">{story.summary}</p>
    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6C7080]">
      <div className="flex items-center gap-2">
        <img
          src="https://i.pravatar.cc/64?img=52"
          alt={story.author}
          className="h-6 w-6 rounded-full"
        />
        <span>{story.author}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {story.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 text-white/60">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  </article>
);

interface EmptyExploreStateProps {
  activeCategory: ExploreCategory;
}

const EmptyExploreState: FC<EmptyExploreStateProps> = ({ activeCategory }) => (
  <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#181B22] bg-[rgba(12,16,20,0.4)] p-10 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 6V18M6 12H18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white">Пока нет подборок в категории «{activeCategory}»</h3>
    <p className="max-w-[360px] text-sm text-[#B0B0B0]">
      Мы уже собираем свежие материалы. Загляните позже или выберите другую тему, чтобы вдохновиться идеями.
    </p>
  </div>
);

export default SocialExplore;
