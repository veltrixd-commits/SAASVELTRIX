// Wellness Dashboard - Personal OS Feature
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, Activity, Moon, Droplets, Brain, TrendingUp, Target, Calendar, Watch, Smartphone, Link2, CheckCircle } from 'lucide-react';
import AlarmClock from '@/components/AlarmClock';
import { createWellnessGuardrails } from '@/lib/wellness-guardrails';

interface WearableConnection {
  provider: string;
  accountName: string;
  connectedAt: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  lastSyncedAt?: string;
  metrics?: {
    restingHeartRate?: number;
    sleepHours?: number;
    steps?: number;
  };
}

interface WellnessCoachContext {
  wellnessScore: number;
  heartRate: number;
  sleepHours: number;
  steps: number;
  hydration: number;
  burnoutRisk: number;
  stressLevel: number;
  energyLevel: number;
  recommendedWorkHours: number;
  staleSources: number;
  totalSources: number;
  guardrailMessages: string[];
  recoveryActions: string[];
}

interface CoachChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
  plan?: string[];
  riskLevel?: 'low' | 'moderate' | 'high';
}

const WEARABLES_KEY = 'veltrix_wearable_connections';
const WELLNESS_SYNC_SETTINGS_KEY = 'veltrix_wellness_live_sync_settings';
const WELLNESS_COACH_CHAT_KEY = 'veltrix_wellness_coach_chat_v1';

