# 📥 Central Inbox & Auto-Responder Guide

## Overview

Your Veltrix Automation Platform now includes three powerful new features:

1. **📥 Central Inbox** - View all messages and comments from all platforms in one unified interface
2. **🤖 Auto-Responder** - Automatically respond to all incoming messages with intelligent, context-aware replies
3. **📦 Delivery Center** - Manage order fulfillment and track deliveries

---

## 1. Central Inbox

### What It Does

The Central Inbox consolidates all your messages, comments, and DMs from **every platform** into a single, unified view:

- **TikTok** - Lead forms + Direct messages + Comments
- **WhatsApp** - Messages
- **Facebook** - Messenger conversations
- **Instagram** - Direct messages + Comments
- **LinkedIn** - InMail messages

### Features

✅ **Unified View** - See all messages in one place  
✅ **Platform Badges** - Instantly identify which platform each message came from  
✅ **Read/Unread Status** - Track which messages need attention  
✅ **Smart Filtering** - Filter by platform, status, lead, or search text  
✅ **Pagination** - Handle thousands of messages efficiently  
✅ **Quick Actions** - Mark as read, view lead details, reply directly  
✅ **Real-time Stats** - See unread counts and 24-hour activity  

### How to Access

Navigate to **Dashboard > 📥 Inbox** or visit `/dashboard/inbox`

### API Endpoint

```typescript
GET /api/inbox
```

**Query Parameters:**
- `platform` - Filter by platform (tiktok, whatsapp, facebook, instagram, linkedin)
- `status` - Filter by status (unread, read, replied)
- `leadId` - Filter by specific lead
- `search` - Search in message content, lead names, or emails
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

**Example Request:**
```bash
curl -X GET "https://yourapp.com/api/inbox?platform=tiktok&status=unread&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "content": "Hey, interested in your services!",
        "direction": "INBOUND",
        "platform": "TIKTOK",
        "status": "DELIVERED",
        "isRead": false,
        "createdAt": "2026-02-13T10:30:00Z",
        "lead": {
          "id": "lead_456",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://..."
        },
        "platformAccount": {
          "username": "johndoe123",
          "displayName": "John Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "totalPages": 3
    },
    "stats": {
      "totalUnread": 23,
      "last24Hours": 45
    }
  }
}
```

### Mark Messages as Read

```typescript
PATCH /api/inbox
```

**Request Body:**
```json
{
  "messageIds": ["msg_123", "msg_456"],
  "action": "read"  // or "unread"
}
```

---

## 2. Auto-Responder System

### What It Does

The Auto-Responder is an **intelligent system** that automatically responds to incoming messages from **all platforms** with contextually appropriate replies. It uses **AI-powered intent detection** to understand what the customer wants and responds accordingly.

### How It Works

1. **Message Received** - Customer sends message on any platform
2. **Intent Analysis** - AI detects customer intent (pricing, support, booking, etc.)
3. **Sentiment Analysis** - AI analyzes tone (positive, negative, neutral)
4. **Smart Response** - System generates appropriate response
5. **Human-like Delay** - Optional delay makes it feel more natural
6. **Auto-Send** - Response sent automatically
7. **Activity Logged** - Everything tracked in timeline

### Supported Intents

The system recognizes and responds to:

- **Pricing/Cost** - "How much does it cost?"
- **Questions/Inquiries** - General questions
- **Appointments/Booking** - "Can I schedule a call?"
- **Complaints/Issues** - Problem reports
- **Support/Help** - "I need help with..."
- **Greetings** - "Hi", "Hello"
- **Thanks** - "Thank you"
- **Custom Intents** - Add your own!

### Configuration

Auto-responder is configured per tenant via the `Integration` model:

```typescript
{
  provider: "AUTO_RESPONDER",
  active: true,
  config: {
    enabled: true,
    platforms: ["TIKTOK", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "LINKEDIN"],
    responseDelay: 3000, // 3 seconds (appears more human)
    businessHoursOnly: false, // Respond 24/7
    blacklistedKeywords: ["spam", "unsubscribe"],
    customResponses: {
      "pricing": "Hi {name}! Our pricing starts at $99/month. Book a call for custom quote: [link]",
      "demo": "Hi {name}! I'd love to show you a demo. What's your availability this week?"
    }
  }
}
```

### Custom Response Templates

You can customize responses for specific intents using template variables:

**Available Variables:**
- `{name}` - Lead's full name
- `{firstName}` - Lead's first name
- `{email}` - Lead's email
- `{phone}` - Lead's phone number

**Example:**
```typescript
{
  "pricing": "Hi {firstName}! 👋 Thanks for asking about pricing. Our plans start at $99/month for businesses like yours. Want to see which plan fits best? Let's schedule a quick 15-min call: [booking_link]"
}
```

### Enable Auto-Responder

