# UserHoverCard - Визуальный пример

## Структура всплывающей карточки (как в Twitter)

```
┌─────────────────────────────────────┐
│  🖼️  Alex Trader         [Follow]  │
│      @alextrader          ✓         │
│                                     │
│  Professional swing trader | 8+    │
│  years experience | Sharing        │
│  technical analysis & insights     │
│                                     │
│  1.2K Following    45.2K Followers │
└─────────────────────────────────────┘
```

## Компоненты карточки

### 1. Шапка (Header)
- Аватар (52x52px)
- Имя пользователя
- Верификационный бейдж (если verified)
- Кнопка Follow/Unfollow

### 2. Био (Bio) - НОВОЕ!
- Краткое описание профиля
- До 160 символов (рекомендация)
- Отображается только если заполнено
- Стиль: `text-white/80`, `text-sm`

### 3. Статистика (Footer)
- Following count (сколько подписок)
- Followers count (сколько подписчиков)
- Форматирование: K для тысяч, M для миллионов

## Реальные примеры из моков

### Alex Trader
```
Bio: "Professional swing trader | 8+ years experience | 
      Sharing technical analysis & market insights"
Followers: 45.2K
Following: 1.2K
```

### Crypto Whale
```
Bio: "Early Bitcoin adopter | Crypto analyst since 2013 | 
      Not financial advice"
Followers: 128K
Following: 320
```

### Algo Dev
```
Bio: "Quantitative developer | Building algo trading systems | 
      Python & ML enthusiast"
Followers: 32.5K
Following: 890
```

### Market News
```
Bio: "Breaking market news & economic updates | 
      Real-time coverage of global markets"
Followers: 256K
Following: 150
```

### Tech Analyst
```
Bio: "Technical analysis expert | Chart patterns & indicators | 
      10k+ followers"
Followers: 18.9K
Following: 450
```

## CSS классы для Bio

```tsx
<p className="mt-3 text-sm leading-relaxed text-white/80">
  {author.bio}
</p>
```

- `mt-3` - отступ сверху от шапки
- `text-sm` - размер текста 14px
- `leading-relaxed` - увеличенная высота строки для читабельности
- `text-white/80` - белый цвет с 80% прозрачности

## Поведение

1. **Есть Bio**: отображается между шапкой и статистикой
2. **Нет Bio**: блок не рендерится, статистика идет сразу после шапки
3. **Длинный Bio**: автоматически переносится на новые строки
4. **Пустой Bio**: не занимает место (условный рендеринг)

## Интеграция

Bio автоматически подтягивается из данных автора:

```tsx
<AvatarWithHoverCard
  author={{
    name: "Alex Trader",
    handle: "@alextrader",
    avatar: "/avatar.jpg",
    bio: "Your bio here...",  // ← Новое поле
    followers: 45200,
    following: 1250,
  }}
>
  {children}
</AvatarWithHoverCard>
```

## Best Practices для Bio

1. **Длина**: 80-160 символов оптимально
2. **Формат**: Используйте | для разделения пунктов
3. **Содержание**: Кто вы + чем занимаетесь + ценность
4. **Эмодзи**: Можно, но умеренно
5. **Ссылки**: Избегайте URL в bio (есть отдельное поле website)

### ✅ Хорошие примеры:
```
"Professional trader | 8+ years | Sharing insights"
"Crypto analyst since 2013 | Not financial advice"
"Python dev | Building algo systems | ML enthusiast"
```

### ❌ Плохие примеры:
```
"Hey! I'm a trader and I love trading stocks and crypto and..."  (слишком длинно)
"Trader"  (слишком коротко, нет контекста)
"Check out my website https://example.com for more info"  (URL лучше в отдельное поле)
```

## Адаптивность

Bio автоматически адаптируется к ширине hover card (320px):
- Многострочный текст с переносами
- Отступы сохраняются на всех экранах
- Читабельность на темном фоне
