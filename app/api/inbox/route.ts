import { NextRequest, NextResponse } from 'next/server';
import { LeadSource } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/server-auth';

/**
 * GET /api/inbox
 * Fetches all messages and comments from all platforms in one unified view
 * Supports filtering, pagination, and unread status
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const platform = searchParams.get('platform'); // tiktok, whatsapp, facebook, instagram, linkedin
    const status = searchParams.get('status'); // unread, read, replied
    const leadId = searchParams.get('leadId');
    const search = searchParams.get('search');
    const platformFilter = platform
      ? (platform.toUpperCase() as LeadSource)
      : undefined;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      conversation: {
        tenantId: payload.tenantId,
      },
    };

    if (platformFilter) {
      where.conversation = {
        ...where.conversation,
        platform: platformFilter,
      };
    }

    if (leadId) {
      where.conversation = {
        ...where.conversation,
        leadId,
      };
    }

    if (status === 'unread') {
      where.readAt = null;
    } else if (status === 'read') {
      where.readAt = { not: null };
    }

    if (search) {
      where.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { lead: { fullName: { contains: search, mode: 'insensitive' } } },
        { lead: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch messages with related data
    const [messages, totalCount] = await Promise.all([
      db.message.findMany({
        where,
        include: {
          conversation: {
            include: {
              lead: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                  status: true,
                  primarySource: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.message.count({ where }),
    ]);

    // Get unread counts by platform
    const unreadCounts = await db.message.groupBy({
      by: ['conversationId'],
      where: {
        conversation: {
          tenantId: payload.tenantId,
        },
        readAt: null,
        direction: 'INBOUND',
      },
      _count: true,
    });

    const last24HourMessages = await db.message.count({
      where: {
        conversation: {
          tenantId: payload.tenantId,
          platform: platformFilter,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          content: msg.content,
          direction: msg.direction,
          platform: msg.conversation.platform,
          status: msg.status,
          isRead: !!msg.readAt,
          createdAt: msg.createdAt,
          lead: msg.conversation.lead,
          conversationId: msg.conversationId,
          metadata: msg.metadata,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          totalUnread: unreadCounts.length,
          last24Hours: last24HourMessages,
        },
      },
    });
  } catch (error) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inbox' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inbox
 * Mark messages as read/unread
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { messageIds, action } = body; // action: 'read' or 'unread'

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'messageIds array is required' },
        { status: 400 }
      );
    }

    // Update messages
    await db.message.updateMany({
      where: {
        id: { in: messageIds },
        conversation: {
          tenantId: payload.tenantId,
        },
      },
      data: {
        readAt: action === 'read' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Messages marked as ${action}`,
    });
  } catch (error) {
    console.error('Inbox update error:', error);
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    );
  }
}
