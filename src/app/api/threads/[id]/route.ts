import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/threads/[id] - Get thread with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: {
        participants: {
          include: { profile: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              include: { profile: true },
            },
          },
        },
        offer: {
          include: {
            listing: {
              include: {
                photos: { take: 1, orderBy: { position: 'asc' } },
              },
            },
            items: {
              include: {
                listing: {
                  include: {
                    photos: { take: 1, orderBy: { position: 'asc' } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check if user is participant
    const isParticipant = thread.participants.some(p => p.id === user.id)
    if (!isParticipant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        threadId: id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    })

    // Reset unread count for this user
    const unreadCounts = (thread.unreadCounts as Record<string, number>) || {}
    unreadCounts[user.id] = 0

    await prisma.chatThread.update({
      where: { id },
      data: { unreadCounts },
    })

    return NextResponse.json({
      id: thread.id,
      participants: thread.participants.map(p => ({
        id: p.id,
        displayName: p.profile?.displayName,
        avatarUrl: p.profile?.avatarUrl,
      })),
      messages: thread.messages.map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        metadata: m.metadata,
        sender: {
          id: m.sender.id,
          displayName: m.sender.profile?.displayName,
          avatarUrl: m.sender.profile?.avatarUrl,
        },
        isOwn: m.senderId === user.id,
        createdAt: m.createdAt,
        readAt: m.readAt,
      })),
      offer: thread.offer,
      lastMessageAt: thread.lastMessageAt,
    })
  } catch (error) {
    console.error('Get thread error:', error)
    return NextResponse.json({ error: 'Failed to get thread' }, { status: 500 })
  }
}
