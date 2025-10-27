# Обзор системы обработки контента

## Взаимосвязь всех компонентов

Сегодня мы работали над разными, но связанными системами обработки контента.

---

## 1. Crop Preview (только что реализовано) 🖼️

### Что это:
- Превью обрезанных изображений
- Canvas API для создания временного превью
- Blob URL в памяти браузера

### Для чего:
- Показать пользователю как будет выглядеть обрезанное фото
- ДО публикации поста

### Технология:
```javascript
Canvas API → Blob URL → Превью
```

---

## 2. Custom Metadata для постов 📝

### Что это:
Расширенная система для хранения дополнительных данных в постах GoToSocial:

```go
// custom-backend/internal/models/post.go
type Post struct {
    // ... стандартные поля ...
    
    // Кастомные метаданные
    CustomMetadata *CustomMetadata `gorm:"type:jsonb"`
}

type CustomMetadata struct {
    CodeBlocks  []CodeBlock  `json:"code_blocks,omitempty"`
    Documents   []Document   `json:"documents,omitempty"`
    MediaMeta   []MediaMeta  `json:"media_meta,omitempty"`
}
```

### Для чего:
- Прикрепление **кода** к постам (с подсветкой синтаксиса)
- Прикрепление **документов** (PDF, DOCX, etc)
- Хранение **метаданных изображений** (включая crop данные!)

---

## 3. Взаимосвязь систем 🔗

### Как crop preview связан с custom metadata:

```
┌─────────────────────────────────────────────────────────┐
│ ПОЛЬЗОВАТЕЛЬ СОЗДАЕТ ПОСТ                               │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
        ↓                               ↓
┌──────────────┐              ┌──────────────────┐
│ ИЗОБРАЖЕНИЕ  │              │ КОД/ДОКУМЕНТЫ    │
└──────────────┘              └──────────────────┘
        ↓                               ↓
   1. Upload                       1. Attach
   2. Crop (превью)                2. Syntax highlight
   3. Save coords                  3. Save metadata
        ↓                               ↓
        └───────────────┬───────────────┘
                        ↓
        ┌───────────────────────────────┐
        │   POST В БАЗЕ ДАННЫХ          │
        │                               │
        │  {                            │
        │    content: "текст",          │
        │    media: [{                  │
        │      url: "image.jpg",        │
        │      crop: {x,y,w,h}   ← CROP│
        │    }],                        │
        │    custom_metadata: {         │
        │      code_blocks: [...],      │
        │      documents: [...],        │
        │      media_meta: [{           │
        │        crop_data: {...}  ← ТУТ│
        │      }]                       │
        │    }                          │
        │  }                            │
        └───────────────────────────────┘
```

---

## 4. Полная архитектура обработки контента

### A. Изображения (с crop)

```
КЛИЕНТ                          СЕРВЕР
──────────────────────────────────────────────

📷 Выбор фото
   ↓
📤 Upload оригинала ──────────→ 💾 storage/original.jpg
   ↓
🎨 Crop editor
   • react-easy-crop
   • Выбор области
   ↓
🖼️ Canvas превью (blob)
   • Локально в браузере
   • Показ пользователю
   ↓
📊 Координаты обрезки
   {x: 100, y: 50, w: 800, h: 600}
   ↓
📮 Публикация ──────────────→ ✂️ Обработка на сервере:
                                 1. Читает original.jpg
                                 2. Обрезает по координатам
                                 3. Сохраняет cropped.jpg
                                 ↓
                              🗄️ В БД:
                                 {
                                   media_url: "cropped.jpg",
                                   custom_metadata: {
                                     media_meta: [{
                                       original_size: {w, h},
                                       crop_applied: {x,y,w,h},
                                       aspect_ratio: "16:9"
                                     }]
                                   }
                                 }
```

### B. Код (syntax highlighting)

```
КЛИЕНТ                          СЕРВЕР
──────────────────────────────────────────────

💻 Вставка кода
   ↓
🎨 Syntax highlight (локально)
   • Prism.js / highlight.js
   • Превью с подсветкой
   ↓
📮 Публикация ──────────────→ 🗄️ В БД:
                                 {
                                   custom_metadata: {
                                     code_blocks: [{
                                       language: "javascript",
                                       code: "console.log('hi')",
                                       line_numbers: true
                                     }]
                                   }
                                 }
```

### C. Документы (PDF, DOCX)

