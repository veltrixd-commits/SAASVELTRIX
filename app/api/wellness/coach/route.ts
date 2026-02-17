export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

interface CoachMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface WellnessContext {
  wellnessScore?: number;
  heartRate?: number;
  sleepHours?: number;
  steps?: number;
  hydration?: number;
  burnoutRisk?: number;
  stressLevel?: number;
  energyLevel?: number;
  recommendedWorkHours?: number;
  staleSources?: number;
  totalSources?: number;
  guardrailMessages?: string[];
  recoveryActions?: string[];
}

interface CoachPayload {
  message?: string;
  history?: CoachMessage[];
  context?: WellnessContext;
  settings?: {
    allowWellnessGuardrails?: boolean;
  };
}

interface CoachResponseShape {
  reply: string;
  plan: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function detectRiskLevel(context: WellnessContext): 'low' | 'moderate' | 'high' {
  const burnout = Number(context.burnoutRisk || 0);
  const stress = Number(context.stressLevel || 0);
  const sleep = Number(context.sleepHours || 0);

  if (burnout >= 75 || stress >= 80 || sleep < 5.5) return 'high';
  if (burnout >= 45 || stress >= 55 || sleep < 6.7) return 'moderate';
  return 'low';
}

function inferFocus(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('stress') || normalized.includes('anx')) return 'stress management';
  if (normalized.includes('sleep') || normalized.includes('tired') || normalized.includes('fatigue')) return 'sleep recovery';
  if (normalized.includes('motivat') || normalized.includes('procrast')) return 'motivation';
  if (normalized.includes('goal') || normalized.includes('routine')) return 'goal planning';
  if (normalized.includes('work') || normalized.includes('deadline') || normalized.includes('overwhelm')) return 'workload balance';
  return 'general wellness';
}

function buildFallback(payload: CoachPayload): CoachResponseShape {
  const message = String(payload.message || '').trim();
  const context = payload.context || {};
  const focus = inferFocus(message);
  const riskLevel = detectRiskLevel(context);

  const burnoutRisk = clamp(Number(context.burnoutRisk || 30), 0, 100);
  const sleepHours = Number(context.sleepHours || 7);
  const steps = Number(context.steps || 8000);
  const recommendedWorkHours = Number(context.recommendedWorkHours || 8);
  const guardrailMessages = Array.isArray(context.guardrailMessages) ? context.guardrailMessages.slice(0, 2) : [];
  const recoveryActions = Array.isArray(context.recoveryActions) ? context.recoveryActions.slice(0, 3) : [];

  const openingByRisk = {
    high: `I hear you, and based on your current wellness signals this looks like a high-load moment. Let's slow things down and protect your recovery first.`,
    moderate: `Thanks for sharing this. Your current wellness pattern suggests moderate strain, so we should take a practical, low-friction approach.`,
    low: `Thanks for sharing. Your wellness baseline looks relatively stable, so we can focus on steady improvement.`
  } as const;

  const plan: string[] = [];

  if (focus === 'stress management' || focus === 'workload balance') {
    plan.push(`Do a 2-minute breathing reset now (inhale 4s, hold 4s, exhale 6s).`);
    plan.push(`Choose your top 1 must-do task and defer everything else for 30 minutes.`);
  }

  if (sleepHours < 6.5 || focus === 'sleep recovery') {
    plan.push(`Set a wind-down target tonight to get at least 7.5 hours of sleep.`);
  }

  if (steps < 6000) {
    plan.push(`Take a 10-15 minute walk before your next deep-work block.`);
  }

  if (plan.length < 3) {
    plan.push(`Block ${Math.max(1, Math.round(recommendedWorkHours / 2))} focused session(s) with 10-minute breaks.`);
  }

  if (recoveryActions.length > 0) {
    plan.push(recoveryActions[0]);
  }

  const guardrailText = guardrailMessages.length > 0
    ? `Guardrail note: ${guardrailMessages.join(' | ')}`
    : '';

  const boundaryAdvice = burnoutRisk >= 70
    ? `For today, cap workload near ${Math.min(recommendedWorkHours, 6)} hours and prioritize recovery.`
    : `Aim for sustainable pacing near ${recommendedWorkHours} productive hours today.`;

  const reply = [
    openingByRisk[riskLevel],
    `You said: "${message}". I suggest we focus on ${focus}.`,
    boundaryAdvice,
    guardrailText,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    reply,
    plan: plan.slice(0, 4),
    riskLevel,
  };
}

function parseModelJson(outputText: string | undefined, payload: CoachPayload): CoachResponseShape {
  if (!outputText) return buildFallback(payload);

  try {
    const parsed = JSON.parse(outputText);
    const reply = String(parsed?.reply || '').trim();
    const plan = Array.isArray(parsed?.plan)
      ? parsed.plan.map((item: unknown) => String(item)).filter(Boolean).slice(0, 5)
      : [];
    const riskCandidate = String(parsed?.riskLevel || '').toLowerCase();
    const riskLevel = riskCandidate === 'high' || riskCandidate === 'moderate' || riskCandidate === 'low'
      ? riskCandidate
      : detectRiskLevel(payload.context || {});

    if (!reply) return buildFallback(payload);

    return {
      reply,
      plan: plan.length > 0 ? plan : buildFallback(payload).plan,
      riskLevel,
    };
  } catch {
    return {
      ...buildFallback(payload),
      reply: outputText.trim(),
    };
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CoachPayload;
    const message = String(payload?.message || '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (!apiKey) {
      return NextResponse.json({
        ...buildFallback(payload),
        provider: 'local-fallback',
      });
    }

    const context = payload.context || {};
    const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];
    const allowGuardrails = payload.settings?.allowWellnessGuardrails !== false;

    const systemPrompt = [
      'You are Veltrix AI Wellness Coach.',
      'Goal: supportive, actionable, concise coaching for stress, burnout prevention, motivation, and routines.',
      'Never claim to be a licensed therapist or provide diagnosis.',
      'If user indicates self-harm intent, advise immediate emergency support and trusted human contact.',
      'Use the provided wellness metrics to tailor guidance and intensity.',
      'Return STRICT JSON with keys: reply (string), plan (string[]), riskLevel (low|moderate|high).',
      'Keep reply under 120 words.',
    ].join(' ');

    const userPrompt = [
      `User message: ${message}`,
      `Context: ${JSON.stringify(context)}`,
      `Guardrails enabled: ${allowGuardrails}`,
      `Recent history: ${JSON.stringify(history)}`,
      'Provide practical steps the user can do today.',
      'Return only valid JSON.',
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
        max_output_tokens: 360,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({
        ...buildFallback(payload),
        provider: 'local-fallback',
        upstreamStatus: aiResponse.status,
      });
    }

    const data = await aiResponse.json();
    const outputText = typeof data?.output_text === 'string' ? data.output_text : '';
    const parsed = parseModelJson(outputText, payload);

    return NextResponse.json({
      ...parsed,
      provider: 'openai',
      model,
    });
  } catch {
    return NextResponse.json({
      ...buildFallback({ message: 'I need wellness support today.' }),
      provider: 'local-fallback',
    });
  }
}
