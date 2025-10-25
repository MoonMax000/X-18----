# 📋 ПОЛНЫЙ СПИСОК TODO - Tyrian Trade

> Все задачи, которые нужно доделать для завершения проекта

---

## ✅ ЧТО УЖЕ СДЕЛАНО (Phase 1)

### Backend ✅
- [x] Auth Controller (register, login, logout)
- [x] Auth Routes & Validators
- [x] Profile Controller (CRUD, avatar/cover upload)
- [x] Profile Routes & Validators
- [x] S3 Storage Service (file uploads)
- [x] Email Service (Resend integration)
- [x] Stripe Connect Controller & Service
- [x] Payment Methods Controller & Service
- [x] JWT Authentication middleware
- [x] Input validation middleware (Zod)
- [x] Error handling middleware
- [x] Database schema (Prisma)
- [x] Email/Password verification tokens

### Frontend ✅
- [x] Login/SignUp modals
- [x] Profile page structure
- [x] Stripe Connect UI
- [x] Basic payment modals (UI только)

---

## ⚠️ ЧТО НУЖНО ДОДЕЛАТЬ

## 🔴 BACKEND - КРИТИЧЕСКИ ВАЖНО

### 1. Missing Route Files (6 файлов)
**Статус:** Объявлены в `index.ts`, но файлы НЕ существуют

- [x] **`backend/src/api/routes/notifications.routes.ts`** ✅
  - Route: `/api/v1/notification-settings`
  - Methods: GET, PUT
  - Description: User notification preferences

- [x] **`backend/src/api/routes/apiKeys.routes.ts`** ✅
  - Route: `/api/v1/api-keys`
  - Methods: GET, POST, DELETE
  - Description: API key management for integrations

- [x] **`backend/src/api/routes/kyc.routes.ts`** ✅
  - Route: `/api/v1/kyc`
  - Methods: GET, POST (upload documents), PUT (update status)
  - Description: KYC verification workflow

- [x] **`backend/src/api/routes/referrals.routes.ts`** ✅
  - Route: `/api/v1/referrals`
  - Methods: GET (stats), GET (list), POST (generate link)
  - Description: Referral program management

- [x] **`backend/src/api/routes/monetization.routes.ts`** ✅
  - Route: `/api/v1/monetization`
  - Methods: GET (earnings), GET (analytics), POST (payout)
  - Description: Creator earnings and payouts

- [x] **`backend/src/api/routes/billing.routes.ts`** ✅
  - Route: `/api/v1/billing`
  - Methods: GET (invoices), GET (subscription), POST (update plan)
  - Description: Billing history and subscription management

---

### 2. Missing Controllers (6 файлов)

- [ ] **`backend/src/api/controllers/notifications.controller.ts`**
  - Methods:
    - `getSettings()` - Get notification preferences
    - `updateSettings()` - Update notification preferences

- [ ] **`backend/src/api/controllers/apiKeys.controller.ts`**
  - Methods:
    - `getKeys()` - List API keys
    - `createKey()` - Generate new API key
    - `deleteKey()` - Revoke API key
    - `rotateKey()` - Rotate existing key

- [ ] **`backend/src/api/controllers/kyc.controller.ts`**
  - Methods:
    - `getStatus()` - Get KYC verification status
    - `submitDocuments()` - Upload KYC documents (via S3)
    - `updateVerification()` - Admin: approve/reject
    - `getDocuments()` - Retrieve uploaded documents

- [ ] **`backend/src/api/controllers/referrals.controller.ts`**
  - Methods:
    - `getStats()` - Get referral statistics
    - `getReferrals()` - List referred users
    - `generateLink()` - Create referral link
    - `trackClick()` - Track referral link clicks

- [ ] **`backend/src/api/controllers/monetization.controller.ts`**
  - Methods:
    - `getEarnings()` - Get earnings summary
    - `getAnalytics()` - Detailed earnings analytics
    - `requestPayout()` - Request payout to Stripe
    - `getPayoutHistory()` - Payout history