```
КЛИЕНТ                          СЕРВЕР
──────────────────────────────────────────────

📄 Выбор документа
   ↓
📤 Upload ─────────────────→ 💾 storage/doc.pdf
   ↓                           ↓
📋 Превью (локально)        🔍 Извлечение метаданных:
   • pdf.js для PDF            • Размер файла
   • mammoth для DOCX          • Количество страниц
   ↓                           • Тип документа
📮 Публикация ──────────────→ 🗄️ В БД:
                                 {
                                   custom_metadata: {
                                     documents: [{
                                       url: "doc.pdf",
                                       type: "pdf",
                                       size: 1024000,
                                       pages: 10
                                     }]
                                   }
                                 }
```

---

## 5. Единая структура данных

### Пост с ВСЕМИ типами контента:

```json
{
  "id": "post-123",
  "content": "Мой проект!",
  
  // Основное изображение (с crop)
  "media": [
    {
      "id": "media-1",
      "url": "https://mysite.com/storage/cropped-img-456.jpg",
      "type": "image"
    }
  ],
  
  // Кастомные метаданные (расширенная информация)
  "custom_metadata": {
    
    // Детали обрезки изображения
    "media_meta": [
      {
        "media_id": "media-1",
        "original_dimensions": {
          "width": 3000,
          "height": 2000
        },
        "crop_applied": {
          "x": 100,
          "y": 50,
          "width": 800,
          "height": 600
        },
        "aspect_ratio": "original",
        "processing_timestamp": "2025-10-27T10:00:00Z"
      }
    ],
    
    // Блоки кода
    "code_blocks": [
      {
        "id": "code-1",
        "language": "javascript",
        "code": "function hello() {\n  console.log('Hi!');\n}",
        "line_numbers": true,
        "theme": "vs-dark"
      },
      {
        "id": "code-2",
        "language": "python",
        "code": "def greet():\n    print('Hello!')",
        "line_numbers": true,
        "theme": "github"
      }
    ],
    
    // Документы
    "documents": [
      {
        "id": "doc-1",
        "url": "https://mysite.com/storage/report.pdf",
        "type": "pdf",
        "filename": "Q4-Report.pdf",
        "size": 2048576,
        "pages": 15,
        "thumbnail": "https://mysite.com/storage/report-thumb.jpg"
      },
      {
        "id": "doc-2",
        "url": "https://mysite.com/storage/design.docx",
        "type": "docx",
        "filename": "Design-Spec.docx",
        "size": 512000,
        "pages": 8
      }
    ]
  }
}
```

---

## 6. Клиентская обработка (превью)

### Все превью создаются ЛОКАЛЬНО:

```javascript
// 1. Crop Preview (изображения)
const croppedPreviewUrl = await getCroppedImg(imageUrl, cropRect);
// → blob:http://localhost:3000/abc-123

// 2. Code Preview (подсветка синтаксиса)
const highlightedCode = Prism.highlight(code, grammar, language);
// → HTML с подсветкой

// 3. Document Preview (PDF/DOCX)
const pdfPreview = await renderPdfPage(pdfFile, pageNumber);
// → canvas с превью страницы

// ВСЕ ЭТО - ЛОКАЛЬНО, НЕ НА СЕРВЕРЕ!
```

---

## 7. Серверная обработка (финальные версии)

### Сервер создает финальные версии:

```go
// custom-backend/internal/api/posts.go

func CreatePost(req CreatePostRequest) {
    post := &Post{
        Content: req.Content,
    }
    
    // 1. Обработка изображений
    for _, media := range req.Media {
        if media.CropRect != nil {
            // Обрезаем изображение на сервере
            croppedImg := cropImage(
                media.OriginalURL,
                media.CropRect.X,
                media.CropRect.Y,
                media.CropRect.Width,
                media.CropRect.Height,
            )
            
            // Сохраняем метаданные
            post.CustomMetadata.MediaMeta = append(
                post.CustomMetadata.MediaMeta,
                MediaMeta{
                    MediaID: media.ID,
                    CropApplied: media.CropRect,
                }
            )
        }
    }
    
    // 2. Сохранение кода (как есть)
    post.CustomMetadata.CodeBlocks = req.CodeBlocks
    
    // 3. Обработка документов
    for _, doc := range req.Documents {
        // Извлечение метаданных
        metadata := extractDocMetadata(doc.URL)
        post.CustomMetadata.Documents = append(
            post.CustomMetadata.Documents,
            Document{
                URL:   doc.URL,
                Type:  doc.Type,
                Size:  metadata.Size,
                Pages: metadata.Pages,
            }
        )
    }
    
    db.Create(post)
}
```

