export const dynamic = 'force-dynamic'

// TikTok Webhook Handler
// Receives TikTok Lead Forms and Direct Messages

import { NextRequest, NextResponse } from 'next/server'
import { createTikTokClient } from '@/lib/messaging/providers/tiktok'
import { triggerLeadCreated, triggerMessageReceived } from '@/lib/automation-engine/engine'
import { autoResponder } from '@/lib/automation/auto-responder'

export async function GET(request: NextRequest) {
  // Webhook verification
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.TIKTOK_WEBHOOK_VERIFY_TOKEN || 'your-verify-token'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('TikTok webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('TikTok webhook received:', JSON.stringify(body, null, 2))

    // Get tenant ID from header or path (multi-tenant support)
    const tenantId = request.headers.get('x-tenant-id') || 'default-tenant'

    // Verify signature
    const signature = request.headers.get('x-tiktok-signature') || ''
    const rawBody = JSON.stringify(body)
    
    // In production, verify signature
    // const isValid = TikTokClient.verifyWebhookSignature(rawBody, signature, process.env.TIKTOK_APP_SECRET || '')
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const tiktok = createTikTokClient()

    // Handle different event types
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const { field, value } = change

        if (field === 'leadgen') {
          // Lead form submission
          await tiktok.processLeadForm(value, tenantId)
          
          // Trigger automation
          const lead = await tiktok.processLeadForm(value, tenantId)
          await triggerLeadCreated(lead.id, tenantId)

        } else if (field === 'messages') {
          // Direct message
          const result = await tiktok.processDirectMessage(value, tenantId)

          // Trigger automation
          await triggerMessageReceived(result.lead.id, tenantId, value)
          
          // Trigger auto-responder
          if (result.message && result.message.id) {
            const autoResult = await autoResponder({
              tenantId,
              leadId: result.lead?.id,
              channel: 'tiktok',
              message: result.message.content ?? '',
              metadata: { event: value },
            })

            if (autoResult.shouldReply) {
              console.log('[auto-responder] TikTok suggestion', autoResult)
              // TODO: send autoResult.replyText via TikTok DM client when ready
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('TikTok webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
