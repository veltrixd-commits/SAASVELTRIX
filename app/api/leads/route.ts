export const dynamic = 'force-dynamic'

// Lead API Routes
// CRUD operations for leads

import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/server/prisma'
import { getUserFromToken } from '@/lib/server-auth'

// GET /api/leads - List all leads
export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const prisma = await getPrisma()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const assignedToId = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    }

    if (status) where.status = status
    if (source) where.primarySource = source
    if (assignedToId) where.assignedToId = assignedToId
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get leads
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          platformAccounts: true,
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          stage: true,
          _count: {
            select: {
              conversations: true,
              activities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })

  } catch (error: any) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()

    const prisma = await getPrisma()

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        primarySource: body.source || 'MANUAL',
        sources: [body.source || 'MANUAL'],
        tenantId: user.tenantId,
        company: body.company,
        position: body.position,
        tags: body.tags || [],
        customFields: body.customFields || {},
        assignedToId: body.assignedToId,
      },
      include: {
        platformAccounts: true,
        assignedTo: true,
      },
    })

    // Trigger automation
    const { triggerLeadCreated } = await import('@/lib/automation-engine/engine')
    await triggerLeadCreated(lead.id, user.tenantId)

    return NextResponse.json(lead, { status: 201 })

  } catch (error: any) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
