import { canCurrentUserUseAiAutomationReplies } from '@/lib/accessControl';

export interface AutomationActionStep {
  id: number;
  type: string;
  content: string;
  delay: number;
}

export interface EngagementItem {
  id: string;
  platform: string;
  type: 'MESSAGE' | 'COMMENT' | 'REVIEW';
  content: string;
  authorName: string;
  authorEmail?: string;
  conversationId: string;
  createdAt: string;
}

export interface AutomationRun {
  id: string;
  automationId: number;
  automationName: string;
  trigger: string;
  status: 'success' | 'partial' | 'failed';
  startedAt: string;
  finishedAt: string;
  stepsExecuted: number;
  stepsSucceeded: number;
  summary: string;
}

interface AutomationLike {
  id: number;
  name: string;
  trigger: string;
  platform?: string;
  actions?: number;
  actionSteps?: AutomationActionStep[];
  totalRuns?: number;
  successRate?: number;
  lastRun?: string;
}

const AUTOMATION_RUNS_KEY = 'veltrix_automation_runs';
const AUTOMATION_MESSAGE_QUEUE_KEY = 'veltrix_automation_message_queue';
const AUTOMATION_EMAIL_QUEUE_KEY = 'veltrix_automation_email_queue';
const AUTOMATION_COMMENT_REPLY_QUEUE_KEY = 'veltrix_automation_comment_reply_queue';
const AUTOMATION_REVIEW_REPLY_QUEUE_KEY = 'veltrix_automation_review_reply_queue';
const ENGAGEMENT_INBOX_KEY = 'veltrix_engagement_inbox';
const PLATFORM_REVIEWS_KEY = 'veltrix_platform_reviews';
const LEADS_KEY = 'veltrix_leads';
const AUTOMATION_PROCESSED_ENGAGEMENTS_KEY = 'veltrix_automation_processed_engagements';
const PRIORITY_TASKS_KEY = 'priorityTasks';

function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function deriveStatus(successful: number, total: number): AutomationRun['status'] {
  if (successful <= 0) return 'failed';
  if (successful < total) return 'partial';
  return 'success';
}

function normalizePlatform(value?: string): string {
  const normalized = String(value || 'OTHER').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized === 'GMB') return 'GOOGLE_MY_BUSINESS';
  return normalized;
}

function getDefaultEngagements(): EngagementItem[] {
  const now = Date.now();
  return [
    {
      id: 'eng-msg-tiktok-1',
      platform: 'TIKTOK',
      type: 'MESSAGE',
      content: 'I want to know your package options for my small business.',
      authorName: 'Emily Chen',
      authorEmail: 'emily.chen@email.com',
      conversationId: 'eng-conv-tiktok-1',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'eng-msg-wa-1',
      platform: 'WHATSAPP',
      type: 'MESSAGE',
      content: 'Can we schedule a quick consultation this week?',
      authorName: 'Michael Johnson',
      authorEmail: 'michael@email.com',
      conversationId: 'eng-conv-wa-1',
      createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'eng-cmt-ig-1',
      platform: 'INSTAGRAM',
      type: 'COMMENT',
      content: 'Loved this post. Do you help with content strategy too?',
      authorName: 'Jessica T.',
      authorEmail: 'jessica@email.com',
      conversationId: 'eng-conv-ig-1',
      createdAt: new Date(now - 75 * 60 * 1000).toISOString(),
    },
    {
      id: 'eng-rvw-gmb-1',
      platform: 'GOOGLE_MY_BUSINESS',
      type: 'REVIEW',
      content: 'Great service and support. Looking forward to working together again.',
      authorName: 'Nandi M.',
      authorEmail: 'nandi@example.com',
      conversationId: 'eng-conv-gmb-1',
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    },
  ];
}

