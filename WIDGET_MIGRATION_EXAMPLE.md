# Widget Styles Migration Example

## Система централизованных стилей

Я создал централизованную систему для управления стилями виджетов:

### Файлы:
1. **`client/lib/widget-styles.ts`** - Основной файл с пресетами и классами
2. **`tailwind.config.ts`** - Добавлены цвета виджетов (widget-border, widget-bg, etc.)
3. **`WIDGET_STYLES_GUIDE.md`** - Документация по использованию

## Как это работает

### Старый подход (проблемный):
```tsx
// Каждый компонент дублируе�� стили
<div className="rounded-3xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]">
```

**Проблемы:**
- Дублирование кода
- Сложно изменить стили глобально
- Легко допустить ошибку в значениях
- Непонятно, какие значения использовать

### Новый подход (централизованный):

#### Способ 1: Используя пресеты
```tsx
import { WIDGET_PRESETS } from '@/lib/widget-styles';

// Стандартный виджет
<div className={WIDGET_PRESETS.standard.container}>
  <div className={WIDGET_PRESETS.standard.header}>
    <h2 className={WIDGET_PRESETS.standard.title}>Title</h2>
  </div>
</div>
```

#### Способ 2: Используя Tailwind классы
```tsx
// Теперь можно использовать короткие классы
<div className="border-widget-border bg-widget-bg">
  Content
</div>
```

#### Способ 3: Комбинированный
```tsx
import { WIDGET_CLASSES } from '@/lib/widget-styles';

<div className={`${WIDGET_CLASSES.card} p-4`}>
  Content
</div>
```

## Пример миграции: UserInfoCards

### До миграции:
```tsx
<div className="flex items-center gap-2 rounded-2xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.55)] px-3 py-2.5 backdrop-blur-[50px] md:px-4 md:py-3">
```

### После миграции:
```tsx
import { WIDGET_PRESETS } from '@/lib/widget-styles';

<div className={WIDGET_PRESETS.compact.container}>
```

**Преимущества:**
- Код короче и понятнее
- Легко изменить стили для всех виджетов сразу
- TypeScript автодополнение
- Нет опечаток в значениях

## Пример миграции: Вкладки (Tabs)

### До:
```tsx
<button
  className={`flex h-10 items-center justify-center rounded-[32px] px-4 py-3 text-[15px] font-bold transition ${
    activeTab === tab
      ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]"
      : "border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] text-white/80 hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)]"
  }`}
>
```

### После:
```tsx
import { WIDGET_PRESETS } from '@/lib/widget-styles';

<button
  className={`${WIDGET_PRESETS.tab.button} ${
    activeTab === tab 
      ? WIDGET_PRESETS.tab.buttonActive 
      : WIDGET_PRESETS.tab.buttonInactive
  }`}
>
```

## Изменение стилей глобально

Теперь чтобы изменить стили всех виджетов:

### Вариант 1: В Tailwind конфиге
```typescript
// tailwind.config.ts
colors: {
  "widget-border": "rgba(24,27,34,0.85)", // Изменили прозрачность
  "widget-bg": "rgba(12,16,20,0.60)",      // Изменили прозрачность
}
```

### Вариант 2: В widget-styles.ts
```typescript
// client/lib/widget-styles.ts
export const WIDGET_COLORS = {
  border: {
    primary: 'rgba(24,27,34,0.85)', // Изменили здесь
  },
}
```

После изменения все компоненты, использующие эту систему, обновятся автоматически!

## Доступные пресеты

### Контейнеры
- `WIDGET_PRESETS.standard.container` - Стандартный виджет
- `WIDGET_PRESETS.compact.container` - Компактный виджет
- `WIDGET_PRESETS.empty.container` - Пустое состояние
- `WIDGET_PRESETS.post.container` - Карточка поста

### Вкладки
- `WIDGET_PRESETS.tab.button` - Базовая кнопка
- `WIDGET_PRESETS.tab.buttonActive` - Активная вкладка
- `WIDGET_PRESETS.tab.buttonInactive` - Неактивная вкладка

### Пагинация
- `WIDGET_PRESETS.pagination.control` - Кнопки навигации
- `WIDGET_PRESETS.pagination.pageButton` - Номер страницы
- `WIDGET_PRESETS.pagination.pageActive` - Активная страница

## Tailwind классы напрямую

Можно использовать прямо в className:
```tsx
<div className="border-widget-border bg-widget-bg">
<div className="bg-widget-bg-alt">
<div className="bg-widget-bg-light">
<div className="hover:border-widget-border-hover">
```

## Следующие шаги

Рекомендую мигрировать компоненты в таком порядке:
1. ✅ Создана система стилей
2. Мигрировать UserInfoCards
3. Мигрировать CreatePostBox
4. Мигрировать UserTabs
5. Мигрировать остальные виджеты на /home

Хотите, чтобы я мигрировал компоненты сейчас?
