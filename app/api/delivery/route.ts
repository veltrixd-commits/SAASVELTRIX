export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/server/prisma';
import { verifyToken } from '@/lib/server-auth';

/**
 * GET /api/delivery
 * Fetches all orders/deals that need fulfillment
 * Shows both pending and fulfilled orders
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

    const prisma = await getPrisma();

    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const status = searchParams.get('status'); // pending, fulfilled, cancelled
    const search = searchParams.get('search');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause for deals (orders)
    const where: any = {
      lead: {
        tenantId: payload.tenantId,
      },
    };

    // Filter by fulfillment status
    if (status === 'pending') {
      where.metadata = {
        path: ['fulfillmentStatus'],
        equals: 'pending',
      };
    } else if (status === 'fulfilled') {
      where.metadata = {
        path: ['fulfillmentStatus'],
        equals: 'fulfilled',
      };
    } else if (status === 'cancelled') {
      where.metadata = {
        path: ['fulfillmentStatus'],
        equals: 'cancelled',
      };
    }


    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { lead: { fullName: { contains: search, mode: 'insensitive' } } },
        { lead: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Fetch deals with related data
    const [orders, totalCount] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          stage: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          pipeline: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    // Calculate fulfillment metrics
    const pendingOrders = await prisma.deal.count({
      where: {
        lead: {
          tenantId: payload.tenantId,
        },
        metadata: {
          path: ['fulfillmentStatus'],
          equals: 'pending',
        },
      },
    });

    const fulfilledOrders = await prisma.deal.count({
      where: {
        lead: {
          tenantId: payload.tenantId,
        },
        metadata: {
          path: ['fulfillmentStatus'],
          equals: 'fulfilled',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order) => {
          const metadata = (order.metadata as Record<string, any> | null) || {};
          return {
            id: order.id,
            title: order.title,
            value: order.value,
            currency: order.currency,
            stage: order.stage,
            pipeline: order.pipeline,
            lead: order.lead,
            fulfillmentStatus: metadata.fulfillmentStatus || 'pending',
            fulfillmentDate: metadata.fulfillmentDate || null,
            trackingNumber: metadata.trackingNumber || null,
            deliveryNotes: metadata.deliveryNotes || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            expectedDelivery: order.expectedCloseDate,
          };
        }),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          pending: pendingOrders,
          fulfilled: fulfilledOrders,
          total: pendingOrders + fulfilledOrders,
          fulfillmentRate: fulfilledOrders / (pendingOrders + fulfilledOrders) * 100 || 0,
        },
      },
    });
  } catch (error) {
    console.error('Delivery center fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/delivery/[id]
 * Update order fulfillment status
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
    const { orderId, fulfillmentStatus, trackingNumber, deliveryNotes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // Get current deal
    const prisma = await getPrisma();

    const deal = await prisma.deal.findFirst({
      where: {
        id: orderId,
        lead: {
          tenantId: payload.tenantId,
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update deal metadata with fulfillment info
    const updatedDeal = await prisma.deal.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...((deal.metadata as any) || {}),
          fulfillmentStatus: fulfillmentStatus || 'pending',
          fulfillmentDate: fulfillmentStatus === 'fulfilled' ? new Date() : null,
          trackingNumber: trackingNumber || null,
          deliveryNotes: deliveryNotes || null,
          updatedBy: payload.userId,
        },
      },
      include: {
        lead: true,
        stage: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        title: 'Delivery status update',
        leadId: updatedDeal.leadId,
        type: 'STATUS_CHANGE',
        description: `Order fulfillment status updated to: ${fulfillmentStatus}`,
        metadata: {
          orderId,
          fulfillmentStatus,
          trackingNumber,
        },
        userId: payload.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: 'Order fulfillment updated successfully',
    });
  } catch (error) {
    console.error('Delivery update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
