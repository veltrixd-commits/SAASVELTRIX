// Smart Automation Engine - Core
// Event-based, time-based, and behavior-based automation execution

import { AutomationTrigger, AutomationActionType, LeadSource } from '@prisma/client'
import { getPrisma } from '../server/prisma'
import { sendUnifiedMessage } from '../messaging/unified-inbox'
import { classifyLead } from '../ai/classifier'

interface AutomationContext {
  leadId: string
  tenantId: string
  trigger: AutomationTrigger
  triggerData?: any
}

export class AutomationEngine {
  // Execute automations for a given trigger
  async executeTrigger(context: AutomationContext) {
    const { leadId, tenantId, trigger, triggerData } = context
    const prisma = await getPrisma()

    // Find applicable automations
    const automations = await prisma.automation.findMany({
      where: {
        tenantId,
        trigger,
        active: true,
      },
      include: {
        actions: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { priority: 'desc' },
    })

    // Get lead data
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        platformAccounts: true,
      },
    })

    if (!lead) {
      console.error('Lead not found:', leadId)
      return
    }

    // Execute each automation
    for (const automation of automations) {
      // Check if automation filters match
      const matches = await this.matchesFilters(automation.filters as any, lead)
      if (!matches) continue

      // Execute automation
      await this.executeAutomation(automation.id, lead, triggerData)
    }
  }

  // Execute a single automation
  async executeAutomation(automationId: string, lead: any, triggerData?: any) {
    const prisma = await getPrisma()
    // Create automation run
    const run = await prisma.automationRun.create({
      data: {
        automationId,
        leadId: lead.id,
        status: 'running',
        triggeredBy: JSON.stringify(triggerData),
        steps: [],
      },
    })

    try {
      // Get automation with actions
      const automation = await prisma.automation.findUnique({
        where: { id: automationId },
        include: {
          actions: {
            orderBy: { position: 'asc' },
          },
        },
      })

      if (!automation) throw new Error('Automation not found')

      const steps: any[] = []

      // Execute each action
      for (const action of automation.actions) {
        const stepResult = await this.executeAction(action, lead, automation.tenantId)
        steps.push({
          actionId: action.id,
          type: action.type,
          result: stepResult,
          timestamp: new Date().toISOString(),
        })

        // If action has wait, pause execution
        if (action.type === AutomationActionType.WAIT) {
          // In production, this would schedule the next action
          // For now, we log it
          console.log('WAIT action:', action.config)
        }
      }

      // Mark as completed
      await prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          steps: steps,
        },
      })

      // Update automation stats
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          runCount: { increment: 1 },
          successCount: { increment: 1 },
        },
      })

    } catch (error: any) {
      console.error('Automation execution error:', error)

      // Mark as failed
      await prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message,
        },
      })

      // Update automation stats
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          runCount: { increment: 1 },
          failCount: { increment: 1 },
        },
      })
    }
  }

  // Execute a single action
  private async executeAction(action: any, lead: any, tenantId: string) {
    const config = action.config as any

    switch (action.type) {
      case AutomationActionType.SEND_MESSAGE:
        return await this.actionSendMessage(lead, config)

      case AutomationActionType.SEND_EMAIL:
        return await this.actionSendEmail(lead, config)

      case AutomationActionType.ADD_TAG:
        return await this.actionAddTag(lead.id, config.tag)

      case AutomationActionType.REMOVE_TAG:
        return await this.actionRemoveTag(lead.id, config.tag)

      case AutomationActionType.CHANGE_STAGE:
        return await this.actionChangeStage(lead.id, config.stageId)

      case AutomationActionType.ASSIGN_USER:
        return await this.actionAssignUser(lead.id, config.userId)

      case AutomationActionType.UPDATE_FIELD:
        return await this.actionUpdateField(lead.id, config.field, config.value)

      case AutomationActionType.AI_CLASSIFY:
        return await this.actionAIClassify(lead.id, tenantId)

      case AutomationActionType.NOTIFY_OWNER:
        return await this.actionNotifyOwner(lead, tenantId, config)

      case AutomationActionType.CONDITIONAL:
        return await this.actionConditional(action, lead, tenantId)

      default:
        console.log('Unknown action type:', action.type)
        return { success: false, error: 'Unknown action type' }
    }
  }

  // Action: Send message
  private async actionSendMessage(lead: any, config: any) {
    const platform = config.platform || lead.primarySource
    const content = this.replaceVariables(config.content || config.template, lead)

    return await sendUnifiedMessage({
      leadId: lead.id,
      platform: platform as LeadSource,
      content,
      mediaUrl: config.mediaUrl,
    })
  }

  // Action: Send email
  private async actionSendEmail(lead: any, config: any) {
    // Email sending logic here
    // Using nodemailer or similar
    console.log('Sending email to:', lead.email, config)
    return { success: true }
  }

  // Action: Add tag
  private async actionAddTag(leadId: string, tag: string) {
    const prisma = await getPrisma()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return { success: false }

    const tags = new Set(lead.tags)
    tags.add(tag)

    await prisma.lead.update({
      where: { id: leadId },
      data: { tags: Array.from(tags) },
    })

    await prisma.activity.create({
      data: {
        type: 'FIELD_UPDATE',
        title: 'Tag Added',
        description: `Added tag: ${tag}`,
        leadId,
      },
    })

    return { success: true, tag }
  }

  // Action: Remove tag
  private async actionRemoveTag(leadId: string, tag: string) {
    const prisma = await getPrisma()
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return { success: false }

    const tags = new Set(lead.tags)
    tags.delete(tag)

    await prisma.lead.update({
      where: { id: leadId },
      data: { tags: Array.from(tags) },
    })

    return { success: true, tag }
  }

  // Action: Change pipeline stage
  private async actionChangeStage(leadId: string, stageId: string) {
    const prisma = await getPrisma()
    const stage = await prisma.pipelineStage.findUnique({ where: { id: stageId } })
    if (!stage) return { success: false, error: 'Stage not found' }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        stageId,
        pipelineId: stage.pipelineId,
      },
    })

    await prisma.activity.create({
      data: {
        type: 'STAGE_CHANGE',
        title: 'Stage Changed',
        description: `Moved to ${stage.name}`,
        leadId,
      },
    })

    return { success: true, stage: stage.name }
  }

  // Action: Assign user
  private async actionAssignUser(leadId: string, userId: string) {
    const prisma = await getPrisma()
    await prisma.lead.update({
      where: { id: leadId },
      data: { assignedToId: userId },
    })

    await prisma.activity.create({
      data: {
        type: 'FIELD_UPDATE',
        title: 'Lead Assigned',
        description: `Lead assigned to user`,
        leadId,
        userId,
      },
    })

    return { success: true, userId }
  }

  // Action: Update field
  private async actionUpdateField(leadId: string, field: string, value: any) {
    const prisma = await getPrisma()
    await prisma.lead.update({
      where: { id: leadId },
      data: { [field]: value },
    })

    return { success: true, field, value }
  }

  // Action: AI Classify lead
  private async actionAIClassify(leadId: string, tenantId: string) {
    const result = await classifyLead(leadId)
    const prisma = await getPrisma()
    
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        intent: result.intent,
        urgency: result.urgency,
        score: result.score,
        qualification: result.qualification,
      },
    })

    return { success: true, classification: result }
  }

  // Action: Notify owner
  private async actionNotifyOwner(lead: any, tenantId: string, config: any) {
    // Find owner
    const prisma = await getPrisma()
    const owner = await prisma.user.findFirst({
      where: {
        tenantId,
        role: { in: ['BUSINESS_OWNER', 'AGENCY_OWNER'] },
      },
    })

    if (!owner) return { success: false, error: 'No owner found' }

    const message = this.replaceVariables(
      config.message || 'New qualified lead: {{lead.name}}',
      lead
    )

    await prisma.notification.create({
      data: {
        type: 'LEAD_QUALIFIED',
        title: 'Qualified Lead',
        message,
        userId: owner.id,
        entityType: 'lead',
        entityId: lead.id,
      },
    })

    return { success: true, notified: owner.id }
  }

  // Action: Conditional
  private async actionConditional(action: any, lead: any, tenantId: string) {
    const condition = action.condition as any
    const matches = await this.evaluateCondition(condition, lead)

    const actionsToExecute = matches ? condition.then : condition.else

    if (!actionsToExecute) return { success: true, matched: matches }

    // Execute nested actions
    for (const nestedAction of actionsToExecute) {
      await this.executeAction(nestedAction, lead, tenantId)
    }

    return { success: true, matched: matches }
  }

  // Check if automation filters match lead
  private async matchesFilters(filters: any, lead: any): Promise<boolean> {
    if (!filters) return true

    // Check source filter
    if (filters.source && !lead.sources.includes(filters.source)) {
      return false
    }

    // Check status filter
    if (filters.status && lead.status !== filters.status) {
      return false
    }

    // Check tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some((tag: string) => lead.tags.includes(tag))
      if (!hasTag) return false
    }

    return true
  }

  // Evaluate conditional expression
  private async evaluateCondition(condition: string | any, lead: any): Promise<boolean> {
    if (typeof condition === 'string') {
      // Simple string condition like "intent == 'pricing'"
      return this.evaluateStringCondition(condition, lead)
    }

    // Object-based condition
    return true // Implement complex evaluation
  }

  private evaluateStringCondition(condition: string, lead: any): boolean {
    // Replace variables
    const replaced = this.replaceVariables(condition, lead)
    
    // Simple eval (in production, use a safe expression evaluator)
    try {
      return eval(replaced) as boolean
    } catch {
      return false
    }
  }

  // Replace template variables
  private replaceVariables(template: string, lead: any): string {
    return template
      .replace(/\{\{lead\.name\}\}/g, lead.fullName || '')
      .replace(/\{\{lead\.email\}\}/g, lead.email || '')
      .replace(/\{\{lead\.phone\}\}/g, lead.phone || '')
      .replace(/\{\{lead\.score\}\}/g, lead.score?.toString() || '0')
      .replace(/\{\{lead\.status\}\}/g, lead.status || '')
  }
}

// Singleton instance
export const automationEngine = new AutomationEngine()

// Trigger helpers
export async function triggerLeadCreated(leadId: string, tenantId: string) {
  await automationEngine.executeTrigger({
    leadId,
    tenantId,
    trigger: AutomationTrigger.LEAD_CREATED,
  })
}

export async function triggerMessageReceived(leadId: string, tenantId: string, messageData: any) {
  await automationEngine.executeTrigger({
    leadId,
    tenantId,
    trigger: AutomationTrigger.MESSAGE_RECEIVED,
    triggerData: messageData,
  })
}

export async function triggerStageChanged(leadId: string, tenantId: string, stageData: any) {
  await automationEngine.executeTrigger({
    leadId,
    tenantId,
    trigger: AutomationTrigger.STAGE_CHANGED,
    triggerData: stageData,
  })
}
