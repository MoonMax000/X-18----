# Composer Research Summary & Action Plan

## 📋 Статус текущего композитора

### Архитектурное состояние

**✅ Правильно спроектировано:**
- Целевая архитектура: `useSimpleComposer` + общие `shared/` компоненты (Toolbar/Metadata/Footer)
- Система монетизации: 5 типов доступа через `AccessTypeModal`
- Backend модель готова: поля `IsPremium`, `PriceCents`, `access_level`

**⚠️ Требует внимания:**
- Сосуществуют ДВЕ ветки: "advanced" (черновики/мульти-блоки) vs "simple" (целевая)
- Нужно проверить импорты - должна использоваться НОВАЯ модалка, не backup

---

## 🐛 Выявленные технические проблемы

### 1. Подсчёт символов с эмодзи
**Проблема:** `.length` считает неправильно для эмодзи (1 эмодзи = 2-4 юникод-юнита)
**Решение:** Использовать `Intl.Segmenter` для графемного подсчёта

### 2. Bold функционал
**Проблема:** Нет реализации Bold в textarea
**Решение:** Markdown обёртка `**text**` без WYSIWYG

### 3. Вставка эмодзи
**Проблема:** Вставка в конец, а не в позицию курсора
**Решение:** Вставка через `selectionStart/selectionEnd` с восстановлением каретки

### 4. Документ-превью
**Проблема:** Базовое отображение, нет PDF миниатюр
**Решение:** Ленивая загрузка `pdfjs-dist`, иконки по типам, размер файла

### 5. Валидация метаданных
**Проблема:** Нет проверки обязательных полей по категориям
**Решение:** 
- Market + Category всегда обязательны
- Signal требует: Symbol, Timeframe, Risk
- Education: Symbol опционален
- News: Symbol опционален, Market обязателен

### 6. Лимит медиа
**Проблема:** Проверка ≤4 только на фронте
**Решение:** Дублировать валидацию на бэкенде

### 7. Reply Settings vs Visibility
**Проблема:** Смешиваются две оси
**Решение:** Разделить `reply_policy` (кто отвечает) vs `access_level` (кто видит)

---

## 🛠️ Готовые решения из исследования

### Утилиты (client/utils/composerText.ts)
```typescript
// Правильный подсчёт с эмодзи
export function countGraphemes(str: string): number

// Вставка в позицию курсора
export function insertAtCaret(ta: HTMLTextAreaElement, insert: string)

// Bold через Markdown
export function toggleBoldSelection(ta: HTMLTextAreaElement)
```

### Валидация (client/components/CreatePostBox/usePostValidation.ts)
```typescript
export function usePostValidation({
  text, mediaCount, accessType, price, meta
}): {
  violations, canPost, charCount, remaining,
  charRatio, isNearLimit, isOverLimit
}
```

### UI компоненты

**MediaGrid** - резиновая сетка `auto-fit minmax(140px,1fr)`
```typescript
<MediaGrid items={media} onRemove={removeMedia} onClick={openMedia} />
```

**DocumentPreview** - с PDF миниатюрами
```typescript
<DocumentPreview docs={docs} onRemove={removeDoc} onOpen={openDoc} />
```

**AutoGrowTextarea** - авто-ресайз как в Twitter
```typescript
<AutoGrowTextarea minRows={2} maxRows={12} textareaRef={ref} />
```

**EmojiPickerOverlay** - портал, клавиатура, z-index 2100
```typescript
<EmojiPickerOverlay 
  anchorRef={buttonRef} 
  isOpen={isOpen} 
  textareaRef={taRef}
  onChangeText={setText}
/>
```

**ReplySettingsMenu** - отдельное меню с accessibility
```typescript
<ReplySettingsMenu
  anchorRef={buttonRef}
  isOpen={isOpen}
  value={replyPolicy}
  onChange={setReplyPolicy}
/>
```

### Система доступа

**Payload builder**
```typescript
export function buildCreatePostPayload({
  text, media, codeBlocks, replySetting, sentiment,
  meta, accessType, price
}): CreatePostPayload

// Маппинг
const accessLevelMap = {
  'free': 'public',
  'pay-per-post': 'paid',
  'subscribers-only': 'subscribers',
  'followers-only': 'followers',
  'premium': 'premium',
}
```

### Дополнительные хуки

**useFileAttachments** - валидация, лимиты, ревокация URL
```typescript
const { media, docs, errors, canAddMoreMedia, addFiles, removeMedia, removeDoc } 
  = useFileAttachments()
```

**useIMEAwareHotkeys** - Cmd/Ctrl+Enter без конфликтов IME
```typescript
useIMEAwareHotkeys({
  onModEnter: () => handlePost(),
  onModB: () => handleBoldToggle(),
  onEsc: () => onClose(),
}, { enabled: isOpen })
```