- [ ] **`backend/src/api/controllers/billing.controller.ts`**
  - Methods:
    - `getInvoices()` - List billing history
    - `getSubscription()` - Current subscription info
    - `updatePlan()` - Change subscription plan
    - `cancelSubscription()` - Cancel subscription

---

### 3. Missing Validators (6 файлов)

- [ ] **`backend/src/api/validators/notifications.validator.ts`**
  - Schemas: updateNotificationSettingsSchema

- [ ] **`backend/src/api/validators/apiKeys.validator.ts`**
  - Schemas: createApiKeySchema, deleteApiKeySchema

- [ ] **`backend/src/api/validators/kyc.validator.ts`**
  - Schemas: submitKycSchema, updateVerificationSchema

- [ ] **`backend/src/api/validators/referrals.validator.ts`**
  - Schemas: generateLinkSchema, trackClickSchema

- [ ] **`backend/src/api/validators/monetization.validator.ts`**
  - Schemas: requestPayoutSchema, getEarningsSchema

- [ ] **`backend/src/api/validators/billing.validator.ts`**
  - Schemas: updatePlanSchema, cancelSubscriptionSchema

---

### 4. Backend Improvements

- [ ] **Refresh Token Mechanism**
  - Add `RefreshToken` model to Prisma schema
  - Update auth controller with refresh logic
  - Implement token rotation
  - Add refresh token blacklist

- [ ] **Stripe Webhooks**
  - Create webhook endpoint `/api/v1/webhooks/stripe`
  - Handle `checkout.session.completed`
  - Handle `customer.subscription.updated`
  - Handle `customer.subscription.deleted`
  - Handle `invoice.payment_succeeded`
  - Handle `invoice.payment_failed`

- [ ] **File Upload Validation**
  - Add image compression (sharp)
  - Add virus scanning (ClamAV optional)
  - Add file type validation (magic numbers)
  - Add rate limiting for uploads

- [ ] **Email Templates Improvements**
  - Add transaction confirmation emails
  - Add payout notification emails
  - Add subscription renewal reminders
  - Add KYC status update emails

---

## 🟡 FRONTEND - КРИТИЧЕСКИ ВАЖНО

### 5. Payment Methods UI

- [ ] **Create CardForm Component**
  - File: `client/components/BillingSettings/CardForm.tsx`
  - Integrate Stripe Elements
  - Card input with validation
  - Save card via `createSetupIntent`
  - Error handling

- [ ] **Update BillingSettings Component**
  - File: `client/components/BillingSettings/BillingSettings.tsx`
  - Replace mock data with real API calls
  - Connect "Add Payment Method" button to CardForm modal
  - Implement Edit/Remove card actions
  - Implement Set Default card action
  - Real-time update after changes

- [ ] **Add Stripe Elements Provider**
  - File: `client/App.tsx` or `client/main.tsx`
  - Wrap app with `<Elements>` provider
  - Load Stripe.js
  - Configure with publishable key

---

### 6. Purchase Flow (Real Stripe Checkout)

- [ ] **Update PaymentModal Component**
  - File: `client/components/monetization/PaymentModal.tsx`
  - Replace mock `createStripeCheckout` with real API call
  - Call backend endpoint `POST /api/v1/monetization/create-checkout`
  - Redirect to real Stripe Checkout
  - Handle return URL (success/cancel)

- [ ] **Create Success/Cancel Pages**
  - File: `client/pages/PaymentSuccess.tsx`
  - File: `client/pages/PaymentCancel.tsx`
  - Display confirmation message
  - Redirect to post/profile after delay

- [ ] **Backend: Create Checkout Endpoint**
  - File: `backend/src/api/controllers/monetization.controller.ts`
  - Method: `createCheckoutSession()`
  - Create Stripe Checkout Session
  - Store session ID in database
  - Return checkout URL

---

### 7. Subscription Management UI

- [ ] **Create Subscription Plans Component**
  - File: `client/components/Subscriptions/SubscriptionPlans.tsx`
  - Display monthly/yearly plans
  - Show pricing and features
  - Subscribe button → redirect to Stripe Checkout

