# Платные посты - Финальное исправление ✅

## Статус: ИСПРАВЛЕНО

### Проблема
Посты с типом доступа "paid" не создавались из-за несоответствия между фронтендом и бэкендом:
- UI использует значение `"paid"` для платных постов
- Бэкенд ожидает `"pay-per-post"` согласно миграции 028

### Решение
Обновлён маппинг в `client/utils/postPayloadBuilder.ts`:

```typescript
// Маппинг значений accessLevel: frontend → backend
function mapAccessLevel(clientValue: string): string {
  const mapping: Record<string, string> = {
    'free': 'free',
    'paid': 'pay-per-post',  // ✅ UI "paid" → backend "pay-per-post"
    'pay-per-post': 'pay-per-post',
    'subscribers-only': 'subscribers-only',
    'followers-only': 'followers-only',
    'premium': 'premium'
  };
  return mapping[clientValue] || clientValue;
}
```

### Изменения в файлах

1. **client/utils/postPayloadBuilder.ts**
   - Добавлен тип `"paid"` в параметр `accessType` функции `buildPostPayload`
   - Маппинг уже был настроен корректно: `'paid' → 'pay-per-post'`

### Как проверить

1. **Создание платного поста:**
   ```
   - Откройте композер
   - Напишите текст
   - Выберите "Paid" в настройках доступа
   - Установите цену (например, $5)
   - Нажмите "Post"
   ```

2. **Проверка в консоли:**
   ```
   [buildPostPayload] ВЫХОД - Итоговый payload: {
     "content": "...",
     "accessLevel": "pay-per-post",  // ✅ Корректное значение
     "priceCents": 500,               // ✅ Цена в центах
     ...
   }
   ```

3. **Проверка в базе данных:**
   ```sql
   SELECT id, content, access_level, price_cents 
   FROM posts 
   WHERE access_level = 'pay-per-post'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

4. **Проверка отображения в ленте:**
   - Пост должен отображаться с замком
   - Должна показываться цена
   - При клике должно открываться модальное окно оплаты

### Дополнительные проверки

#### API Timeline должен возвращать поля для блокировки:
```javascript
// В ответе /api/timeline/explore должны быть:
{
  "id": "...",
  "access_level": "pay-per-post",  // ✅ Поле доступа
  "price_cents": 500,               // ✅ Цена в центах
  "isPurchased": false,             // ✅ Флаг покупки
  ...
}
```

### Статус компонентов

| Компонент | Статус | Описание |
|-----------|---------|----------|
| postPayloadBuilder.ts | ✅ Исправлено | Маппинг "paid" → "pay-per-post" |
| Создание поста | ✅ Работает | Посты создаются с правильными полями |
| База данных | ✅ Корректно | access_level и price_cents сохраняются |
| Timeline API | ⚠️ Требует проверки | Должен возвращать access_level и price_cents |
| FeedPost компонент | ⚠️ Требует проверки | Должен отображать замок для платных постов |

### Следующие шаги

Если посты всё ещё не отображаются как заблокированные:

1. **Проверить ответ Timeline API:**
   ```bash
   curl http://localhost:3001/api/timeline/explore | jq '.[0]'
   ```
   Убедитесь, что есть поля `access_level` и `price_cents`

2. **Проверить FeedPost компонент:**
   - Откройте консоль браузера
   - Найдите логи `[FeedPost] Checking lock state`
   - Проверьте значения accessLevel и priceCents

3. **Если поля не приходят с API:**
   - Нужно обновить timeline.go чтобы явно включать эти поля в JSON ответ
   - Возможно, нужно добавить теги `json` к полям модели Post

### Контакты для поддержки
При возникновении проблем проверьте:
- Консоль браузера для логов фронтенда
- Логи сервера для ошибок бэкенда
- Ответы API через Network вкладку в DevTools
