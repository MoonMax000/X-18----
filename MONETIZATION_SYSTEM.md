# Post Monetization System Documentation

## Overview

This document describes the complete post monetization system, including all modal windows, user flows, and business logic.

## Post Types & Access Levels

### 1. Public Posts (Free)
- **Access Level**: `public`
- **Badge**: "💲 FREE доступ" (blue)
- **Logic**: Content immediately visible to all users
- **Modals**: None

### 2. Followers-Only Posts (Free)
- **Access Level**: `followers`
- **Badge**: "💲 Premium · закрыто" (purple) when locked
- **Price**: FREE (requires follow only)
- **Logic**: 
  - If user is following author → Content visible
  - If user is NOT following → Show `FollowModal`
- **Modal**: `FollowModal`
- **Button**: "Follow {Author Name}" (blue gradient)

### 3. Paid Posts with Both Options
- **Access Level**: `paid`
- **Badge**: "💲 PREMIUM · ЗАКРЫТО" (purple) when locked
- **Pricing**: 
  - One-time unlock: `$X`
  - Monthly subscription: `$Y/mo`
- **Logic**:
  - If post purchased OR user subscribed → Content visible
  - Otherwise → Show two buttons
- **Modals**: 
  - `PaymentModal` (type: "unlock") for one-time purchase
  - `PaymentModal` (type: "subscribe") for subscription
- **Buttons**:
  - "Unlock for $X" (purple gradient)
  - "Subscribe $Y/mo" (transparent with purple border)
- **Info**: "Subscription gives access to all paid posts and new publications"

### 4. Subscription-Only Posts
- **Access Level**: `subscribers`
- **Badge**: "💲 PREMIUM · ЗАКРЫТО" (purple) when locked
- **Price**: `$Y/mo` (monthly subscription only)
- **Logic**:
  - If user subscribed → Content visible
  - Otherwise → Show subscription button
- **Modal**: `PaymentModal` (type: "subscribe")
- **Button**: "Subscribe $Y/mo" (transparent with purple border)
- **Description**: "Subscribe to {Author} for $Y/mo to access this content"

## Modal Windows

### 1. FollowModal
**File**: `client/components/monetization/FollowModal.tsx`

**Purpose**: Confirm free follow action to unlock followers-only content

**UI Components**:
- Header: "Follow to unlock"
- Author profile card with avatar, name, bio, followers count
- Benefits list:
  - Access to all followers-only posts
  - Exclusive insights and content
  - Updates about new publications
- Note: "100% Free - Following is completely free. No payment required"
- Buttons:
  - Cancel (gray)
  - Follow {Author Name} (blue gradient with UserPlus icon)

**States**:
- `idle`: Initial state
- `processing`: Following in progress (shows spinner)
- `success`: Follow successful (shows checkmark, auto-closes, reloads page)
- `failed`: Error occurred (shows error message)

**Flow**:
1. User clicks "Follow" button on gated content
2. Modal opens showing author profile
3. User clicks "Follow {Author Name}"
4. System processes follow request
5. On success: Shows success message → Reloads page to show unlocked content
6. On error: Shows error message, allows retry

---

### 2. PaymentModal (Unlock)
**File**: `client/components/monetization/PaymentModal.tsx`

**Purpose**: Process one-time post unlock payment

**Props**:
- `type`: "unlock"
- `amount`: Post price
- `postId`: ID of post to unlock

**UI Components**:
- Header: "Разблокировать пост"
- Amount display: `$X`
- Payment method selection: Card / PayPal
- Card input fields (mock):
  - Card number
  - Expiry date (MM/YY)
  - CVV
- Buttons:
  - Отменить (Cancel - gray)
  - Оплатить $X (Pay - purple gradient)

**States**:
- `idle`: Ready for payment
- `processing`: Payment in progress (spinner, disabled inputs)
- `success`: Payment successful (green checkmark, "Готово! ✓")
- `failed`: Payment failed (red error with message)

**Flow**:
1. User clicks "Unlock for $X" on gated content
2. Modal opens with payment form
3. User selects payment method and enters card details (mock)
4. User clicks "Оплатить $X"
5. System processes payment (simulated 2s delay)
6. On success: Shows "Пост разблокирован. Наслаждайтесь чтением!" → Reloads page
7. On error: Shows error message, allows retry

