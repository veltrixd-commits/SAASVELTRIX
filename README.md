# 🚀 Veltrix Automation Platform

**Enterprise-grade automation platform** built with Next.js

## 🎯 What Makes This Different

This is NOT another CRM. This is a **custom automation ecosystem** designed to:

✅ **Own your data** - No vendor lock-in  
✅ **TikTok-native** - First-class TikTok integration  
✅ **Unlimited complexity** - No workflow limits  
✅ **Swappable providers** - Not locked to Twilio  
✅ **Multi-tenant SaaS** - White-label ready  
✅ **AI-powered** - Smart lead qualification built-in  

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Realtime**: WebSockets (Socket.io)
- **Auth**: JWT with role-based access
- **Payments**: Stripe
- **AI**: OpenAI GPT-4

### Core Systems

1. **Universal Lead Capture Engine**
   - Website forms
   - WhatsApp (Meta Business API)
   - Facebook Messenger
   - Instagram DMs
   - LinkedIn messages
   - **TikTok DMs & Lead Forms** ⭐
   - Auto-deduplication across platforms

2. **Smart Automation Engine**
   - Event-based triggers
   - Time-based scheduling
   - Behavior-based rules
   - Conditional logic
   - No limits on complexity

3. **AI Lead Qualification**
   - Auto-classify: Hot/Warm/Cold
   - Detect intent & urgency
   - Platform-aware routing
   - Sentiment analysis

4. **Unified CRM**
   - Custom pipelines per business
   - Multi-stage deal tracking
   - Activity timeline
   - Full conversation history

5. **📥 Central Inbox** ⭐ NEW
   - All messages from all platforms in one view
   - Unified DMs, comments, and conversations
   - Smart filtering and search
   - Read/unread tracking

6. **🤖 Auto-Responder System** ⭐ NEW
   - AI-powered automatic replies
   - Context-aware responses
   - Works across all platforms
   - Intent and sentiment detection

7. **📦 Delivery Center** ⭐ NEW
   - Order fulfillment management
   - Tracking number integration
   - Delivery status tracking
   - Customer notification automation

8. **Multi-Channel Messaging**
   - Abstract messaging layer
   - Provider-agnostic (swap Twilio easily)
   - Unified inbox (see Central Inbox above)
   - TikTok treated as a core channel

9. **Owner-Only Notifications**
   - Smart filtering
   - Only notify when qualified
   - Reduce noise by 90%

10. **Payments & Revenue**
   - Auto-invoicing
   - Stripe integration
   - Revenue forecasting
   - Pipeline-triggered billing

11. **Multi-Tenant SaaS**
   - Agency mode
   - Per-client isolation
   - White-label branding
   - Usage analytics per tenant

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Setup database
npm run db:push
npm run db:generate

# 4. Seed initial data (optional)
npm run db:seed

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Google & Apple OAuth Setup

Enable one-click signup/login by wiring Google and Apple credentials:

### Google
1. Create an **OAuth 2.0 Client ID** in the Google Cloud console (type: Web application).
2. Add `http://localhost:3000/api/auth/oauth/google/callback` (dev) and your production domain to the authorized redirect URIs.
3. Copy the client ID/secret into `.env`:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `GOOGLE_OAUTH_REDIRECT_URI` (optional override)

### Apple
1. Inside Apple Developer > **Certificates, Identifiers & Profiles**, create a **Service ID** for “Sign in with Apple”.
2. Generate a private key (ES256) and note the **Team ID** and **Key ID**.
3. Set the callback URL to `http://localhost:3000/api/auth/oauth/apple/callback` (and your production URL).
4. Populate `.env` with:
  - `APPLE_OAUTH_CLIENT_ID` (Service ID / Bundle ID)
  - `APPLE_OAUTH_TEAM_ID`
  - `APPLE_OAUTH_KEY_ID`
  - `APPLE_OAUTH_PRIVATE_KEY` (PEM text, newline escaped)
  - `APPLE_OAUTH_REDIRECT_URI` (optional override)

After saving the environment variables, restart `npm run dev`. The login/signup pages will now launch `/api/auth/oauth/start`, handle provider callbacks, and return users through `/oauth/complete` which links into the existing local account store.

---

## 📁 Project Structure

