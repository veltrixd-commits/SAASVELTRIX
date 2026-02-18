// lib/automation/auto-responder.ts

export type AutoResponderInput = {
  tenantId?: string;
  leadId?: string;
  channel: string;
  message: string;
  from?: string;
  metadata?: Record<string, unknown>;
};

export type AutoResponderResult = {
  shouldReply: boolean;
  replyText?: string;
  tags?: string[];
  confidence?: number; // 0..1
};

export async function autoResponder(
  input: AutoResponderInput
): Promise<AutoResponderResult> {
  const text = (input.message ?? "").trim();
  if (!text) return { shouldReply: false };

  const lower = text.toLowerCase();

  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost")) {
    return {
      shouldReply: true,
      replyText:
        "Thanks for reaching out. What product/service do you need, and where are you located?",
      tags: ["intent:pricing"],
      confidence: 0.7,
    };
  }

  return {
    shouldReply: true,
    replyText: "Thanks for your message — how can we help you today?",
    tags: ["intent:general"],
    confidence: 0.5,
  };
}
