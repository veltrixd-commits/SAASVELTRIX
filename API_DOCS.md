# 🚀 Veltrix Automation Platform - API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API requests (except webhooks) require a JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "tenant_id_here"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /api/auth/login
Login and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx123...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STAFF",
    "tenantId": "tenant_123"
  },
  "tenant": {
    "id": "tenant_123",
    "name": "Acme Corp",
    "slug": "acme-corp"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👥 Lead Endpoints

### GET /api/leads
List all leads with filtering and pagination.

**Query Parameters:**
- `status` - Filter by status (NEW, CONTACTED, QUALIFIED, HOT, WARM, COLD, CONVERTED, LOST)
- `source` - Filter by source (TIKTOK, WHATSAPP, FACEBOOK, INSTAGRAM, LINKEDIN, WEBSITE)
- `assignedTo` - Filter by assigned user ID
- `search` - Search by name, email, or phone
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

**Example:**
```http
GET /api/leads?status=HOT&source=TIKTOK&page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "leads": [
    {
      "id": "lead_123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "status": "HOT",
      "primarySource": "TIKTOK",
      "sources": ["TIKTOK", "WHATSAPP"],
      "score": 95,
      "intent": "pricing",
      "urgency": "high",
      "tags": ["HOT", "VIP"],
      "platformAccounts": [
        {
          "platform": "TIKTOK",
          "platformId": "tiktok_user_123",
          "username": "@johndoe"
        }
      ],
      "assignedTo": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2026-02-13T10:30:00Z",
      "lastContactAt": "2026-02-13T11:45:00Z",
      "_count": {
        "conversations": 2,
        "activities": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 248,
    "pages": 13
  }
}
```

### POST /api/leads
Create a new lead manually.

**Request:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+9876543210",
  "source": "WEBSITE",
  "company": "Tech Corp",
  "position": "CEO",
  "tags": ["VIP", "Enterprise"],
  "customFields": {
    "industry": "Technology",
    "employees": "50-100"
  },
  "assignedToId": "user_789"
}
```

**Response:**
```json
{
  "id": "lead_new",
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "status": "NEW",
  "primarySource": "WEBSITE",
  "sources": ["WEBSITE"],
  "createdAt": "2026-02-13T12:00:00Z"
}
```

### GET /api/leads/:id
Get full lead details including conversations, activities, and appointments.

**Response:**
```json
{
  "id": "lead_123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "HOT",
  "score": 95,
  "intent": "pricing",
  "urgency": "high",
  "platformAccounts": [...],
  "conversations": [
    {
      "id": "conv_123",
      "platform": "TIKTOK",
      "messages": [
        {
          "id": "msg_456",
          "direction": "INBOUND",
          "content": "I'm interested in your services",
          "createdAt": "2026-02-13T10:30:00Z"
        },
        {
          "id": "msg_457",
          "direction": "OUTBOUND",
          "content": "Thanks for reaching out! Let me help you...",
          "automated": true,
          "createdAt": "2026-02-13T10:31:00Z"
        }
      ]
    }
  ],
  "activities": [
    {
      "type": "MESSAGE",
      "title": "TikTok message received",
      "createdAt": "2026-02-13T10:30:00Z"
    },
    {
      "type": "STATUS_CHANGE",
      "title": "Lead qualified as HOT",
      "createdAt": "2026-02-13T10:32:00Z"
    }
  ],
  "appointments": [],
  "deals": []
}
```

### PATCH /api/leads/:id
Update lead information.

**Request:**
```json
{
  "status": "QUALIFIED",
  "tags": ["HOT", "VIP", "DEMO_SCHEDULED"],
  "assignedToId": "user_999",
  "stageId": "stage_qualified"
}
```

### DELETE /api/leads/:id
Delete a lead (cascade deletes related records).

---

## 💬 Messaging Endpoints

### POST /api/messages/send
Send a message to a lead on any platform.

**Request:**
```json
{
  "leadId": "lead_123",
  "platform": "WHATSAPP",
  "content": "Hi John, following up on your inquiry...",
  "mediaUrl": "https://example.com/image.jpg", // optional
  "automated": false
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "msg_789",
    "conversationId": "conv_123",
    "direction": "OUTBOUND",
    "content": "Hi John, following up...",
    "status": "SENT",
    "createdAt": "2026-02-13T12:00:00Z"
  },
  "platformResult": {
    "success": true,
    "messageId": "wamid.HBgLMTY1N..."
  }
}
```

---

## 🤖 Automation Endpoints

### GET /api/automations
List all automations.

**Response:**
```json
{
  "automations": [
    {
      "id": "auto_123",
      "name": "TikTok Hot Lead Alert",
      "trigger": "LEAD_CREATED",
      "filters": {
        "source": "TIKTOK"
      },
      "active": true,
      "runCount": 47,
      "successCount": 45,
      "failCount": 2
    }
  ]
}
```

### POST /api/automations
Create a new automation.

**Request:**
```json
{
  "name": "24h Follow-up Sequence",
  "trigger": "TIME_BASED",
  "triggerConfig": {
    "delay": "24h",
    "condition": "status == 'NEW'"
  },
  "filters": {
    "source": "TIKTOK"
  },
  "actions": [
    {
      "type": "SEND_MESSAGE",
      "position": 0,
      "config": {
        "platform": "WHATSAPP",
        "content": "Hi {{lead.name}}, just checking in..."
      }
    },
    {
      "type": "ADD_TAG",
      "position": 1,
      "config": {
        "tag": "FOLLOWED_UP"
      }
    }
  ]
}
```

### POST /api/automations/:id/execute
Manually trigger an automation for a specific lead.

**Request:**
```json
{
  "leadId": "lead_123"
}
```

---

## 🪝 Webhook Endpoints

### TikTok Webhook

#### GET /api/webhooks/tiktok
**Webhook verification** (called by TikTok)

```http
GET /api/webhooks/tiktok?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```

#### POST /api/webhooks/tiktok
**Receive TikTok events**

**Headers:**
```http
x-tiktok-signature: HMAC_SHA256_SIGNATURE
x-tenant-id: tenant_123  // For multi-tenant routing
```

**Lead Form Payload:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "lead_id": "tiktok_lead_123",
            "user_id": "tiktok_user_456",
            "form_id": "form_789",
            "submitted_at": 1676304000,
            "fields": [
              {
                "field_id": "name",
                "field_name": "Full Name",
                "field_value": "John Doe"
              },
              {
                "field_id": "phone",
                "field_name": "Phone Number",
                "field_value": "+1234567890"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Direct Message Payload:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "field": "messages",
          "value": {
            "message_id": "msg_123",
            "conversation_id": "conv_456",
            "sender_id": "user_789",
            "recipient_id": "page_123",
            "content": "I'm interested in your services",
            "content_type": "text",
            "created_at": 1676304100
          }
        }
      ]
    }
  ]
}
```

