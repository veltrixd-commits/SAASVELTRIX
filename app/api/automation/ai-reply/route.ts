import { NextResponse } from 'next/server';

interface AiReplyPayload {
  messageType?: string;
  platform?: string;
  inboundText?: string;
  customerName?: string;
  automationName?: string;
  instruction?: string;
}

function localFallbackReply(payload: AiReplyPayload): string {
  const type = (payload.messageType || 'message').toLowerCase();
  const customer = payload.customerName || 'there';
  const platform = (payload.platform || 'platform').replace(/_/g, ' ');
  const instruction = payload.instruction?.trim();

  if (type === 'review') {
    return `Hi ${customer}, thank you for your review on ${platform}. We appreciate your feedback and are committed to delivering excellent service.`;
  }

  if (type === 'comment') {
    return `Hi ${customer}, thanks for your comment on ${platform}. We appreciate it and will gladly help with any questions you have.`;
  }

  return `Hi ${customer}, thanks for your message on ${platform}. ${instruction || 'We received your request and will follow up shortly.'}`;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AiReplyPayload;

    if (!payload?.inboundText || !payload?.platform) {
      return NextResponse.json({ error: 'Missing inboundText or platform.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return NextResponse.json({
        reply: localFallbackReply(payload),
        provider: 'local-fallback',
      });
    }

    const systemPrompt = 'You write short, friendly business replies for customer messages, comments, and reviews. Keep response under 70 words, professional, and action-oriented.';
    const userPrompt = [
      `Automation: ${payload.automationName || 'Auto Reply'}`,
      `Platform: ${payload.platform}`,
      `Type: ${payload.messageType || 'MESSAGE'}`,
      `Customer: ${payload.customerName || 'Customer'}`,
      `Instruction: ${payload.instruction || 'Reply helpfully and briefly.'}`,
      `Inbound: ${payload.inboundText}`,
      'Write only the final reply text.',
    ].join('\n');

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'system',
            content: [{ type: 'text', text: systemPrompt }],
          },
          {
            role: 'user',
            content: [{ type: 'text', text: userPrompt }],
          },
        ],
        max_output_tokens: 180,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({
        reply: localFallbackReply(payload),
        provider: 'local-fallback',
        upstreamStatus: aiResponse.status,
      });
    }

    const data = await aiResponse.json();
    const replyText = data?.output_text || localFallbackReply(payload);

    return NextResponse.json({
      reply: String(replyText).trim(),
      provider: 'openai',
      model,
    });
  } catch {
    return NextResponse.json({
      reply: 'Thanks for your message. We appreciate your feedback and will respond shortly.',
      provider: 'local-fallback',
    });
  }
}
