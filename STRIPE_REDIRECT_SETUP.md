# Stripe Connect Redirect URI Setup

## ✅ Configuration Complete

Your backend is now configured with:
- **Stripe Client ID**: `ca_T79vAXmyMeRCfLB7JH9A80KplW3sRJs7`
- **Publishable Key**: `pk_test_51SAAyA5L1ldpQtHX...`
- **Secret Key**: `sk_test_51SAAyA5L1ldpQtHX...`
- **Backend URL (ngrok)**: `https://social.tyriantrade.ngrok.pro`
- **Frontend URL**: `http://localhost:8080`

## 🔧 Next Step: Configure Stripe Dashboard

You need to add the redirect URIs to your Stripe Connect settings:

### 1. Go to Stripe Dashboard
Visit: https://dashboard.stripe.com/test/connect/accounts/settings

### 2. Add Redirect URIs
In the **Redirects** section, add these two URIs:

```
https://social.tyriantrade.ngrok.pro/api/v1/stripe-connect/callback
http://localhost:3001/api/v1/stripe-connect/callback
```

### 3. Save Changes
Click **Save** in the Stripe Dashboard.

## 📋 How It Works

1. **ngrok tunnel** (`https://social.tyriantrade.ngrok.pro`) tunnels to your local backend on `http://localhost:3001`
2. When users click "Connect with Stripe", they're redirected to Stripe OAuth
3. After authorization, Stripe redirects back to: `https://social.tyriantrade.ngrok.pro/api/v1/stripe-connect/callback`
4. Your backend (GET endpoint) receives the authorization code and exchanges it for connected account credentials
5. The encrypted credentials are stored in your database
6. The user is redirected back to the frontend at `/settings?tab=monetization&connected=true`

## 🔐 About ngrok API Keys

**You don't need to provide ngrok API keys to the backend.**

ngrok works as a tunneling service that:
- Runs on your local machine
- Exposes your local port (3001) to the internet via the ngrok domain
- The backend just receives normal HTTP requests through the tunnel

The backend only needs to know the **public ngrok URL** (already configured as `FRONTEND_URL`).

## 🧪 Testing the Flow

Once you've added the redirect URIs in Stripe Dashboard:

1. Start your backend: `cd backend && npm run dev`
2. Start ngrok (if not already running): `ngrok http 3001 --domain=social.tyriantrade.ngrok.pro`
3. Start your frontend: `npm run dev`
4. Navigate to Settings → Monetization
5. Click "Connect Stripe Account"
6. Complete the Stripe Connect flow

## 🔍 Troubleshooting

**If redirect fails:**
- Verify both URIs are added in Stripe Dashboard
- Check ngrok is running and pointing to port 3001
- Verify `FRONTEND_URL` in `backend/.env` matches your ngrok domain
- Check backend logs for errors

**Common Issues:**
- **"redirect_uri_mismatch"**: The URI in Stripe Dashboard doesn't exactly match the callback URL. Make sure it's exactly: `https://social.tyriantrade.ngrok.pro/api/v1/stripe-connect/callback`
- **ngrok tunnel expired**: Free ngrok tunnels expire; paid accounts have persistent domains (you have this ✅)
- **Port mismatch**: Ensure ngrok tunnels to the same port your backend runs on (3001)
- **CORS errors**: Make sure `FRONTEND_URL` in backend/.env matches your frontend dev server URL

## 📝 Environment Variables Summary

### Backend (`backend/.env`):
```env
PORT=3001
BACKEND_URL="https://social.tyriantrade.ngrok.pro"  # ngrok tunnel to backend
FRONTEND_URL="http://localhost:8080"  # Frontend dev server
STRIPE_SECRET_KEY="sk_test_51SAAyA5L1ldpQtHX..."
STRIPE_PUBLISHABLE_KEY="pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE"
STRIPE_CLIENT_ID="ca_T79vAXmyMeRCfLB7JH9A80KplW3sRJs7"
```

### Frontend (`.env`):
```env
VITE_API_URL=http://localhost:8080
```

## ✨ Ready to Test

Your Stripe Connect integration is configured and ready to test once you add the redirect URIs in the Stripe Dashboard!
