import {
  PrismaClient,
  TenantType,
  UserRole,
  LeadSource,
  LeadStatus,
  AutomationTrigger,
  AutomationActionType,
  MessageDirection,
  MessageStatus,
  ActivityType,
  SubscriptionStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PLAN_SEED_DATA } from '../lib/subscriptionPlans';

const prisma = new PrismaClient();

const DEMO_SLUG = 'demo-agency';
const DEMO_EMAIL = 'demo@veltrix.com';
const DEMO_PASSWORD = 'demo123';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const addDays = (anchor: Date, days: number) => new Date(anchor.getTime() + days * DAY_IN_MS);

async function seedSubscriptionPlans() {
  console.log('⚙️  Syncing subscription plans & entitlements...');
  for (const record of PLAN_SEED_DATA) {
    const planPayload = record.plan;

    const plan = await prisma.subscriptionPlan.upsert({
      where: { code: planPayload.code },
      update: {
        name: planPayload.name,
        description: planPayload.description,
        priceCents: planPayload.priceCents,
        currency: planPayload.currency,
        interval: planPayload.interval,
        trialDays: planPayload.trialDays,
        maxUsers: planPayload.maxUsers,
        maxLeads: planPayload.maxLeads,
        maxAutomations: planPayload.maxAutomations,
        metadata: planPayload.metadata,
        active: true,
      },
      create: {
        code: planPayload.code,
        name: planPayload.name,
        description: planPayload.description,
        priceCents: planPayload.priceCents,
        currency: planPayload.currency,
        interval: planPayload.interval,
        trialDays: planPayload.trialDays,
        maxUsers: planPayload.maxUsers,
        maxLeads: planPayload.maxLeads,
        maxAutomations: planPayload.maxAutomations,
        metadata: planPayload.metadata,
        active: true,
      },
    });

    await prisma.planEntitlement.deleteMany({ where: { planId: plan.id } });

    if (record.entitlements.length > 0) {
      await prisma.planEntitlement.createMany({
        data: record.entitlements.map((entitlement) => ({
          planId: plan.id,
          feature: entitlement.feature,
          unit: entitlement.unit ?? null,
          limitValue: typeof entitlement.limitValue === 'number' ? entitlement.limitValue : null,
          isEnabled: entitlement.isEnabled,
          metadata: entitlement.metadata ?? null,
        })),
      });
    }
  }
}

async function ensureDemoSubscription(tenantId: string) {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { code: 'scale' } });

  if (!plan) {
    console.warn('⚠️  Missing "scale" plan – skipping subscription seed');
    return;
  }

  await prisma.subscription.deleteMany({ where: { tenantId } });

  const now = new Date();
  const periodEnd = addDays(now, plan.interval === 'YEARLY' ? 365 : 30);
  const trialEndsAt = plan.trialDays ? addDays(now, plan.trialDays) : null;

  await prisma.subscription.create({
    data: {
      tenantId,
      planId: plan.id,
      status: SubscriptionStatus.ACTIVE,
      trialEndsAt,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      nextInvoiceAt: periodEnd,
      metadata: {
        seeded: true,
        planCode: plan.code,
      },
    },
  });
}

