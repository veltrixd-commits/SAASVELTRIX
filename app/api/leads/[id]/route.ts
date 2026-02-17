export const dynamic = 'force-dynamic'

// Single Lead API Routes
// Get, Update, Delete individual lead

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromToken, canAccessTenant } from '@/lib/server-auth'

// For static export compatibility
export function generateStaticParams() {
  return []
}

// GET /api/leads/[id] - Get single lead with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: {
        platformAccounts: true,
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        stage: {
          include: {
            pipeline: true,
          },
        },
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 50,
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        appointments: {
          orderBy: { startTime: 'asc' },
        },
        deals: {
          include: {
            pipeline: true,
            stage: true,
          },
        },
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Check tenant access
    if (!canAccessTenant(user.tenantId, lead.tenantId, user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(lead)

  } catch (error: any) {
    console.error('Get lead error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/leads/[id] - Update lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if lead exists and user has access
    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    })

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!canAccessTenant(user.tenantId, existingLead.tenantId, user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Update lead
    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        status: body.status,
        company: body.company,
        position: body.position,
        tags: body.tags,
        customFields: body.customFields,
        assignedToId: body.assignedToId,
        stageId: body.stageId,
        pipelineId: body.pipelineId,
      },
      include: {
        platformAccounts: true,
        assignedTo: true,
        stage: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'FIELD_UPDATE',
        title: 'Lead Updated',
        description: `Lead information updated`,
        leadId: lead.id,
        userId: user.id,
      },
    })

    return NextResponse.json(lead)

  } catch (error: any) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if lead exists and user has access
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    if (!canAccessTenant(user.tenantId, lead.tenantId, user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete lead (cascade will handle related records)
    await prisma.lead.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete lead error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
