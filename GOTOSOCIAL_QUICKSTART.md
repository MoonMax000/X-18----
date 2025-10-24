# GoToSocial Integration - Quick Start

## 🎯 Что уже готово

✅ **Frontend полностью готов:**
- API service layer (`client/services/api/gotosocial.ts`)
- React hooks (`useGTSProfile`, `useGTSTimeline`, `useGTSNotifications`)
- Форма создания поста с метаданными (`ComposerMetadata.tsx`)
- Все страницы подготовлены

✅ **Документация:**
- Полный анализ совместимости
- Пошаговые инструкции
- Примеры кода на Go

---

## 🚀 Быстрый старт (1 неделя)

### День 1: Установка GoToSocial

```bash
# Скачать GoToSocial
wget https://github.com/superseriousbusiness/gotosocial/releases/latest/download/gotosocial-linux-amd64

# Запустить
./gotosocial-linux-amd64 server start
```

### День 2-3: Базовая интеграция

1. Настроить OAuth2 в GoToSocial
2. Обновить `.env`:
   ```bash
   VITE_API_URL=http://localhost:8080
   ```
3. Протестировать логин/логаут
4. Проверить создание постов

### День 4: Добавить метаданные (4 часа!)

Следовать `GOTOSOCIAL_SIMPLE_METADATA_GUIDE.md`:

1. **30 минут:** Добавить JSONB колонку
2. **3 часа:** Обновить API + тесты

**Готово!** Теперь посты могут иметь категории (Signal/News/etc), market, symbol.

### День 5: Тестирование

- Создать посты с разными категориями
- Проверить отображение бейджей
- Протестировать фильтрацию

---

## 📚 Читать по порядку

1. **`GOTOSOCIAL_SIMPLE_METADATA_GUIDE.md`** ⭐ НАЧАТЬ ЗДЕСЬ
   - Самый простой гайд
   - Показывает как добавить метаданные за 4 часа
   - С примерами кода на Go

2. **`GOTOSOCIAL_PAGES_INTEGRATION.md`**
   - Как интегрировать каждую страницу
   - Примеры использования hooks
   - Готовый код для копирования

3. **`GOTOSOCIAL_INTEGRATION_ANALYSIS.md`**
   - Полный анализ совместимости
   - Что работает / что нет
   - Приоритеты разработки

4. **`GOTOSOCIAL_CUSTOMIZATION_GUIDE.md`**
   - Детальный гайд (для справки)
   - Если нужны подробности

---

## ⚡ TL;DR (самое главное)

### Что работает из коробки:
- ✅ Профили пользователей
- ✅ Посты, лайки, репосты
- ✅ Фоловеры/фоловинг
- ✅ Лента (home, public)
- ✅ Уведомления
- ✅ Медиа (фото, видео)

### Что добавить за 4 часа:
- ⏱️ Метаданные постов (категории, market, symbol)

### Что требует отдельной разработки:
- 💰 Монетизация (pay-per-post, подписки)
- 📊 Аналитика (view count, engagement)
- 🔥 Trending (популярные посты, хэштеги)

---

## 🎯 Минимальный MVP (1 неделя)

**Цель:** Раб��тающая соц. сеть с категоризацией постов

**Что делать:**
1. Установить GoToSocial (день 1)
2. Подключить frontend (день 2-3)
3. Добавить метаданные постов (день 4, 4 часа)
4. Тестирование (день 5)

**Результат:**
- Пользователи могут регистрироваться/логиниться
- Создавать посты с категориями (Signal, News, Education, etc.)
- Указывать market (Crypto, Stocks), symbol (BTC, ETH)
- Видеть ленту с бейджами
- Фильтровать по категориям

**Что НЕ работает (пока):**
- Платные посты (pay-per-post)
- Подписки
- Trending topics
- Advanced analytics

---

## 💡 Следующие шаги после MVP

### Неделя 2-4: Монетизация

Построить отдельный backend для:
- Stripe интеграция
- Таблица payments
- Проверка доступа к платным постам
- Система подписок

### Неделя 5-6: Discovery

- Алгоритм trending
- Рекомендации пользователей
- Suggested profiles

### Неделя 7-8: Analytics

- View count
- Engagement metrics
- User statistics

---

## 🆘 Если что-то не работает

### Ошибка: "Network Error"
- Проверить `VITE_API_URL` в `.env`
- Убедиться что GoToSocial запущен
- Проверить CORS settings

### Ошибка: "User not found"
- Проверить формат username (@user vs user)
- Использовать search API вместо прямого поиска

### Метаданные не сохраняются
- Убедиться что JSONB колонка добавлена
- Проверить что API принимает `custom_metadata`
- Посмотреть логи GoToSocial

---

## 📞 Полезные ссылки

- [GoToSocial Docs](https://docs.gotosocial.org/)
- [GoToSocial API](https://docs.gotosocial.org/en/latest/api/swagger/)
- [Mastodon API](https://docs.joinmastodon.org/api/) (GoToSocial совместим)

---

## ✅ Чеклист готовности

**Frontend:**
- [x] API service готов
- [x] Hooks готовы
- [x] Форма создания поста готова
- [x] Метаданные собираются
- [x] Бейджи отображаются

**Backend (что делать):**
- [ ] Установить GoToSocial
- [ ] ��астроить OAuth2
- [ ] Добавить JSONB колонку (30 мин)
- [ ] Обновить API endpoints (3 часа)
- [ ] Протестировать

**Монетизация (отдельная задача):**
- [ ] Stripe аккаунт
- [ ] Custom backend
- [ ] Payments table
- [ ] Access control

---

**Удачи!** 🚀

Начинайте с `GOTOSOCIAL_SIMPLE_METADATA_GUIDE.md` - там все примеры кода!
