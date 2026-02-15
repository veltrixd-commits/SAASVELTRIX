# Veltrix Automation Platform - DEMO GUIDE

## 🎬 Live Demo Scenario: TikTok Lead Journey

This guide walks through the complete demo scenario showing how the platform handles a TikTok lead from first contact to delivery.

---

## 📋 Demo Flow

### Step 1: TikTok Lead Form Submission
**What Happens:**
- User sees TikTok ad
- Clicks "Learn More"
- Fills lead form:
  - Name: John Doe
  - Phone: +1234567890
  - Interest: "Pricing information"

**Behind the Scenes:**
```
POST /api/webhooks/tiktok
{
  "lead_id": "tiktok_12345",
  "user_id": "user_abc",
  "form_id": "form_xyz",
  "fields": [
    { "field_name": "name", "field_value": "John Doe" },
    { "field_name": "phone", "field_value": "+1234567890" },
    { "field_name": "interest", "field_value": "Pricing information" }
  ]
}
```

**Result:**
- ✅ Lead created in database
- ✅ TikTok platform account linked
- ✅ Source: TIKTOK
- ✅ Automation triggered: LEAD_CREATED

---

### Step 2: Same User Messages on WhatsApp
**What Happens:**
- 5 minutes later, John messages on WhatsApp:
  - "Hi, I just filled your form. When can we start?"

**Behind the Scenes:**
```
POST /api/webhooks/whatsapp
{
  "from": "+1234567890",
  "text": { "body": "Hi, I just filled your form. When can we start?" }
}
```

**Smart Matching:**
- System detects phone number matches existing TikTok lead
- **Auto-merges** platforms
- Updates: `sources: [TIKTOK, WHATSAPP]`
- Full conversation history preserved

**Result:**
- ✅ Single lead profile (not duplicate)
- ✅ Cross-platform identity resolved
- ✅ Conversation timeline updated
- ✅ Automation triggered: MESSAGE_RECEIVED

---

### Step 3: Auto-Reply Sent on TikTok
**What Happens:**
- Automation detects new TikTok lead
- Sends immediate response via TikTok DM

**Message:**
```
Thanks for your interest! 🎉

We'll analyze your requirements and get back to you shortly.

In the meantime, check out our portfolio: [link]
```

**Result:**
- ✅ Instant engagement
- ✅ Reply sent on lead's preferred platform (TikTok)
- ✅ Message logged in conversation history
- ✅ Lead feels acknowledged

---

### Step 4: AI Classifies Lead as HOT
**What Happens:**
- AI analyzes:
  - Message: "When can we start?"
  - Form interest: "Pricing information"
  - Platform: TikTok (high-intent)
  - Urgency keywords: "when", "start"

**AI Classification:**
```json
{
  "intent": "pricing",
  "urgency": "high",
  "score": 95,
  "qualification": "hot",
  "reasoning": "User explicitly asks about pricing and shows urgency to start. Direct question indicates decision-ready mindset."
}
```

**Result:**
- ✅ Status changed: NEW → HOT
- ✅ Tag added: "HOT"
- ✅ Score: 95/100
- ✅ Priority elevated

---

### Step 5: Follow-ups Scheduled
**What Happens:**
- Automation engine schedules multi-channel follow-ups:

**Schedule:**
```
Day 1 (WhatsApp): "Hi John! Thanks for reaching out. Let's discuss..."
Day 3 (Email): "Detailed pricing breakdown attached"
Day 5 (SMS): "Quick check-in - any questions?"
```

**Smart Logic:**
- Switch platforms to increase engagement
- Time-based triggers
- Stops if lead responds

**Result:**
- ✅ Automated nurture sequence active
- ✅ Multi-platform engagement strategy
- ✅ Zero manual work required

---

### Step 6: Owner Notified (Qualified Leads Only)
**What Happens:**
- System detects HOT qualification
- Sends notification to business owner

**Notification:**
```
🔥 HOT LEAD ALERT

Name: John Doe
Source: TikTok + WhatsApp
Score: 95/100
Intent: Pricing
Urgency: High

Last Message: "Hi, I just filled your form. When can we start?"

[View Lead] [Reply Now]
```

