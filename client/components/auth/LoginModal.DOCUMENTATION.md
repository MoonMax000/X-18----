# LoginModal Component Documentation

## Overview
The `LoginModal` is a comprehensive authentication modal component that handles multiple authentication flows including login, sign up, password reset, and two-factor authentication (2FA).

**Location:** `client/components/auth/LoginModal.tsx`  
**Total Lines:** ~1438 lines  
**Component Type:** Functional Component (React + TypeScript)

---

## Component Structure

### Props Interface
```typescript
interface LoginModalProps {
  isOpen: boolean;      // Controls modal visibility
  onClose: () => void;  // Callback when modal closes
}
```

---

## State Management

### Authentication States
| State | Type | Purpose |
|-------|------|---------|
| `currentScreen` | `ScreenType` | Controls which screen is displayed |
| `authMethod` | `'email' \| 'phone'` | Login method selector |
| `phoneNumber` | `string` | Phone number input |
| `email` | `string` | Email input |
| `password` | `string` | Password input |
| `showPassword` | `boolean` | Toggle password visibility |
| `phoneError` | `string` | Phone validation error message |
| `emailError` | `string` | Email validation error message |
| `authError` | `string` | General auth error message |
| `attemptsRemaining` | `number \| null` | Login attempts counter |
| `isBlocked` | `boolean` | Account block status |

### Two-Factor Authentication (2FA) States
| State | Type | Purpose |
|-------|------|---------|
| `twoFactorCode` | `string[]` | Array of 6 digits for 2FA code |
| `twoFactorError` | `string` | 2FA error message |
| `failedAttempts` | `number` | Failed 2FA attempts counter |
| `isCodeExpired` | `boolean` | Code expiration status |
| `isBlocked2FA` | `boolean` | 2FA block status |
| `canResend` | `boolean` | Can resend code flag |
| `resendTimer` | `number` | Countdown timer for resend |
| `maskedEmail` | `string` | Masked email for 2FA display |

### Password Reset States
| State | Type | Purpose |
|-------|------|---------|
| `forgotEmail` | `string` | Email for password reset |
| `newPassword` | `string` | New password input |
| `confirmNewPassword` | `string` | Confirm new password |
| `showNewPassword` | `boolean` | Toggle new password visibility |
| `showConfirmNewPassword` | `boolean` | Toggle confirm password visibility |

### Sign Up States
| State | Type | Purpose |
|-------|------|---------|
| `signupAuthMethod` | `'email' \| 'phone'` | Sign up method selector |
| `signupEmail` | `string` | Sign up email input |
| `signupPhone` | `string` | Sign up phone input |
| `signupPassword` | `string` | Sign up password |
| `signupConfirmPassword` | `string` | Confirm sign up password |
| `showSignupPassword` | `boolean` | Toggle signup password visibility |
| `showSignupConfirmPassword` | `boolean` | Toggle confirm password visibility |
| `signupEmailError` | `string` | Sign up email error |
| `signupPhoneError` | `string` | Sign up phone error |
| `signupPasswordError` | `string` | Sign up password error |
| `signupConfirmPasswordError` | `string` | Confirm password error |

### UI States
| State | Type | Purpose |
|-------|------|---------|
| `baseContentHeight` | `number \| null` | Dynamic content height |
| `baseContentWidth` | `number \| null` | Dynamic content width |

---

## Screen Types

The modal supports 7 different screens:

1. **`'login'`** - Main login screen
2. **`'2fa'`** - Two-factor authentication
3. **`'forgot-email'`** - Enter email for password reset
4. **`'forgot-sent'`** - Confirmation that reset email was sent
5. **`'create-password'`** - Create new password
6. **`'password-reset'`** - Password reset success
7. **`'signup'`** - User registration

---

## Core Functions

### Validation Functions

#### `validatePhone(value: string)`
- **Purpose:** Validates international phone numbers
- **Rules:**
  - Must start with `+` and country code
  - Minimum 10 digits
  - Maximum 15 digits
