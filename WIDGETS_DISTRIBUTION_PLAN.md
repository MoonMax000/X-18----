# Widget Distribution Plan

## Текущие доступные виджеты

### Общие виджеты (публичные)
1. **Fear & Greed Index** - индекс страха/жадности рынка
2. **Community Sentiment** - настроение сообщества (% bullish/bearish)
3. **Trending Tickers** - популярные тикеры в сообществе
4. **Top Authors** - топ авторов по популярности
5. **Suggested Profiles** - предложенные профили для подписки
6. **Follow Recommendations** - рекомендации кого подписать
7. **News Widget** - актуальные новости рынка

### Виджеты для профилей
8. **Author Activity** - активность автора (посты, лайки, комменты, новые подписчики)
9. **Top Tickers** - топ тикеров конкретного автора

### Приватные виджеты (только для владельца)
10. **Earnings Widget** - доходы (MRR, ARPU, активные подписчики, топ постов по доходу)
11. **Subscriptions Widget** - мои активные подписки на авторов
12. **Purchased Posts Widget** - мои купленные посты

---

## 📊 Рекомендуемое распределение

### 1️⃣ Общая лента `/feedtest`

**Цель:** Помочь пользователю ориентироваться в рынке и находить интересный контент

**Виджеты (в порядке приоритета):**

✅ **Fear & Greed Index**
- Важный индикатор настроения рынка
- Помогает понять текущую ситуацию

✅ **Community Sentiment**
- Показывает общее настроение трейдеров
- Дополняет Fear & Greed

✅ **Trending Tickers**
- Самые обсуждаемые активы
- Помогает найти горячие темы

✅ **Top Authors**
- Популярные авторы
- Помогает найти качественный контент

✅ **Follow Recommendations**
- Персонализированные рекомендации
- Помогает расширить се��ь

✅ **News Widget**
- Актуальные новости
- Держит в курсе событий

❌ **Suggested Profiles** - УБРАТЬ (дублирует Follow Recommendations)
❌ **Author Activity** - не релевантно для общей ленты
❌ **Top Tickers** - дублирует Trending Tickers
❌ **Earnings** - приватная информация
❌ **Subscriptions** - приватная информация
❌ **Purchased Posts** - приватная информация

**Итого: 6 виджетов**

---

### 2️⃣ Мой профиль `/profile-page` (правый сайдбар)

**Цель:** Показать мою статистику и доходы

**Виджеты в сайдбаре (в порядке приоритета):**

✅ **Author Activity**
- МОЯ активность (посты, лайки, комменты, подписчики)
- Ключевая метрика для автора

✅ **Earnings Widget** 💰
- МОИ доходы (MRR, ARPU, подписчики)
- Критически важно для монетизации

✅ **Top Tickers**
- Мои самые обсуждаемые тикеры
- Показывает мою специализацию

✅ **Community Sentiment**
- Общее настроение рынка
- Контекст для создания контента

✅ **Fear & Greed Index**
- Индикатор рынка
- Помогает планировать контент

❌ **Subscriptions Widget** 👥 - **ПЕРЕНЕСЕНО** в Social Network → Обзор
❌ **Purchased Posts Widget** 🛒 - **ПЕРЕНЕСЕНО** в Social Network → Обзор
❌ **Trending Tickers** - не так важно на своем профиле
❌ **Top Authors** - не релевантно
❌ **Follow Recommendations** - не приоритет
❌ **Suggested Profiles** - не приоритет
❌ **News Widget** - не критично

**Итого: 5 виджетов в сайдбаре (2 приватных + 3 общих)**

---

### 2️⃣.1 Social Network → Обзор `/profile` (основной контент)

**Цель:** Управление подписками и купленным контентом

**Приватные виджеты в разделе "Обзор":**

✅ **Subscriptions Widget** 👥
- МОИ подписки на других авторов
- Управление подписками
- Показывает новые посты от авторов

✅ **Purchased Posts Widget** 🛒
- МОИ купленные посты
- Доступ к премиум контенту
- Быстрый доступ к оплаченным материалам

**Итого: 2 приватных виджета + статистика активности**

---

### 3️⃣ Чужой профиль `/other-profile`

**Цель:** Изучить активность и специализацию автора, решить подписаться или нет

**Виджеты (в порядке приоритета):**

✅ **Author Activity**
- Активность ЭТОГО автора
- Помогает оценить качество

✅ **Top Tickers**
- Специализация ЭТОГО автора
- Понять его фокус

✅ **Fear & Greed Index**
- Контекст рынка
- Универсальный виджет

✅ **Community Sentiment**
- Настроение рынка
- Универсальный виджет

✅ **Trending Tickers**
- Популярные тикеры в сообществе
- Сравнить с фокусом автора

✅ **Top Authors**
- Другие авторы
- Найти альтернативы

✅ **Follow Recommendations**
- Похожие авторы
- Расширить выбор

❌ **Earnings** - приватная информация (нельзя показывать)
❌ **Subscriptions** - приватная информация (нельзя показывать)
❌ **Purchased Posts** - приватная информация (нельзя показывать)
❌ **Suggested Profiles** - дублирует Follow Recommendations
❌ **News Widget** - не критично