---

### 3. PaymentModal (Subscribe)
**File**: `client/components/monetization/PaymentModal.tsx`

**Purpose**: Process monthly subscription to author

**Props**:
- `type`: "subscribe"
- `amount`: Subscription price
- `authorId`: ID of author
- `authorName`: Author display name
- `plan`: "monthly" | "yearly"

**UI Components**:
- Header: "Оформить подпис��у"
- Amount display: `$X/мес` or `$X/год`
- Subscription note: "Следующее списание через 30 дней" (for monthly)
- Payment method selection: Card / PayPal
- Card input fields (same as unlock)
- Buttons:
  - Отменить (Cancel - gray)
  - Оплатить $X (Pay - purple gradient)

**States**: Same as unlock version

**Flow**:
1. User clicks "Subscribe $X/mo" button
2. Modal opens with subscription details
3. User enters payment info
4. User confirms subscription
5. System processes payment
6. On success: Shows "Подписка на {Author} оформлена!" → Reloads page
7. On error: Shows error message, allows retry

---

### 4. TipModal
**File**: `client/components/monetization/TipModal.tsx`

**Purpose**: Send voluntary tip/donation to author (separate from post unlocking)

**UI Components**:
- Header: "Send Donation"
- Author info card
- Preset amounts: $5, $10, $25, $50
- Custom amount input
- Optional message (max 200 chars)
- Buttons:
  - Отменить (Cancel)
  - Отправить ${amount} (Send - pink/rose gradient with Heart icon)

**States**:
- `idle`: Ready to send
- `processing`: Sending tip
- `success`: Tip sent successfully
- `failed`: Error sending tip

**Flow**:
1. User clicks "$ Donate" button on profile
2. Modal opens with preset amounts
3. User selects amount or enters custom
4. User optionally adds message
5. User clicks send
6. On success: Shows confirmation → Closes modal
7. On error: Shows error, allows retry

**Important**: TipModal is triggered from profile "Donate" button, NOT from gated posts

## Data Structure

### SocialPost Interface
```typescript
interface SocialPost {
  id: string;
  author: SocialAuthor;
  title: string;
  body?: string;
  isPremium?: boolean;        // Is this paid content?
  price?: number;             // One-time unlock price (e.g., 9)
  subscriptionPrice?: number; // Monthly subscription price (e.g., 29)
  unlocked?: boolean;         // Has user unlocked this post?
  audience?: "followers" | "everyone"; // Content audience
  // ... other fields
}
```

### Access Level Mapping Logic
```typescript
// From ProfileTweetsClassic.tsx transformToPost()
let accessLevel: AccessLevel = "public";

if (socialPost.audience === "followers") {
  accessLevel = "followers";  // Free, requires follow
} else if (socialPost.isPremium) {
  if (socialPost.price && socialPost.subscriptionPrice) {
    accessLevel = "paid";  // Both unlock and subscribe options
  } else if (socialPost.subscriptionPrice) {
    accessLevel = "subscribers";  // Subscribe-only
  } else {
    accessLevel = "premium";  // Premium tier
  }
}
```

## Button Styling

### Follow Button (Followers-only)
```tsx
className="bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] 
  shadow-[0_8px_24px_rgba(29,155,240,0.4)]
  hover:shadow-[0_12px_32px_rgba(29,155,240,0.6)]"
```
- Color: Blue gradient
- Shadow: Blue glow
- Icon: UserPlus

### Unlock Button (One-time payment)
```tsx
className="bg-gradient-to-r from-[#A06AFF] to-[#482090]
  shadow-[0_8px_24px_rgba(160,106,255,0.4)]
  hover:shadow-[0_12px_32px_rgba(160,106,255,0.6)]"
```
- Color: Purple gradient
- Shadow: Purple glow
- Icon: None (or Lock)

### Subscribe Button
```tsx
className="border-2 border-[#A06AFF] bg-transparent
  hover:bg-[#A06AFF]/10 
  hover:shadow-lg hover:shadow-purple-500/30"
```
- Color: Transparent with purple border
- Hover: Purple tint
- Icon: Crown (for premium tier)

