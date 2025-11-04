# Apple OAuth Production Setup Guide

## Prerequisites

1. Apple Developer Account ($99/year)
2. A valid domain with HTTPS (Apple requires HTTPS)
3. Access to your production server

## Step 1: Configure Apple Developer Console

### 1.1 Create App ID
1. Go to [Apple Developer Console](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → Continue
5. Select **App** → Continue
6. Fill in:
   - Description: `TyriantTrade Web`
   - Bundle ID: `com.tyriantrade.web` (Explicit)
7. Enable **Sign In with Apple** capability
8. Click **Continue** → **Register**

### 1.2 Create Services ID (for Web)
1. In **Identifiers**, click **+** again
2. Select **Services IDs** → Continue
3. Fill in:
   - Description: `TyriantTrade Web Login`
   - Identifier: `com.tyriantrade.web` (this is your APPLE_CLIENT_ID)
4. Click **Continue** → **Register**

### 1.3 Configure Services ID
1. Click on your newly created Services ID
2. Enable **Sign In with Apple**
3. Click **Configure**
4. Primary App ID: Select your App ID from step 1.1
5. Add domains and return URLs:
   - Domain: `api.tyriantrade.com`
   - Return URL: `https://api.tyriantrade.com/api/auth/apple/callback`
6. Click **Next** → **Done** → **Continue** → **Save**

### 1.4 Create Private Key
1. Go to **Keys** → **+** (Add)
2. Key Name: `TyriantTrade Auth Key`
3. Enable **Sign In with Apple**
4. Click **Configure** → Select your Primary App ID
5. Click **Save** → **Continue** → **Register**
6. **IMPORTANT**: Download the key file (AuthKey_XXXXXXXXXX.p8)
   - You can only download this once!
   - Note the **Key ID** (10 characters, e.g., 4QUQ4U396S)

### 1.5 Get Team ID
1. Go to [Membership](https://developer.apple.com/account#MembershipDetailsCard)
2. Find your **Team ID** (10 characters, e.g., CYAMCL7B32)

## Step 2: Production Server Configuration

### 2.1 Upload Private Key
```bash
# On your production server
mkdir -p /app/custom-backend/keys
# Upload AuthKey_XXXXXXXXXX.p8 to this directory
chmod 600 /app/custom-backend/keys/AuthKey_XXXXXXXXXX.p8
```

### 2.2 Set Environment Variables
Add to your production `.env`:

```env
# Apple OAuth Configuration
APPLE_CLIENT_ID=com.tyriantrade.web
APPLE_TEAM_ID=CYAMCL7B32
APPLE_KEY_ID=4QUQ4U396S
APPLE_PRIVATE_KEY_PATH=/app/custom-backend/keys/AuthKey_4QUQ4U396S.p8
APPLE_REDIRECT_URL=https://api.tyriantrade.com/api/auth/apple/callback

# For production
ENV=production
BASE_URL=https://api.tyriantrade.com
```

### 2.3 Update CORS
Ensure your CORS settings include your frontend domain:

```env
CORS_ORIGIN=https://social.tyriantrade.com
```

## Step 3: Frontend Configuration

Update your frontend OAuth initiation to use the correct production URL:

```javascript
// LoginModal.tsx or similar
const handleAppleLogin = async () => {
  try {
    const response = await fetch('https://api.tyriantrade.com/api/auth/apple');
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Apple OAuth error:', error);
  }
};
```

## Step 4: Testing in Production

### 4.1 Verify Configuration
1. Check backend logs for successful Apple OAuth initialization:
   ```
   ✅ Apple OAuth configured: ClientID=com.tyriantrade.web, TeamID=CYAMCL7B32
   ```

### 4.2 Test Flow
1. Click "Sign in with Apple" on your production site
2. You should be redirected to Apple's login page
3. After authorization, Apple will POST to your callback URL
4. Check backend logs for any errors

## Common Issues and Solutions

### Issue 1: Invalid redirect_uri
- **Cause**: URL mismatch between configuration and actual callback
- **Solution**: Ensure APPLE_REDIRECT_URL exactly matches what's configured in Apple Developer Console

### Issue 2: Invalid client
- **Cause**: Wrong Service ID or Team ID
- **Solution**: Verify APPLE_CLIENT_ID matches your Services ID

### Issue 3: Invalid grant
- **Cause**: Authorization code expired or already used
- **Solution**: Codes are single-use and expire in 5 minutes

### Issue 4: Private key errors
- **Cause**: Wrong key format or permissions
- **Solution**: Ensure .p8 file is readable and path is correct

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** on OAuth endpoints
4. **Log all OAuth attempts** for security monitoring
5. **Use HTTPS everywhere** (required by Apple)

## Monitoring and Debugging

Add these logs to track OAuth flow:

```go
// In oauth_handlers.go
log.Printf("[APPLE_OAUTH] Login initiated from IP: %s", c.IP())
log.Printf("[APPLE_OAUTH] Callback received with state: %s", state)
log.Printf("[APPLE_OAUTH] User created/logged in: %s", user.Email)
```

## Testing with Different Apple IDs

Apple provides different responses based on user type:

1. **First-time users**: Receive user data (name, email)
2. **Returning users**: Only receive user ID
3. **Hide My Email users**: Receive proxy email address

Always handle these cases in your code.

## Production Checklist

- [ ] Apple Developer account active
- [ ] App ID created with Sign In with Apple enabled
- [ ] Services ID created and configured
- [ ] Private key downloaded and secured on server
- [ ] Environment variables set correctly
- [ ] HTTPS enabled on all URLs
- [ ] CORS configured for frontend domain
- [ ] Error logging implemented
- [ ] Tested with real Apple ID

## Support

For Apple-specific issues:
- [Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer Forums](https://developer.apple.com/forums/tags/sign-in-with-apple)

For implementation issues:
- Check backend logs: `docker logs custom-backend`
- Enable debug logging in production temporarily
- Test with Apple's validation tool