```
veltrix-automation-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Main dashboard
│   │   ├── leads/                # Lead management
│   │   ├── conversations/        # Unified inbox
│   │   ├── automations/          # Automation builder
│   │   ├── pipelines/            # CRM pipelines
│   │   ├── analytics/            # Reports & analytics
│   │   └── settings/             # Tenant settings
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication
│   │   ├── leads/                # Lead CRUD
│   │   ├── automations/          # Automation engine
│   │   ├── messages/             # Messaging layer
│   │   ├── webhooks/             # Platform webhooks
│   │   │   ├── tiktok/          # TikTok webhook handler
│   │   │   ├── facebook/        # FB/IG webhook handler
│   │   │   ├── whatsapp/        # WhatsApp webhook handler
│   │   │   └── linkedin/        # LinkedIn webhook handler
│   │   └── integrations/         # Platform integrations
│   └── layout.tsx
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── leads/                    # Lead components
│   ├── conversations/            # Chat components
│   ├── automations/              # Automation builder UI
│   └── analytics/                # Charts & reports
├── lib/                          # Core business logic
│   ├── db.ts                     # Prisma client
│   ├── auth.ts                   # Authentication logic
│   ├── automation-engine/        # Automation execution
│   │   ├── triggers.ts           # Trigger handlers
│   │   ├── actions.ts            # Action executors
│   │   ├── evaluator.ts          # Condition evaluator
│   │   └── scheduler.ts          # Job scheduler
│   ├── messaging/                # Multi-channel messaging
│   │   ├── providers/            # Platform adapters
│   │   │   ├── tiktok.ts        # TikTok API client
│   │   │   ├── whatsapp.ts      # WhatsApp client
│   │   │   ├── facebook.ts      # Facebook Messenger
│   │   │   ├── instagram.ts     # Instagram DMs
│   │   │   └── linkedin.ts      # LinkedIn messages
│   │   ├── unified-inbox.ts      # Message normalization
│   │   └── sender.ts             # Message dispatcher
│   ├── ai/                       # AI services
│   │   ├── classifier.ts         # Lead classification
│   │   ├── intent-detector.ts    # Intent analysis
│   │   └── sentiment.ts          # Sentiment analysis
│   ├── payments/                 # Payment processing
│   │   └── stripe.ts
│   └── utils/                    # Utilities
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
├── types/                        # TypeScript types
├── middleware.ts                 # Next.js middleware
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🔌 Platform Integrations

### TikTok (⭐ First-class support)
```typescript
// Receive TikTok Lead Form submission
POST /api/webhooks/tiktok

// Receive TikTok DM
POST /api/webhooks/tiktok/messages

// Send TikTok DM
POST /api/messages/send
{
  "platform": "TIKTOK",
  "recipientId": "user123",
  "content": "Thanks for your interest!"
}
```

### WhatsApp (Provider-agnostic)
```typescript
// Supports multiple providers:
// - Meta Business API (recommended)
// - Twilio
// - WATI
// - Custom provider