**useToast** - тост-центр
```typescript
const toast = useToast()
toast.success('Posted!')
toast.error('Failed to post', error.message)
```

### AccessTypeModal улучшения
- Price presets: $5 / $9.99 / $19.99
- Быстрые кнопки-пилюли для выбора цены

---

## 🎯 Рекомендуемый план внедрения

### Фаза 1: Критичные фиксы (1-2 дня)
- [ ] Внедрить правильный подсчёт символов с эмодзи (`countGraphemes`)
- [ ] Реализовать Bold функционал (`toggleBoldSelection`)
- [ ] Исправить вставку эмодзи по каретке (`insertAtCaret`)
- [ ] Добавить валидацию метаданных (`usePostValidation`)
- [ ] Проверить импорты - убрать "advanced" ветку

### Фаза 2: UX улучшения (2-3 дня)
- [ ] Внедрить `AutoGrowTextarea`
- [ ] Обновить `MediaGrid` с резиновой сеткой
- [ ] Улучшить `DocumentPreview` с PDF миниатюрами
- [ ] Добавить `ReplySettingsMenu` как отдельную ось

### Фаза 3: Монетизация E2E (3-5 дней)
- [ ] Полный payload с 5 типами доступа
- [ ] Backend валидации и эндпоинты
- [ ] Purchase flow (`POST /posts/:id/purchase`)
- [ ] Бейджи и состояния (locked/unlocked) в ленте

### Фаза 4: Полировка (1-2 дня)
- [ ] Price presets в `AccessTypeModal`
- [ ] `useToast` для feedback
- [ ] `useFileAttachments` для безопасной работы с файлами
- [ ] E2E тесты

---

## 📁 Структура файлов

### Создать новые файлы:
```
client/utils/composerText.ts
client/components/CreatePostBox/usePostValidation.ts
client/components/CreatePostBox/payload.ts
client/components/composer/AutoGrowTextarea.tsx
client/components/composer/useFileAttachments.ts
client/hooks/useIMEAwareHotkeys.ts
client/ui/toast/useToast.tsx
client/api/types.ts
client/api/posts.ts
```

### Обновить существующие:
```
client/components/CreatePostBox/MediaGrid.tsx
client/components/CreatePostBox/DocumentPreview.tsx
client/features/feed/components/composers/shared/EmojiPickerOverlay.tsx
client/features/feed/components/composers/shared/ReplySettingsMenu.tsx
client/features/feed/components/composers/shared/AccessTypeModal.tsx
client/features/feed/components/composers/QuickComposer.tsx (или .READY)
client/components/CreatePostBox/CreatePostModal.tsx
```

---

## ⚙️ Backend требования

### Новые поля в модели Post:
```go
AccessLevel  string  // "public" | "paid" | "subscribers" | "followers" | "premium"
PriceCents   int     // для paid постов
ReplyPolicy  string  // "everyone" | "following" | "verified" | "mentioned"
```

### Валидации:
- text ≤ 300 символов (или согласовать с фронтом)
- media ≤ 4 элемента
- для paid: price обязателен, ≥ 0
- метаданные: market + category обязательны, плюс правила по категориям

### Новые эндпоинты:
```
POST /posts/:id/purchase  - Покупка платного поста
GET  /posts/:id          - Возвращать isPurchased, isSubscriber, isOwnPost
```

### Проверка доступа (псевдокод):
```go
func CanAccessPost(post Post, user User) bool {
  if post.UserID == user.ID { return true }
  
  switch post.AccessLevel {
    case "public": return true
    case "paid": return HasPurchased(user, post)
    case "subscribers": return IsSubscribed(user, post.UserID)
    case "followers": return IsFollowing(user, post.UserID)
    case "premium": return user.IsPremium
  }
}
```

---

## 🎨 Z-index иерархия (соблюдать!)

```
AccessTypeModal:  z-[2500]  (самый верх)
Popovers/Emoji:   z-[2100]  (над модалкой)
CreatePostModal:  z-[2000]  (база)
```

---

## 📝 Ключевые правила

1. **Единый источник правды:** `useSimpleComposer` везде
2. **Без черновиков:** целевая архитектура без локальных драфтов
3. **Модальный UX доступа:** выбор только через `AccessTypeModal`, не в тулбаре
4. **Цена только для paid:** в остальных типах price = null
5. **Графемный счётчик:** всегда использовать `countGraphemes`, не `.length`
6. **Резиновая вёрстка:** `auto-fit minmax()`, `min-w-0`, `break-words`, `overflow-hidden`
7. **Reply ≠ Visibility:** разные оси, разные контролы

---

## 🚀 Статус

**Исследование завершено:** Все решения готовы, код проверен  
**Следующий шаг:** Выбрать фазу и начать внедрение  
**Готовность:** 100% для начала работы

---

*Документ создан: 09.11.2025*  
*На основе: 8 документов детального исследования композитора*