- [ ] **Update Subscriptions Page**
  - File: `client/components/Subscriptions/Subscriptions.tsx`
  - Replace mock data with API calls
  - Display current subscription
  - "Change Plan" button
  - "Cancel Subscription" button
  - Subscription renewal date
  - Payment history

- [ ] **Create Change Plan Modal**
  - File: `client/components/Subscriptions/ChangePlanModal.tsx`
  - Show available plans
  - Proration preview
  - Confirm change

- [ ] **Create Cancel Subscription Modal**
  - File: `client/components/Subscriptions/CancelSubscriptionModal.tsx`
  - Confirmation dialog
  - Reason for cancellation (optional)
  - Show benefits lost

---

### 8. API Integration (Frontend Services)

- [ ] **Update backend API client**
  - File: `client/services/api/backend.ts`
  - Add methods for all new endpoints:
    - Notifications settings
    - API keys management
    - KYC submission
    - Referrals
    - Monetization/earnings
    - Billing/invoices

- [ ] **Create API client for new features**
  - Notifications: `getSettings()`, `updateSettings()`
  - API Keys: `getKeys()`, `createKey()`, `deleteKey()`
  - KYC: `getStatus()`, `submitDocuments()`
  - Referrals: `getStats()`, `getReferrals()`, `generateLink()`
  - Monetization: `getEarnings()`, `requestPayout()`
  - Billing: `getInvoices()`, `getSubscription()`, `updatePlan()`

---

### 9. Frontend Components (Missing)

- [ ] **NotificationsSettings Component**
  - File: `client/components/NotificationsSettings/NotificationsSettings.tsx`
  - Toggle switches for notification types
  - Email/Push/SMS preferences
  - Save button

- [ ] **ApiSettings Component** (exists but may need updates)
  - File: `client/components/ApiSettings/ApiSettings.tsx`
  - Verify it's connected to backend API
  - Add create/delete key functionality

- [ ] **KycSettings Component**
  - File: `client/components/KycSettings/KycSettings.tsx`
  - Upload documents (passport, ID, proof of address)
  - Show verification status
  - Display rejection reasons (if any)

- [ ] **ReferralsSettings Component**
  - File: `client/components/ReferralsSettings/ReferralsSettings.tsx`
  - Display referral link
  - Copy link button
  - Show referral stats (clicks, signups, earnings)
  - List of referred users

- [ ] **Monetization Dashboard**
  - File: `client/components/Monetization/MonetizationDashboard.tsx`
  - Earnings overview
  - Revenue charts
  - Payout button
  - Transaction history

---

## 🟢 DATABASE & MIGRATIONS

### 10. Database Schema Updates

- [ ] **Add RefreshToken model**
  ```prisma
  model RefreshToken {
    id        String   @id @default(uuid())
    userId    String
    user      User     @relation(...)
    token     String   @unique
    expiresAt DateTime
    createdAt DateTime @default(now())
  }
  ```

- [ ] **Add NotificationSettings indexes**
  - Index on userId for faster queries

- [ ] **Add ApiKey model (if missing)**
  ```prisma
  model ApiKey {
    id        String   @id @default(uuid())
    userId    String
    user      User     @relation(...)
    name      String
    key       String   @unique
    lastUsed  DateTime?
    createdAt DateTime @default(now())
  }
  ```

- [ ] **Add Referral tracking fields**
  - clickCount in Referral model
  - conversion tracking

---

## 🔵 TESTING & QUALITY

### 11. Backend Testing

- [ ] **Unit Tests**
  - Auth controller tests
  - Profile controller tests
  - Stripe Connect tests
  - Email service tests

- [ ] **Integration Tests**
  - Auth flow (register → verify → login)
  - Payment flow (add card → purchase → confirm)
  - File upload flow
  - Email delivery

- [ ] **API Documentation**
  - Swagger/OpenAPI spec
  - Postman collection
  - API examples

