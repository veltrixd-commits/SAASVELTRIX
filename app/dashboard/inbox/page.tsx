'use client';

import { useState, useEffect } from 'react';
import { canCurrentUserUseAiAutomationReplies } from '@/lib/accessControl';
import { PlatformBadge } from '@/components/PlatformBadge';

interface Message {
  id: string;
  content: string;
  direction: 'INBOUND' | 'OUTBOUND';
  platform: string;
  contentType?: 'MESSAGE' | 'COMMENT' | 'REVIEW';
  status: string;
  isRead: boolean;
  source?: 'AUTOMATION_MESSAGE' | 'AUTOMATION_EMAIL' | 'LEAD_COMMENT' | 'PLATFORM_REVIEW' | 'INBOX';
  createdAt: string;
  lead: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  platformAccount: {
    username: string;
    displayName: string;
  };
  conversationId: string;
}

interface InboxStats {
  totalUnread: number;
  last24Hours: number;
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<InboxStats>({ totalUnread: 0, last24Hours: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openReplyIds, setOpenReplyIds] = useState<Record<string, boolean>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyIds, setSendingReplyIds] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [canUseAiReplies, setCanUseAiReplies] = useState<boolean>(false);

  const INBOX_READ_IDS_KEY = 'veltrix_inbox_read_ids';
  const INBOX_MANUAL_REPLIES_KEY = 'veltrix_inbox_manual_replies';
  const INBOX_MANUAL_MESSAGE_QUEUE_KEY = 'veltrix_inbox_manual_message_queue';
  const INBOX_MANUAL_EMAIL_QUEUE_KEY = 'veltrix_inbox_manual_email_queue';
  const INBOX_MANUAL_COMMENT_REPLY_QUEUE_KEY = 'veltrix_inbox_manual_comment_reply_queue';
  const INBOX_MANUAL_REVIEW_REPLY_QUEUE_KEY = 'veltrix_inbox_manual_review_reply_queue';

  const normalizePlatform = (value?: string) => {
    if (!value) return 'OTHER';
    const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (normalized === 'GOOGLE_MY_BUSINESS' || normalized === 'GMB') return 'GOOGLE_MY_BUSINESS';
    if (normalized === 'WHATSAPP') return 'WHATSAPP';
    if (normalized === 'FACEBOOK') return 'FACEBOOK';
    if (normalized === 'INSTAGRAM') return 'INSTAGRAM';
    if (normalized === 'TIKTOK') return 'TIKTOK';
    if (normalized === 'LINKEDIN') return 'LINKEDIN';
    if (normalized === 'EMAIL') return 'EMAIL';
    return normalized;
  };

  const quickFilters = [
    { id: 'all', label: 'All', platform: 'all', status: 'all', timeframe: 'all', search: '' },
    { id: 'unread', label: 'Unread', platform: 'all', status: 'unread', timeframe: 'all', search: '' },
    { id: 'today', label: 'Today', platform: 'all', status: 'all', timeframe: 'day', search: '' },
    { id: 'email', label: 'Email', platform: 'EMAIL', status: 'all', timeframe: 'all', search: '' },
    { id: 'comments', label: 'Comments', platform: 'all', status: 'all', timeframe: 'all', search: 'comment' },
    { id: 'reviews', label: 'Reviews', platform: 'all', status: 'all', timeframe: 'all', search: 'review' },
    { id: 'gmb', label: 'GMB', platform: 'GOOGLE_MY_BUSINESS', status: 'all', timeframe: 'all', search: '' },
    { id: 'automation', label: 'Automation', platform: 'all', status: 'all', timeframe: 'all', search: 'automation' },
  ] as const;

  const activeQuickFilter =
    quickFilters.find(
      (filter) =>
        filter.platform === selectedPlatform &&
        filter.status === selectedStatus &&
        filter.timeframe === timeframe &&
        filter.search.toLowerCase() === searchQuery.toLowerCase().trim()
    )?.id || null;

  useEffect(() => {
    fetchMessages();
  }, [selectedPlatform, selectedStatus, timeframe, searchQuery, page]);