### Donate Button
```tsx
className="bg-gradient-to-r from-pink-500 to-rose-500
  shadow-lg hover:shadow-xl"
```
- Color: Pink/Rose gradient
- Icon: Heart

## User Experience Flows

### Flow 1: User wants to read followers-only post
```
1. User sees post with "Follow {Author}" button
2. Clicks button → FollowModal opens
3. Sees author profile + benefits
4. Clicks "Follow {Author}"
5. Success message → Page reloads
6. Post content now visible ✓
```

### Flow 2: User wants to unlock single paid post
```
1. User sees post with two buttons
2. Clicks "Unlock for $9" → PaymentModal (unlock) opens
3. Enters payment details
4. Clicks "Оплатить $9"
5. Payment processes
6. Success message → Page reloads
7. Post content visible ✓
```

### Flow 3: User wants to subscribe to author
```
1. User sees "Subscribe $29/mo" button (from post OR "Subscribe $29/mo" alone)
2. Clicks button → PaymentModal (subscribe) opens
3. Sees subscription details + billing info
4. Enters payment details
5. Clicks "Оплатить $29"
6. Payment processes
7. Success → Page reloads
8. ALL premium posts from this author now unlocked ✓
```

### Flow 4: User wants to send tip
```
1. User on author's profile
2. Clicks "$ Donate" button → TipModal opens
3. Selects preset or custom amount
4. Adds optional message
5. Clicks "Отправить ${amount}"
6. Tip sends
7. Success confirmation → Modal closes
```

## Implementation Checklist

### Core Components
- [x] `GatedContent.tsx` - Main gating UI
- [x] `FollowModal.tsx` - Free follow confirmation
- [x] `PaymentModal.tsx` - Unlock & Subscribe payments
- [x] `TipModal.tsx` - Voluntary donations
- [x] `FeedPost.tsx` - Post display with badges
- [x] `ProfileTweetsClassic.tsx` - Post transformation logic

### Data Setup
- [x] Extended `SocialPost` interface with monetization fields
- [x] Access level mapping in `transformToPost()`
- [x] Sample posts for each type in `socialPosts.ts`

### Badges & UI
- [x] "FREE доступ" badge (blue)
- [x] "Premium · закрыто" badge (purple, locked)
- [x] "Premium · открыт" badge (purple, unlocked)
- [x] Blurred images for locked posts
- [x] Animated lock icon
- [x] Button styling variants

### API Integration (TODO)
- [ ] `POST /api/posts/{id}/unlock` - Unlock single post
- [ ] `POST /api/users/{id}/subscribe` - Subscribe to author
- [ ] `POST /api/users/{id}/follow` - Follow author
- [ ] `POST /api/users/{id}/tip` - Send tip
- [ ] `GET /api/posts/{id}/access` - Check user access

### State Management (TODO)
- [ ] Track user's purchased posts
- [ ] Track user's subscriptions
- [ ] Track user's following list
- [ ] Persist after page reload (localStorage or API)

## Future Enhancements

1. **Annual Subscriptions**: Add yearly option with discount
2. **Bundle Deals**: Unlock multiple posts at discounted rate
3. **Gift Subscriptions**: Allow users to gift subscriptions
4. **Subscription Tiers**: Multiple subscription levels (Basic, Pro, VIP)
5. **Free Trial**: 7-day free trial for subscriptions
6. **Referral System**: Earn free access by referring friends
7. **Early Bird Pricing**: Discounted price for early subscribers
8. **Payment History**: View past purchases and subscriptions
9. **Auto-renew Toggle**: Allow users to disable auto-renewal
10. **Receipt Generation**: Email receipts for all transactions

## Error Handling

### Payment Errors
- Insufficient funds
- Invalid card details
- Payment gateway timeout
- Network errors

### Follow Errors
- User already following
- Rate limit exceeded
- Network errors

### General Best Practices
1. Always show clear error messages
2. Allow retry without closing modal
3. Disable actions during processing
4. Show loading states with spinners
5. Auto-close modals only on success
6. Reload page to reflect new access state

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
