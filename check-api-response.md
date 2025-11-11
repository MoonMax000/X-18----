# Проверка API Response

## Проблема
Логи показывают все поля `undefined`:
- `accessLevel: undefined`
- `priceCents: undefined`
- `isPurchased: undefined`

## Решение

### Вариант 1: Проверить Network Response

1. Откройте DevTools (F12)
2. Перейдите на вкладку **Network**
3. Найдите запрос к `/api/timeline/home`
4. Кликните на него
5. Перейдите на вкладку **Response**
6. Найдите свой новый пост (`fa0b6ce8-d57b-4ec4-ac1c-f4b5405a40d0`)

Проверьте какие поля присутствуют:
```json
{
  "id": "fa0b6ce8-d57b-4ec4-ac1c-f4b5405a40d0",
  "access_level": "???",  // <-- как называется?
  "price_cents": ???,      // <-- есть ли это поле?
  "is_purchased": ???,     // <-- есть ли это поле?
  ...
}
```

### Вариант 2: Возможная проблема с JSON тегами

Go бэкенд использует `json:"access_level"` (snake_case)
TypeScript ожидает `accessLevel` (camelCase)

**Если в Network видите `access_level` вместо `accessLevel` - это проблема!**

### Вариант 3: Проверить что бэкенд действительно перезапущен

Возможно старый код еще работает. Перезапустите бэкенд:
```bash
# Найдите процесс
ps aux | grep "go run"

# Убейте его
kill -9 <PID>

# Запустите заново
cd custom-backend
go run cmd/server/main.go
```

## Следующий шаг

Пришлите:
1. Скриншот или текст Network Response для вашего поста
2. Какие поля там есть (особенно связанные с access_level, price, is_purchased)