function getEngagementInboxItems(): EngagementItem[] {
  const raw = readArray<any>(ENGAGEMENT_INBOX_KEY);
  const base = raw.length > 0 ? raw : getDefaultEngagements();

  if (raw.length === 0) {
    writeArray(ENGAGEMENT_INBOX_KEY, base);
  }

  return base.map((item: any) => ({
    id: String(item.id || `eng-${Math.random().toString(36).slice(2, 8)}`),
    platform: normalizePlatform(item.platform),
    type: (String(item.type || 'MESSAGE').toUpperCase() as EngagementItem['type']),
    content: String(item.content || ''),
    authorName: String(item.authorName || item.author || 'Customer'),
    authorEmail: item.authorEmail || item.email,
    conversationId: String(item.conversationId || `conv-${item.id || Date.now()}`),
    createdAt: item.createdAt || new Date().toISOString(),
  }));
}

function getLeadCommentEngagementItems(): EngagementItem[] {
  const leads = readArray<any>(LEADS_KEY);
  return leads.flatMap((lead: any) => {
    const comments = Array.isArray(lead.comments) ? lead.comments : [];
    return comments.map((comment: any) => ({
      id: `lead-comment-${lead.id}-${comment.id}`,
      platform: normalizePlatform(lead.source || 'OTHER'),
      type: 'COMMENT' as const,
      content: String(comment.text || ''),
      authorName: String(comment.author || lead.name || 'Lead'),
      authorEmail: lead.email,
      conversationId: `lead-thread-${lead.id}`,
      createdAt: comment.timestamp ? new Date(comment.timestamp).toISOString() : new Date().toISOString(),
    }));
  });
}

function getReviewEngagementItems(): EngagementItem[] {
  const reviews = readArray<any>(PLATFORM_REVIEWS_KEY);
  return reviews.map((review: any) => ({
    id: `review-${review.id || Math.random().toString(36).slice(2, 8)}`,
    platform: normalizePlatform(review.platform || 'GOOGLE_MY_BUSINESS'),
    type: 'REVIEW' as const,
    content: String(review.content || review.text || ''),
    authorName: String(review.author || review.leadName || 'Reviewer'),
    authorEmail: review.email,
    conversationId: String(review.conversationId || `review-thread-${review.platform || 'general'}`),
    createdAt: review.createdAt || new Date().toISOString(),
  }));
}