Add this to your database (or create via UI):

```typescript
await db.integration.create({
  data: {
    tenantId: 'your-tenant-id',
    provider: 'AUTO_RESPONDER',
    active: true,
    config: {
      enabled: true,
      platforms: ['TIKTOK', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN'],
      responseDelay: 3000,
      businessHoursOnly: false,
    },
  },
});
```

### Auto-Responder Logic

Located in: `lib/automation/auto-responder.ts`

**Key Features:**

✅ **Intent Detection** - Uses AI to understand customer intent  
✅ **Sentiment Analysis** - Detects positive/negative/neutral tone  
✅ **Context-Aware** - References lead name and previous conversation  
✅ **Duplicate Prevention** - Won't spam if already responded recently  
✅ **Business Hours** - Optional business hours only mode  
✅ **Keyword Blacklist** - Don't respond to spam/unsubscribe keywords  
✅ **Human-like Delays** - Configurable delay before responding  
✅ **Cross-Platform** - Works on all integrated platforms  
✅ **Activity Logging** - All auto-responses logged in timeline  

### How It's Triggered

Auto-responder is **automatically triggered** when messages are received via webhooks:

**TikTok Webhook** (`app/api/webhooks/tiktok/route.ts`):
```typescript
// When DM received
const result = await tiktok.processDirectMessage(value, tenantId)
await triggerAutoResponse(tenantId, result.message.id) // Auto-respond!
```

**WhatsApp Webhook** (`app/api/webhooks/whatsapp/route.ts`):
```typescript
// When message received
const result = await whatsapp.processIncomingMessage(messageData, tenantId)
await triggerAutoResponse(tenantId, result.message.id) // Auto-respond!
```

### Example Auto-Response Flow

**Customer (TikTok DM):**
> "Hey, how much does your marketing package cost?"

**System Analysis:**
- Intent: `pricing`
- Sentiment: `neutral`
- Lead: John Doe

**Auto-Response (3 seconds later):**
> "Hi John! 👋 Thanks for your interest in our pricing. I'll get you detailed pricing information right away. Can you let me know which service you're most interested in?"

**Result:**
- Customer feels heard immediately
- Lead stays engaged
- Team has time to prepare detailed response
- All logged in CRM

### Disable for Specific Conversations

If you want to disable auto-response for a specific lead or conversation:

```typescript
await db.lead.update({
  where: { id: leadId },
  data: {
    metadata: {
      ...existingMetadata,
      autoResponseDisabled: true,
    },
  },
});
```

---

## 3. Delivery Center

### What It Does

The Delivery Center helps you **manage order fulfillment** and track deliveries. It shows:

- **Pending Orders** - Orders waiting to be fulfilled
- **Fulfilled Orders** - Completed deliveries
- **Cancelled Orders** - Cancelled orders
- **Tracking Numbers** - Shipping/delivery tracking
- **Customer Details** - Who ordered what
- **Invoice Status** - Payment tracking

### Features

✅ **Order Management** - View all orders in one place  
✅ **Fulfillment Tracking** - Mark orders as fulfilled  
✅ **Tracking Numbers** - Add shipping tracking info  
✅ **Delivery Notes** - Add notes about delivery  
✅ **Customer Info** - See customer details  
✅ **Invoice Integration** - View related invoices  
✅ **Status Filtering** - Filter by pending/fulfilled/cancelled  
✅ **Search** - Search by order, customer name, or email  
✅ **Performance Metrics** - Fulfillment rate, totals, etc.  

### How to Access

Navigate to **Dashboard > 📦 Delivery** or visit `/dashboard/delivery`

### API Endpoint

```typescript
GET /api/delivery
```

**Query Parameters:**
- `status` - Filter by status (pending, fulfilled, cancelled)
- `assignedTo` - Filter by assigned team member
- `search` - Search orders or customers
- `page` - Page number
- `limit` - Results per page

**Example Request:**
```bash
curl -X GET "https://yourapp.com/api/delivery?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "deal_123",
        "title": "Premium Marketing Package",
        "value": 1999.99,
        "currency": "USD",
        "stage": {
          "name": "Payment Received",
          "color": "#10b981"
        },
        "lead": {
          "id": "lead_456",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "fulfillmentStatus": "pending",
        "createdAt": "2026-02-13T10:00:00Z",
        "expectedDelivery": "2026-02-20T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    },
    "stats": {
      "pending": 15,
      "fulfilled": 120,
      "total": 135,
      "fulfillmentRate": 88.89
    }
  }
}
```

### Mark Order as Fulfilled

```typescript
PATCH /api/delivery
```