- **Returns:** `boolean`
- **Side effects:** Sets `phoneError` state

#### `validateEmail(value: string)`
- **Purpose:** Validates email format
- **Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Returns:** `boolean`
- **Side effects:** Sets `emailError` state

#### `validateSignupPhone(value: string)`
- **Purpose:** Validates phone for sign up
- **Same rules as `validatePhone`**
- **Side effects:** Sets `signupPhoneError` state

### Formatting Functions

#### `formatPhoneNumber(value: string)`
- **Purpose:** Formats phone number as user types
- **Logic:**
  - Removes all non-digit/non-+ characters
  - Ensures `+` at start
- **Returns:** Formatted `string`

### Input Handlers

#### Login Handlers
- `handlePhoneChange(e)` - Handles phone input with formatting
- `handleEmailChange(e)` - Handles email input with validation
- `handlePasswordChange(e)` - Handles password input
- `handleLogin()` - Main login function with error scenarios

#### Sign Up Handlers
- `handleSignupPhoneChange(e)` - Handles signup phone with formatting
- `handleSignupEmailChange(e)` - Handles signup email with validation
- `handleSignupPasswordChange(e)` - Handles signup password with requirements check
- `handleSignupConfirmPasswordChange(e)` - Handles password confirmation
- `handleSignupSubmit()` - Main signup function

#### 2FA Handlers
- `handle2FACodeChange(index, value)` - Handles individual digit input
- `handle2FAKeyDown(index, e)` - Handles backspace navigation
- `verify2FACode()` - Verifies 6-digit code
- `resend2FACode()` - Resends verification code

#### Forgot Password Handlers
- `handleForgotEmailChange(e)` - Handles forgot password email
- `handleForgotEmailSubmit()` - Submits forgot password request
- `handleNewPasswordChange(e)` - Handles new password input
- `handleConfirmNewPasswordChange(e)` - Handles password confirmation
- `handlePasswordResetSubmit()` - Submits password reset

### Navigation Functions

#### `handleBackNavigation()`
- **Purpose:** Navigates back through screen flow
- **Flow:**
  - `'forgot-email'` → `'login'`
  - `'forgot-sent'` → `'forgot-email'`
  - `'create-password'` → `'forgot-sent'`
  - `'2fa'` → `'login'`

---

## Password Requirements

The component enforces 4 password requirements:

1. **Length:** At least 12 characters
2. **Case:** Uppercase and lowercase letters
3. **Number:** At least one digit
4. **Special:** At least one special character (`!@#$%^&*(),.?":{}|<>`)

Each requirement displays with visual indicators:
- ✓ Green checkmark when valid
- ✗ Red X when invalid
- Gray dot when neutral (empty password)

---

## useEffect Hooks

### 1. Dynamic Height Calculation (Line ~410)
- **Trigger:** `currentScreen` changes
- **Purpose:** Maintains consistent modal height during screen transitions
- **Implementation:** Uses ResizeObserver to track content size

### 2. Resend Timer Countdown (Line ~450)
- **Trigger:** `currentScreen === '2fa'` and timer active
- **Purpose:** Countdown for resend code button
- **Interval:** 1 second

### 3. Reset Resend Timer (Line ~464)
- **Trigger:** `currentScreen === '2fa'`
- **Purpose:** Resets timer when entering 2FA screen

### 4. Code Expiration Timer (Line ~472)
- **Trigger:** `currentScreen === '2fa'`
- **Purpose:** Expires code after 60 seconds
- **Action:** Sets `isCodeExpired` flag

### 5. Auto-Verify Code (Line ~484)
- **Trigger:** All 6 digits entered
- **Purpose:** Automatically verifies when code is complete

### 6. Auto-Focus First Input (Line ~491)
- **Trigger:** `currentScreen === '2fa'`
- **Purpose:** Focuses first input on 2FA screen

