# Tyrian Trade — Тест-план

## Acceptance Criteria

### 1. Фильтры (Type × Topic)

**PASS**:
- ✅ Таб "Ideas" → Type автоматически = "idea", показываются только Ideas
- ✅ Topic фильтр "News" применяется поверх Type → Ideas на тему News
- ✅ Клик на Trending Ticker $BTC → фильтр `ticker=$BTC`, бейдж "Filtering: $BTC ×"
- ✅ Смена таба → тикер-фильтр сохраняется
- ✅ Клик "× Reset" → все фильтры сбрасываются (кроме таба)

**FAIL**:
- ❌ Конфликт: таб "Ideas" + Topic "Video" → пустая выдача (должны быть Ideas с видео, если есть)
- ❌ Фильтр тикера теряется при смене таба
- ❌ Пустая выдача без сообщения "No posts found"

---

### 2. Gating (Доступ к контенту)

**PASS**:
- ✅ Автор видит свой платный пост целиком (без GatedContent)
- ✅ Анонимный пользователь видит GatedContent для `paid`/`subscribers`/`followers`
- ✅ Фолловер видит `followers-only` пост
- ✅ Фолловер НЕ видит `subscribers-only` (GatedContent)
- ✅ Платный подписчик видит ВСЕ посты автора (paid + subscribers)
- ✅ Купивший разово видит конкретный `paid` пост, но не другие

**FAIL**:
- ❌ Подписчик НЕ видит `paid` пост (должен видеть)
- ❌ Анонимный пользователь видит `followers-only` (баг)
- ❌ После покупки GatedContent не скрывается (нет optimistic update)

**Логика**:
```typescript
isAuthor ∨ 
isPublic ∨ 
(isFollowers ∧ isFollowing) ∨ 
(isSubscribers ∧ hasSubscription) ∨ 
(isPaid ∧ (hasPurchased ∨ hasSubscription))
```

---

### 3. Монетизация

**PASS** (Unlock):
- ✅ Клик "Unlock for $9" → модал открывается
- ✅ Ввод данных карты → клик "Оплатить" → статус "processing" (спиннер)
- ✅ Успех → статус "success" (галочка), модал закрывается через 1.5с
- ✅ GatedContent скрывается, контент показывается (optimistic)
- ✅ Повторная попытка купить тот же пост → GatedContent не показывается

**PASS** (Subscribe):
- ✅ Клик "Subscribe $29/mo" → модал открывается
- ✅ Выбор плана (monthly/yearly) → цена обновляется
- ✅ Успех → все посты автора разблокируются
- ✅ Бейдж "Subscriber" появляется у пользователя (профиль, комменты, виджеты)

**PASS** (Tip):
- ✅ Клик "Send Tip" → модал открывается
- ✅ Выбор суммы ($5/$10/$25/Custom) → клик "Отправить"
- ✅ Успех → toast "Tip sent to @username!"
- ✅ Автор получает уведомление (mock)

**FAIL**:
- ❌ Оплата зависает без таймаута (должен быть таймаут 30с)
- ❌ После отмены подписки доступ теряется сразу (должен сохраниться до конца периода)
- ❌ Earnings widget виден чужому пользователю (должен быть 403)

---

### 4. Профиль (own vs other)

**PASS**:
- ✅ Pinned post показывается только на вкладке "Tweets", всегда сверху
- ✅ В "Tweets & replies" есть индикатор "Replying to @user"
- ✅ Клик на "Replying to" → перех��д к родительскому посту
- ✅ Sticky-шапка появляется при скролле вниз
- ✅ Кнопка "Назад" → `history.back()`, fallback `/feed`
- ✅ Follow counter обновляется optimistically (+1 при Follow)
- ✅ Earnings widget виден только владельцу профиля

**FAIL**:
- ❌ Pinned post исчезает на вкладке "Media" (должен быть, если есть медиа)
- ❌ Sticky-табы не прилипают (CSS баг)
- ❌ Follow counter не обновляется при unfollow из виджета

