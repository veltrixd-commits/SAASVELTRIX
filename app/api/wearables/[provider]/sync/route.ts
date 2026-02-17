export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type Provider = 'fitbit' | 'oura' | 'whoop';

export async function generateStaticParams() {
  return [
    { provider: 'fitbit' },
    { provider: 'oura' },
    { provider: 'whoop' },
  ];
}

function asNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function syncFitbit(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [heartRes, sleepRes, stepsRes] = await Promise.all([
    fetch('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', { headers }),
    fetch('https://api.fitbit.com/1.2/user/-/sleep/date/today.json', { headers }),
    fetch('https://api.fitbit.com/1/user/-/activities/date/today.json', { headers }),
  ]);

  const heartJson = heartRes.ok ? await heartRes.json() : null;
  const sleepJson = sleepRes.ok ? await sleepRes.json() : null;
  const stepsJson = stepsRes.ok ? await stepsRes.json() : null;

  const restingHeartRate = asNumber(heartJson?.['activities-heart']?.[0]?.value?.restingHeartRate, 0);
  const totalMinutesAsleep = asNumber(sleepJson?.summary?.totalMinutesAsleep, 0);
  const steps = asNumber(stepsJson?.summary?.steps, 0);

  return {
    restingHeartRate,
    sleepHours: Number((totalMinutesAsleep / 60).toFixed(1)),
    steps,
  };
}

async function syncOura(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const today = new Date().toISOString().split('T')[0];

  const [sleepRes, activityRes] = await Promise.all([
    fetch(`https://api.ouraring.com/v2/usercollection/daily_sleep?start_date=${today}&end_date=${today}`, { headers }),
    fetch(`https://api.ouraring.com/v2/usercollection/daily_activity?start_date=${today}&end_date=${today}`, { headers }),
  ]);

  const sleepJson = sleepRes.ok ? await sleepRes.json() : null;
  const activityJson = activityRes.ok ? await activityRes.json() : null;

  const sleepSeconds = asNumber(sleepJson?.data?.[0]?.total_sleep_duration, 0);
  const steps = asNumber(activityJson?.data?.[0]?.steps, 0);
  const restingHeartRate = asNumber(sleepJson?.data?.[0]?.lowest_heart_rate, 0);

  return {
    restingHeartRate,
    sleepHours: Number((sleepSeconds / 3600).toFixed(1)),
    steps,
  };
}

async function syncWhoop(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [recoveryRes, sleepRes, cycleRes] = await Promise.all([
    fetch('https://api.prod.whoop.com/developer/v1/recovery?limit=1', { headers }),
    fetch('https://api.prod.whoop.com/developer/v1/activity/sleep?limit=1', { headers }),
    fetch('https://api.prod.whoop.com/developer/v1/cycle?limit=1', { headers }),
  ]);

  const recoveryJson = recoveryRes.ok ? await recoveryRes.json() : null;
  const sleepJson = sleepRes.ok ? await sleepRes.json() : null;
  const cycleJson = cycleRes.ok ? await cycleRes.json() : null;

  const restingHeartRate = asNumber(recoveryJson?.records?.[0]?.score?.resting_heart_rate, 0);
  const sleepMs = asNumber(sleepJson?.records?.[0]?.score?.stage_summary?.total_in_bed_time_milli, 0);
  const steps = asNumber(cycleJson?.records?.[0]?.score?.strain ?? 0, 0) * 1000;

  return {
    restingHeartRate,
    sleepHours: Number((sleepMs / 3600000).toFixed(1)),
    steps: Math.round(steps),
  };
}

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const provider = params.provider as Provider;

  if (!['fitbit', 'oura', 'whoop'].includes(provider)) {
    return NextResponse.json({ error: 'Unsupported wearable provider.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const accessToken = String(body?.accessToken || '').trim();

  if (!accessToken) {
    return NextResponse.json({ error: 'Missing accessToken.' }, { status: 400 });
  }

  try {
    const metrics =
      provider === 'fitbit'
        ? await syncFitbit(accessToken)
        : provider === 'oura'
        ? await syncOura(accessToken)
        : await syncWhoop(accessToken);

    return NextResponse.json({
      provider,
      syncedAt: new Date().toISOString(),
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || `Failed to sync ${provider} data.` },
      { status: 500 }
    );
  }
}