**Request Body:**
```json
{
  "orderId": "deal_123",
  "fulfillmentStatus": "fulfilled",
  "trackingNumber": "USPS1234567890",
  "deliveryNotes": "Delivered to reception. Signed by John."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "deal_123",
    "fulfillmentStatus": "fulfilled",
    "fulfillmentDate": "2026-02-13T15:30:00Z",
    "trackingNumber": "USPS1234567890"
  },
  "message": "Order fulfillment updated successfully"
}
```

### Order Lifecycle

1. **Deal Created** - Customer makes purchase
2. **Payment Received** - Invoice marked as paid
3. **Auto-Tagged as "Pending"** - Appears in Delivery Center
4. **Team Fulfills** - Product/service delivered
5. **Marked as "Fulfilled"** - Tracking + notes added
6. **Customer Notified** - Activity logged
7. **Pipeline Updated** - Deal moved to "Delivered" stage

### Automation Integration

You can automate delivery notifications:

```typescript
// When order is fulfilled
{
  "trigger": "DEAL_UPDATED",
  "conditions": [
    {
      "field": "metadata.fulfillmentStatus",
      "operator": "equals",
      "value": "fulfilled"
    }
  ],
  "actions": [
    {
      "type": "SEND_MESSAGE",
      "config": {
        "template": "Hi {name}! 🎉 Your order has been fulfilled! Tracking: {trackingNumber}"
      }
    },
    {
      "type": "NOTIFY_OWNER",
      "config": {
        "message": "Order fulfilled: {dealTitle}"
      }
    }
  ]
}
```

---

## Integration with Existing Features

### How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER JOURNEY                         │
└─────────────────────────────────────────────────────────────┘

1. Customer Messages (TikTok/WhatsApp/etc.)
                ↓
2. Message Appears in 📥 CENTRAL INBOX
                ↓
3. 🤖 AUTO-RESPONDER Sends Reply (instantly)
                ↓
4. Lead Qualifies → Deal Created
                ↓
5. Payment Received
                ↓
6. Order Appears in 📦 DELIVERY CENTER
                ↓
7. Team Marks as Fulfilled
                ↓
8. Customer Notified → Tracking Sent
                ↓
9. Deal Moved to "Delivered"
```

### Database Structure

**Orders are stored as Deals:**

```typescript
model Deal {
  id                String    @id @default(cuid())
  tenantId          String
  leadId            String
  title             String
  value             Float
  currency          String    @default("USD")
  expectedCloseDate DateTime?
  metadata          Json?     // Includes fulfillmentStatus, trackingNumber, etc.
  
  // Relations
  lead              Lead      @relation(...)
  stage             PipelineStage @relation(...)
  invoices          Invoice[]
  
  @@index([tenantId, metadata.fulfillmentStatus])
}
```

**Fulfillment metadata:**
```json
{
  "fulfillmentStatus": "pending" | "fulfilled" | "cancelled",
  "fulfillmentDate": "2026-02-13T15:30:00Z",
  "trackingNumber": "USPS1234567890",
  "deliveryNotes": "Left at front door",
  "updatedBy": "user_123"
}
```

---

## Quick Setup Guide

### Step 1: Enable Auto-Responder

```sql
INSERT INTO "Integration" (
  "id",
  "tenantId",
  "provider",
  "active",
  "config"
) VALUES (
  'int_autoresponder',
  'your-tenant-id',
  'AUTO_RESPONDER',
  true,
  '{
    "enabled": true,
    "platforms": ["TIKTOK", "WHATSAPP", "FACEBOOK", "INSTAGRAM", "LINKEDIN"],
    "responseDelay": 3000,
    "businessHoursOnly": false
  }'::jsonb
);
```

### Step 2: Test Inbox

1. Go to `/dashboard/inbox`
2. Send a test message from TikTok/WhatsApp
3. See it appear in inbox
4. Watch auto-responder send reply!

### Step 3: Test Delivery Center

1. Create a test deal with payment
2. Go to `/dashboard/delivery`
3. Mark order as fulfilled
4. Add tracking number
5. Check activity log

---

## Customization

### Custom Auto-Responses

Edit `lib/automation/auto-responder.ts`:

```typescript
private async generateResponse(
  messageContent: string,
  intent: string,
  sentiment: string,
  lead: any
): Promise<string> {
  // Add your custom logic here
  if (intent === 'your_custom_intent') {
    return `Custom response for ${lead.name}!`;
  }
  
  // Fall back to default
  return this.defaultResponses[intent];
}
```

### Custom Delivery Statuses

Extend the fulfillment workflow:

```typescript
// In your Deal model metadata
{
  "fulfillmentStatus": "pending",
  "fulfillmentSteps": [
    { "step": "ordered", "completed": true, "date": "..." },
    { "step": "processing", "completed": true, "date": "..." },
    { "step": "shipped", "completed": false },
    { "step": "delivered", "completed": false }
  ]
}
```

### Custom Inbox Filters

Add more filters to inbox UI:

```typescript
// In app/dashboard/inbox/page.tsx
<select onChange={(e) => setCustomFilter(e.target.value)}>
  <option value="vip">VIP Leads Only</option>
  <option value="hot">Hot Leads Only</option>
  <option value="needs-response">Needs Response</option>