---

### 5. Hot Score

**PASS**:
- ✅ Пост с большим engagement + свежий → выше в Hot
- ✅ Старый пост с огромным engagement → ниже свежего (decay работает)
- ✅ Переключение Hot → Recent → сортировка меняется

**Тест-кейсы**:

| Post | Likes | Comments | Reposts | Views | Age   | Engagement | Decay  | Hot Score |
|------|-------|----------|---------|-------|-------|------------|--------|-----------|
| A    | 100   | 20       | 10      | 5000  | 12h   | 230        | 0.606  | ~139.4    |
| B    | 200   | 5        | 5       | 10000 | 48h   | 325        | 0.135  | ~43.9     |

**Ожидание**: A выше B в Hot (свежее, хотя меньше engagement).

**FAIL**:
- ❌ Старый пост с 10K лайков выше свежего с 500 (decay не работает)
- ❌ Hot/Recent переключение не меняет порядок

---

### 6. Новые посты (WebSocket)

**PASS**:
- ✅ WebSocket подключается (или mock interval срабатывает)
- ✅ Событие `new_post` → счётчик `newPostsCount` увеличивается
- ✅ Баннер "X new posts available" появляется (sticky вверху)
- ✅ Клик на баннер → новые посты вставляются в начало ленты (fade-in)
- ✅ Счётчик обнуляется после загрузки

**FAIL**:
- ❌ WebSocket отключается, fallback polling не работает
- ❌ Баннер не появляется (не подписаны на события)
- ❌ Новые посты дублируются в ленте (нет проверки по ID)

---

## Тест-кейсы (Edge Cases)

### TC-001: Конфликтные фильтры
**Шаги**:
1. Выбрать таб "Soft" (Type=Code)
2. Выбрать Topic="Video"
3. Проверить выдачу

**Ожидание**:
- Показываются посты с кодом И видео
- Если нет → "No posts found. Try resetting filters" + кнопка [Reset]

---

### TC-002: Пустая выдача
**Шаги**:
1. Выбрать все фильтры (Market=Crypto, Price=Paid, Topic=On-chain, Ticker=$DOGE)
2. Период=Today

**Ожидание**:
- "No posts found. Try resetting filters or changing period"
- Кнопка [Reset filters]

---

### TC-003: Потеря сети в оплате
**Шаги**:
1. Клик "Unlock for $9"
2. Ввод данных карты
3. Отключить интернет
4. Клик "Оплатить"

**Ожидание**:
- Спиннер висит макс 30 секунд
- Таймаут → "Network error. Check connection and try again"
- Кнопка [Retry]

---

### TC-004: Повторный Unlock
**Шаги**:
1. Купить пост за $9
2. Обновить страницу (F5)
3. Проверить, показывается ли GatedContent

**Ожидание**:
- GatedContent НЕ показывается
- Пост сразу открыт (проверка `hasPurchased(postId)`)

---

### TC-005: Смена табов с активным тикером
**Шаги**:
1. Выбрать фильтр Ticker=$BTC
2. Переключить таб "Ideas" → "Analytics"
3. Проверить бейдж "Filtering: $BTC ×"

**Ожидание**:
- Фильтр сохраняется
- Бейдж виден
- Показываются Analytics по $BTC

---

### TC-006: Автосейв черновика
**Шаги**:
1. Открыть Advanced Composer
2. Написать текст "Hello world"
3. Закрыть модал без публикации
4. Открыть снова

**Ожидание**:
- Текст "Hello world" восстановлен из `localStorage`
- Можно продолжить редактирование

---

### TC-007: Follow из виджета → профиль
**Шаги**:
1. В Top Authors кликнуть Follow на @cryptowhale
2. Перейти на `/other-profile/cryptowhale`
3. Проверить кнопку