---

## 8. Ключевая взаимосвязь

### Общий принцип для ВСЕХ типов контента:

```
┌─────────────────────────────────────────────┐
│ ПРИНЦИП: ПРЕВЬЮ ЛОКАЛЬНО, ОБРАБОТКА НА      │
│          СЕРВЕРЕ                            │
└─────────────────────────────────────────────┘

1. ПРЕВЬЮ (клиент):
   • Изображения → Canvas blob URL
   • Код → Syntax highlighting
   • Документы → PDF.js / Mammoth preview
   
   Цель: Показать пользователю ДО публикации
   Нагрузка: 0 на сервер

2. ОБРАБОТКА (сервер):
   • Изображения → Обрезка по координатам
   • Код → Валидация, санитизация
   • Документы → Извлечение метаданных
   
   Цель: Создать финальные версии
   Нагрузка: Только при публикации (1 раз)

3. ХРАНЕНИЕ (БД):
   • Все в custom_metadata
   • Единая структура для всех типов
   • Легко расширяется
```

---

## 9. Преимущества такой архитектуры

### ✅ Единообразие:
Все типы контента обрабатываются по одному принципу:
- Локальное превью
- Координаты/метаданные на сервер
- Финальная обработка на сервере

### ✅ Масштабируемость:
```
100,000 пользователей создают превью:
  • Изображения: 0 нагрузки (Canvas локально)
  • Код: 0 нагрузки (Prism локально)
  • Документы: 0 нагрузки (PDF.js локально)
  
Итого: 0 нагрузки на сервер! ✅
```

### ✅ Расширяемость:
Легко добавить новые типы контента:
- Видео (превью → обработка)
- Аудио (waveform → конвертация)
- 3D модели (viewer → обработка)

### ✅ Производительность:
- Пользователь видит превью мгновенно
- Сервер обрабатывает только при публикации
- Нет лишних запросов к серверу

---

## 10. Пример полного flow

### Пользователь создает "богатый" пост:

```
👤 ПОЛЬЗОВАТЕЛЬ

1. Загружает фото → 📤 Upload → 💾 Сервер (оригинал)
2. Обрезает фото → 🎨 Canvas превью локально
3. Вставляет код → 🎨 Syntax highlight локально
4. Прикрепляет PDF → 📋 PDF.js превью локально

   ↓ Видит ВСЁ в превью ↓

5. Нажимает "Post"


📮 ОТПРАВКА НА СЕРВЕР

{
  content: "Мой проект!",
  media: [{
    url: "/storage/original.jpg",
    crop: {x, y, w, h}          ← только координаты!
  }],
  code_blocks: [{
    language: "js",
    code: "console.log()"       ← текст кода
  }],
  documents: [{
    url: "/storage/doc.pdf"     ← уже на сервере
  }]
}


⚙️ ОБРАБОТКА НА СЕРВЕРЕ

1. Обрезает изображение по координатам
2. Валидирует код
3. Извлекает метаданные документа

💾 Сохраняет всё в custom_metadata


✅ РЕЗУЛЬТАТ В БД

{
  content: "Мой проект!",
  media_url: "cropped.jpg",      ← финальное изображение
  custom_metadata: {
    media_meta: [{...}],         ← детали crop
    code_blocks: [{...}],        ← код с метаданными
    documents: [{...}]           ← документ с метаданными
  }
}
```

---

## Резюме

### Crop preview - это часть большой системы:

1. **Crop Preview** (сегодня реализовано):
   - Превью обрезанных изображений
   - Canvas API
   - Blob URLs

2. **Custom Metadata** (база для всего):
   - Хранение расширенных данных
   - Поддержка кода, документов, медиа-метаданных
   - JSONB в PostgreSQL

3. **Общий принцип**:
   - Превью локально (Canvas, Prism, PDF.js)
   - Обработка на сервере (crop, validation, extraction)
   - Метаданные в custom_metadata

### Все взаимосвязано! 🔗

- Crop превью использует ту же философию что код и документы
- Все хранится в custom_metadata
- Все следует принципу "превью локально, обработка на сервере"

---

*Документ создан: 27.10.2025*
