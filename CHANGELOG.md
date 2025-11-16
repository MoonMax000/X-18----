# Changelog

All notable changes to X-18 project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Profile Paywall System** - закрытые профили с монетизацией
  - `ProfilePaywall.tsx` - главный paywall компонент с OnlyFans-style дизайном
  - `SubscriptionPaywallWidget.tsx` - компактный виджет для сайдбара
  - `useStripePayment.ts` - хук для оплаты сохраненной картой
  - Animated background (gradient blobs)
  - Promotional pricing support (90% discount banners)
  - Content stats preview (posts, photos, videos, premium)
  - Card check before payment
  - "Add card" modal flow
- **Enhanced Toast Notifications**
  - 3 variants: default (purple), success (green), destructive (red)
  - Backdrop blur glass effect
  - Color-coded shadows for each variant
  - Top-right positioning with z-index 9999
  - Improved animations
- **User Model Extensions**
  - `is_profile_private` - флаг закрытого профиля
  - `subscription_discount_price` - промо-цена ($3)
  - `subscription_discount_percentage` - процент скидки (90%)
  - `subscription_discount_days` - длительность промо (30 дней)
  - `photos_count` - количество фото
  - `videos_count` - количество видео
  - `premium_posts_count` - количество премиум постов

### Changed
- `ProfilePageLayout.tsx` - добавлена логика отображения paywall
  - Conditional rendering: paywall vs normal content
  - Integration в правый сайдбар
- `toast.tsx` - обновлен дизайн
  - Темная тема (#181a20/95)
  - Rounded corners (rounded-2xl)
  - Shadow improvements
- `custom-backend.ts` - расширен User interface

### Fixed
- Import paths для `useStripePayment` в ProfilePaywall и SubscriptionPaywallWidget
- Toast background opacity для glass effect

### Backend TODO
- [ ] Database migration для новых User полей
- [ ] POST /api/payments/charge-saved-card endpoint
- [ ] GET /api/users/:id/subscription-status endpoint
- [ ] PUT /api/users/me/profile-settings endpoint
- [ ] Stats calculation logic (photos_count, videos_count, premium_posts_count)
- [ ] Subscription creation и tracking

---

## [1.0.0] - 2025-11-02

### Added
- MVP функционал (посты, комментарии, подписки)
- JWT аутентификация (Access + Refresh tokens)
- Email верификация через AWS SES
- AWS production deployment
- CloudFront CDN для frontend
- PostgreSQL + Redis infrastructure
- Stripe монетизация (платные посты)
- Admin панель
- Notifications system
- Widgets (News, Tickers, Top Authors, Earnings)
- WebSocket для real-time updates

### Infrastructure
- AWS ECS Fargate для backend (Go + Fiber)
- AWS RDS PostgreSQL 15
- AWS ElastiCache Redis 7
- AWS S3 для media storage
- CloudWatch monitoring
- GitHub Actions CI/CD
- Route 53 DNS
- Custom domain (x18.pro)

### Security
- JWT token rotation
- CORS configuration
- Rate limiting
- Password hashing (bcrypt)
- SQL injection protection (GORM)
- XSS protection

---

## [0.9.0] - 2025-10-20

### Added
- OAuth интеграция (Apple Sign In)
- 2FA/TOTP authentication
- Session tracking с geoIP
- Payment methods (saved cards)
- Account linking system
- Active sessions management
- Device tracking

### Changed
- Улучшена архитектура аутентификации
- Оптимизирован процесс регистрации
- Email verification flow улучшен

### Security
- TOTP secret encryption
- Session token rotation
- Suspicious activity detection

---

## [0.8.0] - 2025-10-10

### Added
- Премиум контент (платные посты)
- Stripe интеграция (payment intents)
- Media Grid для фото/видео
- Code blocks с syntax highlighting
- Document attachments (PDF, DOCX, etc)
- Media editor (crop, filters)
- Payment modal redesign

### Changed
- Composer UI обновлен (AccessTypeModal)
- Улучшена производительность timeline
- Media upload optimization

---

## [0.7.0] - 2025-09-25

### Added
- WebSocket для real-time уведомлений
- Notification preferences (email, push, in-app)
- Advanced profile stats
- Crop/edit для аватаров и обложек
- React Easy Crop integration
- Image compression

### Changed
- Avatar/Cover upload flow улучшен
- Profile stats calculation оптимизирован

---

## [0.6.0] - 2025-09-10

### Added
- Email verification через AWS SES
- Password reset flow
- Account security settings
- Email templates (HTML)
- Verification code (6 digits)

### Security
- Rate limiting для API
- CORS configuration
- JWT rotation
- Password strength validation

### Fixed
- Email delivery issues
- Verification code expiry
- CORS errors на production

---

## [0.5.0] - 2025-08-20

### Added
- Custom Go backend (Fiber v2)
- PostgreSQL database
- Redis caching
- AWS infrastructure
- GORM ORM
- Database migrations system

### Changed
- Миграция с GoToSocial на custom backend
- API endpoints redesign
- Database schema optimization

### Removed
- GoToSocial dependency
- Old backend code

---

## [0.4.0] - 2025-08-01

### Added
- Admin panel
- User management
- Content moderation
- Analytics dashboard
- Newsletter system

---

## [0.3.0] - 2025-07-20

### Added
- Widgets system
- News widget (финансовые новости)
- Trending tickers widget
- Top authors widget
- Earnings widget
- Activity widget

---

## [0.2.0] - 2025-07-10

### Added
- Post creation flow
- Media upload (images, videos)
- Comments system (threaded)
- Likes functionality
- Profile pages
- Follow/Unfollow

---

## [0.1.0] - 2025-07-01

### Added
- Initial React frontend (Vite + TypeScript)
- Basic authentication
- Posts feed
- User profiles
- Tailwind CSS
- shadcn/ui components
- React Router v6

---

## Формат версий

- **Major (X.0.0)** - Breaking changes, major features
- **Minor (0.X.0)** - New features, backward compatible
- **Patch (0.0.X)** - Bug fixes, small improvements

**Формат дат:** YYYY-MM-DD

---

**Последнее обновление:** 05.11.2025  
**Текущая версия:** 1.0.0 (Unreleased features для 1.1.0)