---

### 12. Frontend Testing

- [ ] **Component Tests**
  - LoginModal
  - PaymentModal
  - CardForm
  - SubscriptionPlans

- [ ] **E2E Tests**
  - Registration flow
  - Login flow
  - Purchase content
  - Subscribe to author
  - Upload avatar

---

## 🟣 DEPLOYMENT & DEVOPS

### 13. Production Setup

- [ ] **Environment Variables**
  - Production `.env` file
  - Secrets management (AWS Secrets Manager / Vault)
  - Environment validation

- [ ] **Database**
  - Run migrations in production
  - Database backups
  - Connection pooling

- [ ] **AWS S3**
  - Create production S3 bucket
  - Configure CORS
  - Set up CloudFront CDN (optional)

- [ ] **Email Service**
  - Add custom domain to Resend
  - Verify domain DNS
  - Update EMAIL_FROM

- [ ] **Stripe**
  - Move to production API keys
  - Configure webhooks in production
  - Test production payments

- [ ] **Monitoring**
  - Set up logging (CloudWatch / Datadog)
  - Error tracking (Sentry)
  - Performance monitoring (New Relic / DataDog)

- [ ] **CI/CD**
  - GitHub Actions / GitLab CI
  - Automated tests
  - Automated deployments

---

## ⚪ NICE TO HAVE (Optional)

### 14. Features (не критично, но полезно)

- [ ] **Admin Panel**
  - User management
  - KYC approval interface
  - Transaction monitoring
  - Analytics dashboard

- [ ] **Analytics**
  - Google Analytics / Mixpanel
  - Custom event tracking
  - Conversion funnels

- [ ] **Social Features**
  - Comments on posts
  - Likes/Reactions
  - Follow/Unfollow
  - Direct messages

- [ ] **Advanced Search**
  - Elasticsearch integration
  - Full-text search
  - Filters and sorting

- [ ] **Notifications**
  - Real-time notifications (WebSockets)
  - Push notifications
  - SMS notifications (Twilio)

- [ ] **Mobile App**
  - React Native app
  - iOS/Android deployment

---

## 📊 PROGRESS SUMMARY

### Backend
- **Completed:** 11 controllers, 10 routes, 8 validators, 2 services, auth, email ✅
- **TODO:** Webhooks, refresh tokens, admin middleware ⚠️
- **Progress:** ~85% complete (Phase 2A DONE)

### Frontend
- **Completed:** Basic UI, modals, layouts ✅
- **TODO:** Real API integration, payment UI, subscription UI, settings pages ⚠️
- **Progress:** ~30% complete

### Overall Project
- **Progress:** ~35% complete
- **Estimated Time to MVP:** 2-3 weeks (with 1 developer)
- **Critical Path:** Backend controllers → Frontend integration → Testing

---

## 🎯 RECOMMENDED ORDER (Priority)

### Week 1: Critical Backend
1. Create all 6 missing routes files
2. Create all 6 missing controllers
3. Create all 6 validators
4. Test endpoints with Postman

### Week 2: Frontend Integration
5. Update backend API client
6. Create CardForm component (Stripe Elements)
7. Real Purchase Flow (Stripe Checkout)
8. Subscription Management UI

### Week 3: Features & Polish
9. Create missing settings components
10. Implement webhooks
11. Add testing
12. Deploy to production

---

## 📝 NOTES

### Dependencies
- **Backend:** All new controllers follow same pattern as auth/profile
- **Frontend:** Needs Stripe Elements library
- **Database:** May need new migrations for RefreshToken

### Breaking Changes
- Moving from mock data to real API will require updates in multiple components
- Stripe integration requires frontend changes in multiple places

### Risks
- Stripe webhook configuration must be correct
- Email deliverability (may need custom domain)
- S3 costs (should monitor)

---

**Last Updated:** 2024-01-15  
**Total Tasks:** ~80 tasks  
**Completed:** ~28 tasks (35%)  
**Remaining:** ~52 tasks (65%)
