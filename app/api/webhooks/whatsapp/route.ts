export const dynamic = 'force-dynamic'

// WhatsApp Webhook Handler
// Receives WhatsApp messages (Meta Business API format)

import { NextRequest, NextResponse } from 'next/server'
import { createWhatsAppClient } from '@/lib/messaging/providers/whatsapp'
import { triggerMessageReceived } from '@/lib/automation-engine/engine'
import { autoResponder } from '@/lib/automation/auto-responder'

export async function GET(request: NextRequest) {
  // Webhook verification
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'your-verify-token'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant'

    const whatsapp = createWhatsAppClient()

    // Handle messages
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const { value } = change

        if (value.messages) {
          for (const message of value.messages) {
            const messageData = {
              from: message.from,
              body: message.text?.body || '[Media]',
              mediaUrl: message.image?.link || message.video?.link || message. document?.link,
              messageId: message.id,
              timestamp: message.timestamp,
            }

            // Process message
            const result = await whatsapp.processIncomingMessage(messageData, tenantId)

            // Trigger automation
            await triggerMessageReceived(result.lead.id, tenantId, messageData)
            
            // Trigger auto-responder
            if (result.message && result.message.id) {
              const autoResult = await autoResponder({
                tenantId,
                leadId: result.lead?.id,
                channel: 'whatsapp',
                message: result.message.content ?? messageData.body ?? '',
                from: message.from,
                metadata: { providerPayload: value },
              })

              if (autoResult.shouldReply) {
                console.log('[auto-responder] WhatsApp suggestion', autoResult)
                // TODO: send autoResult.replyText via WhatsApp provider when ready
              }
            }
          }
        }

        // Handle status updates (delivered, read, etc.)
        if (value.statuses) {
          for (const status of value.statuses) {
            console.log('Message status:', status)
            // Update message status in database
          }
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