function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function readConnections(): WearableConnection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WEARABLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeConnections(connections: WearableConnection[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEARABLES_KEY, JSON.stringify(connections));
}

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'routine' | 'therapist'>('overview');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [connectError, setConnectError] = useState('');
  const [providerConfig, setProviderConfig] = useState<Record<string, { configured: boolean; missing: string[] }>>({});
  const [showMetricDetail, setShowMetricDetail] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProvider, setImportProvider] = useState<'apple_health' | 'samsung_health' | null>(null);
  const [importPayload, setImportPayload] = useState('');
  const [importing, setImporting] = useState(false);
  const [liveSyncEnabled, setLiveSyncEnabled] = useState(true);
  const [lastLiveSyncAt, setLastLiveSyncAt] = useState<string | null>(null);
  const [liveSyncError, setLiveSyncError] = useState('');
  const [liveSyncIntervalMs, setLiveSyncIntervalMs] = useState(60_000);
  const [staleAfterMs, setStaleAfterMs] = useState(5 * 60_000);
  const [allowWellnessGuardrails, setAllowWellnessGuardrails] = useState(true);

  useEffect(() => {
    setConnections(readConnections());

    try {
      const rawSettings = localStorage.getItem(WELLNESS_SYNC_SETTINGS_KEY);
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        if (typeof parsed.liveSyncEnabled === 'boolean') setLiveSyncEnabled(parsed.liveSyncEnabled);
        if (typeof parsed.liveSyncIntervalMs === 'number') setLiveSyncIntervalMs(parsed.liveSyncIntervalMs);
        if (typeof parsed.staleAfterMs === 'number') setStaleAfterMs(parsed.staleAfterMs);
      }
    } catch {
    }

    fetch('/api/wearables/status')
      .then((response) => response.json())
      .then((json) => {
        setProviderConfig(json?.status || {});
      })
      .catch(() => {
        setProviderConfig({});
      });

    try {
      const rawSettings = localStorage.getItem('userSettings');
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        if (typeof parsed?.permissions?.allowWellnessGuardrails === 'boolean') {
          setAllowWellnessGuardrails(parsed.permissions.allowWellnessGuardrails);
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      WELLNESS_SYNC_SETTINGS_KEY,
      JSON.stringify({ liveSyncEnabled, liveSyncIntervalMs, staleAfterMs })
    );
  }, [liveSyncEnabled, liveSyncIntervalMs, staleAfterMs]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const payload = event.data;
      if (!payload || payload.type !== 'wearable_oauth_result') return;

      setConnectingProvider(null);

      if (!payload.success) {
        setConnectError(payload.error || 'Wearable connection failed.');
        return;
      }

      setConnectError('');

      const accountData = payload.accountData || {};
      const provider = String(payload.provider || accountData.provider || '').toLowerCase();

      const next = readConnections().filter((item) => item.provider !== provider);
      next.push({
        provider,
        accountName: accountData.accountName || provider,
        connectedAt: accountData.connectedAt || new Date().toISOString(),
        accessToken: accountData.accessToken,
        refreshToken: accountData.refreshToken,
        expiresIn: accountData.expiresIn,
        lastSyncedAt: accountData.lastSyncedAt,
        metrics: accountData.metrics,
      });

      writeConnections(next);
      setConnections(next);
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const aggregated = useMemo(() => {
    const connectedMetrics = connections
      .map((item) => item.metrics)
      .filter(Boolean) as Array<{ restingHeartRate?: number; sleepHours?: number; steps?: number }>;

    if (connectedMetrics.length === 0) {
      return {
        heartRate: 72,
        sleepHours: 7.5,
        steps: 8432,
        hydration: 6,
      };
    }

    const average = (values: number[]) => {
      if (values.length === 0) return 0;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

    const heartRates = connectedMetrics.map((item) => item.restingHeartRate || 0).filter(Boolean);
    const sleepHours = connectedMetrics.map((item) => item.sleepHours || 0).filter(Boolean);
    const steps = connectedMetrics.map((item) => item.steps || 0).filter(Boolean);

    return {
      heartRate: Math.round(average(heartRates) || 72),
      sleepHours: Number((average(sleepHours) || 7.5).toFixed(1)),
      steps: Math.round(average(steps) || 8432),
      hydration: 6,
    };
  }, [connections]);

  const wellnessScore = useMemo(() => {
    const heartScore = aggregated.heartRate >= 55 && aggregated.heartRate <= 85 ? 30 : 20;
    const sleepScore = Math.min(30, Math.round((aggregated.sleepHours / 8) * 30));
    const stepsScore = Math.min(30, Math.round((aggregated.steps / 10000) * 30));
    const hydrationScore = Math.min(10, Math.round((aggregated.hydration / 8) * 10));
    return Math.max(0, Math.min(100, heartScore + sleepScore + stepsScore + hydrationScore));
  }, [aggregated]);

  const connectedDevices = connections.map((item) => item.provider);
  const realtimeProviders = connections
    .map((item) => item.provider)
    .filter((provider) => provider === 'fitbit' || provider === 'oura' || provider === 'whoop');

  const isStale = (lastSyncedAt?: string) => {
    if (!lastSyncedAt) return true;
    const syncedMs = new Date(lastSyncedAt).getTime();
    if (Number.isNaN(syncedMs)) return true;
    return Date.now() - syncedMs > staleAfterMs;
  };

  const staleConnectedCount = connections.filter((item) => isStale(item.lastSyncedAt)).length;

  const coachContext = useMemo<WellnessCoachContext>(() => {
    const stressLevel = clampNumber(
      Math.round(
        (aggregated.heartRate > 85 ? (aggregated.heartRate - 85) * 2 : 8) +
          (aggregated.sleepHours < 7 ? (7 - aggregated.sleepHours) * 14 : 0) +
          (aggregated.steps < 7000 ? ((7000 - aggregated.steps) / 1000) * 5 : 0) +
          (100 - wellnessScore) * 0.35
      ),
      5,
      100
    );

    const energyLevel = clampNumber(
      Math.round((aggregated.sleepHours / 8) * 55 + Math.min(aggregated.steps / 10000, 1) * 25 + (wellnessScore / 100) * 20),
      5,
      100
    );

    const burnoutRisk = clampNumber(Math.round((100 - wellnessScore) * 0.65 + stressLevel * 0.35), 0, 100);

    const wellnessData = {
      energyLevel,
      stressLevel,
      sleepHours: aggregated.sleepHours,
      workHoursToday: burnoutRisk >= 75 ? 5 : burnoutRisk >= 55 ? 7 : 8,
      workHoursThisWeek: burnoutRisk >= 75 ? 32 : burnoutRisk >= 55 ? 40 : 45,
      lastBreak: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      burnoutRisk,
    };

    const guardrailPermissions = {
      canViewEarnings: true,
      canViewPerformance: true,
      canShareWellnessData: false,
      earningsVisibility: 'private' as const,
      performanceVisibility: 'private' as const,
      wellnessVisibility: 'therapist-only' as const,
      allowAutopilot: true,
      allowWellnessGuardrails,
      allowPerformanceTracking: true,
    };

    const guardrailsEngine = createWellnessGuardrails(wellnessData, guardrailPermissions);
    const guardrails = guardrailsEngine.analyze();

    return {
      wellnessScore,
      heartRate: aggregated.heartRate,
      sleepHours: aggregated.sleepHours,
      steps: aggregated.steps,
      hydration: aggregated.hydration,
      burnoutRisk,
      stressLevel,
      energyLevel,
      recommendedWorkHours: guardrailsEngine.getRecommendedWorkHours(),
      staleSources: staleConnectedCount,
      totalSources: connections.length,
      guardrailMessages: guardrails.slice(0, 3).map((item) => `${item.message} ${item.recommendation}`),
      recoveryActions: guardrailsEngine.getRecoveryActions().slice(0, 4),
    };
  }, [aggregated, wellnessScore, staleConnectedCount, connections.length, allowWellnessGuardrails]);

  const startConnect = async (provider: 'fitbit' | 'oura' | 'whoop') => {
    setConnectError('');
    setConnectingProvider(provider);

    try {
      const response = await fetch(`/api/wearables/${provider}/start`, { method: 'POST' });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error || `Could not connect ${provider}.`);
      }

      window.open(json.authUrl, `${provider}-oauth`, 'width=520,height=680');
    } catch (error: any) {
      setConnectingProvider(null);
      setConnectError(error?.message || `Could not connect ${provider}.`);
    }
  };

  const openImportBridge = (provider: 'apple_health' | 'samsung_health') => {
    setImportProvider(provider);
    setImportPayload('');
    setShowImportModal(true);
    setConnectError('');
  };

  const submitImportBridge = async () => {
    if (!importProvider) return;
    if (!importPayload.trim()) {
      setConnectError('Please paste your exported health payload first.');
      return;
    }

    setImporting(true);
    setConnectError('');

    try {
      const endpoint =
        importProvider === 'apple_health'
          ? '/api/wearables/apple-health/import'
          : '/api/wearables/samsung-health/import';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: importPayload }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || `Failed to import ${importProvider}.`);
      }

      const next = readConnections().filter((item) => item.provider !== importProvider);
      next.push({
        provider: importProvider,
        accountName: json.accountName || (importProvider === 'apple_health' ? 'Apple Health' : 'Samsung Health'),
        connectedAt: new Date().toISOString(),
        accessToken: 'import_bridge',
        lastSyncedAt: json.syncedAt,
        metrics: json.metrics,
      });

      writeConnections(next);
      setConnections(next);
      setShowImportModal(false);
      setImportPayload('');
      setImportProvider(null);
    } catch (error: any) {
      setConnectError(error?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const disconnect = (provider: string) => {
    const next = connections.filter((item) => item.provider !== provider);
    writeConnections(next);
    setConnections(next);
  };

  const syncProvider = async (provider: string) => {
    const connection = connections.find((item) => item.provider === provider);
    if (!connection) return;

    if (provider === 'apple_health' || provider === 'samsung_health') {
      openImportBridge(provider);
      return;
    }

    setSyncingProvider(provider);
    setConnectError('');

    try {
      const response = await fetch(`/api/wearables/${provider}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: connection.accessToken }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || `Failed to sync ${provider}.`);

      const next = connections.map((item) =>
        item.provider === provider
          ? {
              ...item,
              metrics: json.metrics,
              lastSyncedAt: json.syncedAt,
            }
          : item
      );

      writeConnections(next);
      setConnections(next);
    } catch (error: any) {
      setConnectError(error?.message || `Failed to sync ${provider}.`);
    } finally {
      setSyncingProvider(null);
    }
  };

  const syncAll = async () => {
    for (const provider of connectedDevices) {
      if (provider === 'apple_health' || provider === 'samsung_health') {
        continue;
      }
      await syncProvider(provider);
    }
  };

  useEffect(() => {
    if (!liveSyncEnabled) return;
    if (realtimeProviders.length === 0) return;

    let cancelled = false;

    const runLiveSync = async () => {
      try {
        setLiveSyncError('');

        for (const provider of realtimeProviders) {
          const connection = readConnections().find((item) => item.provider === provider);
          if (!connection?.accessToken) continue;

          const response = await fetch(`/api/wearables/${provider}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: connection.accessToken }),
          });

          const json = await response.json();
          if (!response.ok) {
            throw new Error(json?.error || `Live sync failed for ${provider}.`);
          }

          if (cancelled) return;

          const updated = readConnections().map((item) =>
            item.provider === provider
              ? {
                  ...item,
                  metrics: json.metrics,
                  lastSyncedAt: json.syncedAt,
                }
              : item
          );

          writeConnections(updated);
          setConnections(updated);
        }

        if (!cancelled) {
          setLastLiveSyncAt(new Date().toISOString());
        }
      } catch (error: any) {
        if (!cancelled) {
          setLiveSyncError(error?.message || 'Live sync failed.');
        }
      }
    };

    runLiveSync();
    const timer = window.setInterval(runLiveSync, liveSyncIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [liveSyncEnabled, liveSyncIntervalMs, realtimeProviders.join('|')]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Personal Wellness OS
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Your complete health & wellbeing operating system
          </p>
        </div>
        <button 
          onClick={() => setShowConnectModal(true)}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg flex items-center gap-2"
        >
          <Watch className="w-5 h-5" />
          Connect Smartwatch
        </button>
      </div>

      {connectError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {connectError}
        </div>
      )}

      <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Real-Time Wearable Sync</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Fitbit/Oura/WHOOP refresh on interval. Apple/Samsung refresh on import.
            </p>
            {lastLiveSyncAt && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                Last live sync: {new Date(lastLiveSyncAt).toLocaleTimeString()}
              </p>
            )}
            {connections.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                {staleConnectedCount} of {connections.length} connected source{connections.length > 1 ? 's' : ''} stale
              </p>
            )}
            {liveSyncError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{liveSyncError}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={String(liveSyncIntervalMs)}
                onChange={(e) => setLiveSyncIntervalMs(parseInt(e.target.value, 10))}
                className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="15000">Sync every 15s</option>
                <option value="30000">Sync every 30s</option>
                <option value="60000">Sync every 60s</option>
                <option value="120000">Sync every 2m</option>
              </select>
              <select
                value={String(staleAfterMs)}
                onChange={(e) => setStaleAfterMs(parseInt(e.target.value, 10))}
                className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <option value="120000">Stale after 2m</option>
                <option value="300000">Stale after 5m</option>
                <option value="600000">Stale after 10m</option>
                <option value="1800000">Stale after 30m</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setLiveSyncEnabled((prev) => !prev)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
              liveSyncEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            {liveSyncEnabled ? 'Live Sync ON' : 'Live Sync OFF'}
          </button>
        </div>
      </div>

      {/* Health Score */}
      <div className="glass-card rounded-xl p-6 mb-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Today's Wellness Score</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Based on all your metrics</p>
          </div>
          <div className="text-5xl font-bold text-green-600">{wellnessScore}%</div>
        </div>
        <div className="mt-4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-teal-500" style={{ width: `${wellnessScore}%` }}></div>
        </div>
        {connections.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Live data from {connections.length} connected wearable{connections.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={syncAll}
              disabled={Boolean(syncingProvider)}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {syncingProvider ? 'Syncing…' : 'Sync Wearable Data'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Heart}
          label="Heart Rate"
          value={`${aggregated.heartRate} bpm`}
          status="normal"
          onClick={() => setShowMetricDetail('heart')}
        />
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={`${aggregated.sleepHours} hrs`}
          status="good"
          onClick={() => setShowMetricDetail('sleep')}
        />
        <MetricCard
          icon={Activity}
          label="Steps"
          value={aggregated.steps.toLocaleString()}
          status="good"
          onClick={() => setShowMetricDetail('steps')}
        />
        <MetricCard
          icon={Droplets}
          label="Hydration"
          value="6/8 glasses"
          status="warning"
          onClick={() => setShowMetricDetail('hydration')}
        />
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={Activity}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'routine'}
            onClick={() => setActiveTab('routine')}
            icon={Calendar}
            label="Morning Routine"
          />
          <TabButton
            active={activeTab === 'therapist'}
            onClick={() => setActiveTab('therapist')}
            icon={Brain}
            label="AI Coach"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        {activeTab === 'overview' && <Overview connectedDevices={connectedDevices} />}
        {activeTab === 'routine' && <MorningRoutine />}
        {activeTab === 'therapist' && (
          <AITherapist
            context={coachContext}
            settings={{ allowWellnessGuardrails }}
          />
        )}
      </div>

      {/* Connect Smartwatch Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Devices</h2>
                <button 
                  onClick={() => setShowConnectModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sync your wearable devices to automatically track health metrics, sleep, activity, and more.
              </p>

              <div className="space-y-3">
                <DeviceOption 
                  name="Fitbit" 
                  icon="⌚" 
                  description="OAuth connection for heart, sleep, and activity data"
                  configured={providerConfig.fitbit?.configured === true}
                  connected={connectedDevices.includes('fitbit')}
                  connecting={connectingProvider === 'fitbit'}
                  syncing={syncingProvider === 'fitbit'}
                  lastSyncedAt={connections.find((item) => item.provider === 'fitbit')?.lastSyncedAt}
                  stale={isStale(connections.find((item) => item.provider === 'fitbit')?.lastSyncedAt)}
                  onConnect={() => startConnect('fitbit')}
                  onDisconnect={() => disconnect('fitbit')}
                  onSync={() => syncProvider('fitbit')}
                  missing={providerConfig.fitbit?.missing || []}
                />
                <DeviceOption 
                  name="Oura" 
                  icon="💍" 
                  description="OAuth connection for sleep and readiness data"
                  configured={providerConfig.oura?.configured === true}
                  connected={connectedDevices.includes('oura')}
                  connecting={connectingProvider === 'oura'}
                  syncing={syncingProvider === 'oura'}
                  lastSyncedAt={connections.find((item) => item.provider === 'oura')?.lastSyncedAt}
                  stale={isStale(connections.find((item) => item.provider === 'oura')?.lastSyncedAt)}
                  onConnect={() => startConnect('oura')}
                  onDisconnect={() => disconnect('oura')}
                  onSync={() => syncProvider('oura')}
                  missing={providerConfig.oura?.missing || []}
                />
                <DeviceOption 
                  name="WHOOP" 
                  icon="📊" 
                  description="OAuth connection for recovery, strain, and sleep"
                  configured={providerConfig.whoop?.configured === true}
                  connected={connectedDevices.includes('whoop')}
                  connecting={connectingProvider === 'whoop'}
                  syncing={syncingProvider === 'whoop'}
                  lastSyncedAt={connections.find((item) => item.provider === 'whoop')?.lastSyncedAt}
                  stale={isStale(connections.find((item) => item.provider === 'whoop')?.lastSyncedAt)}
                  onConnect={() => startConnect('whoop')}
                  onDisconnect={() => disconnect('whoop')}
                  onSync={() => syncProvider('whoop')}
                  missing={providerConfig.whoop?.missing || []}
                />
                <DeviceOption 
                  name="Apple Watch" 
                  icon="⌚" 
                  description="Apple Health export bridge for real watch data"
                  configured={providerConfig.apple_health?.configured !== false}
                  connected={connectedDevices.includes('apple_health')}
                  connecting={connectingProvider === 'apple_health'}
                  syncing={syncingProvider === 'apple_health'}
                  lastSyncedAt={connections.find((item) => item.provider === 'apple_health')?.lastSyncedAt}
                  stale={isStale(connections.find((item) => item.provider === 'apple_health')?.lastSyncedAt)}
                  onConnect={() => openImportBridge('apple_health')}
                  onDisconnect={() => disconnect('apple_health')}
                  onSync={() => syncProvider('apple_health')}
                  missing={providerConfig.apple_health?.missing || []}
                />
                <DeviceOption 
                  name="Samsung Galaxy Watch" 
                  icon="⌚" 
                  description="Samsung Health export bridge for real watch data"
                  configured={providerConfig.samsung_health?.configured !== false}
                  connected={connectedDevices.includes('samsung_health')}
                  connecting={connectingProvider === 'samsung_health'}
                  syncing={syncingProvider === 'samsung_health'}
                  lastSyncedAt={connections.find((item) => item.provider === 'samsung_health')?.lastSyncedAt}
                  stale={isStale(connections.find((item) => item.provider === 'samsung_health')?.lastSyncedAt)}
                  onConnect={() => openImportBridge('samsung_health')}
                  onDisconnect={() => disconnect('samsung_health')}
                  onSync={() => syncProvider('samsung_health')}
                  missing={providerConfig.samsung_health?.missing || []}
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Mobile App Integration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download our mobile app to enable background syncing and real-time health tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowConnectModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium hover:scale-105 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportModal && importProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {importProvider === 'apple_health' ? 'Import Apple Health Data' : 'Import Samsung Health Data'}
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportProvider(null);
                  setImportPayload('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Paste exported JSON/CSV/XML payload from your health app to connect and sync real watch metrics.
            </p>

            <textarea
              value={importPayload}
              onChange={(e) => setImportPayload(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white"
              placeholder={importProvider === 'apple_health' ? 'Paste Apple Health export payload...' : 'Paste Samsung Health export payload...'}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportProvider(null);
                  setImportPayload('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitImportBridge}
                disabled={importing}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {importing ? 'Importing…' : 'Import & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Detail Modal */}
      {showMetricDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMetricDetail(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {showMetricDetail === 'heart' && '❤️ Heart Rate Details'}
                {showMetricDetail === 'sleep' && '🌙 Sleep Analysis'}
                {showMetricDetail === 'steps' && '👟 Activity Summary'}
                {showMetricDetail === 'hydration' && '💧 Hydration Tracker'}
              </h3>
              <button onClick={() => setShowMetricDetail(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="space-y-4">
              {showMetricDetail === 'heart' && (
                <>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-blue-600 mb-2">{aggregated.heartRate} bpm</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Resting Heart Rate</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Average (7 days):</span><span className="font-semibold">74 bpm</span></div>
                    <div className="flex justify-between"><span>Max today:</span><span className="font-semibold">145 bpm</span></div>
                    <div className="flex justify-between"><span>Min today:</span><span className="font-semibold">58 bpm</span></div>
                  </div>
                </>
              )}
              {showMetricDetail === 'sleep' && (
                <>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-purple-600 mb-2">{aggregated.sleepHours} hrs</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Last Night</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Deep Sleep:</span><span className="font-semibold">2.5 hrs</span></div>
                    <div className="flex justify-between"><span>REM Sleep:</span><span className="font-semibold">1.8 hrs</span></div>
                    <div className="flex justify-between"><span>Light Sleep:</span><span className="font-semibold">3.2 hrs</span></div>
                    <div className="flex justify-between"><span>Sleep Score:</span><span className="font-semibold text-green-600">85/100</span></div>
                  </div>
                </>
              )}
              {showMetricDetail === 'steps' && (
                <>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-green-600 mb-2">{aggregated.steps.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Steps Today</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Goal Progress:</span><span className="font-semibold">84%</span></div>
                    <div className="flex justify-between"><span>Distance:</span><span className="font-semibold">6.2 km</span></div>
                    <div className="flex justify-between"><span>Calories:</span><span className="font-semibold">342 kcal</span></div>
                    <div className="flex justify-between"><span>Active Minutes:</span><span className="font-semibold">47 min</span></div>
                  </div>
                </>
              )}
              {showMetricDetail === 'hydration' && (
                <>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-blue-500 mb-2">6/8</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Glasses Today</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Water:</span><span className="font-semibold">1,500 ml</span></div>
                    <div className="flex justify-between"><span>Goal:</span><span className="font-semibold">2,000 ml</span></div>
                    <div className="flex justify-between"><span>Remaining:</span><span className="font-semibold text-yellow-600">500 ml</span></div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Log Water Intake</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, status, onClick }: any) {
  const statusColors = {
    normal: 'text-blue-600',
    good: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 hover:scale-105 transition-all text-left w-full"
    >
      <Icon className={`w-6 h-6 mb-2 ${statusColors[status as keyof typeof statusColors]}`} />
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function DeviceOption({
  name,
  icon,
  description,
  configured,
  connected,
  connecting,
  syncing,
  lastSyncedAt,
  stale,
  missing,
  onConnect,
  onDisconnect,
  onSync,
}: any) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-between hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          {!configured && missing?.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Missing: {missing.join(', ')}
            </p>
          )}
          {connected && lastSyncedAt && (
            <p className={`text-xs mt-1 ${stale ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
              {stale ? 'Stale' : 'Fresh'} • Synced {new Date(lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
      {connected ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onSync}
            disabled={syncing}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
          <button
            onClick={onDisconnect}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2 hover:bg-green-200 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Connected
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          <Link2 className="w-4 h-4" />
          {connecting ? 'Connecting…' : 'Connect'}
        </button>
      )}
    </div>
  );
}

function Overview({ connectedDevices }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Health Overview</h3>
        {connectedDevices.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Watch className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {connectedDevices.length} device{connectedDevices.length > 1 ? 's' : ''} syncing
            </span>
          </div>
        )}
      </div>

      {/* Alarm Clock Component */}
      <AlarmClock />

      {/* Weekly Trend */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          7-Day Wellness Trend
        </h4>
        <div className="grid grid-cols-7 gap-2">
          {[
            { day: 'Mon', height: 85, score: 85 },
            { day: 'Tue', height: 92, score: 92 },
            { day: 'Wed', height: 78, score: 78 },
            { day: 'Thu', height: 88, score: 88 },
            { day: 'Fri', height: 95, score: 95 },
            { day: 'Sat', height: 72, score: 72 },
            { day: 'Sun', height: 68, score: 68 }
          ].map((item, i) => (
            <div key={item.day} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.day}</div>
              <div className={`rounded-lg ${
                i < 5 ? 'bg-green-500' : i === 5 ? 'bg-yellow-500' : 'bg-gray-300'
              }`} style={{ height: `${item.height}px` }}></div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white mt-2">
                {item.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Goals */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Today's Goals
        </h4>
        <div className="space-y-4">
          <GoalProgress label="10,000 Steps" current={8432} target={10000} />
          <GoalProgress label="8 Glasses Water" current={6} target={8} />
          <GoalProgress label="7.5 Hours Sleep" current={7.5} target={7.5} />
          <GoalProgress label="30 Min Exercise" current={22} target={30} />
        </div>
      </div>

      {/* Quick Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        <TipCard
          title="🌅 Morning Tip"
          description="Start your day with 10 minutes of meditation to boost focus and reduce stress."
        />
        <TipCard
          title="💧 Hydration Alert"
          description="You're 2 glasses short of your hydration goal. Drink water now!"
        />
      </div>
    </div>
  );
}

function MorningRoutine() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivity, setNewActivity] = useState({ time: '', activity: '' });
  
  const routines = [
    { id: 1, time: '06:00 AM', activity: 'Wake up & Drink water', completed: true },
    { id: 2, time: '06:15 AM', activity: '10 min Meditation', completed: true },
    { id: 3, time: '06:30 AM', activity: '5 min Gratitude Journal', completed: true },
    { id: 4, time: '06:45 AM', activity: '30 min Exercise', completed: false },
    { id: 5, time: '07:30 AM', activity: 'Healthy Breakfast', completed: false },
    { id: 6, time: '08:00 AM', activity: 'Review daily goals', completed: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Morning Routine Builder</h3>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all whitespace-nowrap"
        >
          + Add Activity
        </button>
      </div>

      {/* Smartwatch Integration Notice */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-4 border-2 border-teal-200 dark:border-teal-700">
        <div className="flex items-center gap-3">
          <Watch className="w-6 h-6 text-teal-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Smartwatch Auto-Tracking Enabled</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Activities like exercise and sleep are automatically synced from your connected devices
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌅</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Today's Routine</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {routines.filter(r => r.completed).length} of {routines.length} completed
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                routine.completed
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <input
                type="checkbox"
                checked={routine.completed}
                className="w-5 h-5 rounded"
                readOnly
              />
              <div className="flex-1">
                <div className={`font-medium ${
                  routine.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {routine.activity}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{routine.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">💡 Routine Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>✓ You've completed your routine 5/7 days this week</li>
          <li>✓ Morning meditation has improved your focus by 23%</li>
          <li>✓ Best streak: 12 days in a row</li>
        </ul>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Activity</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                <input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity</label>
                <input
                  type="text"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({...newActivity, activity: e.target.value})}
                  className="w-full px-4 py-2 glass-input rounded-lg"
                  placeholder="e.g., Morning stretch, Read book"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  alert(`Activity added: ${newActivity.activity} at ${newActivity.time}`);
                  setNewActivity({ time: '', activity: '' });
                  setShowAddModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium"
              >
                Add Activity
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AITherapist({
  context,
  settings,
}: {
  context: WellnessCoachContext;
  settings: { allowWellnessGuardrails: boolean };
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [coachError, setCoachError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WELLNESS_COACH_CHAT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-40));
          return;
        }
      }
    } catch {
    }

    const baselineIntro: CoachChatMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: `Hi! I’m your AI wellness coach. Your current wellness score is ${context.wellnessScore}% and estimated burnout risk is ${context.burnoutRisk}%. Tell me how you’re feeling today, and I’ll help with a practical plan.`,
      createdAt: new Date().toISOString(),
      riskLevel: context.burnoutRisk >= 75 ? 'high' : context.burnoutRisk >= 45 ? 'moderate' : 'low',
      plan: context.recoveryActions.slice(0, 2),
    };

    setMessages([baselineIntro]);
  }, [context.wellnessScore, context.burnoutRisk, context.recoveryActions]);

  useEffect(() => {
    if (messages.length === 0) return;
    localStorage.setItem(WELLNESS_COACH_CHAT_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  const sendMessage = async (overrideMessage?: string) => {
    const outbound = (overrideMessage ?? message).trim();
    if (!outbound || sending) return;

    const userMsg: CoachChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: outbound,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setMessage('');
    setSending(true);
    setCoachError('');

    try {
      const response = await fetch('/api/wellness/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: outbound,
          history: nextMessages.map((item) => ({ sender: item.sender, text: item.text })),
          context,
          settings,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Coach is currently unavailable.');
      }

      const aiMsg: CoachChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'ai',
        text: String(json?.reply || 'I’m here with you. Let’s take this one step at a time.'),
        createdAt: new Date().toISOString(),
        plan: Array.isArray(json?.plan) ? json.plan.slice(0, 5) : [],
        riskLevel: json?.riskLevel === 'high' || json?.riskLevel === 'moderate' || json?.riskLevel === 'low' ? json.riskLevel : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const fallback: CoachChatMessage = {
        id: `ai-${Date.now()}-fallback`,
        sender: 'ai',
        text: 'I hit a connection issue, but we can still work through this. Start with a 2-minute breathing reset and one small next action.',
        createdAt: new Date().toISOString(),
        plan: ['Breathe for 2 minutes', 'Pick one next action', 'Take a short walk break'],
        riskLevel: context.burnoutRisk >= 75 ? 'high' : 'moderate',
      };
      setMessages((prev) => [...prev, fallback]);
      setCoachError(error?.message || 'Failed to reach AI coach.');
    } finally {
      setSending(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    sendMessage(`I need help with ${topic.toLowerCase()}.`);
  };

  const clearConversation = () => {
    localStorage.removeItem(WELLNESS_COACH_CHAT_KEY);
    setMessages([
      {
        id: `ai-${Date.now()}-reset`,
        sender: 'ai',
        text: `Conversation reset. Your current baseline is ${context.wellnessScore}% wellness score with ${context.burnoutRisk}% burnout risk. What would you like support with now?`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Wellness Coach</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Real-time coaching powered by your wellness signals, guardrails, and daily behavior patterns
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <CoachSignal label="Wellness" value={`${context.wellnessScore}%`} tone="green" />
        <CoachSignal label="Burnout" value={`${context.burnoutRisk}%`} tone={context.burnoutRisk >= 70 ? 'red' : context.burnoutRisk >= 45 ? 'yellow' : 'green'} />
        <CoachSignal label="Sleep" value={`${context.sleepHours}h`} tone={context.sleepHours < 6.5 ? 'yellow' : 'green'} />
        <CoachSignal label="Steps" value={context.steps.toLocaleString()} tone={context.steps < 6000 ? 'yellow' : 'green'} />
      </div>

      {coachError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {coachError}
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-xl ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      AI Coach{msg.riskLevel ? ` • ${msg.riskLevel.toUpperCase()} focus` : ''}
                    </span>
                  </div>
                )}
                <p className="text-sm">{msg.text}</p>
                {msg.sender === 'ai' && Array.isArray(msg.plan) && msg.plan.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs list-disc list-inside opacity-90">
                    {msg.plan.map((item, index) => (
                      <li key={`${msg.id}-plan-${index}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="max-w-sm px-4 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <p className="text-sm">Coach is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Share what's on your mind..."
            disabled={sending}
            className="flex-1 px-4 py-3 glass-input rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>

      {/* Quick Topics */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Topics</h4>
        <div className="flex flex-wrap gap-2">
          <TopicButton label="Stress Management" onClick={() => handleTopicClick('Stress Management')} />
          <TopicButton label="Goal Setting" onClick={() => handleTopicClick('Goal Setting')} />
          <TopicButton label="Work-Life Balance" onClick={() => handleTopicClick('Work-Life Balance')} />
          <TopicButton label="Productivity Tips" onClick={() => handleTopicClick('Productivity Tips')} />
          <TopicButton label="Motivation" onClick={() => handleTopicClick('Motivation')} />
          <TopicButton label="Sleep Recovery" onClick={() => handleTopicClick('Sleep Recovery')} />
        </div>
        <button
          onClick={clearConversation}
          className="mt-3 text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
        >
          Clear conversation
        </button>
      </div>
    </div>
  );
}

function CoachSignal({ label, value, tone }: { label: string; value: string; tone: 'green' | 'yellow' | 'red' }) {
  const toneClasses: Record<'green' | 'yellow' | 'red', string> = {
    green: 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
    yellow: 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    red: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300',
  };

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function GoalProgress({ label, current, target }: any) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="text-gray-600 dark:text-gray-400">
          {current}/{target}
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function TipCard({ title, description }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700">
      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h5>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function TopicButton({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all"
    >
      {label}
    </button>
  );
}
