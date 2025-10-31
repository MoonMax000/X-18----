# 🌐 Правильные Production URL

## ✅ Актуальные адреса (2025)

### Frontend (Netlify → Custom Domain)
- **Production URL**: `https://social.tyriantrade.com`
- **Admin Panel**: `https://social.tyriantrade.com/admin`
- **Profile Security**: `https://social.tyriantrade.com/profile?tab=profile&profileTab=security`

### Backend (Railway)
- **API Base**: `https://x-18-production-38ec.up.railway.app`
- **Health Check**: `https://x-18-production-38ec.up.railway.app/health`

### WebSocket
- **WS URL**: `wss://x-18-production-38ec.up.railway.app/ws`

---

## ❌ Устаревшие URL (не использовать!)

### Старые Netlify URL:
- ~~x-18.netlify.app~~
- ~~x-18-production.netlify.app~~
- ~~sunny-froyo-f47377.netlify.app~~
- ~~wonderful-einstein-123abc.netlify.app~~
- ~~random-name-123.netlify.app~~
- ~~your-app.netlify.app~~
- ~~tyrian-trade-frontend.netlify.app~~

---

## 🔧 Используйте эти URL в инструкциях:

### Для пользователей:
```
Frontend: https://social.tyriantrade.com
Admin: https://social.tyriantrade.com/admin
Security: https://social.tyriantrade.com/profile?tab=profile&profileTab=security
```

### Для разработчиков:
```bash
# Frontend
LOCAL: http://localhost:5173
PRODUCTION: https://social.tyriantrade.com

# Backend
LOCAL: http://localhost:8080
PRODUCTION: https://x-18-production-38ec.up.railway.app
```

### Railway Environment Variables:
```env
CORS_ORIGIN=https://social.tyriantrade.com
FRONTEND_URL=https://social.tyriantrade.com
ALLOWED_ORIGINS=https://social.tyriantrade.com,http://localhost:5173
```

---

## 📝 Примечание

Все старые netlify URL в документации являются **устаревшими**.  
Используйте только `social.tyriantrade.com` для production ссылок.
