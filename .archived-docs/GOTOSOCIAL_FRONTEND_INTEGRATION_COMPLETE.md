# GoToSocial Frontend Integration - Полная документация

## Обзор
Полное руководство по интеграции фронтенда с кастомизированным GoToSocial backend, включая поддержку custom_metadata для торговых постов и фильтрацию timeline.

**Дата:** 25 октября 2025  
**Статус:** ✅ Backend готов, Frontend интеграция готова к использованию

---

## 📋 Содержание

1. [Настройка окружения](#настройка-окружения)
2. [API клиент обновлен](#api-клиент-обновлен)
3. [Примеры для каждой страницы](#примеры-для-каждой-страницы)
4. [Работа с custom_metadata](#работа-с-custom_metadata)
5. [Фильтрация timeline](#фильтрация-timeline)
6. [Примеры кода](#примеры-кода)
7. [Чеклист интеграции](#чеклист-интеграции)

---

## 🔧 Настройка окружения

### 1. Environment Variables

Создайте/обновите `.env`:

```bash
# GoToSocial Backend URL
VITE_GOTOSOCIAL_API_URL=http://localhost:8080
# OR для production
VITE_GOTOSOCIAL_API_URL=https://gotosocial.yourinstance.com

# OAuth2 Configuration
VITE_OAUTH_CLIENT_ID=your_client_id_here
VITE_OAUTH_CLIENT_SECRET=your_client_secret_here
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 2. Update client.ts

Обновите `client/services/api/client.ts` для использования GoToSocial URL:

```typescript
const API_BASE_URL = import.meta.env.VITE_GOTOSOCIAL_API_URL || 'http://localhost:8080';
```

---

## ✅ API клиент обновлен

### Изменения в `client/services/api/gotosocial.ts`

#### 1. Обновлен интерфейс GTSStatus

```typescript
export interface GTSStatus {
  // ... стандартные поля
  // Кастомные метаданные для торговых постов
  custom_metadata?: Record<string, string>;
}
```

#### 2. Функция getHomeTimeline с фильтрацией

```typescript
export async function getHomeTimeline(options?: { 
  max_id?: string; 
  min_id?: string; 
  limit?: number;
  // Custom metadata filters
  category?: string;
  market?: string;
  symbol?: string;
  timeframe?: string;
  risk?: string;
}): Promise<GTSStatus[]>
```

#### 3. Функция createStatus с метаданными

```typescript
export async function createStatus(params: {
  status?: string;
  // ... стандартные параметры
  // Custom metadata for trading posts
  custom_metadata?: Record<string, string>;
}): Promise<GTSStatus>
```

---

## 📄 Примеры для каждой страницы

### 1. Feed Page (`/feedtest`)

#### Базовая загрузка timeline

```typescript
// client/pages/FeedTest.tsx
import { useState, useEffect } from 'react';
import { getHomeTimeline, GTSStatus } from '@/services/api/gotosocial';

export default function FeedTest() {
  const [posts, setPosts] = useState<GTSStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const statuses = await getHomeTimeline({ limit: 20 });
      setPosts(statuses);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="feed-container">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

#### С фильтрацией по метаданным

```typescript
// client/pages/FeedTest.tsx (расширенная версия)
import { useState, useEffect } from 'react';
import { getHomeTimeline, GTSStatus } from '@/services/api/gotosocial';

export default function FeedTest() {
  const [posts, setPosts] = useState<GTSStatus[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    market: '',
    symbol: '',
    timeframe: '',
    risk: '',
  });

  useEffect(() => {
    loadTimeline();
  }, [filters]);

  const loadTimeline = async () => {
    try {
      // Фильтруем только непустые значения
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const statuses = await getHomeTimeline({
        limit: 20,
        ...activeFilters,
      });
      
      setPosts(statuses);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Filters Sidebar */}
      <aside className="w-64">
        <h3>Фильтры</h3>
        
        {/* Market Filter */}
        <select 
          value={filters.market}
          onChange={e => setFilters({...filters, market: e.target.value})}
        >
          <option value="">Все рынки</option>
          <option value="forex">Forex</option>
          <option value="crypto">Crypto</option>
          <option value="stocks">Stocks</option>
        </select>

        {/* Category Filter */}
        <select 
          value={filters.category}
          onChange={e => setFilters({...filters, category: e.target.value})}
        >
          <option value="">Все категории</option>
          <option value="trade">Торговые сигналы</option>
          <option value="analysis">Анализ</option>
          <option value="education">Обучение</option>
        </select>

        {/* Symbol Filter */}
        <input
          type="text"
          placeholder="Символ (EUR/USD)"
          value={filters.symbol}
          onChange={e => setFilters({...filters, symbol: e.target.value})}
        />

        {/* Risk Filter */}
        <select 
          value={filters.risk}
          onChange={e => setFilters({...filters, risk: e.target.value})}
        >
          <option value="">Любой риск</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>

        <button onClick={() => setFilters({
          category: '', market: '', symbol: '', timeframe: '', risk: ''
        })}>
          Сбросить фильтры
        </button>
      </aside>

      {/* Timeline */}
      <main className="flex-1">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>
    </div>
  );
}
```

---

### 2. Create Post Modal

#### Создание торгового поста с метаданными

```typescript
// client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx
import { useState } from 'react';
import { createStatus, uploadMedia } from '@/services/api/gotosocial';

export default function CreatePostModal({ isOpen, onClose }) {
  const [text, setText] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  // Custom metadata fields
  const [metadata, setMetadata] = useState({
    category: '',
    market: '',
    symbol: '',
    timeframe: '',
    risk: '',
  });

  const handlePost = async () => {
    try {
      // 1. Upload media if any
      let mediaIds: string[] = [];
      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles.map(file => uploadMedia(file));
        const uploadedMedia = await Promise.all(uploadPromises);
        mediaIds = uploadedMedia.map(m => m.id);
      }

      // 2. Prepare custom_metadata (only non-empty fields)
      const customMetadata = Object.fromEntries(
        Object.entries(metadata).filter(([_, value]) => value !== '')
      );

      // 3. Create status
      const status = await createStatus({
        status: text,
        media_ids: mediaIds,
        visibility: 'public',
        // Include custom metadata if any
        ...(Object.keys(customMetadata).length > 0 && {
          custom_metadata: customMetadata
        }),
      });

      console.log('Post created:', status);
      
      // Reset form
      setText('');
      setMediaFiles([]);
      setMetadata({
        category: '', market: '', symbol: '', timeframe: '', risk: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Не удалось создать пост');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="create-post-modal">
        <h2>Создать пост</h2>

        {/* Text Area */}
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="О чем думаете?"
          rows={4}
        />

        {/* Media Upload */}
        <MediaUpload 
          onUpload={files => setMediaFiles(files)} 
        />

        {/* Trading Metadata Fields */}
        <div className="metadata-fields">
          <h3>Метаданные торговли (опционально)</h3>
          
          <select 
            value={metadata.category}
            onChange={e => setMetadata({...metadata, category: e.target.value})}
          >
            <option value="">Выберите категорию</option>
            <option value="trade">Торговый сигнал</option>
            <option value="analysis">Анализ</option>
            <option value="education">Обучение</option>
          </select>

          <select 
            value={metadata.market}
            onChange={e => setMetadata({...metadata, market: e.target.value})}
          >
            <option value="">Выберите рынок</option>
            <option value="forex">Forex</option>
            <option value="crypto">Crypto</option>
            <option value="stocks">Stocks</option>
          </select>

          <input
            type="text"
            placeholder="Символ (например, EURUSD)"
            value={metadata.symbol}
            onChange={e => setMetadata({...metadata, symbol: e.target.value})}
          />

          <input
            type="text"
            placeholder="Таймфрейм (например, 1h)"
            value={metadata.timeframe}
            onChange={e => setMetadata({...metadata, timeframe: e.target.value})}
          />

          <select 
            value={metadata.risk}
            onChange={e => setMetadata({...metadata, risk: e.target.value})}
          >
            <option value="">Уровень риска</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <Button onClick={onClose} variant="outline">
            Отмена
          </Button>
          <Button onClick={handlePost} disabled={!text.trim()}>
            Опубликовать
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

### 3. Post Card - Отображение метаданных

```typescript
// client/components/PostCard/PostCard.tsx
import { GTSStatus } from '@/services/api/gotosocial';

interface PostCardProps {
  post: GTSStatus;
}

export default function PostCard({ post }: PostCardProps) {
  const { custom_metadata } = post;

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar src={post.account.avatar} />
        <div>
          <h4>{post.account.display_name}</h4>
          <span>@{post.account.username}</span>
        </div>
      </div>

      {/* Content */}
      <div 
        className="post-content" 
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {/* Custom Metadata Badge */}
      {custom_metadata && Object.keys(custom_metadata).length > 0 && (
        <div className="metadata-badges">
          {custom_metadata.category && (
            <Badge variant="primary">{custom_metadata.category}</Badge>
          )}
          {custom_metadata.market && (
            <Badge variant="secondary">{custom_metadata.market}</Badge>
          )}
          {custom_metadata.symbol && (
            <Badge variant="outline">{custom_metadata.symbol}</Badge>
          )}
          {custom_metadata.timeframe && (
            <Badge variant="outline">{custom_metadata.timeframe}</Badge>
          )}
          {custom_metadata.risk && (
            <Badge 
              variant={
                custom_metadata.risk === 'low' ? 'success' :
                custom_metadata.risk === 'high' ? 'destructive' :
                'warning'
              }
            >
              {custom_metadata.risk} risk
            </Badge>
          )}
        </div>
      )}

      {/* Media */}
      {post.media_attachments.length > 0 && (
        <MediaGallery media={post.media_attachments} />
      )}

      {/* Actions */}
      <div className="post-actions">
        <ActionButton icon="reply" count={post.replies_count} />
        <ActionButton icon="reblog" count={post.reblogs_count} />
        <ActionButton icon="favourite" count={post.favourites_count} />
        <ActionButton icon="bookmark" />
      </div>
    </div>
  );
}
```

---

### 4. Profile Page

```typescript
// client/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { 
  getCurrentAccount, 
  getAccountStatuses,
  GTSAccount,
  GTSStatus 
} from '@/services/api/gotosocial';

export default function ProfilePage() {
  const [profile, setProfile] = useState<GTSAccount | null>(null);
  const [posts, setPosts] = useState<GTSStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const account = await getCurrentAccount();
      setProfile(account);

      // Get user's posts
      const statuses = await getAccountStatuses(account.id, {
        limit: 20,
        exclude_replies: false,
      });
      setPosts(statuses);
      
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка профиля...</div>;
  if (!profile) return <div>Профиль не найден</div>;

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <img src={profile.header} alt="Header" className="header-image" />
        <Avatar src={profile.avatar} size="large" />
        <h1>{profile.display_name}</h1>
        <p>@{profile.username}</p>
        <div 
          className="bio" 
          dangerouslySetInnerHTML={{ __html: profile.note }} 
        />
        
        {/* Stats */}
        <div className="profile-stats">
          <div>
            <strong>{profile.statuses_count}</strong>
            <span>Постов</span>
          </div>
          <div>
            <strong>{profile.followers_count}</strong>
            <span>Подписчиков</span>
          </div>
          <div>
            <strong>{profile.following_count}</strong>
            <span>Подписок</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="profile-posts">
        <h2>Посты</h2>
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
```

---

### 5. Notifications Page

```typescript
// client/pages/SocialNotifications.tsx
import { useState, useEffect } from 'react';
import { getNotifications, GTSNotification } from '@/services/api/gotosocial';

export default function SocialNotifications() {
  const [notifications, setNotifications] = useState<GTSNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'mentions'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const types = filter === 'mentions' 
        ? ['mention'] 
        : undefined;

      const data = await getNotifications({
        limit: 20,
        types,
      });
      
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notifications-page">
      <h1>Уведомления</h1>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Все
        </button>
        <button 
          className={filter === 'mentions' ? 'active' : ''}
          onClick={() => setFilter('mentions')}
        >
          Упоминания
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// NotificationItem Component
function NotificationItem({ notification }: { notification: GTSNotification }) {
  const { type, account, status } = notification;

  const getNotificationText = () => {
    switch (type) {
      case 'mention':
        return `упомянул вас`;
      case 'favourite':
        return `понравился ваш пост`;
      case 'reblog':
        return `репостнул ваш пост`;
      case 'follow':
        return `подписался на вас`;
      default:
        return type;
    }
  };

  return (
    <div className="notification-item">
      <Avatar src={account.avatar} />
      <div>
        <p>
          <strong>{account.display_name}</strong> {getNotificationText()}
        </p>
        {status && (
          <div 
            className="notification-status" 
            dangerouslySetInnerHTML={{ __html: status.content }} 
          />
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Работа с custom_metadata

### Структура метаданных

```typescript
// Рекомендуемая структура
interface TradingMetadata {
  // Основная информация
  category?: 'trade' | 'analysis' | 'education' | 'news';
  market?: 'forex' | 'crypto' | 'stocks' | 'commodities';
  symbol?: string; // 'EURUSD', 'BTCUSD', 'AAPL'
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  risk?: 'low' | 'medium' | 'high';
  
  // Расширенная информация (опционально)
  direction?: 'long' | 'short';
  entry?: string;
  stop_loss?: string;
  take_profit?: string;
}
```

### Пример создания поста с полными метаданными

```typescript
const tradingPost = await createStatus({
  status: `
    📊 EUR/USD Торговый сигнал
    
    Направление: Long
    Entry: 1.0950
    SL: 1.0920
    TP: 1.1020
    
    R:R = 1:2.3
    
    #forex #eurusd #trading
  `,
  custom_metadata: {
    category: 'trade',
    market: 'forex',
    symbol: 'EURUSD',
    timeframe: '4h',
    risk: 'medium',
    direction: 'long',
    entry: '1.0950',
    stop_loss: '1.0920',
    take_profit: '1.1020',
  },
});
```

---

## 🔍 Фильтрация timeline

### Примеры фильтрации

```typescript
// 1. Только Forex посты
const forexPosts = await getHomeTimeline({
  market: 'forex',
  limit: 20,
});

// 2. Торговые сигналы по EUR/USD
const eurusdSignals = await getHomeTimeline({
  category: 'trade',
  symbol: 'EURUSD',
  limit: 20,
});

// 3. Низкорисковые крипто сигналы
const safeCryptoSignals = await getHomeTimeline({
  market: 'crypto',
  risk: 'low',
  category: 'trade',
  limit: 20,
});

// 4. 4-часовые анализы
const fourHourAnalysis = await getHomeTimeline({
  timeframe: '4h',
  category: 'analysis',
  limit: 20,
});

// 5. Комбинированный фильтр
const specificSignals = await getHomeTimeline({
  category: 'trade',
  market: 'forex',
  symbol: 'GBPUSD',
  timeframe: '1h',
  risk: 'medium',
  limit: 20,
});
```

### Компонент фильтров

```typescript
// client/components/TimelineFilters.tsx
import { useState } from 'react';

interface FiltersState {
  category: string;
  market: string;
  symbol