  useEffect(() => {
    setCanUseAiReplies(canCurrentUserUseAiAutomationReplies());
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const appendToStorageArray = (key: string, item: Record<string, any>) => {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(parsed) ? [...parsed, item] : [item];
    localStorage.setItem(key, JSON.stringify(next));
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Demo data - replace with API call in production
      const demoMessages: Message[] = [
        {
          id: '1',
          content: 'Hi! I\'m interested in your social media marketing services. Do you have packages for small businesses?',
          direction: 'INBOUND',
          platform: 'TIKTOK',
          status: 'delivered',
          isRead: false,
          source: 'INBOX',
          createdAt: '2026-02-14T10:30:00Z',
          lead: {
            id: 'lead1',
            name: 'Emily Chen',
            email: 'emily.chen@email.com',
            avatar: ''
          },
          platformAccount: {
            username: '@emilychen',
            displayName: 'Emily Chen'
          },
          conversationId: 'conv1'
        },
        {
          id: '2',
          content: 'Your recent TikTok about automation was amazing! Can you help set this up for my business?',
          direction: 'INBOUND',
          platform: 'TIKTOK',
          status: 'delivered',
          isRead: false,
          source: 'INBOX',
          createdAt: '2026-02-14T09:15:00Z',
          lead: {
            id: 'lead2',
            name: 'David Martinez',
            email: 'david.martinez@email.com'
          },
          platformAccount: {
            username: '@davidm',
            displayName: 'David M'
          },
          conversationId: 'conv2'
        },
        {
          id: '3',
          content: 'Thanks for the quick response! When can we schedule a call to discuss the pricing?',
          direction: 'INBOUND',
          platform: 'WHATSAPP',
          status: 'delivered',
          isRead: true,
          source: 'INBOX',
          createdAt: '2026-02-14T08:45:00Z',
          lead: {
            id: 'lead3',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com'
          },
          platformAccount: {
            username: '+27215550101',
            displayName: 'Sarah Johnson'
          },
          conversationId: 'conv3'
        },
        {
          id: '4',
          content: 'I saw your ad on Facebook. Do you offer SEO services as well?',
          direction: 'INBOUND',
          platform: 'FACEBOOK',
          status: 'delivered',
          isRead: false,
          source: 'INBOX',
          createdAt: '2026-02-14T07:20:00Z',
          lead: {
            id: 'lead4',
            name: 'Michael Wong',
            email: 'michael.wong@email.com'
          },
          platformAccount: {
            username: 'michael.wong.77',
            displayName: 'Michael Wong'
          },
          conversationId: 'conv4'
        },
        {
          id: '5',
          content: 'Hi there! I\'d like to learn more about your content creation packages',
          direction: 'INBOUND',
          platform: 'INSTAGRAM',
          status: 'delivered',
          isRead: true,
          source: 'INBOX',
          createdAt: '2026-02-13T18:30:00Z',
          lead: {
            id: 'lead5',
            name: 'Jessica Taylor',
            email: 'jessica.taylor@email.com'
          },
          platformAccount: {
            username: '@jessicataylor',
            displayName: 'Jessica Taylor'
          },
          conversationId: 'conv5'
        },
        {
          id: '6',
          content: 'Looking for a digital marketing partner for our startup. Are you available for a consultation?',
          direction: 'INBOUND',
          platform: 'LINKEDIN',
          status: 'delivered',
          isRead: false,
          source: 'INBOX',
          createdAt: '2026-02-13T16:45:00Z',
          lead: {
            id: 'lead6',
            name: 'Alex Robinson',
            email: 'alex.robinson@email.com'
          },
          platformAccount: {
            username: 'alex-robinson',
            displayName: 'Alex Robinson'
          },
          conversationId: 'conv6'
        },
        {
          id: '7',
          content: 'Great post about lead generation! Can we chat about implementing this for my team?',
          direction: 'INBOUND',
          platform: 'TIKTOK',
          status: 'delivered',
          isRead: true,
          source: 'INBOX',
          createdAt: '2026-02-13T15:00:00Z',
          lead: {
            id: 'lead7',
            name: 'Rachel Green',
            email: 'rachel.green@email.com'
          },
          platformAccount: {
            username: '@rachelgreenbiz',
            displayName: 'Rachel Green'
          },
          conversationId: 'conv7'
        },
        {
          id: '8',
          content: 'Do you have case studies I can review before making a decision?',
          direction: 'INBOUND',
          platform: 'WHATSAPP',
          status: 'delivered',
          isRead: false,
          source: 'INBOX',
          createdAt: '2026-02-13T14:20:00Z',
          lead: {
            id: 'lead8',
            name: 'Tom Anderson',
            email: 'tom.anderson@email.com'
          },
          platformAccount: {
            username: '+27215550108',
            displayName: 'Tom Anderson'
          },
          conversationId: 'conv8'
        }
      ];

      const readIdsRaw = localStorage.getItem(INBOX_READ_IDS_KEY);
      const readIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];

      const automationQueueRaw = localStorage.getItem('veltrix_automation_message_queue');
      const automationQueue = automationQueueRaw ? JSON.parse(automationQueueRaw) : [];
      const automationMessages: Message[] = Array.isArray(automationQueue)
        ? automationQueue.map((item: any) => ({
            id: item.id,
            content: item.content || 'Automation action message',
            direction: 'OUTBOUND' as const,
            contentType: item.contentType || 'MESSAGE',
            platform: normalizePlatform(String(item.platform || 'AUTOMATION')),
            status: item.status || 'queued',
            isRead: readIds.includes(item.id),
            source: 'AUTOMATION_MESSAGE' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: `automation-${item.automationId || 'system'}`,
              name: item.automationName || 'Automation Bot',
              email: 'automation@veltrix.local',
              avatar: ''
            },
            platformAccount: {
              username: 'automation-bot',
              displayName: item.automationName || 'Automation Engine'
            },
            conversationId: `auto-${item.automationId || 'system'}`,
          }))
        : [];

      const automationEmailQueueRaw = localStorage.getItem('veltrix_automation_email_queue');
      const automationEmailQueue = automationEmailQueueRaw ? JSON.parse(automationEmailQueueRaw) : [];
      const automationEmailMessages: Message[] = Array.isArray(automationEmailQueue)
        ? automationEmailQueue.map((item: any) => ({
            id: item.id,
            content: item.body || item.subject || 'Automation email action',
            direction: 'OUTBOUND' as const,
            contentType: item.contentType || 'MESSAGE',
            platform: 'EMAIL',
            status: item.status || 'queued',
            isRead: readIds.includes(item.id),
            source: 'AUTOMATION_EMAIL' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: `automation-email-${item.automationId || 'system'}`,
              name: item.automationName || 'Automation Email Bot',
              email: item.to || 'automation@veltrix.local',
              avatar: ''
            },
            platformAccount: {
              username: 'automation-email-bot',
              displayName: item.subject || item.automationName || 'Automation Email Engine'
            },
            conversationId: `auto-email-${item.automationId || 'system'}`,
          }))
        : [];