async function main() {
  console.log('🌱 Seeding Veltrix platform data...');

  await seedSubscriptionPlans();

  // Ensure idempotent runs by clearing the demo tenant first
  await prisma.tenant.deleteMany({ where: { slug: DEMO_SLUG } });

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Veltrix Demo Agency',
      slug: DEMO_SLUG,
      type: TenantType.AGENCY,
      brandName: 'Veltrix Demo',
      primaryColor: '#2563eb',
      plan: 'scale',
      maxUsers: 25,
      maxLeads: 5000,
      maxAutomations: 50,
    },
  });

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const owner = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'Owner',
      role: UserRole.AGENCY_OWNER,
      tenantId: tenant.id,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VeltrixDemo',
      phone: '+1-555-0100',
    },
  });

  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Revenue Engine',
      description: 'Default pipeline to demonstrate CRM flow',
      tenantId: tenant.id,
      autoMove: true,
      dealTracking: true,
      stages: {
        create: [
          { name: 'New', color: '#60a5fa', position: 0 },
          { name: 'Engaged', color: '#a855f7', position: 1 },
          { name: 'Qualified', color: '#10b981', position: 2 },
          { name: 'Proposal Sent', color: '#f59e0b', position: 3 },
          { name: 'Negotiation', color: '#f97316', position: 4 },
          { name: 'Won', color: '#22c55e', position: 5, isClosedWon: true },
          { name: 'Lost', color: '#6b7280', position: 6, isClosedLost: true },
        ],
      },
    },
    include: { stages: true },
  });

  const stageByName = Object.fromEntries(pipeline.stages.map((stage) => [stage.name, stage]));

  const leadBlueprints = [
    {
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+27-555-0101',
      source: LeadSource.TIKTOK,
      status: LeadStatus.HOT,
      stage: 'Engaged',
      score: 95,
      priority: 3,
      company: 'Influence Labs',
      intent: 'pricing',
      urgency: 'high',
      tags: ['tiktok', 'vip'],
      handle: 'sarah_moves',
      followers: 58000,
      customFields: { campaign: 'SparkLaunch', region: 'Cape Town' },
      activityType: ActivityType.STATUS_CHANGE,
      thread: [
        {
          direction: MessageDirection.INBOUND,
          content: 'Loved your TikTok demo—can we talk pricing today?',
          offsetMinutes: 90,
        },
        {
          direction: MessageDirection.OUTBOUND,
          content: 'Absolutely! Dropping the pricing breakdown now.',
          automated: true,
          offsetMinutes: 70,
        },
      ],
    },
    {
      fullName: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+27-555-0102',
      source: LeadSource.WHATSAPP,
      status: LeadStatus.WARM,
      stage: 'New',
      score: 78,
      priority: 2,
      company: 'Chen Holdings',
      intent: 'demo',
      urgency: 'medium',
      tags: ['whatsapp', 'demo'],
      handle: 'chen_connects',
      followers: 4200,
      customFields: { interestedProduct: 'Autopilot', teamSize: 8 },
      activityType: ActivityType.NOTE,
      thread: [
        {
          direction: MessageDirection.INBOUND,
          content: 'We need WhatsApp automation that respects human handoff. Possible?',
          offsetMinutes: 120,
        },
        {
          direction: MessageDirection.OUTBOUND,
          content: 'Yes! We can mirror your handoff rules exactly. Sending demo slots.',
          offsetMinutes: 95,
        },
      ],
    },
    {
      fullName: 'Emma Williams',
      email: 'emma.williams@email.com',
      phone: '+27-555-0103',
      source: LeadSource.INSTAGRAM,
      status: LeadStatus.CONTACTED,
      stage: 'Qualified',
      score: 84,
      priority: 2,
      company: 'Williams Media',
      intent: 'service question',
      urgency: 'medium',
      tags: ['instagram'],
      handle: 'emma_creates',
      followers: 22000,
      customFields: { favoriteChannel: 'Reels' },
      activityType: ActivityType.CALL,
      thread: [
        {
          direction: MessageDirection.INBOUND,
          content: 'Could Veltrix auto-respond to IG story replies too?',
          offsetMinutes: 60,
        },
        {
          direction: MessageDirection.OUTBOUND,
          content: 'Yes—we unify story replies + DMs inside the same inbox.',
          offsetMinutes: 50,
        },
      ],
    },
  ];

  const leads = [] as { id: string; primarySource: LeadSource }[];

  for (const blueprint of leadBlueprints) {
    const stage = stageByName[blueprint.stage] ?? stageByName['New'];

    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        fullName: blueprint.fullName,
        email: blueprint.email,
        phone: blueprint.phone,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(blueprint.fullName)}`,
        primarySource: blueprint.source,
        sources: [blueprint.source],
        status: blueprint.status,
        score: blueprint.score,
        priority: blueprint.priority,
        company: blueprint.company,
        intent: blueprint.intent,
        urgency: blueprint.urgency,
        qualification: {
          sentiment: blueprint.status === LeadStatus.HOT ? 'positive' : 'neutral',
          confidence: blueprint.score / 100,
        },
        tags: blueprint.tags,
        customFields: blueprint.customFields,
        pipelineId: pipeline.id,
        stageId: stage?.id,
        assignedToId: owner.id,
      },
    });

    leads.push({ id: lead.id, primarySource: blueprint.source });

    await prisma.platformAccount.create({
      data: {
        leadId: lead.id,
        platform: blueprint.source,
        platformId: `${blueprint.source.toLowerCase()}_${lead.id.slice(-6)}`,
        username: blueprint.handle,
        profileUrl: `https://social.veltrix/${blueprint.handle}`,
        primary: true,
        verified: true,
        metadata: { followers: blueprint.followers },
      },
    });

    await prisma.activity.create({
      data: {
        type: blueprint.activityType,
        title: `Lead captured from ${blueprint.source}`,
        description: `${blueprint.fullName} entered the system via ${blueprint.source}.`,
        leadId: lead.id,
        userId: owner.id,
        metadata: { score: blueprint.score, intent: blueprint.intent },
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        tenantId: tenant.id,
        event: 'lead_created',
        category: 'lead',
        source: blueprint.source,
        userId: owner.id,
        leadId: lead.id,
        value: blueprint.score,
        metadata: { status: blueprint.status, stage: blueprint.stage },
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        tenantId: tenant.id,
        leadId: lead.id,
        platform: blueprint.source,
        lastMessage: blueprint.thread[blueprint.thread.length - 1]?.content,
        lastMessageAt: new Date(Date.now() - blueprint.thread[0].offsetMinutes * 60 * 1000),
        messages: {
          create: blueprint.thread.map((message) => ({
            direction: message.direction,
            status: MessageStatus.DELIVERED,
            content: message.content,
            platform: blueprint.source,
            automated: message.automated ?? false,
            createdAt: new Date(Date.now() - message.offsetMinutes * 60 * 1000),
          })),
        },
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        tenantId: tenant.id,
        event: 'message_thread_created',
        category: 'messaging',
        source: blueprint.source,
        leadId: lead.id,
        metadata: { conversationId: conversation.id, messages: blueprint.thread.length },
      },
    });
  }

  const automation = await prisma.automation.create({
    data: {
      tenantId: tenant.id,
      name: 'Welcome New TikTok Leads',
      description: 'Auto-reply and tag every TikTok lead over score 80',
      trigger: AutomationTrigger.LEAD_CREATED,
      triggerConfig: {
        source: LeadSource.TIKTOK,
        minScore: 80,
      },
      filters: {
        surfaces: ['leads-hq'],
      },
      priority: 1,
      actions: {
        create: [
          {
            type: AutomationActionType.SEND_MESSAGE,
            position: 0,
            config: {
              platform: LeadSource.TIKTOK,
              template: '🔥 You are now in the fast lane! Our team will reply in minutes.',
            },
          },
          {
            type: AutomationActionType.ADD_TAG,
            position: 1,
            config: {
              tags: ['needs-fast-follow'],
            },
          },
          {
            type: AutomationActionType.NOTIFY_OWNER,
            position: 2,
            config: {
              channel: 'email',
              template: 'New hot TikTok lead needs attention',
            },
          },
        ],
      },
      pipelineId: stageByName['Qualified']?.id,
    },
  });

  if (leads.length > 0) {
    await prisma.automationRun.create({
      data: {
        automationId: automation.id,
        leadId: leads[0].id,
        triggeredBy: 'seed-script',
        status: 'completed',
        steps: [
          { action: 'SEND_MESSAGE', status: 'completed' },
          { action: 'ADD_TAG', status: 'completed' },
        ],
        executedById: owner.id,
        completedAt: new Date(),
      },
    });
  }

  await prisma.analyticsEvent.create({
    data: {
      tenantId: tenant.id,
      event: 'automation_created',
      category: 'automation',
      metadata: { automationId: automation.id, actions: 3 },
    },
  });

  await ensureDemoSubscription(tenant.id);

  console.log('✅ Seed completed successfully!');
  console.log('🔐 Demo login');
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
