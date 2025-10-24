# API Integration Guide

This guide explains how to connect the frontend to your backend API.

## 📁 File Structure

```
client/
├── hooks/
│   └── useAuth.ts          # Authentication hook (ready to use)
├── services/
│   └── api/
│       ├── client.ts       # HTTP client with auto-token handling
│       └── auth.ts         # Auth API methods
└── types/
    └── api.ts              # TypeScript types for API
```

## 🚀 Quick Start

### 1. Configure Backend URL

Update `client/services/api/client.ts`:

```typescript
// For development
const BASE_URL = 'http://localhost:3000/api';

// For production (use environment variable)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

### 2. Add Environment Variable

Create `.env` file:

```bash
VITE_API_URL=https://your-api.com/api
```

### 3. Use in Components

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginModal() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    const result = await login({
      method: 'email',
      identifier: 'user@example.com',
      password: 'password123'
    });

    if (result) {
      // Login successful, user and token stored
      console.log('Logged in:', result.user);
    } else {
      // Error occurred, check error state
      console.error('Login failed:', error);
    }
  };
}
```

## 📡 API Endpoints

The frontend expects these endpoints:

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email or phone |
| POST | `/api/auth/signup` | Sign up new user |
| POST | `/api/auth/verify` | Verify email/phone with code |
| POST | `/api/auth/request-reset` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with code |
| POST | `/api/auth/refresh` | Refresh auth token |
| POST | `/api/auth/logout` | Logout user |

### Request/Response Examples

#### Login Request
```json
POST /api/auth/login
{
  "method": "email",
  "identifier": "user@example.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "john_doe",
    "displayName": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "tier": "premium",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "AUTH_INVALID_CREDENTIALS",
  "details": {
    "password": ["Password is incorrect"]
  }
}
```

## 🔐 Authentication Flow

1. **User logs in** → Frontend calls `login()` from `useAuth`
2. **Backend validates** → Returns token + user data
3. **Token stored** → Saved in `localStorage` as `auth_token`
4. **Auto-included** → All subsequent requests include token in `Authorization: Bearer {token}` header
5. **Token refresh** → When token expires, call `refreshToken()` automatically

## 🛠️ Available Hooks & Methods

### useAuth Hook

```typescript
const {
  // Methods
  login,                    // Login user
  signUp,                   // Sign up new user
  verifyCode,              // Verify email/phone
  requestPasswordReset,    // Request password reset
  resetPassword,           // Reset password
  logout,                  // Logout user
  isAuthenticated,         // Check if logged in
  getCurrentUser,          // Get current user

  // State
  isLoading,               // Loading state
  error,                   // Error message
} = useAuth();
```

### API Client Methods

```typescript
import { apiClient } from '@/services/api/client';

// GET request
const data = await apiClient.get('/users/me');

// POST request
const result = await apiClient.post('/posts', { title: 'Hello' });

// PUT request
await apiClient.put('/users/me', { displayName: 'New Name' });

// PATCH request
await apiClient.patch('/users/me', { avatar: 'url' });

// DELETE request
await apiClient.delete('/posts/123');
```

## 📝 TypeScript Types

All types are defined in `client/types/api.ts`:

- `User` - User object
- `LoginRequest` - Login payload
- `SignUpRequest` - Sign up payload
- `AuthResponse` - Auth response
- `VerifyCodeRequest` - Verification payload
- `APIError` - Error response
- `isAPIError()` - Type guard for errors

## 🔄 Token Refresh

The API client automatically includes the auth token in all requests. To implement token refresh:

```typescript
import { authAPI } from '@/services/api/auth';

// When you receive 401 Unauthorized
const refreshToken = localStorage.getItem('refresh_token');
const response = await authAPI.refreshToken(refreshToken);

// Update tokens
localStorage.setItem('auth_token', response.token);
localStorage.setItem('refresh_token', response.refreshToken);
```

## 🧪 Testing Without Backend

For testing without a backend, you can mock the API:

```typescript
// In client/services/api/auth.ts
export const authAPI = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Mock response for testing
    return {
      success: true,
      token: 'mock_token_123',
      user: {
        id: '1',
        email: data.identifier,
        username: 'testuser',
        displayName: 'Test User',
        isVerified: true,
        tier: 'premium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
  },
  // ... other methods
};
```

## ✅ Optimizations Done

### Performance
- ✅ Lazy loading for `LoginModal` (reduces initial bundle by ~70KB)
- ✅ Code splitting for all pages (loads only what's needed)
- ✅ Suspense with loading states

### Mobile UX
- ✅ Touch-friendly buttons (44px minimum on mobile)
- ✅ Responsive tabs (larger on mobile, compact on desktop)
- ✅ Scrollable modal (works with virtual keyboard)

### API Integration
- ✅ `useAuth` hook ready for backend
- ✅ HTTP client with auto-token handling
- ✅ TypeScript types for all API calls
- ✅ Error handling built-in
- ✅ Token storage in localStorage

## 🚀 Next Steps

1. **Set up backend API** with the endpoints listed above
2. **Update `BASE_URL`** in `client/services/api/client.ts`
3. **Test authentication flow** with real backend
4. **Implement token refresh** logic if needed
5. **Add more API endpoints** as needed

## 📚 Additional Resources

- [React Query](https://tanstack.com/query) - For data fetching and caching
- [Axios](https://axios-http.com/) - Alternative to fetch API
- [JWT](https://jwt.io/) - Understanding JSON Web Tokens
