/**
 * Wellness Guardrails System
 * 
 * Automatically detects burnout, stress, and overwork
 * Throttles workload and suggests recovery actions
 * NEVER exposes individual data without explicit permission
 */

import type { WellnessData, WellnessGuardrail, UserPermissions } from '@/types/autopilot';

export class WellnessGuardrailsEngine {
  private wellnessData: WellnessData;
  private permissions: UserPermissions;

  constructor(wellnessData: WellnessData, permissions: UserPermissions) {
    this.wellnessData = wellnessData;
    this.permissions = permissions;
  }

  /**
   * Analyze wellness data and generate guardrails
   */
  public analyze(): WellnessGuardrail[] {
    if (!this.permissions.allowWellnessGuardrails) {
      return [];
    }

    const guardrails: WellnessGuardrail[] = [];

    // Check each wellness metric
    guardrails.push(...this.checkBurnoutRisk());
    guardrails.push(...this.checkOverwork());
    guardrails.push(...this.checkEnergyLevels());
    guardrails.push(...this.checkStressLevels());
    guardrails.push(...this.checkSleepDeprivation());
    guardrails.push(...this.checkWorkLifeBalance());

    return guardrails.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Check if automatic workload throttling should be applied
   */
  public shouldThrottleWorkload(): boolean {
    const { burnoutRisk, stressLevel, workHoursThisWeek } = this.wellnessData;
    
    return (
      burnoutRisk > 80 ||
      stressLevel > 85 ||
      workHoursThisWeek > 60
    );
  }

  /**
   * Calculate recommended maximum work hours for today
   */
  public getRecommendedWorkHours(): number {
    const { burnoutRisk, energyLevel, workHoursThisWeek, sleepHours } = this.wellnessData;

    let baseHours = 8;

    // Reduce based on burnout risk
    if (burnoutRisk > 80) baseHours = 4;
    else if (burnoutRisk > 60) baseHours = 6;
    else if (burnoutRisk > 40) baseHours = 7;

    // Reduce based on energy level
    if (energyLevel < 30) baseHours = Math.min(baseHours, 4);
    else if (energyLevel < 50) baseHours = Math.min(baseHours, 6);

    // Reduce if overworked this week
    if (workHoursThisWeek > 50) baseHours = Math.min(baseHours, 5);
    else if (workHoursThisWeek > 40) baseHours = Math.min(baseHours, 7);

    // Reduce if sleep deprived
    if (sleepHours < 6) baseHours = Math.min(baseHours, 5);

    return Math.max(2, baseHours); // Minimum 2 hours
  }

  /**
   * Get recovery actions based on wellness state
   */
  public getRecoveryActions(): string[] {
    const actions: string[] = [];
    const { burnoutRisk, stressLevel, energyLevel, sleepHours } = this.wellnessData;

    if (burnoutRisk > 70) {
      actions.push('Take a day off or half-day');
      actions.push('Schedule a wellness check-in with AI therapist');
    }

    if (stressLevel > 70) {
      actions.push('Practice 10-minute breathing exercise');
      actions.push('Take a 20-minute walk outside');
      actions.push('Delegate non-critical tasks');
    }

    if (energyLevel < 40) {
      actions.push('Take a 15-minute power nap');
      actions.push('Eat a healthy snack');
      actions.push('Do light stretching or yoga');
    }

    if (sleepHours < 6) {
      actions.push('Go to bed early tonight (aim for 8 hours)');
      actions.push('Avoid caffeine after 2 PM');
    }

    return actions;
  }

  // ============================================
  // PRIVATE ANALYSIS METHODS
  // ============================================

  private checkBurnoutRisk(): WellnessGuardrail[] {
    const { burnoutRisk } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    if (burnoutRisk > 80) {
      guardrails.push({
        id: 'burnout-critical',
        severity: 'critical',
        type: 'burnout-risk',
        message: '🚨 Critical burnout risk detected',
        recommendation: 'STOP: Take today off or work maximum 4 hours. This is not sustainable.',
        autoAction: 'throttle-tasks',
      });
    } else if (burnoutRisk > 60) {
      guardrails.push({
        id: 'burnout-warning',
        severity: 'warning',
        type: 'burnout-risk',
        message: '⚠️ Elevated burnout risk',
        recommendation: 'Limit work to 6 hours today. Take regular breaks. Consider lighter week.',
        autoAction: 'suggest-break',
      });
    } else if (burnoutRisk > 40) {
      guardrails.push({
        id: 'burnout-info',
        severity: 'info',
        type: 'burnout-risk',
        message: 'ℹ️ Moderate stress levels',
        recommendation: 'Be mindful of work-life balance. Schedule recovery time.',
      });
    }

    return guardrails;
  }

  private checkOverwork(): WellnessGuardrail[] {
    const { workHoursThisWeek, workHoursToday } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    if (workHoursThisWeek > 60) {
      guardrails.push({
        id: 'overwork-critical',
        severity: 'critical',
        type: 'overwork',
        message: `⏰ ${workHoursThisWeek} hours this week - excessive`,
        recommendation: 'Take tomorrow off or work half-day. This pace is unsustainable.',
        autoAction: 'notify-owner',
      });
    } else if (workHoursThisWeek > 50) {
      guardrails.push({
        id: 'overwork-warning',
        severity: 'warning',
        type: 'overwork',
        message: `⚠️ ${workHoursThisWeek} hours this week`,
        recommendation: 'Plan lighter workload for rest of week. Target 40-45 hours.',
      });
    }

    if (workHoursToday > 10) {
      guardrails.push({
        id: 'overwork-today',
        severity: 'warning',
        type: 'overwork',
        message: `⏱️ ${workHoursToday} hours today - that's enough`,
        recommendation: 'Stop working. Rest and recharge for tomorrow.',
        autoAction: 'suggest-break',
      });
    }

    return guardrails;
  }

  private checkEnergyLevels(): WellnessGuardrail[] {
    const { energyLevel } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    if (energyLevel < 20) {
      guardrails.push({
        id: 'energy-critical',
        severity: 'critical',
        type: 'low-energy',
        message: '🪫 Critical low energy',
        recommendation: 'Take immediate break. Consider ending work early today.',
        autoAction: 'reschedule',
      });
    } else if (energyLevel < 40) {
      guardrails.push({
        id: 'energy-warning',
        severity: 'warning',
        type: 'low-energy',
        message: '🔋 Low energy detected',
        recommendation: 'Take 15-minute break. Focus on low-energy tasks only.',
        autoAction: 'suggest-break',
      });
    }

    return guardrails;
  }

  private checkStressLevels(): WellnessGuardrail[] {
    const { stressLevel } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    if (stressLevel > 85) {
      guardrails.push({
        id: 'stress-critical',
        severity: 'critical',
        type: 'stress-detected',
        message: '😰 Extreme stress levels',
        recommendation: 'Stop work. Practice breathing exercise. Talk to AI therapist.',
        autoAction: 'throttle-tasks',
      });
    } else if (stressLevel > 70) {
      guardrails.push({
        id: 'stress-warning',
        severity: 'warning',
        type: 'stress-detected',
        message: '😓 High stress detected',
        recommendation: 'Take 20-minute walk. Delegate tasks if possible. Practice mindfulness.',
      });
    }

    return guardrails;
  }

  private checkSleepDeprivation(): WellnessGuardrail[] {
    const { sleepHours } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    if (sleepHours < 5) {
      guardrails.push({
        id: 'sleep-critical',
        severity: 'warning',
        type: 'low-energy',
        message: `😴 Only ${sleepHours} hours of sleep`,
        recommendation: 'Avoid critical decisions. Take naps. Go to bed early tonight.',
      });
    } else if (sleepHours < 6.5) {
      guardrails.push({
        id: 'sleep-info',
        severity: 'info',
        type: 'low-energy',
        message: `💤 Below optimal sleep (${sleepHours}h)`,
        recommendation: 'Aim for 7-8 hours tonight. Take short breaks during the day.',
      });
    }

    return guardrails;
  }

  private checkWorkLifeBalance(): WellnessGuardrail[] {
    const { workHoursThisWeek, lastBreak } = this.wellnessData;
    const guardrails: WellnessGuardrail[] = [];

    // Check if last break was too long ago (more than 2 hours)
    if (lastBreak) {
      const hoursSinceBreak = (new Date().getTime() - new Date(lastBreak).getTime()) / (1000 * 60 * 60);
      if (hoursSinceBreak > 3) {
        guardrails.push({
          id: 'break-needed',
          severity: 'info',
          type: 'overwork',
          message: `☕ Last break was ${Math.round(hoursSinceBreak)} hours ago`,
          recommendation: 'Take a 10-minute break. Stretch and hydrate.',
          autoAction: 'suggest-break',
        });
      }
    }

    return guardrails;
  }

  // ============================================
  // PRIVACY PROTECTION
  // ============================================

  /**
   * Get aggregate (anonymized) wellness data for owners
   * NEVER exposes individual data unless explicitly permitted
   */
  public static getAggregateData(teamWellnessData: WellnessData[]): {
    averageBurnoutRisk: number;
    teamAtRisk: number;
    averageStressLevel: number;
    averageEnergyLevel: number;
    recommendedAction: string;
  } {
    if (teamWellnessData.length === 0) {
      return {
        averageBurnoutRisk: 0,
        teamAtRisk: 0,
        averageStressLevel: 0,
        averageEnergyLevel: 0,
        recommendedAction: 'No wellness data available',
      };
    }

    const avgBurnout = teamWellnessData.reduce((sum, d) => sum + d.burnoutRisk, 0) / teamWellnessData.length;
    const avgStress = teamWellnessData.reduce((sum, d) => sum + d.stressLevel, 0) / teamWellnessData.length;
    const avgEnergy = teamWellnessData.reduce((sum, d) => sum + d.energyLevel, 0) / teamWellnessData.length;
    const atRisk = teamWellnessData.filter(d => d.burnoutRisk > 60).length;

    let recommendedAction = 'Team wellness is good';
    if (avgBurnout > 60) {
      recommendedAction = 'Consider reducing team workload';
    } else if (avgStress > 70) {
      recommendedAction = 'Team stress is elevated - provide support';
    } else if (avgEnergy < 50) {
      recommendedAction = 'Team energy is low - schedule lighter week';
    }

    return {
      averageBurnoutRisk: Math.round(avgBurnout),
      teamAtRisk: atRisk,
      averageStressLevel: Math.round(avgStress),
      averageEnergyLevel: Math.round(avgEnergy),
      recommendedAction,
    };
  }
}

/**
 * Factory to create wellness guardrails engine
 */
export function createWellnessGuardrails(
  wellnessData: WellnessData,
  permissions: UserPermissions
): WellnessGuardrailsEngine {
  return new WellnessGuardrailsEngine(wellnessData, permissions);
}
