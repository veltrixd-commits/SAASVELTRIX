/**
 * Autopilot Engine - Core Intelligence Layer
 * 
 * Consumes data from all modules (CRM, tasks, content, wellness, revenue)
 * Produces intelligent recommendations for daily focus, priorities, and opportunities
 * 
 * This is the "brain" of Veltrix Autopilot.
 */

import type {
  AutopilotRecommendations,
  AutopilotDataSources,
  FocusPlan,
  PriorityTask,
  IncomeOpportunity,
  WellnessGuardrail,
  UserMode,
  UserPermissions,
} from '@/types/autopilot';

export class AutopilotEngine {
  private dataSources: AutopilotDataSources;
  private userMode: UserMode;
  private permissions: UserPermissions;

  constructor(
    dataSources: AutopilotDataSources,
    userMode: UserMode,
    permissions: UserPermissions
  ) {
    this.dataSources = dataSources;
    this.userMode = userMode;
    this.permissions = permissions;
  }

  /**
   * Generate complete autopilot recommendations
   */
  public generateRecommendations(): AutopilotRecommendations {
    return {
      dailyFocusPlan: this.generateFocusPlan(),
      priorityTasks: this.generatePriorityTasks(),
      incomeOpportunities: this.generateIncomeOpportunities(),
      wellnessGuardrails: this.generateWellnessGuardrails(),
      insights: this.generateInsights(),
      generatedAt: new Date(),
    };
  }

  // ============================================
  // DAILY FOCUS PLAN
  // ============================================

  private generateFocusPlan(): FocusPlan {
    const { wellness, revenue, leads, tasks } = this.dataSources;
    
    // Determine energy level
    const energyLevel = this.calculateEnergyLevel(wellness);
    
    // Calculate productive hours based on wellness
    const estimatedProductiveHours = this.estimateProductiveHours(wellness, energyLevel);
    
    // Determine primary focus based on user mode and urgency
    const primary = this.determinePrimaryFocus();
    
    // Generate secondary focuses
    const secondary = this.determineSecondaryFocuses();
    
    // Recommend breaks based on wellness state
    const recommendedBreaks = this.calculateRecommendedBreaks(wellness);

    return {
      primary,
      secondary,
      energyLevel,
      estimatedProductiveHours,
      recommendedBreaks,
    };
  }

  private calculateEnergyLevel(wellness: typeof this.dataSources.wellness): 'low' | 'medium' | 'high' {
    const score = wellness.energyLevel;
    if (score < 40) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  }

  private estimateProductiveHours(
    wellness: typeof this.dataSources.wellness,
    energyLevel: 'low' | 'medium' | 'high'
  ): number {
    // Base hours by energy level
    const baseHours = {
      low: 4,
      medium: 6,
      high: 8,
    }[energyLevel];

    // Reduce if burnout risk is high
    const burnoutPenalty = wellness.burnoutRisk > 70 ? 2 : 0;
    
    // Reduce if already worked too much this week
    const overworkPenalty = wellness.workHoursThisWeek > 45 ? 1 : 0;

    return Math.max(2, baseHours - burnoutPenalty - overworkPenalty);
  }

  private determinePrimaryFocus(): string {
    const { leads, revenue, wellness, content } = this.dataSources;

    // Critical: Burnout risk
    if (wellness.burnoutRisk > 80) {
      return '🛡️ Recovery & Wellness (Critical)';
    }

    // Mode-specific priorities
    switch (this.userMode) {
      case 'businessOwner':
        // Hot leads take priority
        const hotLeads = leads.filter(l => l.status === 'hot').length;
        if (hotLeads > 0) {
          return `🔥 Close ${hotLeads} Hot Lead${hotLeads > 1 ? 's' : ''}`;
        }
        // Revenue goal progress
        const revenueProgress = (revenue.monthlyRevenue / revenue.revenueGoal) * 100;
        if (revenueProgress < 50 && new Date().getDate() > 15) {
          return '💰 Revenue Recovery - Focus on Sales';
        }
        return '📈 Grow Your Business';

      case 'creator':
        const unpublishedContent = content.filter(c => !c.published).length;
        if (unpublishedContent > 5) {
          return '🎬 Publish Content & Engage Audience';
        }
        return '✨ Create & Monetize Content';

      case 'employee':
        return '🎯 Complete Priority Tasks';

      case 'individual':
        return '🌟 Personal Growth & Wellness';

      default:
        return '🚀 Focus on What Matters';
    }
  }

