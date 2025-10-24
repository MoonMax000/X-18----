# Composer Architecture

## 📋 Overview

Рефакторинг системы создания постов для унификации функциональности между QuickComposer (/feedtest) и CreatePostModal (модальное окно).

## 🏗️ Структура

```
client/features/feed/components/composers/
├── QuickComposer.tsx              # Основной композер ��а странице /feedtest
├── shared/                        # Переиспользуемые компоненты
│   ├── ComposerMetadata.tsx      # Метаданные: Market, Category, Symbol, Timeframe, Risk
│   ├── ComposerToolbar.tsx       # Тулбар: Media, Emoji, Code, Sentiment, Paid
│   ├── ComposerFooter.tsx        # Футер: Counter + Post button + Reply settings
│   └── index.ts                   # Экспорты
└── QuickComposer.backup.tsx      # Резервная копия старой версии

client/components/CreatePostBox/
├── CreatePostModal/
│   └── CreatePostModal.tsx        # Модальное окно для создания постов
├── useSimpleComposer.ts           # Упрощенный хук для одного блока
└── CreatePostModal.backup.tsx     # Резервная копия старой версии
```

## 🎯 Ключевые решения

### 1. Единая логика

**Хук**: `useSimpleComposer`
- Заменяет `useAdvancedComposer`
- Поддерживает только **один блок** (убрана multi-block логика)
- Управляет состоянием: text, media, codeBlocks, sentiment, replySetting

**Использ��ется в**:
- QuickComposer (страница /feedtest)
- CreatePostModal (модальное окно)

### 2. Общие UI компоненты

#### ComposerMetadata
```typescript
<ComposerMetadata
  visible={text.length > 0}
  market={postMarket}
  category={postCategory}
  symbol={postSymbol}
  timeframe={postTimeframe}
  risk={postRisk}
  onMarketChange={setPostMarket}
  onCategoryChange={setPostCategory}
  onSymbolChange={setPostSymbol}
  onTimeframeChange={setPostTimeframe}
  onRiskChange={setPostRisk}
/>
```

**Функциональность**:
- Market selector (Crypto, Stocks, Forex, Commodities, Indices)
- Category selector (Signal, News, Education, Analysis, Macro, Code, Video, General)
- Symbol input (BTC, ETH, etc.)
- Timeframe selector (15m, 1h, 4h, 1d, 1w)
- Risk level selector (Low, Medium, High)

#### ComposerToolbar
```typescript
<ComposerToolbar
  onMediaClick={() => mediaInputRef.current?.click()}
  onDocumentClick={() => documentInputRef.current?.click()}
  onVideoClick={() => videoInputRef.current?.click()}
  onCodeBlockClick={() => setIsCodeBlockOpen(true)}
  onEmojiClick={() => setIsEmojiPickerOpen(true)}
  onBoldClick={handleBoldToggle}
  isBoldActive={isBoldActive}
  sentiment={sentiment}
  onSentimentChange={setSentiment}
  isPaid={isPaid}
  onPaidChange={setIsPaid}
/>
```

**Функциональность**:
- Media buttons (Photos, Documents, Videos)
- Code block button
- Emoji picker button
- Bold text toggle
- Sentiment buttons (Bullish/Bearish)
- Paid toggle

#### ComposerFooter
```typescript
<ComposerFooter
  charRatio={charRatio}
  remainingChars={remainingChars}
  isNearLimit={isNearLimit}
  isOverLimit={isOverLimit}
  canPost={canPost}
  onPost={handlePost}
  showReplySettings={true}              // Опционально для модала
  replySummary={replySummary}
  onReplyClick={handleReplyButtonClick}
  isPosting={isPosting}
/>
```

**Функциональность**:
- Character counter (круговой индикатор)
- Post button с градиентом
- Reply settings button (опционально для модала)

### 3. Убранный функционал

#### ❌ Multi-block threads
- **Было**: Поддержка создания цепочек постов (threads)
- **Стало**: Только один блок
- **Причина**: Упрощение UX и кода

#### ❌ Drafts система
- **Было**: Автосохранение черновиков с localStorage
- **Стало**: Предупреждение при закрытии с несохраненн��м контентом
- **Причина**: Упрощение, меньше состояния

### 4. Новый функционал

#### ✅ Предупреждение при закрытии

CreatePostModal теперь показывает предупреждение:
```typescript
const handleClose = useCallback(() => {
  if (text.trim().length > 0 || media.length > 0 || codeBlocks.length > 0) {
    const confirmed = window.confirm(
      'You have unsaved changes. Are you sure you want to close? Your post will not be saved.'
    );
    if (!confirmed) return;
  }
  onClose();
}, [text, media, codeBlocks, onClose]);
```