**Intelligent Notification System:**
- ✅ Only qualified, high-value leads trigger notifications
- ✅ Reduces noise by 90%
- ✅ Owner focuses on closing, not screening
- ✅ Complete context provided for immediate engagement

**Result:**
- ✅ Owner sees only qualified leads
- ✅ Complete context provided
- ✅ Ready to engage immediately

---

### Step 7: Lead Moved to Delivery Stage
**What Happens:**
- Owner replies and books appointment
- Quote sent and accepted
- Payment received via Stripe

**Pipeline Movement:**
```
Lead → Qualified → Quote Sent → Payment Received → In Delivery
```

**Automation Triggers:**
```
PAYMENT_RECEIVED → {
  - Move to "In Delivery" stage
  - Send welcome email
  - Notify owner: "💰 Payment received - Ready for delivery"
  - Create internal task for team
  - Start delivery workflow
}
```

**Result:**
- ✅ Fully automated pipeline
- ✅ Zero manual stage updates
- ✅ Owner informed at key moments
- ✅ Client gets immediate confirmation

---

## 🎯 What This Demonstrates

### Platform Capabilities:

✅ **TikTok Integration** - First-class native support  
✅ **Cross-Platform Merge** - Automatic lead deduplication  
✅ **AI Classification** - GPT-4 powered qualification  
✅ **Owner Notifications** - Qualified leads only, reducing noise by 90%  
✅ **Platform Switching** - Multi-channel communication management  
✅ **Data Ownership** - Full control and ownership of all data  

---

## 📊 Key Metrics Shown in Dashboard

After demo scenario:

```
Total Leads: 248 (+1: John Doe)
Hot Leads: 47 (+1)
Active Conversations: 89 (+2: TikTok + WhatsApp)
Automations Running: 12 (all active)

Platform Breakdown:
- TikTok: 89 leads (36%)
- WhatsApp: 67 leads (27%)
- Facebook: 45 leads (18%)
- Instagram: 32 leads (13%)
- LinkedIn: 12 leads (5%)
- Website: 3 leads (1%)
```

---

## 🚀 How to Run the Demo

### 1. Setup
```bash
npm install
npm run db:push
npm run db:seed  # Creates demo data
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Webhook
```bash
# Simulate TikTok lead form
curl -X POST http://localhost:3000/api/webhooks/tiktok \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"field":"leadgen","value":{"lead_id":"demo123","user_id":"user456","fields":[{"field_name":"name","field_value":"John Doe"},{"field_name":"phone","field_value":"+1234567890"}]}}]}]}'

# Simulate WhatsApp message
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"from":"+1234567890","text":{"body":"When can we start?"}}]}}]}]}'
```

### 4. View Dashboard
```
http://localhost:3000/dashboard
```

---

## 📁 Key Files to Review

- `prisma/schema.prisma` - Complete database schema
- `lib/messaging/providers/tiktok.ts` - TikTok integration
- `lib/automation-engine/engine.ts` - Automation logic
- `lib/ai/classifier.ts` - AI classification
- `app/api/webhooks/tiktok/route.ts` - TikTok webhook handler
- `app/dashboard/page.tsx` - Dashboard UI

---

## 💡 Customization Points

1. **AI Prompts** - Modify in `lib/ai/classifier.ts`
2. **Automation Rules** - Configure in database
3. **WhatsApp Provider** - Swap in `lib/messaging/providers/whatsapp.ts`
4. **Notification Logic** - Adjust in `lib/automation-engine/engine.ts`

---

## 🎓 Learning Outcomes

By exploring this demo, you'll understand:

✅ Multi-platform lead capture
✅ Identity resolution across platforms
✅ AI-powered qualification
✅ Event-driven automation
✅ Smart owner notifications
✅ Pipeline automation
✅ Multi-tenant architecture
✅ Provider-agnostic design

---

**Built by Veltrix Digital**
**Zero subscriptions. Full control. Infinite scale.**
