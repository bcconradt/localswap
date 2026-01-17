import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { blockUserSchema } from '@/lib/validations'

// GET /api/blocks - Get blocked users
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blocks = await prisma.block.findMany({
      where: { blockerId: user.id },
      include: {
        blocked: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      blocks: blocks.map(b => ({
        id: b.id,
        user: {
          id: b.blocked.id,
          displayName: b.blocked.profile?.displayName,
          avatarUrl: b.blocked.profile?.avatarUrl,
        },
        createdAt: b.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get blocks error:', error)
    return NextResponse.json({ error: 'Failed to get blocks' }, { status: 500 })
  }
}

// POST /api/blocks - Block user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { blockedId } = blockUserSchema.parse(body)

    // Can't block yourself
    if (blockedId === user.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      )
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId,
        },
      },
    })

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 400 }
      )
    }

    await prisma.block.create({
      data: {
        blockerId: user.id,
        blockedId,
      },
    })

    // Cancel any pending offers between these users
    await prisma.offer.updateMany({
      where: {
        OR: [
          { offererId: user.id, ownerId: blockedId },
          { offererId: blockedId, ownerId: user.id },
        ],
        status: { in: ['pending', 'countered', 'accepted'] },
      },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Block user error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to block user' }, { status: 500 })
  }
}