### 7. **Reset on Close (Line ~497)** ✨ NEW
- **Trigger:** `isOpen === false`
- **Purpose:** Resets all form data and returns to login screen
- **Resets:** All state variables to initial values

---

## Render Functions

### `renderBackButton()`
- **Returns:** Back button JSX or `null`
- **Shows on:** All screens except `'login'`, `'signup'`, and `'password-reset'`
- **Icon:** Left arrow SVG
- **Position:** Absolute top-left

### `renderContent()`
- **Returns:** Current screen JSX
- **Switch on:** `currentScreen` state
- **Screens:**
  1. Login screen with Phone/Email toggle (removed in latest update)
  2. 2FA screen with 6-digit input
  3. Forgot email screen
  4. Email sent confirmation
  5. Create password screen
  6. Password reset success
  7. Sign up screen with Phone/Email toggle ✨ NEW

---

## Visual Structure

```
┌─────────────────────────────────────────────────────┐
│  Modal Overlay (backdrop-blur)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │  Modal Container (rounded-[25px])             │  │
│  │  ┌─────────────────┬──────────────────────┐   │  │
│  │  │  Left Panel     │  Right Panel         │   │  │
│  │  │  (Content)      │  (Logo & Text)       │   │  │
│  │  │                 │  (Desktop only)      │   │  │
│  │  │  [Back Button]  │                      │   │  │
│  │  │                 │  ┌────────────��─┐    │   │  │
│  │  │  ┌───────────┐  │  │ Animated Logo│    │   │  │
│  │  │  │ Content   │  │  └──────────────┘    │   │  │
│  │  │  │ Area      │  │                      │   │  │
│  │  │  │ (Dynamic) │  │  "Join One and Only  │   │  │
│  │  │  └───────────┘  │   Ecosystem..."      │   │  │
│  │  │                 │                      │   │  │
│  │  └─────────────────┴──────────────────────┘   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Layout Details

#### Modal Container
- **Max Width:** `max-w-4xl`
- **Border Radius:** `rounded-[25px]`
- **Shadow:** Custom centered shadow `shadow-[0_25px_50px_-12px_rgba(160,106,255,0.25)]` ✨ FIXED
- **Overflow:** `overflow-hidden`

#### Left Panel (Content)
- **Width:** `w-full md:w-[393px]`
- **Background:** `bg-[rgba(12,16,20,0.8)]` with `backdrop-blur-[50px]`
- **Border:** `border border-[#181B22]`
- **Gradient Overlay:** Purple gradient from top-left to bottom-right

#### Right Panel (Desktop Only)
- **Width:** `w-[393px]`
- **Display:** `hidden md:flex`
- **Background:** `bg-[rgba(11,14,17,0.72)]` with `backdrop-blur-[50px]`
- **Content:** Logo + marketing text

---

## Error Handling

### Login Error Scenarios

1. **Invalid Credentials**
   - Message: "Invalid login or password."
   - Shows attempts remaining
   
2. **IP Blocked (5+ attempts)**
   - Message: "Too many failed attempts. IP blocked for 15 minutes."
   - Sets `isBlocked` flag

3. **Account Locked (10+ attempts)**
   - Message: "Too many failed attempts. Account locked for 30 minutes."
   - Sets `isBlocked` flag

### 2FA Error Scenarios

1. **Invalid Code**
   - Message: "Invalid code. Please try again."
   - Clears code and refocuses

2. **Code Expired**
   - Message: "Code expired. Request a new one."
   - Shows resend option

3. **Too Many Attempts (3+)**
   - Message: "Too many failed attempts. Try again later."
   - Sets `isBlocked2FA` flag

### Sign Up Error Scenarios

1. **Invalid Email**
   - Message: "Please enter a valid email address"
   - Shows below email input

2. **Email Already Registered**
   - Message: "This email is already registered"
   - Shows below email input

3. **Phone Already in Use**
   - Message: "This phone number is already in use."
   - Shows below phone input

4. **Password Mismatch**
   - Message: "Passwords do not match"
   - Shows below confirm password input

---

## Icon Color Logic ✨ NEW

Icons change color based on input state:

```typescript
// Empty → Grey (#B0B0B0)
// Has value → White (#FFFFFF)
// Error → Red (#EF4444)

stroke={error ? "#EF4444" : value ? "#FFFFFF" : "#B0B0B0"}
```

**Applies to:**
- Phone icon
- Email icon
- Password icon (all screens)

---

## Recent Changes

### Latest Updates
1. ✨ **Removed Phone/Email toggle from Sign In** - Login now uses default method
2. ✨ **Added Phone/Email toggle to Sign Up** - Users can register with phone or email
3. ✨ **Fixed modal shadow** - Changed from `shadow-2xl shadow-primary/10` to centered custom shadow
4. ✨ **Adjusted Sign Up spacing** - Reduced gap from `gap-8` to `gap-4`, mt from `mt-8` to `mt-4`
5. ✨ **Added reset on close** - All form data resets when modal closes
6. ✨ **Icon color states** - Icons now change color: empty (grey) → filled (white) → error (red)

---

## File Organization

### Lines 1-100: Setup & State
- Imports
- Interface definitions
- State declarations
- Password requirements

### Lines 101-230: Validation & Formatting
- Phone/Email validation
- Phone number formatting
- Input change handlers

### Lines 231-310: 2FA Logic
- 2FA code handling
- Verification logic
- Resend functionality

### Lines 311-450: Password Reset
- Forgot password flow
- New password creation
- Navigation logic

### Lines 451-540: Hooks & Computed
- useEffect hooks
- Computed values
- Form validation

### Lines 541-1310: Render Functions
- `renderBackButton()`
- `renderContent()` with all screens

### Lines 1311-1438: Main Render
- Modal structure
- Left/Right panels
- Export

---

## Maintenance Tips

### Adding a New Screen

1. Add screen type to `ScreenType` union (line 9)
2. Add case to `renderContent()` switch (line ~525)
3. Add back button logic if needed (line ~507)
4. Add reset logic in close useEffect (line ~497)

### Adding Validation

1. Create validation function (after line ~145)
2. Add error state (lines 18-52)
3. Add handler function (lines 147-215)
4. Update UI with error message

### Modifying Error Messages

All error messages are hardcoded strings. Search for specific message text and update inline.

---

## Performance Considerations

- ✅ Dynamic height prevents layout shift
- ✅ Auto-focus improves UX
- ✅ Timer cleanup in useEffect
- ✅ Debounced validation on input
- ⚠️ Large component file (1438 lines) - consider splitting

---

## Suggested Refactoring

For better maintainability, consider splitting into:

1. **`LoginForm.tsx`** - Login screen
2. **`SignUpForm.tsx`** - Sign up screen
3. **`TwoFactorAuth.tsx`** - 2FA screen
4. **`ForgotPassword.tsx`** - Password reset flow
5. **`AuthModalContainer.tsx`** - Main modal wrapper
6. **`useAuthForm.ts`** - Custom hook for form state
7. **`authValidation.ts`** - Validation utilities

---

## Testing Checklist

- [ ] Login with phone number
- [ ] Login with email
- [ ] Invalid credentials (test attempts counter)
- [ ] 2FA code entry
- [ ] 2FA resend after 60s
- [ ] Code expiration
- [ ] Forgot password flow
- [ ] Sign up with email
- [ ] Sign up with phone ✨ NEW
- [ ] Password requirements validation
- [ ] Modal close resets data ✨ NEW
- [ ] Icon color changes ✨ NEW
- [ ] Back button navigation
- [ ] Mobile responsive layout

---

## Dependencies

- `react` - Component framework
- `@/lib/utils` - `cn()` utility for conditional classes
- CSS classes use Tailwind CSS

---

## Contact & Support

For questions about this component, refer to:
- Main developer documentation
- Component props interface
- This documentation file

**Last Updated:** Current session
**Documentation Version:** 1.0