function getAllInboundEngagements(): EngagementItem[] {
  const items = [
    ...getEngagementInboxItems(),
    ...getLeadCommentEngagementItems(),
    ...getReviewEngagementItems(),
  ];

  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

function shouldRunAiReply(automation: AutomationLike, steps: AutomationActionStep[]): boolean {
  const trigger = String(automation.trigger || '').toLowerCase();
  const triggerMatch =
    trigger.includes('message') ||
    trigger.includes('comment') ||
    trigger.includes('review') ||
    trigger.includes('engagement');

  const stepMatch = steps.some((step) => {
    const value = `${step.type} ${step.content}`.toLowerCase();
    return value.includes('ai') || value.includes('reply') || value.includes('respond');
  });

  return triggerMatch || stepMatch;
}

function isPlatformMatch(automationPlatform: string | undefined, engagementPlatform: string): boolean {
  const selected = normalizePlatform(automationPlatform || 'ALL');
  return selected === 'ALL' || selected === 'ALL_PLATFORMS' || selected === engagementPlatform;
}

function getProcessedSet(automationId: number): Set<string> {
  const processed = readArray<any>(AUTOMATION_PROCESSED_ENGAGEMENTS_KEY);
  const ids = processed
    .filter((item) => Number(item.automationId) === Number(automationId))
    .map((item) => String(item.engagementId));
  return new Set(ids);
}

function markProcessed(automationId: number, engagementIds: string[]) {
  if (engagementIds.length === 0) return;
  const processed = readArray<any>(AUTOMATION_PROCESSED_ENGAGEMENTS_KEY);
  const additions = engagementIds.map((engagementId) => ({
    automationId,
    engagementId,
    processedAt: new Date().toISOString(),
  }));
  writeArray(AUTOMATION_PROCESSED_ENGAGEMENTS_KEY, [...processed, ...additions].slice(-500));
}

async function generateAiReply(params: {
  engagement: EngagementItem;
  automation: AutomationLike;
  step: AutomationActionStep;
}): Promise<string> {
  if (typeof window === 'undefined') {
    return `Thanks for reaching out, ${params.engagement.authorName}. We appreciate your ${params.engagement.type.toLowerCase()} and will follow up shortly.`;
  }

  try {
    const response = await fetch('/api/automation/ai-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageType: params.engagement.type,
        platform: params.engagement.platform,
        inboundText: params.engagement.content,
        customerName: params.engagement.authorName,
        automationName: params.automation.name,
        instruction: params.step.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI reply route failed (${response.status})`);
    }

    const payload = await response.json();
    if (payload?.reply && typeof payload.reply === 'string') {
      return payload.reply.trim();
    }
  } catch {
  }

  return `Hi ${params.engagement.authorName}, thanks for your ${params.engagement.type.toLowerCase()} on ${params.engagement.platform.replace(/_/g, ' ')}. ${params.step.content || 'We appreciate your feedback and will assist you shortly.'}`;
}

export function getAutomationRuns(): AutomationRun[] {
  const runs = readArray<AutomationRun>(AUTOMATION_RUNS_KEY);
  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export async function executeAutomation(automation: AutomationLike): Promise<{
  run: AutomationRun;
  updatedAutomation: AutomationLike;
}> {
  const startedAt = new Date();
  const steps: AutomationActionStep[] =
    Array.isArray(automation.actionSteps) && automation.actionSteps.length > 0
      ? automation.actionSteps
      : Array.from({ length: Math.max(1, Number(automation.actions || 1)) }, (_, index) => ({
          id: index + 1,
          type: 'Create Task',
          content: `Auto action step ${index + 1}`,
          delay: 0,
        }));

  let stepsSucceeded = 0;

  const messageQueue = readArray<any>(AUTOMATION_MESSAGE_QUEUE_KEY);
  const emailQueue = readArray<any>(AUTOMATION_EMAIL_QUEUE_KEY);
  const commentReplyQueue = readArray<any>(AUTOMATION_COMMENT_REPLY_QUEUE_KEY);
  const reviewReplyQueue = readArray<any>(AUTOMATION_REVIEW_REPLY_QUEUE_KEY);
  const priorityTasks = readArray<any>(PRIORITY_TASKS_KEY);

  const runAiReply = shouldRunAiReply(automation, steps);
  const hasAiPermission = canCurrentUserUseAiAutomationReplies();
  const processedSet = getProcessedSet(automation.id);
  const pendingEngagements = runAiReply
    ? getAllInboundEngagements().filter(
        (item) => isPlatformMatch(automation.platform, item.platform) && !processedSet.has(item.id)
      )
    : [];
  const processedThisRun: string[] = [];

  if (runAiReply && !hasAiPermission) {
    const nowIso = new Date().toISOString();
    const run: AutomationRun = {
      id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      automationId: automation.id,
      automationName: automation.name,
      trigger: automation.trigger,
      status: 'failed',
      startedAt: nowIso,
      finishedAt: nowIso,
      stepsExecuted: 0,
      stepsSucceeded: 0,
      summary: 'Missing permission: AI automation replies',
    };

    const updatedAutomation: AutomationLike = {
      ...automation,
      actionSteps: steps,
      actions: steps.length,
      lastRun: 'Just now',
    };

    return {
      run,
      updatedAutomation,
    };
  }

  if (runAiReply && pendingEngagements.length === 0) {
    const nowIso = new Date().toISOString();
    const run: AutomationRun = {
      id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      automationId: automation.id,
      automationName: automation.name,
      trigger: automation.trigger,
      status: 'success',
      startedAt: nowIso,
      finishedAt: nowIso,
      stepsExecuted: 0,
      stepsSucceeded: 0,
      summary: 'No new engagements to process',
    };

    const updatedAutomation: AutomationLike = {
      ...automation,
      actionSteps: steps,
      actions: steps.length,
      lastRun: 'Just now',
    };

    return {
      run,
      updatedAutomation,
    };
  }

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const lowerType = step.type.toLowerCase();

    if (runAiReply) {
      for (const engagement of pendingEngagements) {
        try {
          const aiReply = await generateAiReply({
            engagement,
            automation,
            step,
          });

          const commonPayload = {
            id: `ai-reply-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            automationId: automation.id,
            automationName: automation.name,
            trigger: automation.trigger,
            platform: engagement.platform,
            contentType: engagement.type,
            content: aiReply,
            sourceEngagementId: engagement.id,
            sourceConversationId: engagement.conversationId,
            leadName: engagement.authorName,
            leadEmail: engagement.authorEmail,
            createdAt: new Date().toISOString(),
            status: 'queued',
          };

          if (engagement.type === 'COMMENT') {
            commentReplyQueue.push(commonPayload);
          } else if (engagement.type === 'REVIEW') {
            reviewReplyQueue.push(commonPayload);
          }

          if (engagement.platform === 'EMAIL') {
            emailQueue.push({
              ...commonPayload,
              subject: `${automation.name} AI response`,
              body: aiReply,
              to: engagement.authorEmail,
            });
          } else {
            messageQueue.push(commonPayload);
          }

          processedThisRun.push(engagement.id);
          stepsSucceeded += 1;
        } catch {
        }
      }

      continue;
    }

    if (lowerType.includes('message') || lowerType.includes('whatsapp') || lowerType.includes('tiktok')) {
      messageQueue.push({
        id: `msg-${Date.now()}-${index}`,
        automationId: automation.id,
        automationName: automation.name,
        platform: String(automation.platform || 'Automation').toUpperCase(),
        trigger: automation.trigger,
        content: step.content,
        createdAt: new Date().toISOString(),
        status: 'queued',
      });
      stepsSucceeded += 1;
      continue;
    }

    if (lowerType.includes('email')) {
      emailQueue.push({
        id: `email-${Date.now()}-${index}`,
        automationId: automation.id,
        automationName: automation.name,
        trigger: automation.trigger,
        subject: `${automation.name} automated email`,
        body: step.content,
        createdAt: new Date().toISOString(),
        status: 'queued',
      });
      stepsSucceeded += 1;
      continue;
    }

    priorityTasks.push({
      id: `task-${Date.now()}-${index}`,
      title: step.content || `${automation.name} follow-up action`,
      description: `Generated by automation \"${automation.name}\" (${step.type})`,
      completed: false,
      createdAt: new Date().toISOString(),
      source: 'automation',
      automationId: automation.id,
    });
    stepsSucceeded += 1;
  }

  writeArray(AUTOMATION_MESSAGE_QUEUE_KEY, messageQueue);
  writeArray(AUTOMATION_EMAIL_QUEUE_KEY, emailQueue);
  writeArray(AUTOMATION_COMMENT_REPLY_QUEUE_KEY, commentReplyQueue);
  writeArray(AUTOMATION_REVIEW_REPLY_QUEUE_KEY, reviewReplyQueue);
  writeArray(PRIORITY_TASKS_KEY, priorityTasks);
  markProcessed(automation.id, processedThisRun);

  const finishedAt = new Date();
  const run: AutomationRun = {
    id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    automationId: automation.id,
    automationName: automation.name,
    trigger: automation.trigger,
    status: deriveStatus(stepsSucceeded, steps.length),
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    stepsExecuted: steps.length,
    stepsSucceeded,
    summary: runAiReply
      ? `${stepsSucceeded} AI responses queued for ${pendingEngagements.length} engagement(s)`
      : `${stepsSucceeded}/${steps.length} steps executed`,
  };

  const runs = readArray<AutomationRun>(AUTOMATION_RUNS_KEY);
  runs.unshift(run);
  writeArray(AUTOMATION_RUNS_KEY, runs.slice(0, 100));

  const nextTotalRuns = Number(automation.totalRuns || 0) + 1;
  const historicalSuccess = (Number(automation.successRate || 0) * Number(automation.totalRuns || 0)) / 100;
  const nextSuccessRate = ((historicalSuccess + (run.status === 'success' ? 1 : run.status === 'partial' ? 0.5 : 0)) / nextTotalRuns) * 100;

  const updatedAutomation: AutomationLike = {
    ...automation,
    actionSteps: steps,
    actions: steps.length,
    totalRuns: nextTotalRuns,
    successRate: Number(nextSuccessRate.toFixed(1)),
    lastRun: 'Just now',
  };

  return {
    run,
    updatedAutomation,
  };
}