**Итого: 7 виджетов (без приватных)**

---

## 📋 Сравнительная таблица

| Виджет | /feedtest | /profile-page | /other-profile |
|--------|-----------|---------------|----------------|
| **Fear & Greed Index** | ✅ | ✅ | ✅ |
| **Community Sentiment** | ✅ | ✅ | ✅ |
| **Trending Tickers** | ✅ | ❌ | ✅ |
| **Top Authors** | ✅ | ❌ | ✅ |
| **Follow Recommendations** | ✅ | ❌ | ✅ |
| **News Widget** | ✅ | ❌ | ❌ |
| **Suggested Profiles** | ❌ | ❌ | ❌ |
| **Author Activity** | ❌ | ✅ (свой) | ✅ (автора) |
| **Top Tickers** | ❌ | ✅ (свои) | ✅ (автора) |
| **Earnings** 💰 | ❌ | ✅ (ТОЛЬКО свой) | ❌ |
| **Subscriptions** 👥 | ❌ | ✅ (ТОЛЬКО свой) | ❌ |
| **Purchased Posts** 🛒 | ❌ | ✅ (ТОЛЬКО свой) | ❌ |
| **Итого** | 6 | 7 | 7 |

---

## 🎯 Ключевые принципы

### 1. Приватность
- **Earnings**, **Subscriptions**, **Purchased Posts** - ТОЛЬКО на своём профиле
- Никогда не показывать доходы и покупки других пользователей

### 2. Релевантность
- **/feedtest** - фокус на обнаружение контента и трендов
- **/profile-page** - фокус на мои метрики и монетизацию
- **/other-profile** - фокус на оценку автора

### 3. Нет дублирования
- **Suggested Profiles** убрать везде (дублирует Follow Recommendations)
- **Trending Tickers** vs **Top Tickers** - разные контексты

### 4. Производительность
- Не более 7 виджетов на странице
- Ленивая загрузка для тяжелых виджетов

---

## 🔧 Что нужно сделать

### 1. Обновить FeedTest.tsx
```tsx
<RightSidebar
  // Общие виджеты
  fearGreedScore={32}
  communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
  trendingTickers={TRENDING_TICKERS}
  topAuthors={TOP_AUTHORS}
  followRecommendations={DEFAULT_FOLLOW_RECOMMENDATIONS}
  newsItems={DEFAULT_NEWS_ITEMS}
  
  // Отключить всё остальное
  showAuthorActivity={false}
  showTopTickers={false}
  showEarnings={false}
  showSubscriptions={false}
  showPurchasedPosts={false}
  suggestedProfiles={[]} // Убрать
/>
```

### 2. ProfilePage.tsx уже правильно настроен
```tsx
<RightSidebar
  isOwnProfile={true} // Ключевой параметр
  
  // Мои виджеты
  showAuthorActivity={true}
  showTopTickers={true}
  showEarnings={true}
  showSubscriptions={true}
  showPurchasedPosts={true}
  
  // Общие виджеты
  fearGreedScore={32}
  communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
  
  // Отключить
  trendingTickers={[]}
  topAuthors={[]}
  followRecommendations={[]}
  newsItems={[]}
  suggestedProfiles={[]}
/>
```

### 3. Создать/обновить OtherProfilePage.tsx
```tsx
<RightSidebar
  isOwnProfile={false} // Чужой профиль
  
  // Виджеты автора
  showAuthorActivity={true}
  showTopTickers={true}
  
  // Общие виджеты
  fearGreedScore={32}
  communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
  trendingTickers={TRENDING_TICKERS}
  topAuthors={TOP_AUTHORS}
  followRecommendations={DEFAULT_FOLLOW_RECOMMENDATIONS}
  
  // Приватные - ОТКЛЮЧИТЬ
  showEarnings={false}
  showSubscriptions={false}
  showPurchasedPosts={false}
  
  // Отключить
  newsItems={[]}
  suggestedProfiles={[]}
/>
```

---

## ✅ Итоговая рекомендация

### Лента (/feedtest)
Фокус на **открытии контента**:
1. Fear & Greed Index
2. Community Sentiment
3. Trending Tickers
4. Top Authors
5. Follow Recommendations
6. News Widget

### Мой профиль (/profile-page)
Фокус на **монетизации и статистике**:
1. Author Activity (моя)
2. Earnings 💰
3. Top Tickers (мои)
4. Subscriptions 👥
5. Purchased Posts 🛒
6. Community Sentiment
7. Fear & Greed Index

### Чужой профиль (/other-profile)
Фокус на **оценке автора**:
1. Author Activity (автора)
2. Top Tickers (автора)
3. Fear & Greed Index
4. Community Sentiment
5. Trending Tickers
6. Top Authors
7. Follow Recommendations

---

## 📝 Примечания

- **Suggested Profiles** рекомендую удалить полностью (дублирует Follow Recommendations)
- **News Widget** оставить только в общей ленте
- Приватные виджеты должны быть защищены на уровне компонента (`isOwnProfile` check)
- Рассмотреть возможность кастомизации виджетов пользователем в будущем

Хотите, чтобы я сразу реализовал эти изменения?
