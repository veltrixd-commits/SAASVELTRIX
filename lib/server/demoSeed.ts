/**
 * Server-side demo seed.
 * Called once per new tenant immediately after account creation.
 * Creates: 1 pipeline + stages, 10 leads, 1 conversation + 2 messages per lead.
 */

import { LeadSource, LeadStatus, MessageDirection, MessageStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const DEMO_FLAG = 'demo_seeded';

const LEAD_SOURCES: LeadSource[] = [
  LeadSource.TIKTOK,
  LeadSource.WHATSAPP,
  LeadSource.FACEBOOK,
  LeadSource.INSTAGRAM,
  LeadSource.WEBSITE,
];

const DEMO_LEADS = [
  { fullName: 'Sarah Mitchell',   email: 'sarah.mitchell@techstartup.com',  status: LeadStatus.HOT,       score: 98, intent: 'Enterprise package',    source: LeadSource.TIKTOK,     budget: 50000 },
  { fullName: 'Marcus Johnson',   email: 'marcus@growthhackers.co',         status: LeadStatus.HOT,       score: 95, intent: 'TikTok lead gen',        source: LeadSource.WHATSAPP,   budget: 45000 },
  { fullName: 'Priya Patel',      email: 'priya.patel@fashionbrand.com',    status: LeadStatus.WARM,      score: 82, intent: 'Social automation',       source: LeadSource.INSTAGRAM,  budget: 18000 },
  { fullName: 'David Okonkwo',    email: 'david@retailchain.co.za',         status: LeadStatus.QUALIFIED, score: 76, intent: 'POS integration',         source: LeadSource.WEBSITE,    budget: 30000 },
  { fullName: 'Emma Thornton',    email: 'emma.t@agencyhq.com',             status: LeadStatus.HOT,       score: 91, intent: 'White-label reseller',    source: LeadSource.FACEBOOK,   budget: 60000 },
  { fullName: 'Kwame Asante',     email: 'kwame@startuplab.com',            status: LeadStatus.QUALIFIED, score: 70, intent: 'Startup CRM',             source: LeadSource.TIKTOK,     budget: 8000 },
  { fullName: 'Linh Nguyen',      email: 'linh.nguyen@ecomco.com',          status: LeadStatus.WARM,      score: 65, intent: 'E-commerce automation',   source: LeadSource.INSTAGRAM,  budget: 12000 },
  { fullName: 'Tariq Al-Hassan',  email: 'tariq@consultinggroup.ae',        status: LeadStatus.NEW,       score: 55, intent: 'Demo request',            source: LeadSource.WEBSITE,    budget: 25000 },
  { fullName: 'Jessica Brown',    email: 'jessica@beautyempire.co',         status: LeadStatus.CONTACTED, score: 60, intent: 'Content scheduling',      source: LeadSource.FACEBOOK,   budget: 5000 },
  { fullName: 'Raj Mehta',        email: 'raj.mehta@techventures.in',       status: LeadStatus.WARM,      score: 74, intent: 'Full suite evaluation',   source: LeadSource.WHATSAPP,   budget: 35000 },
];

const INBOUND_MESSAGES = [
  'Hi, I saw your TikTok video about automation — I need this for my business!',
  'Can you send me pricing info? We have about 200 leads per month.',
  'Is this compatible with WhatsApp Business API?',
  'We want a demo ASAP. Who should I speak to?',
  'How long does setup take?',
  'Do you offer white-label options?',
  'What is the ROI compared to hiring staff?',
  'Can this handle multiple team members?',
  'Does it integrate with Shopify?',
  'We need something running by next week — is that possible?',
];

const OUTBOUND_MESSAGES = [
  'Hi! Thanks for reaching out. I would love to show you what we can do. When is a good time for a quick call?',
  'Great question! Our pricing starts at R 999/month for the starter plan. I will send over our full brochure.',
  'Yes, we have native WhatsApp Business API integration. Setup takes less than 30 minutes.',
  'Absolutely! I have a slot open tomorrow at 10am or 2pm — which works for you?',
  'Most clients are fully live within 24 hours. Our onboarding team guides you every step of the way.',
];

export async function seedDemoData(
  tx: Prisma.TransactionClient,
  tenantId: string,
  userId: string
): Promise<void> {
  // Check idempotency flag via a lightweight lead count
  const existing = await tx.lead.count({ where: { tenantId } });
  if (existing > 0) return; // already seeded

  // 1. Create a default pipeline
  const pipeline = await tx.pipeline.create({
    data: {
      name: 'Sales Pipeline',
      description: 'Default pipeline created for your account',
      dealTracking: true,
      tenantId,
    },
  });

  const stageNames = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed Won'];
  const stages = await Promise.all(
    stageNames.map((name, i) =>
      tx.pipelineStage.create({
        data: {
          name,
          position: i,
          isClosedWon: i === stageNames.length - 1,
          pipelineId: pipeline.id,
        },
      })
    )
  );

  const firstStage = stages[0];

  // 2. Create 10 leads + 1 conversation + 2 messages each
  for (let i = 0; i < DEMO_LEADS.length; i++) {
    const ld = DEMO_LEADS[i];
    const source = LEAD_SOURCES[i % LEAD_SOURCES.length];

    const lead = await tx.lead.create({
      data: {
        fullName: ld.fullName,
        email: ld.email,
        status: ld.status,
        score: ld.score,
        intent: ld.intent,
        budget: ld.budget,
        primarySource: ld.source,
        sources: [ld.source],
        tags: ['demo'],
        pipelineId: pipeline.id,
        stageId: firstStage.id,
        assignedToId: userId,
        tenantId,
        firstContactAt: new Date(Date.now() - (i + 1) * 3_600_000),
        lastContactAt: new Date(Date.now() - i * 1_800_000),
      },
    });

    const conv = await tx.conversation.create({
      data: {
        leadId: lead.id,
        platform: ld.source,
        lastMessage: INBOUND_MESSAGES[i],
        lastMessageAt: new Date(Date.now() - i * 1_800_000),
        unreadCount: i < 5 ? 1 : 0,
        tenantId,
      },
    });

    // Inbound message from lead
    await tx.message.create({
      data: {
        conversationId: conv.id,
        direction: MessageDirection.INBOUND,
        status: MessageStatus.READ,
        content: INBOUND_MESSAGES[i],
        platform: ld.source,
        createdAt: new Date(Date.now() - i * 1_800_000 - 120_000),
      },
    });

    // Outbound reply
    await tx.message.create({
      data: {
        conversationId: conv.id,
        direction: MessageDirection.OUTBOUND,
        status: MessageStatus.DELIVERED,
        content: OUTBOUND_MESSAGES[i % OUTBOUND_MESSAGES.length],
        platform: ld.source,
        automated: false,
        createdAt: new Date(Date.now() - i * 1_800_000 - 60_000),
      },
    });
  }
}