---

### WhatsApp Webhook

#### GET /api/webhooks/whatsapp
**Webhook verification** (called by Meta)

```http
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE_STRING
```

#### POST /api/webhooks/whatsapp
**Receive WhatsApp messages**

**Payload (Meta Business API format):**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "+1234567890",
                "id": "wamid.HBgLMTY1N...",
                "timestamp": "1676304200",
                "type": "text",
                "text": {
                  "body": "Hi, I need help with pricing"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

**Image Message:**
```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "+1234567890",
                "id": "wamid.HBgLMTY1N...",
                "timestamp": "1676304200",
                "type": "image",
                "image": {
                  "mime_type": "image/jpeg",
                  "sha256": "abc123...",
                  "id": "media_id_123",
                  "link": "https://example.com/image.jpg"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 📊 Analytics Endpoints

### GET /api/analytics/overview
Get dashboard statistics.

**Response:**
```json
{
  "totalLeads": 248,
  "hotLeads": 47,
  "activeConversations": 89,
  "automationsRunning": 12,
  "leadsByPlatform": {
    "TIKTOK": 89,
    "WHATSAPP": 67,
    "FACEBOOK": 45,
    "INSTAGRAM": 32,
    "LINKEDIN": 12,
    "WEBSITE": 3
  },
  "conversionRate": 23.5,
  "averageScore": 67
}
```

### GET /api/analytics/leads-over-time
Get lead creation trends.

**Query Parameters:**
- `period` - time period (day, week, month, year)
- `start` - start date (ISO 8601)
- `end` - end date (ISO 8601)

**Response:**
```json
{
  "data": [
    {
      "date": "2026-02-07",
      "count": 12,
      "hot": 3,
      "warm": 5,
      "cold": 4
    },
    {
      "date": "2026-02-08",
      "count": 15,
      "hot": 4,
      "warm": 7,
      "cold": 4
    }
  ]
}
```

---

## 🔔 Notification Endpoints

### GET /api/notifications
Get user notifications.

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "LEAD_QUALIFIED",
      "title": "🔥 Hot Lead Alert",
      "message": "John Doe (TikTok) has been qualified as HOT",
      "read": false,
      "entityType": "lead",
      "entityId": "lead_123",
      "createdAt": "2026-02-13T10:32:00Z"
    }
  ],
  "unreadCount": 3
}
```

### PATCH /api/notifications/:id/read
Mark notification as read.

---

## 🏢 Tenant Endpoints

### GET /api/tenant
Get current tenant information.

**Response:**
```json
{
  "id": "tenant_123",
  "name": "Veltrix Digital",
  "slug": "veltrix-digital",
  "type": "AGENCY",
  "brandName": "Veltrix",
  "logo": "https://example.com/logo.png",
  "plan": "enterprise",
  "maxUsers": 50,
  "maxLeads": 10000,
  "active": true
}
```

---

## 🔌 Integration Endpoints

### GET /api/integrations
List all platform integrations.

**Response:**
```json
{
  "integrations": [
    {
      "id": "int_123",
      "type": "TIKTOK",
      "name": "TikTok Business Account",
      "active": true,
      "syncStatus": "active",
      "lastSyncAt": "2026-02-13T12:00:00Z"
    }
  ]
}
```

### POST /api/integrations
Add a new integration.

**Request:**
```json
{
  "type": "TIKTOK",
  "name": "My TikTok Account",
  "credentials": {
    "appId": "your_app_id",
    "appSecret": "your_app_secret",
    "accessToken": "your_access_token"
  }
}
```

---

## ⚡ Rate Limiting

- **Authenticated requests:** 1000 requests per hour
- **Webhook endpoints:** 10,000 requests per hour
- **AI classification:** 100 requests per hour

**Rate limit headers:**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1676307600
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## 📚 SDKs & Libraries

### TypeScript/JavaScript
```typescript
import { VeltrixClient } from '@veltrix/sdk'

const client = new VeltrixClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.veltrix.com'
})

// Create a lead
const lead = await client.leads.create({
  fullName: 'John Doe',
  email: 'john@example.com',
  source: 'TIKTOK'
})

// Send a message
await client.messages.send({
  leadId: lead.id,
  platform: 'WHATSAPP',
  content: 'Welcome!'
})
```

---

## 🔐 Webhook Security

### Verify Signatures

**TikTok:**
```typescript
import crypto from 'crypto'

function verifyTikTokSignature(payload: string, signature: string): boolean {
  const secret = process.env.TIKTOK_APP_SECRET
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}
```

**WhatsApp (Meta):**
```typescript
function verifyMetaSignature(payload: string, signature: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(payload)
  const expectedSignature = `sha256=${hmac.digest('hex')}`
  return signature === expectedSignature
}
```

---

## 🧪 Testing Webhooks

### Using cURL

**Test TikTok Webhook:**
```bash
curl -X POST http://localhost:3000/api/webhooks/tiktok \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "field": "leadgen",
        "value": {
          "lead_id": "test_123",
          "user_id": "user_456",
          "fields": [
            {"field_name": "name", "field_value": "Test User"},
            {"field_name": "phone", "field_value": "+1234567890"}
          ]
        }
      }]
    }]
  }'
```

**Test WhatsApp Webhook:**
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "+1234567890",
            "text": {"body": "Test message"},
            "timestamp": "1676304200"
          }]
        }
      }]
    }]
  }'
```

---

## 📖 Additional Resources

- **Full Documentation:** [README.md](README.md)
- **Demo Guide:** [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **Project Summary:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Database Schema:** [prisma/schema.prisma](prisma/schema.prisma)

---

**Built by Veltrix Digital**  
**API Version: 1.0.0**  
**Last Updated: February 13, 2026**
