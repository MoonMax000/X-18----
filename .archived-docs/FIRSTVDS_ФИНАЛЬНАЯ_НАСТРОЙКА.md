# ✅ ЧТО ДОБАВИТЬ В FirstVDS ПРЯМО СЕЙЧАС

## 📝 Netlify уже ждет эти записи!

Отлично! Вы уже добавили домены в Netlify. Теперь нужно настроить DNS в FirstVDS.

## 🎯 ДОБАВЬТЕ ЭТИ ЗАПИСИ В FirstVDS:

### 1️⃣ Откройте панель FirstVDS → Управление DNS

### 2️⃣ Добавьте следующие записи:

| Имя | Тип | Значение | Приоритет/TTL |
|-----|-----|----------|---------------|
| **social** | CNAME | **tyrian-trade-frontend.netlify.app** | 3600 |
| **admin** | CNAME | **tyrian-trade-frontend.netlify.app** | 3600 |
| **api** | CNAME | **tjpcog02.up.railway.app** | 3600 |
| **subdomain-owner-verification** | TXT | **9a9c8b1075e75c4c642c29ecb03b54f2** | 3600 |

## ⚠️ ВАЖНО ПРИ ДОБАВЛЕНИИ:

### Для CNAME записей:
- **Имя записи**: вводите ТОЛЬКО префикс (social, admin, api)
- **НЕ НУЖНО** вводить полный домен (НЕ social.tyriantrade.com)
- **Значение**: вводите полностью как указано выше

### Для TXT записи:
- **Имя записи**: subdomain-owner-verification
- **Значение**: 9a9c8b1075e75c4c642c29ecb03b54f2 (без кавычек)

## 📸 Как должно выглядеть в FirstVDS:

```
Запись 1:
Тип: CNAME
Имя: social
Значение: tyrian-trade-frontend.netlify.app
TTL: 3600

Запись 2:
Тип: CNAME
Имя: admin
Значение: tyrian-trade-frontend.netlify.app
TTL: 3600

Запись 3:
Тип: CNAME
Имя: api
Значение: tjpcog02.up.railway.app
TTL: 3600

Запись 4:
Тип: TXT
Имя: subdomain-owner-verification
Значение: 9a9c8b1075e75c4c642c29ecb03b54f2
TTL: 3600
```

## ✅ После добавления:

1. **Подождите 5-30 минут** для распространения DNS
2. В Netlify нажмите **"Verify DNS configuration"** 
3. SSL сертификаты создадутся автоматически

## 🔍 Как проверить:

### В командной строке:
```bash
# Проверка DNS записей
nslookup social.tyriantrade.com
nslookup admin.tyriantrade.com
nslookup api.tyriantrade.com
```

### Или откройте в браузере через 30 минут:
- https://social.tyriantrade.com
- https://admin.tyriantrade.com
- https://api.tyriantrade.com/health

## ❗ Если у вас уже есть старые записи:
- Удалите старые A записи для social/admin/api
- Замените их на новые CNAME записи из таблицы выше
