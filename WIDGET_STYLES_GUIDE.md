# Widget Styles Guide

This document explains the centralized widget styling system.

## Overview

All widget styles are now managed through `client/lib/widget-styles.ts`. This provides a single source of truth for:
- Border colors
- Background colors
- Gradients
- Shadows
- Common class combinations

## Usage

### Import the styles

```typescript
import { WIDGET_STYLES, WIDGET_CLASSES, WIDGET_PRESETS } from '@/lib/widget-styles';
```

### Using preset combinations

```typescript
// Standard widget
<div className={WIDGET_PRESETS.standard.container}>
  <div className={WIDGET_PRESETS.standard.header}>
    <h2 className={WIDGET_PRESETS.standard.title}>Widget Title</h2>
  </div>
</div>

// Compact widget
<div className={WIDGET_PRESETS.compact.container}>
  Content
</div>
```

### Using individual values

```typescript
// Custom border
<div className={`border border-[${WIDGET_STYLES.border.primary}]`}>
  Content
</div>

// Custom background
<div className={`bg-[${WIDGET_STYLES.background.card}]`}>
  Content
</div>
```

### Using helper functions

```typescript
import { getWidgetBorder, getWidgetBackground } from '@/lib/widget-styles';

// Adjust opacity
<div className={`${getWidgetBorder(0.85)} ${getWidgetBackground(0.60)}`}>
  Content with custom opacity
</div>
```

## Color Values

### Borders
- **Primary**: `rgba(24,27,34,0.95)` - Main widget borders
- **Secondary**: `#2F3240` - Hover state borders
- **Accent**: `#A06AFF` - Active/focus state

### Backgrounds
- **Card**: `rgba(12,16,20,0.50)` - Main card background
- **Card Alt**: `rgba(12,16,20,0.55)` - Alternative card background
- **Card Light**: `rgba(12,16,20,0.40)` - Lighter card background
- **Card Dark**: `rgba(12,16,20,0.65)` - Darker card background
- **Hover**: `rgba(18,22,28,0.8)` - Hover state background
- **Black**: `#0B0E13` - Pure black

## Modifying Global Styles

To change widget styles across the entire application:

1. Open `client/lib/widget-styles.ts`
2. Modify the values in `WIDGET_STYLES` object
3. All components using these styles will automatically update

Example - make borders 10% more transparent:
```typescript
border: {
  primary: 'rgba(24,27,34,0.85)', // Changed from 0.95
  // ...
}
```

## Migration Guide

To migrate existing components to use centralized styles:

### Before:
```typescript
<div className="rounded-3xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]">
```

### After:
```typescript
import { WIDGET_PRESETS } from '@/lib/widget-styles';

<div className={WIDGET_PRESETS.standard.container}>
```

## Components Using This System

Current components that should use widget-styles:
- UserInfoCards
- CreatePostBox
- UserTabs
- UserMarketsCard
- PortfolioCard
- ActivityCard
- ProductsCard
- UserHeader
- Pagination

## Benefits

1. **Consistency**: All widgets use the same styling values
2. **Easy Updates**: Change styles in one place
3. **Type Safety**: TypeScript ensures correct usage
4. **Maintainability**: Clear, documented styling system
5. **Performance**: No duplicate style definitions
