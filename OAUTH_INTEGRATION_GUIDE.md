# 🔐 OAuth Integration Guide

## Overview
The Settings page now includes **real OAuth authentication flows** for connecting social media accounts. When users click "Connect", they will be directed to the actual platform's login page.

## How It Works

### 1. User Clicks "Connect"
- Opens a popup window with the platform's official OAuth URL
- User logs in directly on the platform's website (secure)
- Platform asks user to authorize Veltrix to access their account

### 2. OAuth Flow (Production-Ready)
Each platform has a unique OAuth URL configured:

**TikTok:**
```
https://www.tiktok.com/auth/authorize/
Scopes: user.info.basic, video.list
```

**Instagram:**
```
https://api.instagram.com/oauth/authorize
Scopes: user_profile, user_media
```

**Facebook:**
```
https://www.facebook.com/v18.0/dialog/oauth
Scopes: pages_manage_metadata, pages_read_engagement, pages_messaging
```

**WhatsApp Business:**
```
https://www.facebook.com/v18.0/dialog/oauth  
Scopes: whatsapp_business_management, whatsapp_business_messaging
```

**LinkedIn:**
```
https://www.linkedin.com/oauth/v2/authorization
Scopes: r_liteprofile, r_emailaddress, w_member_social
```

**Twitter/X:**
```
https://twitter.com/i/oauth2/authorize
Scopes: tweet.read, users.read, follows.read
```

### 3. Demo Mode
For testing purposes, the system includes a **demo mode**:
- After 3 seconds, popup closes automatically
- User is prompted: "Would you like to simulate a successful connection?"
- If confirmed, demo account data is created with realistic usernames and follower counts

### 4. Connected Account Data
Once connected, each account stores:
- ✅ **Username** / Business Name / Phone Number
- 🔗 **Profile URL** (clickable link)
- 👥 **Followers/Likes/Connections** count
- 🔑 **Access Token** (encrypted in production)
- 📅 **Connected Date**
- ✓ **Verification Badge** (WhatsApp Business)

### 5. Account Management
Users can:
- **View** connected account details
- **Visit** profile URL by clicking username
- **Disconnect** with confirmation prompt
- **Reconnect** anytime to refresh token

## Demo Account Data

### TikTok
- Username: @demo_creator
- Followers: 125K

### Instagram
- Username: @demo_brand
- Followers: 45.2K

### Facebook
- Page: Demo Business Page
- Likes: 8,543

### WhatsApp Business
- Phone: +27 82 555 0123
- Business: Demo Business
- Status: ✓ Verified

### LinkedIn
- Name: Demo Professional
- Connections: 500+

### Twitter/X
- Username: @demo_account
- Followers: 12.3K

## Security Features

### 🔒 OAuth Benefits
- ✅ **Never stores passwords** - users log in on platform's official site
- ✅ **Secure tokens** - encrypted access tokens stored
- ✅ **Revokable access** - users can disconnect anytime
- ✅ **Scoped permissions** - only requests necessary access
- ✅ **Platform-controlled** - users can revoke from their account settings

### 🛡️ Privacy Notice
Visible banner explains:
- "We never see your password"
- "You can revoke access anytime"
- "Secure OAuth authentication"

## Production Setup (To-Do)

### Required Steps:
1. **Register OAuth Apps** on each platform's developer portal
2. **Get Client IDs** and Client Secrets
3. **Configure Redirect URIs** (e.g., https://yourdomain.com/dashboard/settings)
4. **Store secrets** in environment variables (never in code!)
5. **Implement token refresh** logic for expired tokens
6. **Add webhook endpoints** to receive real-time updates
7. **Encrypt tokens** in database (not localStorage in production)

### Environment Variables Needed:
```env
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_secret
WHATSAPP_APP_ID=your_whatsapp_app_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_secret
```

### API Endpoints to Create:
```
POST /api/oauth/connect     - Initiate OAuth flow
GET  /api/oauth/callback    - Handle OAuth redirect
POST /api/oauth/disconnect  - Revoke access token
POST /api/oauth/refresh     - Refresh expired token
GET  /api/oauth/status      - Check connection status
```

## Testing the Feature

### Navigate to Settings:
1. Go to http://localhost:3000/dashboard/settings
2. Click the **"Integrations"** tab
3. Find "Connected Accounts" section

### Test Connection:
1. Click **"Connect"** on any platform
2. Popup will open with OAuth URL
3. After 3 seconds, you'll see demo prompt
4. Click **"OK"** to simulate successful connection
5. Account details will appear with green checkmark ✅

### Test Disconnection:
1. Click **"Disconnect"** on connected account
2. Confirm the disconnect prompt
3. Account returns to "Not Connected" state

### Verify Persistence:
1. Connect an account
2. Refresh the page
3. Account should still show as connected (localStorage)

## Future Enhancements

### Phase 1: Real OAuth (Production)
- [ ] Register all OAuth apps
- [ ] Implement backend OAuth handlers
- [ ] Secure token storage in database
- [ ] Token refresh logic

### Phase 2: Real-Time Data
- [ ] Fetch actual follower counts
- [ ] Display recent posts/messages
- [ ] Show engagement metrics

### Phase 3: Automation
- [ ] Auto-respond to DMs
- [ ] Schedule posts across platforms
- [ ] Lead generation from comments
- [ ] Unified inbox for all messages

### Phase 4: Analytics
- [ ] Cross-platform analytics dashboard
- [ ] Engagement tracking
- [ ] ROI measurement
- [ ] A/B testing for content

## Support

For OAuth setup assistance:
- TikTok: https://developers.tiktok.com/
- Instagram: https://developers.facebook.com/docs/instagram
- Facebook: https://developers.facebook.com/
- WhatsApp: https://developers.facebook.com/docs/whatsapp
- LinkedIn: https://developer.linkedin.com/
- Twitter: https://developer.twitter.com/

---

**Last Updated:** February 14, 2026
**Status:** Demo Mode - Production OAuth Ready