**Ожидание**:
- Кнопка "Follow" → "Following"
- Изменение синхронизировано везде (виджет, профиль, посты)

---

### TC-008: WebSocket disconnect
**Шаги**:
1. Открыть ленту
2. Закрыть вкладку
3. Открыть снова через 5 минут

**Ожидание**:
- WebSocket переподключается
- П��дписка на события восстановлена
- Или fallback на polling (GET /feed/new каждые 30с)

---

### TC-009: Pinned post на Media
**Шаги**:
1. Закрепить пост с изображением
2. Перейти на вкладку "Media"

**Ожидание**:
- Pinned пост показывается сверху (только если есть медиа)
- Если пост без медиа → не показывается на Media

---

### TC-010: Churn (отмена подписки)
**Шаги**:
1. Подписаться на @author за $29/mo
2. Сразу отменить подписку
3. Проверить доступ к платным постам

**Ожидание**:
- Доступ сохраняется до конца оплаченного периода (nextBillingDate)
- Toast: "Subscription cancelled. Access until Feb 1"

---

### TC-011: Hot score для старого поста
**Данные**:
- Post A: 7 дней назад, 10K лайков
- Post B: 1 час назад, 500 лайков

**Ожидание**:
- Post B выше в Hot (decay сильнее для старого)
- Hot score A ≈ 10000×0.135 = 1350
- Hot score B ≈ 500×0.96 = 480
- Стоп, A выше? Проверить формулу!

---

## Метрики успеха

**Функциональность**:
- ✅ 100% Acceptance Criteria PASS
- ✅ 0% Edge Cases FAIL
- ✅ Coverage: >80% (unit + integration)

**Производительность**:
- Hot Score сортировка < 50ms (для 100 постов)
- GatingCheck < 100ms (с кешем)
- PaymentModal открывается < 200ms

**UX**:
- Optimistic update < 100ms (unlock, subscribe, follow)
- Новые посты появляются < 500ms после клика
- Модалы закрываются плавно (300ms transition)

**Аналитика**:
- 100% событий треккаются (post_create, unlock, subscribe...)
- Нет потери событий при ошибках сети

---

## Тестовое окружение

**Dev**:
- Mock API (локальные Set'ы)
- Mock WebSocket (setInterval)
- Console логи аналитики

**Staging**:
- Реальный API (Supabase)
- WebSocket сервер (Redis pub/sub)
- GA тестовый аккаунт

**Production**:
- Prod API
- Prod WebSocket
- GA production ID

---

## Автоматизация

**Unit тесты** (Jest):
```bash
npm run test:unit
```

**Integration тесты** (React Testing Library):
```bash
npm run test:integration
```

**E2E тесты** (Playwright):
```bash
npm run test:e2e
```

**CI/CD**:
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run build
```

---

## Баг-репорты (шаблон)

```markdown
**Заголовок**: [BUG] GatedContent не скрывается после unlock

**Шаги**:
1. Открыть платный пост
2. Кликнуть "Unlock for $9"
3. Успешная оплата
4. Проверить UI

**Ожидание**: GatedContent скрывается, контент показывается
**Реальность**: GatedContent остаётся, контент не виден
**Воспроизводится**: Всегда
**Версия**: v1.2.0
**Browser**: Chrome 120
**Screenshot**: [прикрепить]

**Console**:
```
POST /purchases 200 OK
{ purchaseId: "pur-123", status: "success" }
```

**Fix**: Добавить `unlockPost(postId)` после успешной оплаты
```

---

## Итого

**План**:
1. **M0**: Ручное тестирование AC (1 день)
2. **M1**: Unit тесты (3 дня)
3. **M2**: Integration тесты (5 дней)
4. **M3**: E2E тесты (7 дней)
5. **M4**: Автоматизация CI/CD (2 дня)

**Команда**:
- QA Lead: координация, тест-планы
- QA Engineer × 2: ручное + авто
- Developer: фиксы багов

**Статус**: 🟢 Ready to start
