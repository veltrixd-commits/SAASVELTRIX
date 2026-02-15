/**
 * Performance Insights - Money Feedback Loop
 * 
 * Correlates actions (tasks, content, leads) to revenue impact
 * Shows users: "If you do X → you earn Y"
 */

import type { 
  PerformanceInsight, 
  MoneyFeedbackLoop,
  AutopilotDataSources,
  UserPermissions 
} from '@/types/autopilot';

export class PerformanceInsightsEngine {
  private dataSources: AutopilotDataSources;
  private permissions: UserPermissions;

  constructor(dataSources: AutopilotDataSources, permissions: UserPermissions) {
    this.dataSources = dataSources;
    this.permissions = permissions;
  }

  /**
   * Generate performance insights with revenue correlation
   */
  public generateInsights(): PerformanceInsight[] {
    if (!this.permissions.canViewPerformance) {
      return [];
    }

    const insights: PerformanceInsight[] = [];

    // Lead response time → revenue correlation
    insights.push(this.analyzeLeadResponseTime());

    // Task completion rate → revenue correlation
    insights.push(this.analyzeTaskCompletion());

    // Content output → revenue correlation
    insights.push(this.analyzeContentOutput());

    // Automation usage → time savings
    insights.push(this.analyzeAutomationImpact());

    return insights.filter(i => i.revenueCorrelation !== 0);
  }

  /**
   * Create money feedback loops: "Do X → Earn Y"
   */
  public createFeedbackLoops(): MoneyFeedbackLoop[] {
    if (!this.permissions.canViewEarnings) {
      return [];
    }

    const loops: MoneyFeedbackLoop[] = [];

    // Hot leads → conversions → revenue
    const hotLeadsLoop = this.calculateHotLeadLoop();
    if (hotLeadsLoop) loops.push(hotLeadsLoop);

    // Content creation → engagement → deals
    const contentLoop = this.calculateContentLoop();
    if (contentLoop) loops.push(contentLoop);

    // Task completion → project delivery → revenue
    const taskLoop = this.calculateTaskLoop();
    if (taskLoop) loops.push(taskLoop);

    return loops;
  }

  // ============================================
  // ANALYSIS METHODS
  // ============================================

  private analyzeLeadResponseTime(): PerformanceInsight {
    const { leads, revenue } = this.dataSources;
    
    // Calculate average response time and conversion rate
    const respondedLeads = leads.filter(l => l.lastContact);
    const avgResponseTimeHours = 2; // TODO: Calculate from actual data
    
    // Faster response = higher conversion (industry standard: 5x higher within 5 min)
    const revenueCorrelation = avgResponseTimeHours < 1 ? 0.85 : 0.45;

    return {
      metric: 'Lead Response Time',
      value: avgResponseTimeHours,
      trend: 'stable',
      revenueCorrelation,
      recommendation: avgResponseTimeHours > 1 
        ? 'Respond to leads within 1 hour to increase conversions by up to 5x'
        : 'Great response time! Keep it up.',
    };
  }

  private analyzeTaskCompletion(): PerformanceInsight {
    const { tasks, revenue } = this.dataSources;
    
    const completedTasks = tasks.filter(t => t.status === 'done');
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Higher completion rate correlates with higher revenue
    const revenueCorrelation = completionRate > 80 ? 0.75 : completionRate > 60 ? 0.5 : 0.25;

    return {
      metric: 'Task Completion Rate',
      value: Math.round(completionRate),
      trend: completionRate > 70 ? 'up' : completionRate > 50 ? 'stable' : 'down',
      revenueCorrelation,
      recommendation: completionRate < 70
        ? 'Increase completion rate to 80%+ for better revenue outcomes'
        : 'Excellent completion rate! Your focus is paying off.',
    };
  }

  private analyzeContentOutput(): PerformanceInsight {
    const { content } = this.dataSources;
    
    const publishedContent = content.filter(c => c.published);
    const contentThisMonth = publishedContent.length; // Simplified - should filter by date

    // More content = more opportunities (but quality matters)
    const revenueCorrelation = contentThisMonth > 10 ? 0.65 : contentThisMonth > 5 ? 0.4 : 0.15;

    return {
      metric: 'Content Output',
      value: contentThisMonth,
      trend: contentThisMonth > 8 ? 'up' : 'stable',
      revenueCorrelation,
      recommendation: contentThisMonth < 8
        ? 'Publish 8-12 pieces of content per month to maximize reach and revenue'
        : 'Strong content output! Focus on quality and engagement.',
    };
  }

  private analyzeAutomationImpact(): PerformanceInsight {
    const { automation } = this.dataSources;
    
    const hoursSaved = automation.timeSaved / 60;
    
    // Time saved = time for revenue-generating activities
    // Assuming R 500/hour value of saved time
    const potentialRevenue = hoursSaved * 500;
    const revenueCorrelation = automation.activeAutomations > 3 ? 0.7 : 0.4;

    return {
      metric: 'Automation Efficiency',
      value: Math.round(hoursSaved),
      trend: 'up',
      revenueCorrelation,
      recommendation: automation.activeAutomations < 3
        ? `Automation saved ${Math.round(hoursSaved)}h. Add more automations to free up time for growth.`
        : `${Math.round(hoursSaved)} hours saved! Use this time for high-value activities.`,
    };
  }

