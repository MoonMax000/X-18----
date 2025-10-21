# Feed Styles System

Централизованная система стилей для всех компонентов Feed.

## 📁 Структура

```
styles/
├── index.ts       # Экспорт всех стилей
├── tokens.ts      # Цвета, градиенты, тени, размеры
├── variants.ts    # Готовые варианты для компонентов
└── README.md      # Документация (этот файл)
```

## 🎨 Использование

### 1. Импорт стилей

```tsx
import { COLORS, GRADIENTS, BUTTON_VARIANTS } from '@/features/feed/styles';
```

### 2. Использование токенов

```tsx
// Цвета
<div style={{ color: COLORS.accent.purple.light }}>...</div>

// Градиенты (Tailwind классы)
<button className={GRADIENTS.primary}>Primary Button</button>
```

### 3. Использование вариантов

```tsx
// Кнопки
<button className={BUTTON_VARIANTS.primary}>Click me</button>
<button className={BUTTON_VARIANTS.follow}>Follow</button>

// С условием
<button className={isActive ? BUTTON_VARIANTS.bullish(true) : BUTTON_VARIANTS.bullish(false)}>
  Bullish
</button>

// Карточки
<div className={CARD_VARIANTS.widget.default}>...</div>

// Табы
<button className={TAB_VARIANTS.item(isActive, isAll)}>Tab</button>
```

## 🔧 Доступные токены

### COLORS
- `background.*` - фоновые цвета
- `text.*` - цвета текста
- `accent.*` - акцентные цвета (purple, blue)
- `sentiment.*` - цвета для bullish/bearish
- `border.*` - цвета границ

### GRADIENTS
- `primary` - основной фиолетовый градиент
- `bullish` - зелёный градиент
- `bearish` - красный градиент
- `hot` / `recent` - для фильтров
- `paid` - для платного контента

### SHADOWS
- `widget` - тень для виджетов
- `purple*` - фиолетовые тени для кнопок
- `glow` - эффект свечения

### RADIUS
- `widget.*` - радиусы для виджетов
- `button.*` - радиусы для кнопок
- `dropdown` - для выпадающих меню

## 📦 Доступные варианты

### BUTTON_VARIANTS
- `primary` - основная кнопка
- `primaryDisabled` - неактивная кнопка
- `outline` - кнопка с обводкой
- `ghost` - прозрачная кнопка
- `follow` / `following` - кнопки подписки
- `bullish(active)` / `bearish(active)` - переключатели sentiment
- `paid(active)` - переключатель платности

### CARD_VARIANTS
- `widget.default` / `widget.compact` - карточки виджетов
- `composer` - карточка композера
- `dropdown` - выпадающие меню
- `modal` - модальные окна

### TAB_VARIANTS
- `container` - контейнер для вкладок
- `item(isActive, isAll)` - вкладка

### FILTER_VARIANTS
- `label` - подписи фильтров
- `trigger` - кнопка триггера фильтра
- `option(isActive)` - опция фильтра
- `toggle(isActive, variant)` - переключатель Hot/Recent

### CODE_BLOCK_VARIANTS
- `container` - контейнер блока кода
- `header` - заголовок
- `language` - язык программирования
- `removeButton` - кнопка удаления
- `content` - содержимое кода

### WIDGET_VARIANTS
- `header` - заголовок виджета
- `subtitle` - подзаголовок
- `showMore` - кнопка "Show more"
- `ticker(isSelected)` - элемент тикера

## ✏️ Как изменить стили

### Изменить цвет

В `tokens.ts`:
```ts
export const COLORS = {
  accent: {
    purple: {
      light: "#NEW_COLOR", // ← Измените здесь
      // ...
    }
  }
}
```

### Изменить вариант кнопки

В `variants.ts`:
```ts
export const BUTTON_VARIANTS = {
  primary: `... YOUR_NEW_STYLES ...`, // ← Измените здесь
}
```

### Добавить новый вариант

В `variants.ts`:
```ts
export const BUTTON_VARIANTS = {
  // ... существующие
  myNewVariant: "rounded-full bg-blue-500 text-white", // ← Добавьте здесь
}
```

## 🚀 М��грация старых компонентов

### До:
```tsx
<button className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white">
  Click
</button>
```

### После:
```tsx
import { BUTTON_VARIANTS } from '@/features/feed/styles';

<button className={BUTTON_VARIANTS.primary}>
  Click
</button>
```

## 💡 Преимущества

✅ **Централизация** - все стили в одном месте  
✅ **Консистентность** - одинаковые стили везде  
✅ **Легко менять** - изменили в одном месте = изменилось везде  
✅ **TypeScript** - автодополнение и проверка типов  
✅ **Документировано** - понятно что и для чего  
✅ **Переиспользуемость** - не нужно дублировать код