  private determineSecondaryFocuses(): string[] {
    const focuses: string[] = [];
    const { leads, tasks, content, automation } = this.dataSources;

    // Add secondary focuses based on data
    if (leads.filter(l => l.status === 'new').length > 3) {
      focuses.push('Qualify new leads');
    }

    const overdueTasks = tasks.filter(
      t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    if (overdueTasks > 0) {
      focuses.push(`Complete ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`);
    }

    if (content.filter(c => c.scheduledDate && !c.published).length > 0) {
      focuses.push('Schedule content');
    }

    if (automation.activeAutomations < 2) {
      focuses.push('Set up automation');
    }

    return focuses.slice(0, 3); // Max 3 secondary focuses
  }

  private calculateRecommendedBreaks(wellness: typeof this.dataSources.wellness): number {
    // High stress = more breaks
    if (wellness.stressLevel > 70) return 6;
    if (wellness.stressLevel > 50) return 4;
    return 3;
  }

  // ============================================
  // PRIORITY TASKS
  // ============================================

  private generatePriorityTasks(): PriorityTask[] {
    const { leads, tasks, wellness } = this.dataSources;
    const priorityTasks: PriorityTask[] = [];

    // Convert hot leads to priority tasks
    leads
      .filter(l => l.status === 'hot')
      .slice(0, 3)
      .forEach(lead => {
        priorityTasks.push({
          id: `lead-${lead.id}`,
          title: `Follow up with hot lead from ${lead.source}`,
          impact: 'critical',
          revenueImpact: lead.estimatedValue || null,
          energyRequired: 'medium',
          estimatedMinutes: 30,
          category: 'lead',
          reason: 'Hot lead with high conversion potential',
        });
      });

    // Add high-priority tasks
    tasks
      .filter(t => t.priority === 'high' && t.status !== 'done')
      .slice(0, 3)
      .forEach(task => {
        priorityTasks.push({
          id: task.id,
          title: task.title,
          impact: task.linkedRevenue ? 'high' : 'medium',
          revenueImpact: task.linkedRevenue || null,
          energyRequired: 'medium',
          estimatedMinutes: 60,
          category: 'admin',
          reason: task.linkedRevenue 
            ? `Directly impacts R ${task.linkedRevenue} in revenue`
            : 'High priority task',
        });
      });

    // Wellness-aware sorting: if energy is low, deprioritize high-energy tasks
    if (wellness.energyLevel < 40) {
      priorityTasks.sort((a, b) => {
        if (a.energyRequired === 'low' && b.energyRequired !== 'low') return -1;
        if (a.energyRequired !== 'low' && b.energyRequired === 'low') return 1;
        return 0;
      });
    }

    return priorityTasks.slice(0, 5); // Max 5 priority tasks
  }

  // ============================================
  // INCOME OPPORTUNITIES
  // ============================================

  private generateIncomeOpportunities(): IncomeOpportunity[] {
    if (!this.permissions.canViewEarnings) {
      return []; // Respect privacy
    }

    const { leads, content, revenue } = this.dataSources;
    const opportunities: IncomeOpportunity[] = [];

    // Hot leads as income opportunities
    leads
      .filter(l => l.status === 'hot' && l.estimatedValue)
      .forEach(lead => {
        opportunities.push({
          id: `opp-lead-${lead.id}`,
          type: 'hot-lead',
          title: `Close deal from ${lead.source}`,
          potentialRevenue: lead.estimatedValue!,
          effort: 'medium',
          confidence: 75,
          action: 'Send proposal or follow up',
          deadline: lead.lastContact 
            ? new Date(new Date(lead.lastContact).getTime() + 2 * 24 * 60 * 60 * 1000)
            : undefined,
        });
      });

    // Content monetization (for creators)
    if (this.userMode === 'creator') {
      const recentContent = content.filter(c => c.published && c.engagement && c.engagement > 1000);
      if (recentContent.length > 0) {
        opportunities.push({
          id: 'opp-content-monetize',
          type: 'content-deal',
          title: 'Monetize high-performing content',
          potentialRevenue: 5000,
          effort: 'low',
          confidence: 60,
          action: 'Reach out to brands for sponsorship',
        });
      }
    }

    // Upsell existing clients
    if (this.userMode === 'businessOwner' && revenue.totalRevenue > 50000) {
      opportunities.push({
        id: 'opp-upsell',
        type: 'upsell',
        title: 'Upsell to existing clients',
        potentialRevenue: 15000,
        effort: 'medium',
        confidence: 50,
        action: 'Review client list and identify upsell candidates',
      });
    }

    return opportunities.slice(0, 4); // Max 4 opportunities
  }

  // ============================================
  // WELLNESS GUARDRAILS
  // ============================================

  private generateWellnessGuardrails(): WellnessGuardrail[] {
    if (!this.permissions.allowWellnessGuardrails) {
      return [];
    }

    const { wellness } = this.dataSources;
    const guardrails: WellnessGuardrail[] = [];

    // Critical: Burnout risk
    if (wellness.burnoutRisk > 80) {
      guardrails.push({
        id: 'burnout-critical',
        severity: 'critical',
        type: 'burnout-risk',
        message: 'Critical burnout risk detected',
        recommendation: 'Take today off or work max 4 hours. Schedule recovery time.',
        autoAction: 'throttle-tasks',
      });
    } else if (wellness.burnoutRisk > 60) {
      guardrails.push({
        id: 'burnout-warning',
        severity: 'warning',
        type: 'burnout-risk',
        message: 'Elevated burnout risk',
        recommendation: 'Limit work to 6 hours. Take regular breaks.',
        autoAction: 'suggest-break',
      });
    }

    // Overwork detection
    if (wellness.workHoursThisWeek > 50) {
      guardrails.push({
        id: 'overwork',
        severity: 'warning',
        type: 'overwork',
        message: `You've worked ${wellness.workHoursThisWeek} hours this week`,
        recommendation: 'Consider taking tomorrow off or working half-day.',
      });
    }

    // Low energy
    if (wellness.energyLevel < 30) {
      guardrails.push({
        id: 'low-energy',
        severity: 'warning',
        type: 'low-energy',
        message: 'Low energy detected',
        recommendation: 'Focus on low-energy tasks. Take a 20-minute walk.',
        autoAction: 'reschedule',
      });
    }

    // High stress
    if (wellness.stressLevel > 75) {
      guardrails.push({
        id: 'high-stress',
        severity: 'warning',
        type: 'stress-detected',
        message: 'Elevated stress levels',
        recommendation: 'Practice 10-minute breathing exercise. Delegate non-critical tasks.',
      });
    }

    // Sleep deprivation
    if (wellness.sleepHours < 6) {
      guardrails.push({
        id: 'sleep-deprived',
        severity: 'info',
        type: 'low-energy',
        message: `Only ${wellness.sleepHours} hours of sleep last night`,
        recommendation: 'Avoid critical decisions. Prioritize rest tonight.',
      });
    }

    return guardrails;
  }

  // ============================================
  // INSIGHTS
  // ============================================

  private generateInsights(): string[] {
    const insights: string[] = [];
    const { revenue, automation, tasks, wellness, leads } = this.dataSources;

    // Revenue insights
    const revenueProgress = (revenue.monthlyRevenue / revenue.revenueGoal) * 100;
    if (revenueProgress >= 100) {
      insights.push(`🎉 You've hit ${Math.round(revenueProgress)}% of your monthly revenue goal!`);
    } else if (revenueProgress >= 75) {
      insights.push(`💪 ${Math.round(100 - revenueProgress)}% away from your revenue goal`);
    }

    // Automation wins
    if (automation.timeSaved > 120) {
      const hours = Math.round(automation.timeSaved / 60);
      insights.push(`⚡ Automation saved you ${hours} hours this week`);
    }

    // Task completion rate
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    if (completionRate > 80) {
      insights.push(`🏆 ${Math.round(completionRate)}% task completion rate - excellent focus!`);
    }

    // Lead response time
    const recentLeads = leads.filter(
      l => l.createdAt && new Date().getTime() - new Date(l.createdAt).getTime() < 24 * 60 * 60 * 1000
    );
    if (recentLeads.length > 5) {
      insights.push(`🔥 ${recentLeads.length} new leads today - respond quickly to maximize conversions`);
    }

    // Wellness streak
    if (wellness.energyLevel > 70 && wellness.stressLevel < 40) {
      insights.push(`🌟 Great energy and low stress - you're in peak performance mode`);
    }

    return insights.slice(0, 3); // Max 3 insights
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * TODO: Connect to AI/GPT for more intelligent recommendations
   * This is where we'd integrate OpenAI for natural language insights
   */
  private async generateAIInsights(): Promise<string[]> {
    // Placeholder for future AI integration
    return [];
  }

  /**
   * Apply wellness guardrails automatically
   * Throttles task load if burnout risk is high
   */
  public applyWellnessThrottling(guardrails: WellnessGuardrail[]): boolean {
    const criticalGuardrails = guardrails.filter(g => g.severity === 'critical');
    return criticalGuardrails.length > 0;
  }
}

/**
 * Factory function to create AutopilotEngine with current user data
 */
export function createAutopilotEngine(
  userData: any,
  userMode: UserMode,
  permissions: UserPermissions
): AutopilotEngine {
  // TODO: Fetch real data from database/localStorage
  // For now, use mock data structure
  const dataSources: AutopilotDataSources = extractDataSources(userData);
  
  return new AutopilotEngine(dataSources, userMode, permissions);
}

/**
 * Extract autopilot data sources from user data
 * TODO: Connect to real data stores
 */
function extractDataSources(userData: any): AutopilotDataSources {
  // Mock structure - replace with real data fetching
  return {
    leads: userData?.leads || [],
    tasks: userData?.tasks || [],
    content: userData?.content || [],
    wellness: userData?.wellness || {
      energyLevel: 70,
      stressLevel: 40,
      sleepHours: 7,
      workHoursToday: 4,
      workHoursThisWeek: 25,
      burnoutRisk: 30,
    },
    revenue: userData?.revenue || {
      totalRevenue: 50000,
      monthlyRevenue: 15000,
      weeklyRevenue: 3500,
      revenueGoal: 20000,
      pipelineValue: 45000,
    },
    automation: userData?.automation || {
      activeAutomations: 3,
      tasksAutomated: 15,
      leadsProcessed: 25,
      timeSaved: 180,
    },
  };
}
