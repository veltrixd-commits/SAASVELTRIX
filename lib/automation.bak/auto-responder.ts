import { getPrisma } from '@/lib/server/prisma';
import { sendUnifiedMessage } from '@/lib/messaging/unified-inbox';
import { detectIntent, analyzeSentiment } from '@/lib/ai/classifier';

/**
 * Auto-Responder System
 * Automatically responds to all comments and DMs from all platforms
 * with intelligent, context-aware messages
 */

export interface AutoResponderConfig {
  enabled: boolean;
  platforms: ('TIKTOK' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN')[];
  responseDelay?: number; // milliseconds to wait before responding (appears more human)
  businessHoursOnly?: boolean;
  blacklistedKeywords?: string[]; // Don't auto-respond to these
  customResponses?: {
    [key: string]: string; // intent -> response template
  };
}

export class AutoResponder {
  private config: AutoResponderConfig;
  private tenantId: string;

  constructor(tenantId: string, config: AutoResponderConfig) {
    this.tenantId = tenantId;
    this.config = config;
  }

  /**
   * Process incoming message and auto-respond if appropriate
   */
  async processMessage(messageId: string): Promise<boolean> {
    try {
      const prisma = await getPrisma();

      // Fetch message with context
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: {
              lead: true,
              platformAccount: true,
            },
          },
        },
      });

      if (!message || message.direction !== 'INBOUND') {
        return false;
      }

      // Check if auto-response is enabled for this platform
      if (!this.config.enabled || !this.config.platforms.includes(message.conversation.platform)) {
        return false;
      }

      // Check business hours if required
      if (this.config.businessHoursOnly && !this.isBusinessHours()) {
        return false;
      }

      // Check for blacklisted keywords
      if (this.containsBlacklistedKeyword(message.content)) {
        return false;
      }

      // Check if we already responded recently (avoid spam)
      const recentResponse = await prisma.message.findFirst({
        where: {
          conversationId: message.conversationId,
          direction: 'OUTBOUND',
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });

      if (recentResponse) {
        console.log('Already responded recently, skipping auto-response');
        return false;
      }

      // Analyze message intent
      const intent = await detectIntent(message.content);
      const sentiment = await analyzeSentiment(message.content);

      // Generate appropriate response
      const response = await this.generateResponse(
        message.content,
        intent,
        sentiment,
        message.conversation.lead
      );

      // Add human-like delay
      if (this.config.responseDelay) {
        await this.sleep(this.config.responseDelay);
      }

      // Send response
      await sendUnifiedMessage({
        tenantId: this.tenantId,
        platform: message.conversation.platform,
        recipientId: message.conversation.platformAccount.platformUserId,
        content: response,
        conversationId: message.conversationId,
        metadata: {
          autoResponse: true,
          triggeredBy: messageId,
          intent,
          sentiment,
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          tenantId: this.tenantId,
          leadId: message.conversation.lead.id,
          type: 'AUTO_RESPONSE_SENT',
          description: `Auto-responded to ${message.conversation.platform} message`,
          metadata: {
            messageId,
            intent,
            sentiment,
            platform: message.conversation.platform,
          },
        },
      });

      console.log(`Auto-response sent for message ${messageId}`);
      return true;
    } catch (error) {
      console.error('Auto-responder error:', error);
      return false;
    }
  }

  /**
   * Generate contextual response based on message analysis
   */
  private async generateResponse(
    messageContent: string,
    intent: string,
    sentiment: string,
    lead: any
  ): Promise<string> {
    const leadName = lead.name || 'there';

    // Check for custom response templates
    if (this.config.customResponses && this.config.customResponses[intent]) {
      return this.replaceVariables(this.config.customResponses[intent], lead);
    }

    // Default intelligent responses based on intent
    switch (intent.toLowerCase()) {
      case 'pricing':
      case 'cost':
      case 'price':
        return `Hi ${leadName}! 👋 Thanks for your interest in our pricing. I'll get you detailed pricing information right away. Can you let me know which service you're most interested in?`;

      case 'question':
      case 'inquiry':
        return `Hi ${leadName}! 👋 Thanks for reaching out! I've received your message and I'll get back to you with a detailed answer very shortly. Anything urgent I should prioritize?`;

      case 'appointment':
      case 'booking':
      case 'schedule':
        return `Hi ${leadName}! 👋 I'd love to schedule a time to chat with you. Let me check available slots and I'll send you some options shortly. What days work best for you?`;

      case 'complaint':
      case 'issue':
      case 'problem':
        return `Hi ${leadName}, I'm really sorry to hear you're experiencing an issue. Your concern is important to us and I'm going to personally look into this right away. Can you provide a few more details?`;

      case 'support':
      case 'help':
        return `Hi ${leadName}! 👋 I'm here to help! I've received your message and I'll get you the support you need right away. What can I assist you with?`;

      case 'greeting':
      case 'hello':
        return `Hi ${leadName}! 👋 Thanks for reaching out! How can I help you today?`;

      case 'thanks':
      case 'thank you':
        return `You're very welcome, ${leadName}! 😊 Let me know if there's anything else I can help with!`;

      default:
        // Generic response with positive sentiment
        if (sentiment === 'positive') {
          return `Hi ${leadName}! 👋 Thanks for your message! I'll get back to you shortly with the information you need. Anything specific I should focus on?`;
        } else if (sentiment === 'negative') {
          return `Hi ${leadName}, I've received your message and I want to make sure we address your concerns properly. Let me look into this and get back to you very soon.`;
        } else {
          return `Hi ${leadName}! 👋 Thanks for reaching out! I've received your message and I'll respond with details shortly. Is there anything urgent I should know about?`;
        }
    }
  }

  /**
   * Replace variables in template with actual lead data
   */
  private replaceVariables(template: string, lead: any): string {
    return template
      .replace(/\{name\}/g, lead.name || 'there')
      .replace(/\{email\}/g, lead.email || '')
      .replace(/\{phone\}/g, lead.phone || '')
      .replace(/\{firstName\}/g, lead.name?.split(' ')[0] || 'there');
  }

  /**
   * Check if current time is within business hours
   */
  private isBusinessHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Monday-Friday, 9 AM - 6 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  }

  /**
   * Check if message contains blacklisted keywords
   */
  private containsBlacklistedKeyword(content: string): boolean {
    if (!this.config.blacklistedKeywords) return false;

    const lowerContent = content.toLowerCase();
    return this.config.blacklistedKeywords.some((keyword) =>
      lowerContent.includes(keyword.toLowerCase())
    );
  }

  /**
   * Sleep helper for human-like delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Initialize auto-responder for a tenant
 */
export async function initializeAutoResponder(tenantId: string): Promise<AutoResponder | null> {
  try {
    const prisma = await getPrisma();

    // Fetch tenant's auto-responder configuration
    const integration = await prisma.integration.findFirst({
      where: {
        tenantId,
        provider: 'AUTO_RESPONDER',
        active: true,
      },
    });

    if (!integration) {
      return null;
    }

    const config = integration.config as any as AutoResponderConfig;
    return new AutoResponder(tenantId, config);
  } catch (error) {
    console.error('Failed to initialize auto-responder:', error);
    return null;
  }
}

/**
 * Trigger auto-response for a message
 * Called from webhook handlers automatically
 */
export async function triggerAutoResponse(tenantId: string, messageId: string): Promise<void> {
  try {
    const autoResponder = await initializeAutoResponder(tenantId);
    if (!autoResponder) {
      console.log('Auto-responder not enabled for tenant:', tenantId);
      return;
    }

    await autoResponder.processMessage(messageId);
  } catch (error) {
    console.error('Auto-response trigger error:', error);
  }
}
