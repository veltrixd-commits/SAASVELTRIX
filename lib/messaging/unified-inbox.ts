// Unified Messaging Layer
// Abstract interface for sending messages across all platforms

import { LeadSource } from '@prisma/client'
import { getPrisma } from '../server/prisma'
import { createTikTokClient } from './providers/tiktok'
import { createWhatsAppClient } from './providers/whatsapp'

interface SendMessageParams {
  leadId: string
  platform: LeadSource
  content: string
  mediaUrl?: string
  automated?: boolean
}

export async function sendUnifiedMessage(params: SendMessageParams) {
  const { leadId, platform, content, mediaUrl, automated = false } = params
  const prisma = await getPrisma()

  // Get lead with platform account
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      platformAccounts: {
        where: { platform },
      },
      conversations: {
        where: { platform },
      },
    },
  })

  if (!lead) {
    throw new Error('Lead not found')
  }

  const platformAccount = lead.platformAccounts[0]
  if (!platformAccount) {
    throw new Error(`No ${platform} account found for lead`)
  }

  let result: any
  let conversation = lead.conversations[0]

  // Create conversation if doesn't exist
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        leadId: lead.id,
        platform,
        tenantId: lead.tenantId,
      },
    })
  }

  // Send via appropriate platform
  switch (platform) {
    case LeadSource.TIKTOK:
      const tiktok = createTikTokClient()
      result = await tiktok.sendDirectMessage(platformAccount.platformId, content, mediaUrl ? 'image' : 'text', mediaUrl)
      break

    case LeadSource.WHATSAPP:
      const whatsapp = createWhatsAppClient()
      result = await whatsapp.sendMessage(platformAccount.platformId, content, mediaUrl)
      break

    case LeadSource.FACEBOOK:
    case LeadSource.INSTAGRAM:
      // Facebook/Instagram messaging
      result = await sendViaFacebook(platformAccount.platformId, content, mediaUrl, platform)
      break

    case LeadSource.LINKEDIN:
      // LinkedIn messaging
      result = await sendViaLinkedIn(platformAccount.platformId, content)
      break

    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  // Store message in database
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'OUTBOUND',
      content,
      contentType: mediaUrl ? 'image' : 'text',
      mediaUrl,
      platform,
      platformMessageId: result.messageId,
      status: result.success ? 'SENT' : 'FAILED',
      automated,
    },
  })

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      lastMessage: content,
      lastMessageAt: new Date(),
    },
  })

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      lastContactAt: new Date(),
    },
  })

  return {
    success: result.success,
    message,
    platformResult: result,
  }
}

// Facebook/Instagram messaging (Meta Business API)
async function sendViaFacebook(recipientId: string, content: string, mediaUrl: string | undefined, platform: LeadSource) {
  const axios = require('axios')
  
  const endpoint = platform === LeadSource.FACEBOOK 
    ? 'https://graph.facebook.com/v18.0/me/messages'
    : 'https://graph.facebook.com/v18.0/me/messages' // Same endpoint

  try {
    const response = await axios.post(endpoint, {
      recipient: { id: recipientId },
      message: {
        text: !mediaUrl ? content : undefined,
        attachment: mediaUrl ? {
          type: 'image',
          payload: { url: mediaUrl },
        } : undefined,
      },
    }, {
      params: {
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      },
    })

    return {
      success: true,
      messageId: response.data.message_id,
    }
  } catch (error: any) {
    console.error('Facebook send error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

// LinkedIn messaging
async function sendViaLinkedIn(recipientId: string, content: string) {
  const axios = require('axios')

  try {
    const response = await axios.post('https://api.linkedin.com/v2/messages', {
      recipient: recipientId,
      message: content,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    return {
      success: true,
      messageId: response.data.id,
    }
  } catch (error: any) {
    console.error('LinkedIn send error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}