      const automationCommentQueueRaw = localStorage.getItem('veltrix_automation_comment_reply_queue');
      const automationCommentQueue = automationCommentQueueRaw ? JSON.parse(automationCommentQueueRaw) : [];
      const automationCommentMessages: Message[] = Array.isArray(automationCommentQueue)
        ? automationCommentQueue.map((item: any) => ({
            id: item.id,
            content: item.content || 'Automation comment reply',
            direction: 'OUTBOUND' as const,
            contentType: 'COMMENT' as const,
            platform: normalizePlatform(String(item.platform || 'AUTOMATION')),
            status: item.status || 'queued',
            isRead: readIds.includes(item.id),
            source: 'AUTOMATION_MESSAGE' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: `comment-${item.automationId || 'system'}`,
              name: item.leadName || 'Comment Lead',
              email: item.leadEmail || 'comment@veltrix.local',
              avatar: ''
            },
            platformAccount: {
              username: 'automation-comment-bot',
              displayName: item.automationName || 'Automation Comment Engine'
            },
            conversationId: item.sourceConversationId || `auto-comment-${item.automationId || 'system'}`,
          }))
        : [];

      const automationReviewQueueRaw = localStorage.getItem('veltrix_automation_review_reply_queue');
      const automationReviewQueue = automationReviewQueueRaw ? JSON.parse(automationReviewQueueRaw) : [];
      const automationReviewMessages: Message[] = Array.isArray(automationReviewQueue)
        ? automationReviewQueue.map((item: any) => ({
            id: item.id,
            content: item.content || 'Automation review reply',
            direction: 'OUTBOUND' as const,
            contentType: 'REVIEW' as const,
            platform: normalizePlatform(String(item.platform || 'AUTOMATION')),
            status: item.status || 'queued',
            isRead: readIds.includes(item.id),
            source: 'AUTOMATION_MESSAGE' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: `review-${item.automationId || 'system'}`,
              name: item.leadName || 'Reviewer',
              email: item.leadEmail || 'review@veltrix.local',
              avatar: ''
            },
            platformAccount: {
              username: 'automation-review-bot',
              displayName: item.automationName || 'Automation Review Engine'
            },
            conversationId: item.sourceConversationId || `auto-review-${item.automationId || 'system'}`,
          }))
        : [];

      const manualRepliesRaw = localStorage.getItem(INBOX_MANUAL_REPLIES_KEY);
      const manualReplies = manualRepliesRaw ? JSON.parse(manualRepliesRaw) : [];
      const manualReplyMessages: Message[] = Array.isArray(manualReplies)
        ? manualReplies.map((item: any) => ({
            id: String(item.id),
            content: String(item.content || ''),
            direction: 'OUTBOUND' as const,
            contentType: item.contentType || 'MESSAGE',
            platform: normalizePlatform(String(item.platform || 'EMAIL')),
            status: String(item.status || 'sent'),
            isRead: true,
            source: 'INBOX' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: item.lead?.id || 'manual-reply-lead',
              name: item.lead?.name || 'Unknown Lead',
              email: item.lead?.email || 'unknown@lead.local',
              avatar: item.lead?.avatar || ''
            },
            platformAccount: {
              username: item.platformAccount?.username || 'you',
              displayName: item.platformAccount?.displayName || 'You'
            },
            conversationId: item.conversationId || `manual-${item.id}`,
          }))
        : [];

      const engagementInboxRaw = localStorage.getItem('veltrix_engagement_inbox');
      const engagementInbox = engagementInboxRaw ? JSON.parse(engagementInboxRaw) : [];
      const engagementMessages: Message[] = Array.isArray(engagementInbox)
        ? engagementInbox.map((item: any) => ({
            id: String(item.id || `eng-${Math.random().toString(36).slice(2, 8)}`),
            content: String(item.content || ''),
            direction: 'INBOUND' as const,
            contentType: String(item.type || 'MESSAGE').toUpperCase() as Message['contentType'],
            platform: normalizePlatform(String(item.platform || 'OTHER')),
            status: 'delivered',
            isRead: readIds.includes(String(item.id)),
            source: 'INBOX' as const,
            createdAt: item.createdAt || new Date().toISOString(),
            lead: {
              id: String(item.authorId || `eng-lead-${item.id || 'unknown'}`),
              name: String(item.authorName || 'Customer'),
              email: String(item.authorEmail || 'customer@unknown.local'),
              avatar: ''
            },
            platformAccount: {
              username: String(item.authorHandle || item.authorName || 'customer'),
              displayName: String(item.authorName || 'Customer')
            },
            conversationId: String(item.conversationId || `eng-conv-${item.id || Date.now()}`),
          }))
        : [];

      const leadsRaw = localStorage.getItem('veltrix_leads');
      const leads = leadsRaw ? JSON.parse(leadsRaw) : [];
      const leadCommentMessages: Message[] = Array.isArray(leads)
        ? leads.flatMap((lead: any) => {
            const comments = Array.isArray(lead.comments) ? lead.comments : [];
            return comments.map((comment: any) => ({
              id: `lead-comment-${lead.id}-${comment.id}`,
              content: comment.text || 'Lead comment',
              direction: comment.author === 'You' ? ('OUTBOUND' as const) : ('INBOUND' as const),
              contentType: 'COMMENT' as const,
              platform: normalizePlatform(lead.source),
              status: 'delivered',
              isRead: readIds.includes(`lead-comment-${lead.id}-${comment.id}`),
              source: 'LEAD_COMMENT' as const,
              createdAt: comment.timestamp ? new Date(comment.timestamp).toISOString() : new Date().toISOString(),
              lead: {
                id: String(lead.id),
                name: lead.name || 'Lead',
                email: lead.email || 'lead@unknown.local',
                avatar: ''
              },
              platformAccount: {
                username: lead.phone || lead.email || 'lead-user',
                displayName: comment.author || lead.name || 'Lead'
              },
              conversationId: `lead-thread-${lead.id}`,
            }));
          })
        : [];

      const platformReviewsRaw = localStorage.getItem('veltrix_platform_reviews');
      const platformReviews = platformReviewsRaw ? JSON.parse(platformReviewsRaw) : [];
      const reviewMessages: Message[] = Array.isArray(platformReviews)
        ? platformReviews.map((review: any) => ({
            id: `platform-review-${review.id || Math.random().toString(36).slice(2, 8)}`,
            content: `${review.content || review.text || 'Platform review'}${review.rating ? ` (⭐ ${review.rating}/5)` : ''}`,
            direction: review.author === 'You' ? ('OUTBOUND' as const) : ('INBOUND' as const),
            contentType: 'REVIEW' as const,
            platform: normalizePlatform(review.platform || 'GOOGLE_MY_BUSINESS'),
            status: review.status || 'delivered',
            isRead: readIds.includes(`platform-review-${review.id}`),
            source: 'PLATFORM_REVIEW' as const,
            createdAt: review.createdAt || new Date().toISOString(),
            lead: {
              id: review.leadId || `reviewer-${review.id || 'unknown'}`,
              name: review.leadName || review.author || 'Reviewer',
              email: review.email || 'reviewer@unknown.local',
              avatar: ''
            },
            platformAccount: {
              username: review.username || 'reviewer',
              displayName: review.author || review.leadName || 'Reviewer'
            },
            conversationId: review.conversationId || `review-thread-${review.platform || 'general'}`,
          }))
        : [];

      const hydratedDemoMessages = demoMessages.map((message) => ({
        ...message,
        isRead: readIds.includes(message.id) ? true : message.isRead,
      }));

      // Filter messages based on criteria
      let filteredMessages = [
        ...hydratedDemoMessages,
        ...engagementMessages,
        ...automationMessages,
        ...automationEmailMessages,
        ...automationCommentMessages,
        ...automationReviewMessages,
        ...manualReplyMessages,
        ...leadCommentMessages,
        ...reviewMessages,
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (selectedPlatform !== 'all') {
        filteredMessages = filteredMessages.filter(m => m.platform === selectedPlatform.toUpperCase());
      }

      if (timeframe !== 'all') {
        const now = new Date();
        const timeframeMs: Record<string, number> = {
          hour: 60 * 60 * 1000,
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000,
          year: 365 * 24 * 60 * 60 * 1000,
        };
        const duration = timeframeMs[timeframe];
        if (duration) {
          const cutoff = new Date(now.getTime() - duration);
          filteredMessages = filteredMessages.filter((m) => new Date(m.createdAt) >= cutoff);
        }
      }
      
      if (selectedStatus === 'unread') {
        filteredMessages = filteredMessages.filter(m => !m.isRead);
      } else if (selectedStatus === 'read') {
        filteredMessages = filteredMessages.filter(m => m.isRead);
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredMessages = filteredMessages.filter(m =>
          m.content.toLowerCase().includes(query) ||
          m.lead.name.toLowerCase().includes(query) ||
          m.lead.email.toLowerCase().includes(query) ||
          (m.contentType || 'MESSAGE').toLowerCase().includes(query) ||
          (m.source || 'INBOX').toLowerCase().includes(query)
        );
      }

      setMessages(filteredMessages);
      
      // Calculate stats
      const allMessages = [
        ...hydratedDemoMessages,
        ...engagementMessages,
        ...automationMessages,
        ...automationEmailMessages,
        ...automationCommentMessages,
        ...automationReviewMessages,
        ...manualReplyMessages,
        ...leadCommentMessages,
        ...reviewMessages,
      ];
      const totalUnread = allMessages.filter(m => !m.isRead).length;
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last24Hours = allMessages.filter(m => new Date(m.createdAt) > oneDayAgo).length;
      
      setStats({
        totalUnread,
        last24Hours
      });
      
      setTotalPages(1);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    try {
      const readIdsRaw = localStorage.getItem(INBOX_READ_IDS_KEY);
      const existingReadIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      const mergedReadIds = Array.from(new Set([...existingReadIds, ...messageIds]));
      localStorage.setItem(INBOX_READ_IDS_KEY, JSON.stringify(mergedReadIds));
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      TIKTOK: 'bg-black text-white',
      WHATSAPP: 'bg-green-500 text-white',
      FACEBOOK: 'bg-blue-600 text-white',
      INSTAGRAM: 'bg-pink-500 text-white',
      LINKEDIN: 'bg-blue-700 text-white',
      EMAIL: 'bg-slate-600 text-white',
      GOOGLE_MY_BUSINESS: 'bg-emerald-600 text-white',
    };
    return colors[platform] || 'bg-gray-500 text-white';
  };

  const applyQuickFilter = (filterId: (typeof quickFilters)[number]['id']) => {
    const filter = quickFilters.find((item) => item.id === filterId);
    if (!filter) return;

    setSelectedPlatform(filter.platform);
    setSelectedStatus(filter.status);
    setTimeframe(filter.timeframe);
    setSearchQuery(filter.search);
    setPage(1);
  };

  const handleSendReply = async (message: Message) => {
    if (!canUseAiReplies) {
      showToast('error', 'AI reply permission is blocked for your account.');
      return;
    }

    const draft = (replyDrafts[message.id] || '').trim();
    if (!draft) {
      showToast('error', 'Reply message cannot be empty.');
      return;
    }

    try {
      setSendingReplyIds((prev) => ({ ...prev, [message.id]: true }));

      const replyId = `manual-reply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = new Date().toISOString();

      const outgoingMessage = {
        id: replyId,
        content: draft,
        platform: message.platform,
        contentType: message.contentType || 'MESSAGE',
        status: 'sent',
        createdAt,
        lead: message.lead,
        platformAccount: {
          username: 'you',
          displayName: 'You'
        },
        conversationId: message.conversationId,
        inReplyTo: message.id,
      };

      appendToStorageArray(INBOX_MANUAL_REPLIES_KEY, outgoingMessage);

      const queuePayload = {
        id: replyId,
        platform: message.platform,
        content: draft,
        to: message.lead.email,
        leadId: message.lead.id,
        leadName: message.lead.name,
        conversationId: message.conversationId,
        createdAt,
        status: 'queued',
      };

      if (message.platform === 'EMAIL') {
        appendToStorageArray(INBOX_MANUAL_EMAIL_QUEUE_KEY, {
          ...queuePayload,
          contentType: message.contentType || 'MESSAGE',
          subject: `Reply to ${message.lead.name}`,
          body: draft,
        });
      } else {
        if (message.contentType === 'COMMENT') {
          appendToStorageArray(INBOX_MANUAL_COMMENT_REPLY_QUEUE_KEY, {
            ...queuePayload,
            contentType: 'COMMENT',
          });
        } else if (message.contentType === 'REVIEW') {
          appendToStorageArray(INBOX_MANUAL_REVIEW_REPLY_QUEUE_KEY, {
            ...queuePayload,
            contentType: 'REVIEW',
          });
        } else {
          appendToStorageArray(INBOX_MANUAL_MESSAGE_QUEUE_KEY, {
            ...queuePayload,
            contentType: 'MESSAGE',
          });
        }
      }

      const readIdsRaw = localStorage.getItem(INBOX_READ_IDS_KEY);
      const existingReadIds = readIdsRaw ? JSON.parse(readIdsRaw) : [];
      const mergedReadIds = Array.from(new Set([...existingReadIds, message.id]));
      localStorage.setItem(INBOX_READ_IDS_KEY, JSON.stringify(mergedReadIds));

      setReplyDrafts((prev) => ({ ...prev, [message.id]: '' }));
      setOpenReplyIds((prev) => ({ ...prev, [message.id]: false }));
      showToast('success', `Reply sent on ${message.platform}.`);
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
      showToast('error', 'Failed to send reply. Please try again.');
    } finally {
      setSendingReplyIds((prev) => ({ ...prev, [message.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-2 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">📥 Signal queue. No channel escapes.</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              TikTok DMs, WhatsApp voice notes, reviews—everything lands here so you clear the noise fast.
            </p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  canUseAiReplies
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {canUseAiReplies ? 'AI replies unlocked.' : 'AI replies blocked—ask admin.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.totalUnread}</div>
              <div className="text-xs text-gray-500">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.last24Hours}</div>
              <div className="text-xs text-gray-500">Last 24h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickFilters.map((filter) => {
            const isActive = activeQuickFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => applyQuickFilter(filter.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">All Platforms</option>
            <option value="TIKTOK">🎵 TikTok</option>
            <option value="WHATSAPP">💬 WhatsApp</option>
            <option value="FACEBOOK">👥 Facebook</option>
            <option value="INSTAGRAM">📷 Instagram</option>
            <option value="LINKEDIN">💼 LinkedIn</option>
            <option value="EMAIL">✉️ Email</option>
            <option value="GOOGLE_MY_BUSINESS">📍 Google My Business</option>
          </select>

          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">All Time</option>
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />

          <button
            onClick={fetchMessages}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            🔄 <span className="hidden sm:inline">Resync feed</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Pulling every DM, comment, and review…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-xl text-gray-500">📭 Inbox is clear.</p>
            <p className="text-sm text-gray-400 mt-2">
              Loosen the filters or wait for the next spike.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`bg-white rounded-lg border ${
                  message.isRead ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                } p-3 sm:p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Lead Avatar */}
                  <div className="flex-shrink-0">
                    {message.lead.avatar ? (
                      <img
                        src={message.lead.avatar}
                        alt={message.lead.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                        {message.lead.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {message.lead.name}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${getPlatformColor(
                          message.platform
                        )}`}
                      >
                        <PlatformBadge
                          platform={message.platform}
                          variant="icon"
                          size="xs"
                          iconClassName="!ring-0 shadow-none"
                        />
                        <span className="hidden sm:inline font-medium">{message.platform}</span>
                      </span>
                      {message.direction === 'OUTBOUND' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-green-100 text-green-800">
                          ↗️ <span className="hidden sm:inline">Sent</span>
                        </span>
                      )}
                      {message.contentType === 'COMMENT' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-amber-100 text-amber-800">
                          💬 <span className="hidden sm:inline">Comment</span>
                        </span>
                      )}
                      {message.contentType === 'REVIEW' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-yellow-100 text-yellow-800">
                          ⭐ <span className="hidden sm:inline">Review</span>
                        </span>
                      )}
                      {!message.isRead && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-blue-100 text-blue-800">
                          • Unread
                        </span>
                      )}
                      {message.source === 'AUTOMATION_MESSAGE' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-purple-100 text-purple-800">
                          ⚙️ <span className="hidden sm:inline">Automation Msg</span>
                        </span>
                      )}
                      {message.source === 'AUTOMATION_EMAIL' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-indigo-100 text-indigo-800">
                          ✉️ <span className="hidden sm:inline">Automation Email</span>
                        </span>
                      )}
                      {message.source === 'LEAD_COMMENT' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-orange-100 text-orange-800">
                          🧵 <span className="hidden sm:inline">Lead Comment</span>
                        </span>
                      )}
                      {message.source === 'PLATFORM_REVIEW' && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-lime-100 text-lime-800">
                          🌟 <span className="hidden sm:inline">Platform Review</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                      @{message.platformAccount.username} • {message.lead.email}
                    </p>

                    <p className="text-sm sm:text-base text-gray-900 dark:text-white mt-2">{message.content}</p>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500">
                      <span className="truncate">
                        🕒 {new Date(message.createdAt).toLocaleString()}
                      </span>
                      {!message.isRead && (
                        <button
                          onClick={() => markAsRead([message.id])}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      <a
                        href="/dashboard/leads"
                        className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        Open lead →
                      </a>
                      {message.direction === 'INBOUND' && (
                        <button
                          disabled={!canUseAiReplies}
                          onClick={() =>
                            setOpenReplyIds((prev) => ({
                              ...prev,
                              [message.id]: !prev[message.id],
                            }))
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {openReplyIds[message.id] ? 'Cancel reply' : 'Reply'}
                        </button>
                      )}
                    </div>

                    {message.direction === 'INBOUND' && openReplyIds[message.id] && (
                      <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <textarea
                          value={replyDrafts[message.id] || ''}
                          onChange={(e) =>
                            setReplyDrafts((prev) => ({
                              ...prev,
                              [message.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder={`Reply to ${message.lead.name} on ${message.platform}...`}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setOpenReplyIds((prev) => ({
                                ...prev,
                                [message.id]: false,
                              }))
                            }
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => handleSendReply(message)}
                            disabled={!canUseAiReplies || !!sendingReplyIds[message.id]}
                            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {!canUseAiReplies ? 'Permission blocked' : sendingReplyIds[message.id] ? 'Sending...' : 'Send reply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              ← <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="px-2 sm:px-4 py-2 text-xs sm:text-base text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <span className="hidden sm:inline">Next</span> →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