// Easy to swap providers without code changes
```

### Facebook & Instagram
```typescript
// Unified Meta integration
// Handles both Messenger and Instagram DMs
```

### LinkedIn
```typescript
// LinkedIn message integration
// Auto-sync conversations
```

---

## 🤖 Automation Examples

### Example 1: TikTok Lead Auto-Qualification
```typescript
{
  "name": "TikTok Hot Lead Filter",
  "trigger": "LEAD_CREATED",
  "filters": {
    "source": "TIKTOK"
  },
  "actions": [
    {
      "type": "AI_CLASSIFY",
      "config": { "model": "gpt-4" }
    },
    {
      "type": "CONDITIONAL",
      "condition": "intent == 'pricing' AND urgency == 'high'",
      "then": [
        { "type": "ADD_TAG", "config": { "tag": "HOT" } },
        { "type": "CHANGE_STAGE", "config": { "stage": "qualified" } },
        { "type": "NOTIFY_OWNER" }
      ],
      "else": [
        { "type": "SEND_MESSAGE", "config": { "template": "auto_reply" } }
      ]
    }
  ]
}
```

### Example 2: Cross-Platform Follow-Up
```typescript
{
  "name": "24h No Reply Follow-up",
  "trigger": "TIME_BASED",
  "triggerConfig": {
    "delay": "24h",
    "condition": "lastContactAt < 24h ago AND status == NEW"
  },
  "actions": [
    {
      "type": "SEND_MESSAGE",
      "config": {
        "platform": "WHATSAPP",  // Switch platform!
        "template": "follow_up_24h"
      }
    },
    {
      "type": "ADD_TAG",
      "config": { "tag": "FOLLOWED_UP" }
    }
  ]
}
```

### Example 3: Payment-Triggered Pipeline Movement
```typescript
{
  "name": "Move to Delivery on Payment",
  "trigger": "PAYMENT_RECEIVED",
  "actions": [
    {
      "type": "CHANGE_STAGE",
      "config": { "pipeline": "main", "stage": "in_delivery" }
    },
    {
      "type": "NOTIFY_OWNER",
      "config": {
        "message": "💰 Payment received for {{lead.name}} - Ready for delivery"
      }
    },
    {
      "type": "SEND_EMAIL",
      "config": {
        "to": "{{lead.email}}",
        "template": "welcome_to_delivery"
      }
    }
  ]
}
```

---

## 📊 Demo Scenario (TikTok-Focused)

### Scenario Flow:

1. **Lead submits TikTok Lead Form**
   - Webhook received at `/api/webhooks/tiktok`
   - Lead created with source `TIKTOK`
   - Full profile extracted

2. **Same lead sends WhatsApp message 5 mins later**
   - Webhook received at `/api/webhooks/whatsapp`
   - System matches by phone number
   - Merges platforms automatically
   - Updates `sources: [TIKTOK, WHATSAPP]`

3. **Auto-reply sent on TikTok**
   - Automation triggered: `LEAD_CREATED + source=TIKTOK`
   - TikTok DM sent via API
   - Logged in conversation history

4. **AI classifies lead as HOT**
   - Intent: "pricing"
   - Urgency: "high"
   - Score: 95/100
   - Status changed to `HOT`

5. **Follow-ups scheduled**
   - Day 1: WhatsApp message
   - Day 3: Email
   - Day 5: SMS (if no reply)

6. **Owner notified when qualified**
   - Notification: "🔥 Hot lead from TikTok: John Doe"
   - Shows: score, intent, full context
   - Owner can reply directly from dashboard

7. **Lead moved to "Delivery" stage**
   - Appointment booked
   - Payment received
   - Auto-moved through pipeline

### View This In Action:
- **Dashboard**: All leads consolidated
- **CRM Pipeline**: Visual stage progression
- **Conversations**: Unified timeline (TikTok + WhatsApp)
- **Automation Log**: Every action logged
- **Owner Notifications**: Only qualified leads

---

## 🎨 Key Platform Features

✅ **TikTok Integration** - First-class native support  
✅ **WhatsApp Provider** - Any provider (Meta, Twilio, WATI, custom)  
✅ **Workflow Limits** - Unlimited automations  
✅ **Cost per Contact** - Pay for hosting only  
✅ **Data Ownership** - Full ownership and control  
✅ **Custom Code** - Full access to codebase  
✅ **AI Classification** - GPT-4 powered lead qualification  
✅ **Multi-Tenant** - Built-in white-label support  
✅ **Open Source** - Complete transparency

---

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Tenant data isolation
- Encrypted credentials
- Webhook signature verification
- Rate limiting
- CORS protection

---

## 🚢 Deployment

### Docker (Recommended)
```bash
# Coming soon: Dockerfile and docker-compose.yml
```

### Vercel (Quick)
```bash
# Push to GitHub
# Connect to Vercel
# Add environment variables
# Deploy
```

### VPS (Custom)
```bash
# Any cloud: AWS, DigitalOcean, Hetzner, etc.
# Full control, zero vendor lock-in
```

---

## 📈 Roadmap

- [x] Core database schema
- [x] Multi-tenant architecture
- [ ] Authentication system
- [ ] Lead capture engine
- [ ] Automation engine
- [ ] TikTok integration
- [ ] WhatsApp integration
- [ ] Facebook & Instagram
- [ ] LinkedIn integration
- [ ] AI classification
- [ ] Dashboard UI
- [ ] Automation builder UI
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Zapier alternative (public webhooks)

---

## 💡 Philosophy

**Built for Africa, Built for the World**

This platform represents a new approach to business automation:
- **Ownership over rental**
- **Flexibility over templates**
- **Intelligence over rules**
- **TikTok-first over TikTok-afterthought**

Perfect for:
- Digital agencies (white-label)
- Growing businesses (owned infra)
- SaaS builders (learn & extend)
- African entrepreneurs (cost-effective)

---

## 📝 License

MIT - You own this. Build on it. Scale it. Sell it.

---

## 🤝 Contributing

This is YOUR platform. Fork it. Customize it. Make it yours.

---

## 📞 Support

Built by **Veltrix Digital**  
For agencies and businesses who demand more.

**Zero subscriptions. Full control. Infinite scale.**

---

## ⚡ Next Steps

1. **Install** → Follow Quick Start above
2. **Configure** → Add your platform API keys
3. **Customize** → Modify to your exact needs
4. **Deploy** → Own your infrastructure
5. **Scale** → Add clients, no per-seat costs

**Welcome to true automation ownership.** 🚀