  // ============================================
  // FEEDBACK LOOP CALCULATIONS
  // ============================================

  private calculateHotLeadLoop(): MoneyFeedbackLoop | null {
    const { leads } = this.dataSources;
    
    const hotLeads = leads.filter(l => l.status === 'hot');
    if (hotLeads.length === 0) return null;

    // Industry average: 40% of hot leads convert
    const expectedConversions = Math.round(hotLeads.length * 0.4);
    const avgDealSize = 5000; // TODO: Calculate from actual data
    const expectedRevenue = expectedConversions * avgDealSize;

    return {
      userId: 'current-user', // TODO: Get from auth
      action: `Follow up with ${hotLeads.length} hot leads`,
      result: `${expectedConversions} expected sales`,
      revenueImpact: expectedRevenue,
      formula: `${hotLeads.length} hot leads → ~${expectedConversions} conversions (40%) → R ${expectedRevenue.toLocaleString()}`,
      confidence: 75,
    };
  }

  private calculateContentLoop(): MoneyFeedbackLoop | null {
    const { content } = this.dataSources;
    
    const highEngagement = content.filter(c => c.engagement && c.engagement > 5000);
    if (highEngagement.length === 0) return null;

    // High engagement content can lead to brand deals
    const potentialDeals = Math.min(highEngagement.length, 2); // Conservative estimate
    const avgDealValue = 8000; // TODO: Calculate from actual brand deal history
    const expectedRevenue = potentialDeals * avgDealValue;

    return {
      userId: 'current-user',
      action: `Leverage ${highEngagement.length} high-performing posts`,
      result: `${potentialDeals} potential brand deals`,
      revenueImpact: expectedRevenue,
      formula: `${highEngagement.length} viral posts → reach out to brands → ${potentialDeals} deals × R ${avgDealValue.toLocaleString()} = R ${expectedRevenue.toLocaleString()}`,
      confidence: 60,
    };
  }

  private calculateTaskLoop(): MoneyFeedbackLoop | null {
    const { tasks } = this.dataSources;
    
    const revenueLinkedTasks = tasks.filter(t => t.linkedRevenue && t.status !== 'done');
    if (revenueLinkedTasks.length === 0) return null;

    const totalRevenue = revenueLinkedTasks.reduce((sum, t) => sum + (t.linkedRevenue || 0), 0);

    return {
      userId: 'current-user',
      action: `Complete ${revenueLinkedTasks.length} revenue-linked tasks`,
      result: 'Revenue unlocked',
      revenueImpact: totalRevenue,
      formula: `${revenueLinkedTasks.length} tasks → project completion → R ${totalRevenue.toLocaleString()}`,
      confidence: 85,
    };
  }

  // ============================================
  // PREDICTIVE EARNINGS
  // ============================================

  /**
   * Predict earnings based on current activity level
   * "If you maintain this pace, you'll earn X this month"
   */
  public predictMonthlyEarnings(): {
    predicted: number;
    confidence: number;
    based: string;
  } | null {
    if (!this.permissions.canViewEarnings) return null;

    const { revenue, leads, content } = this.dataSources;
    
    // Simple prediction: current weekly revenue × 4
    const weeklyRevenue = revenue.weeklyRevenue;
    const predictedMonthly = weeklyRevenue * 4.33; // avg weeks per month

    // Adjust based on pipeline
    const pipelineMultiplier = revenue.pipelineValue > revenue.monthlyRevenue * 2 ? 1.2 : 1.0;
    const adjusted = predictedMonthly * pipelineMultiplier;

    return {
      predicted: Math.round(adjusted),
      confidence: 65,
      based: 'Current weekly revenue pace and pipeline value',
    };
  }

  /**
   * Calculate the value of an hour of work
   * Used for wellness guardrails and task prioritization
   */
  public calculateHourlyValue(): number {
    const { revenue } = this.dataSources;
    
    // Simple calculation: monthly revenue / average working hours
    const avgWorkingHoursPerMonth = 160; // 40 hours × 4 weeks
    const hourlyValue = revenue.monthlyRevenue / avgWorkingHoursPerMonth;
    
    return Math.round(hourlyValue);
  }
}

/**
 * Factory to create performance insights engine
 */
export function createPerformanceInsightsEngine(
  dataSources: AutopilotDataSources,
  permissions: UserPermissions
): PerformanceInsightsEngine {
  return new PerformanceInsightsEngine(dataSources, permissions);
}

/**
 * Format currency (ZAR)
 */
export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA')}`;
}

/**
 * Format percentage with trend indicator
 */
export function formatTrend(value: number, trend: 'up' | 'down' | 'stable'): string {
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return `${arrow} ${value}%`;
}
