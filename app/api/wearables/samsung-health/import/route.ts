export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

function toNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(payload: string) {
  const lines = payload
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { restingHeartRate: 0, sleepHours: 0, steps: 0 };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));

  const idxSteps = headers.findIndex((h) => h === 'steps' || h === 'step_count');
  const idxHeart = headers.findIndex((h) => h === 'restingheartrate' || h === 'resting_heart_rate' || h === 'heart_rate');
  const idxSleep = headers.findIndex((h) => h === 'sleephours' || h === 'sleep_hours' || h === 'sleep');

  let steps = 0;
  const heartValues: number[] = [];
  const sleepValues: number[] = [];

  rows.forEach((row) => {
    if (idxSteps >= 0) steps += toNumber(row[idxSteps], 0);
    if (idxHeart >= 0) {
      const value = toNumber(row[idxHeart], 0);
      if (value > 0) heartValues.push(value);
    }
    if (idxSleep >= 0) {
      const value = toNumber(row[idxSleep], 0);
      if (value > 0) sleepValues.push(value);
    }
  });

  const restingHeartRate =
    heartValues.length > 0
      ? Math.round(heartValues.reduce((sum, value) => sum + value, 0) / heartValues.length)
      : 0;

  const sleepHours =
    sleepValues.length > 0
      ? Number((sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length).toFixed(1))
      : 0;

  return {
    restingHeartRate,
    sleepHours,
    steps: Math.round(steps),
  };
}

function parseJson(payload: string) {
  const parsed = JSON.parse(payload);
  const metrics = parsed.metrics || parsed;

  return {
    restingHeartRate: toNumber(metrics.restingHeartRate ?? metrics.heartRate, 0),
    sleepHours: Number(toNumber(metrics.sleepHours ?? metrics.sleep, 0).toFixed(1)),
    steps: Math.round(toNumber(metrics.steps, 0)),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const payload = String(body?.payload || '').trim();

  if (!payload) {
    return NextResponse.json({ error: 'Missing Samsung Health export payload.' }, { status: 400 });
  }

  try {
    const metrics = payload.startsWith('{') || payload.startsWith('[') ? parseJson(payload) : parseCsv(payload);

    return NextResponse.json({
      provider: 'samsung_health',
      accountName: 'Samsung Health',
      syncedAt: new Date().toISOString(),
      metrics: {
        restingHeartRate: metrics.restingHeartRate || 72,
        sleepHours: metrics.sleepHours || 7,
        steps: metrics.steps || 6800,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not parse Samsung Health export payload.' },
      { status: 400 }
    );
  }
}
