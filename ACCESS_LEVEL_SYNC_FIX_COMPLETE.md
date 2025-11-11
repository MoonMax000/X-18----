## Исправление рассинхрона значений AccessLevel

### 🔴 Проблема
Фронтенд и бэкенд использовали разные значения для `accessLevel`:
- **Фронтенд отправлял**: `'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium'`
- **Бэкенд после миграции 028 поддерживает**: `'public' | 'paid' | 'subscribers-only' | 'followers-only' | 'premium'`

Это приводило к тому, что:
- Пост создавался с `'free'`, но бэкенд не понимал это значение
- Поля `accessLevel`, `priceCents`, `postPrice` приходили как `undefined`
- Lock UI не отображался
- Фото не показывались

### ✅ Исправления

#### 1. Добавлен маппинг в `postPayloadBuilder.ts`
```typescript
function mapAccessLevel(clientValue: string): string {
  const mapping: Record<string, string> = {
    'free': 'public',           // 'free' устарело
    'pay-per-post': 'paid',     // унифицируем в 'paid'
    'subscribers-only': 'subscribers-only',
    'followers-only': 'followers-only',
    'premium': 'premium'
  };
  return mapping[clientValue] || clientValue;
}
```

Теперь при создании поста фронтенд отправляет правильные значения.

#### 2. Создана утилита нормализации `client/lib/access-level-utils.ts`
```typescript
// Нормализует значения от бэкенда
export function normalizeAccessLevel(level?: string | null): AccessLevelClient

// Проверяет блокировку с учетом нормализации
export function isPostLocked(params: {
  accessLevel?: string | null;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isFollower?: boolean;
  isOwnPost: boolean;
}): boolean
```

Эта утилита обрабатывает как старые (legacy), так и новые значения.

#### 3. Обновлен `FeedPost.tsx`
```typescript
import { isPostLocked, normalizeAccessLevel } from "@/lib/access-level-utils";

// Используем утилиту вместо ручной проверки
const isLocked = isPostLocked({
  accessLevel: localPost.accessLevel,
  isPurchased: localPost.isPurchased,
  isSubscriber: localPost.isSubscriber,
  isFollower: localPost.isFollower,
  isOwnPost
});
```

### 📊 Таблица маппинга значений

| Старое (legacy) | Новое (unified) | Описание |
|----------------|-----------------|----------|
| `free` | `public` | Публичный контент |
| `pay-per-post` | `paid` | Разовая покупка |
| `subscribers-only` | `subscribers-only` | Без изменений |
| `followers-only` | `followers-only` | Без изменений |
| `premium` | `premium` | Без изменений |

### 🧪 Как протестировать

1. **Перезапустите локальный бэкенд**:
   ```bash
   # Остановите старый процесс (Ctrl+C или kill)
   lsof -ti:8080 | xargs kill
   
   # Перезапустите с новым кодом
   cd custom-backend
   go run cmd/server/main.go
   ```

2. **Перезагрузите фронтенд** в браузере (Ctrl+R)

3. **Создайте платный пост**:
   - Откройте композер
   - Выберите "Pay-per-post" ($5)
   - Добавьте фото
   - Опубликуйте

4. **Проверьте в консоли браузера**:
   ```javascript
   [FeedPost DEBUG] Post access control: {
     accessLevel: "paid",         // ✅ было undefined
     priceCents: 500,              // ✅ было undefined
     postPrice: 5.0,               // ✅ было undefined
     isPurchased: false,
     isOwnPost: true,
   }
   
   [FeedPost DEBUG] Lock calculation (with normalization): {
     accessLevel: "paid",
     normalizedAccessLevel: "paid",  // ✅ нормализовано
     isLocked: false  // для автора
   }
   ```

5. **Для другого пользователя** (или в режиме инкогнито):
   - Пост должен отображаться заблокированным
   - Видна кнопка "Unlock for $5.00"
   - Фото размыто

### ✅ Ожидаемый результат

После исправлений:
- ✅ Фронтенд отправляет правильные значения (`'public'` вместо `'free'`)
- ✅ Бэкенд корректно сохраняет `access_level` в БД
- ✅ API возвращает все поля: `accessLevel`, `priceCents`, `postPrice`
- ✅ Нормализация обрабатывает любые значения (старые и новые)
- ✅ Lock UI отображается корректно
- ✅ Фото показываются
- ✅ Monetization работает

### 🚀 Deployment

Для деплоя на production:
```bash
# Пересобрать фронтенд
npm run build

# Закоммитить изменения
git add client/utils/postPayloadBuilder.ts
git add client/lib/access-level-utils.ts
git add client/features/feed/components/posts/FeedPost.tsx
git commit -m "fix: sync accessLevel values between frontend and backend"

# Запушить
git push origin main
```

AWS автоматически задеплоит новую версию.

### 📝 Файлы, которые были изменены

1. `client/utils/postPayloadBuilder.ts` - добавлен маппинг значений
2. `client/lib/access-level-utils.ts` - новая утилита нормализации (создан)
3. `client/features/feed/components/posts/FeedPost.tsx` - использует утилиту

### 🔗 Связанные документы

- `PAID_POST_FIX_COMPLETE.md` - предыдущее исправление JSON naming
- `LOCAL_BACKEND_RESTART_GUIDE.md` - инструкции по перезапуску
- `custom-backend/internal/database/migrations/028_sync_access_level_values.sql` - миграция БД