#### ✅ Метаданные везде

Теперь метаданные (Market, Category, Symbol, Timeframe, Risk) доступны:
- ✅ На странице /feedtest (QuickComposer)
- ✅ В модальном окне (CreatePostModal)

#### ✅ Keyboard shortcuts

CreatePostModal:
- `Esc` - закрыть модал
- `Cmd/Ctrl + Enter` - опубликовать пост

## 🔄 Сравнение: До и После

### Было (useAdvancedComposer)
```typescript
const composer = useAdvancedComposer();
// Массив блоков
composer.blocks // Block[]
composer.addBlock()
composer.deleteBlock(id)
composer.activeBlockId
```

### Стало (useSimpleComposer)
```typescript
const composer = useSimpleComposer();
// Один блок
composer.text
composer.media
composer.codeBlocks
composer.updateText()
composer.addMedia()
```

## 📊 Преимущества

### 1. DRY (Don't Repeat Yourself)
- Один `ComposerFooter` вместо дублирования в QuickComposer и CreatePostModal
- Один `ComposerMetadata` для обоих композеров
- Один `ComposerToolbar` для всех инструментов

### 2. Единообразие
- Одинаковый UI везде
- Одинаковая логика
- Одинаковые фичи (метаданные, sentiment, paid)

### 3. Легкость поддержки
- Изменения в одном месте (`shared/`)
- Меньше кода для ревью
- Проще тестировать

### 4. Упрощение
- Убраны неиспользуемые фичи (multi-block, drafts)
- Меньше состояния для управления
- Чище код

## 🚀 Использование

### QuickComposer на странице

```typescript
import QuickComposer from "@/features/feed/components/composers/QuickComposer";

<QuickComposer onExpand={(data) => console.log(data)} />
```

### CreatePostModal в приложении

```typescript
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal/CreatePostModal";

<CreatePostModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  initialText="Optional initial text"
  initialSentiment="bullish"
/>
```

## 🔧 Технические детали

### Character Limit
- По умолчанию: 300 символов
- Настраивается через `useSimpleComposer({ charLimit: 500 })`

### Media Limits
- Максимум 4 фото/видео
- Поддерживаемые форматы:
  - Изображения: image/*
  - Документы: .pdf, .doc, .docx, .ppt, .pptx, .txt, .xls, .xlsx
  - Видео: .mp4, .webm, .mov, .avi

### Reply Settings
- Everyone (по умолчанию)
- Accounts you follow
- Verified accounts
- Only accounts you mention

## 📝 Migration Guide

### Если вы использовали старый API

**Было**:
```typescript
const { blocks, activeBlockId, addBlock } = useAdvancedComposer();
```

**Стало**:
```typescript
const { text, updateText, media, addMedia } = useSimpleComposer();
```

### Если создавали кастомный композер

Используйте shared компоненты:
```typescript
import { ComposerMetadata, ComposerToolbar, ComposerFooter } from '@/features/feed/components/composers/shared';

function MyComposer() {
  const composer = useSimpleComposer();
  
  return (
    <>
      <Textarea value={composer.text} onChange={e => composer.updateText(e.target.value)} />
      <ComposerToolbar {...toolbarProps} />
      <ComposerMetadata {...metadataProps} />
      <ComposerFooter {...footerProps} />
    </>
  );
}
```

## 🐛 Troubleshooting

### Импорты не работают

Проверьте пути:
```typescript
// Correct
import { ComposerMetadata } from '@/features/feed/components/composers/shared';

// Wrong
import { ComposerMetadata } from '@/features/feed/components/composers/ComposerMetadata';
```

### useSimpleComposer не найден

Проверьте импорт:
```typescript
import { useSimpleComposer } from '@/components/CreatePostBox/useSimpleComposer';
```

## 📦 Резервные копии

Старые версии сохранены:
- `QuickComposer.backup.tsx`
- `CreatePostModal.backup.tsx`

Для отката:
```bash
mv client/features/feed/components/composers/QuickComposer.backup.tsx client/features/feed/components/composers/QuickComposer.tsx
mv client/components/CreatePostBox/CreatePostModal/CreatePostModal.backup.tsx client/components/CreatePostBox/CreatePostModal/CreatePostModal.tsx
```

## 🎉 Результат

- ✅ Единая логика создания постов
- ✅ Одинаковый функционал везде
- ✅ Переиспользуемые компоненты
- ✅ Упрощенная архитектура
- ✅ Меньше кода для поддержки
- ✅ Предупреждение при потере данных
- ✅ Метаданные доступны везде
