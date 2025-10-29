# План улучшения Crop функциональности

## Фаза 1: Изменяемая рамка обрезки (Resizable Crop Frame)

### 1.1 Архитектура
- Добавить state для размеров рамки: `frameWidth`, `frameHeight`
- Создать систему resize handles (8 точек: 4 угла + 4 стороны)
- Добавить state для активного handle: `activeHandle`
- Реализовать систему ограничений (constraints)

### 1.2 Визуальные элементы
```tsx
// Структура handles
type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

// Позиции handles
const handlePositions = {
  n: { cursor: 'ns-resize', top: -4, left: '50%', transform: 'translateX(-50%)' },
  ne: { cursor: 'nesw-resize', top: -4, right: -4 },
  e: { cursor: 'ew-resize', top: '50%', right: -4, transform: 'translateY(-50%)' },
  // ... и так далее
};
```

### 1.3 Логика изменения размера
- При drag handle: обновлять размеры рамки
- Сохранять соотношение сторон при зажатом Shift
- Ограничения: рамка не может выйти за границы изображения
- Минимальный размер рамки: 50x50px

## Фаза 2: Визуальные улучшения

### 2.1 Затемнение области вне рамки
```css
/* Overlay с вырезом для рамки */
.crop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

/* Используем clip-path или mask для вырезания области рамки */
```

### 2.2 Визуальная обратная связь
- Показывать размеры рамки при изменении (tooltip)
- Подсвечивать активный handle
- Анимировать переходы между пресетами
- Показывать сетку Rule of Thirds только при драге

### 2.3 Улучшенные курсоры
- grab/grabbing для перемещения изображения
- resize курсоры для handles
- not-allowed когда достигнуты границы

## Фаза 3: Управление состоянием

### 3.1 Отслеживание изменений
```tsx
// Добавить state
const [hasChanges, setHasChanges] = useState(false);
const [initialState, setInitialState] = useState<CropState | null>(null);

// Сравнение текущего состояния с исходным
const checkForChanges = () => {
  return JSON.stringify(currentState) !== JSON.stringify(initialState);
};
```

### 3.2 Кнопка "Сохранить"
- Активна только когда `hasChanges === true`
- Добавить визуальную индикацию (opacity, cursor)
- При сохранении обновлять `initialState`

### 3.3 Сохранение состояния рамки для пресетов
```tsx
// Расширить presetTransforms
presetTransforms.current[preset] = {
  zoom,
  x,
  y,
  frameWidth,
  frameHeight,
  frameX,
  frameY
};
```

## Фаза 4: Улучшенная математика

### 4.1 Минимальный зум
```tsx
const calculateMinZoom = () => {
  // Минимальный зум = когда изображение полностью помещается в рамку
  const frameAspect = frameWidth / frameHeight;
  const imageAspect = naturalWidth / naturalHeight;
  
  if (imageAspect > frameAspect) {
    // Изображение шире - подгоняем по ширине
    return frameWidth / naturalWidth;
  } else {
    // Изображение выше - подгоняем по высоте
    return frameHeight / naturalHeight;
  }
};
```

### 4.2 Правильный расчет cropRect
```tsx
const calculateCropRect = () => {
  // Учитывать положение и размер рамки
  // Конвертировать координаты экрана в координаты изображения
  // Учитывать текущий зум и смещение
};
```

### 4.3 Поддержка произвольных соотношений
- Свободное изменение размера рамки
- Фиксированные соотношения: 1:1, 4:3, 16:9, 9:16
- Переключение между режимами

## Фаза 5: UX улучшения

### 5.1 Клавиатурное управление
- Arrow keys: перемещение изображения (по 10px)
- Shift + Arrow: быстрое перемещение (по 50px)
- +/- : изменение зума
- Enter: сохранение
- Escape: отмена

### 5.2 Touch поддержка
- Pinch to zoom на мобильных устройствах
- Touch drag для перемещения
- Двойной тап для сброса зума

### 5.3 Дополнительные функции
- Кнопка "Reset" для сброса к исходному состоянию
- Кнопка поворота изображения (90°)
- История изменений (undo/redo)

## Техническая реализация

### State структура
```tsx
interface CropState {
  // Изображение
  zoom: number;
  translateX: number;
  translateY: number;
  rotation: number;
  
  // Рамка
  frameX: number;
  frameY: number;
  frameWidth: number;
  frameHeight: number;
  
  // Режим
  aspectRatio: 'free' | '1:1' | '4:3' | '16:9' | '9:16';
  isResizing: boolean;
  isDragging: boolean;
  activeHandle: ResizeHandle | null;
}
```

### Порядок реализации
1. Базовая изменяемая рамка
2. Визуальные улучшения (затемнение, feedback)
3. Управление состоянием и валидация
4. Математические улучшения
5. UX функции и полировка

## Ожидаемый результат
- Полнофункциональный crop editor уровня Twitter/Instagram
- Интуитивное управление мышью и клавиатурой
- Визуальная обратная связь на все действия
- Правильные математические расчеты
- Отличная производительность