</select>
```

---

## Best Practices

### Auto-Responder

✅ **Keep responses friendly and conversational**  
✅ **Always include lead's name**  
✅ **Set a response delay (2-5 seconds) to seem human**  
✅ **Don't auto-respond to obvious spam**  
✅ **Use business hours mode for B2B**  
✅ **Customize responses for your industry**  
✅ **Monitor and adjust based on feedback**  

### Inbox Management

✅ **Check unread messages regularly**  
✅ **Use filters to prioritize hot leads**  
✅ **Mark messages as read after handling**  
✅ **Use search to find specific conversations**  
✅ **Review auto-responses and adjust as needed**  

### Delivery Center

✅ **Update fulfillment status promptly**  
✅ **Always add tracking numbers when available**  
✅ **Include delivery notes for transparency**  
✅ **Set realistic expected delivery dates**  
✅ **Notify customers when orders ship**  
✅ **Monitor fulfillment rate metrics**  

---

## Troubleshooting

### Auto-Responder Not Working

1. **Check if enabled:**
```sql
SELECT * FROM "Integration" 
WHERE "provider" = 'AUTO_RESPONDER' 
AND "active" = true;
```

2. **Check webhook logs:**
```sql
SELECT * FROM "WebhookLog" 
WHERE "status" = 'FAILED' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

3. **Verify AI service:**
- Ensure `OPENAI_API_KEY` is set in `.env`
- Check OpenAI API quota/limits

### Messages Not Appearing in Inbox

1. **Verify message creation:**
```sql
SELECT * FROM "Message" 
WHERE "createdAt" > NOW() - INTERVAL '1 hour' 
ORDER BY "createdAt" DESC;
```

2. **Check conversation linkage:**
```sql
SELECT m.*, c.* 
FROM "Message" m
JOIN "Conversation" c ON m."conversationId" = c.id
WHERE c."tenantId" = 'your-tenant-id';
```

### Orders Not Showing in Delivery Center

1. **Check deal metadata:**
```sql
SELECT id, title, metadata 
FROM "Deal" 
WHERE "tenantId" = 'your-tenant-id';
```

2. **Add fulfillment status if missing:**
```sql
UPDATE "Deal" 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{fulfillmentStatus}',
  '"pending"'
)
WHERE metadata->>'fulfillmentStatus' IS NULL;
```

---

## Performance Tips

### Inbox Optimization

- Use pagination (50 messages per page)
- Index on `readAt`, `createdAt`, `platform`
- Cache unread counts
- Use WebSocket for real-time updates

### Auto-Responder Optimization

- Set reasonable response delays (3-5 seconds)
- Cache AI intent/sentiment results
- Use database indexes on `direction`, `createdAt`
- Batch process messages if high volume

### Delivery Center Optimization

- Index on `metadata.fulfillmentStatus`
- Pre-compute fulfillment metrics
- Use database views for complex queries
- Cache statistics

---

## Future Enhancements

### Planned Features

- [ ] **Inbox**: Real-time message updates via WebSocket
- [ ] **Inbox**: Voice message support
- [ ] **Inbox**: Media preview (images, videos)
- [ ] **Auto-Responder**: Multi-language support
- [ ] **Auto-Responder**: A/B testing for responses
- [ ] **Auto-Responder**: Smart escalation (hand-off to human)
- [ ] **Delivery**: Bulk fulfillment actions
- [ ] **Delivery**: Shipping label generation
- [ ] **Delivery**: Customer delivery portal
- [ ] **All**: Mobile apps (iOS/Android)

---

## Summary

You now have **three powerful features**:

1. **📥 Central Inbox** - All messages in one place
2. **🤖 Auto-Responder** - Intelligent automatic replies
3. **📦 Delivery Center** - Order fulfillment management

**These features work together to:**
- Capture every message from every platform
- Respond instantly with intelligent, context-aware replies
- Track orders from payment to delivery
- Provide amazing customer experience
- Scale your business without hiring more staff

**Cost Savings:**
- No need for separate helpdesk (saves $50-200/month)
- No need for fulfillment software (saves $30-100/month)
- Reduce response time from hours to seconds
- Handle 10x more messages with same team

**Your competitive advantages:**
- ✅ Instant responses 24/7
- ✅ Unified inbox (competitors use 5+ tools)
- ✅ AI-powered intelligence
- ✅ End-to-end tracking
- ✅ Full data ownership
- ✅ Zero vendor lock-in

---

**Built with ❤️ by Veltrix Digital**  
**Version: 2.0.0**  
**Last Updated: February 13, 2026**
