// AI Lead Classification
// Smart lead qualification using GPT-4

import OpenAI from 'openai'
import { getPrisma } from '../server/prisma'

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey })
  }

  return openaiClient
}

interface ClassificationResult {
  intent: string
  urgency: string
  score: number
  qualification: any
  reasoning: string
}

export async function classifyLead(leadId: string): Promise<ClassificationResult> {
  const prisma = await getPrisma()
  // Get lead with conversation history
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      conversations: {
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
      platformAccounts: true,
    },
  })

  if (!lead) {
    throw new Error('Lead not found')
  }

  // Build context for AI
  const context = buildLeadContext(lead)

  // Call GPT-4 for classification
  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert lead qualification AI. Analyze the lead data and classify:
1. Intent: What does the lead want? (pricing, demo, support, information, sales, other)
2. Urgency: How urgent is their need? (high, medium, low)
3. Score: Overall lead quality (0-100)
4. Qualification: Is this a qualified lead? (hot, warm, cold)

Respond with JSON only:
{
  "intent": "pricing",
  "urgency": "high",
  "score": 85,
  "qualification": "hot",
  "reasoning": "Brief explanation"
}`,
      },
      {
        role: 'user',
        content: context,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(completion.choices[0].message.content || '{}')

  return {
    intent: result.intent || 'unknown',
    urgency: result.urgency || 'low',
    score: result.score || 0,
    qualification: result.qualification || 'cold',
    reasoning: result.reasoning || '',
  }
}

function buildLeadContext(lead: any): string {
  const messages = lead.conversations.flatMap((c: any) => c.messages)
  const messageHistory = messages
    .slice(0, 10)
    .map((m: any) => `[${m.direction}] ${m.content}`)
    .join('\n')

  return `
Lead Information:
- Name: ${lead.fullName}
- Email: ${lead.email || 'N/A'}
- Phone: ${lead.phone || 'N/A'}
- Source: ${lead.primarySource}
- All Sources: ${lead.sources.join(', ')}
- Current Status: ${lead.status}
- Tags: ${lead.tags.join(', ') || 'None'}
- Custom Fields: ${JSON.stringify(lead.customFields || {})}

Recent Conversation (latest 10 messages):
${messageHistory || 'No messages yet'}

Platform Accounts:
${lead.platformAccounts.map((pa: any) => `- ${pa.platform}: ${pa.username || pa.platformId}`).join('\n')}

Analyze this lead and provide classification.
  `.trim()
}

// Detect intent from message
export async function detectIntent(message: string): Promise<string> {
  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an intent classifier. Classify the message into one of: pricing, demo, support, information, sales, complaint, other. Respond with one word only.',
      },
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.3,
  })

  return completion.choices[0].message.content?.toLowerCase() || 'other'
}

// Analyze sentiment
export async function analyzeSentiment(message: string): Promise<string> {
  const openai = getOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a sentiment analyzer. Classify the message sentiment as: positive, negative, or neutral. Respond with one word only.',
      },
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.3,
  })

  return completion.choices[0].message.content?.toLowerCase() || 'neutral'
}
