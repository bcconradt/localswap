import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { sendMessageSchema } from '@/lib/validations'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = sendMessageSchema.parse(body)

    const thread = await prisma.chatThread.findUnique({
      where: { id },
      include: { participants: true },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Check if user is participant
    const isParticipant = thread.participants.some(p => p.id === user.id)
    if (!isParticipant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Rate limiting for new accounts
    const accountAge = Date.now() - new Date(user.createdAt).getTime()
    const isNewAccount = accountAge < 7 * 24 * 60 * 60 * 1000 // 7 days

    if (isNewAccount) {
      const todayMessages = await prisma.message.count({
        where: {
          senderId: user.id,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      })

      if (todayMessages >= 10) {
        return NextResponse.json(
          { error: 'Daily message limit reached for new accounts' },
          { status: 429 }
        )
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId: id,
        senderId: user.id,
        type: data.type,
        content: data.content,
        metadata: data.metadata as object | undefined,
      },
      include: {
        sender: {
          include: { profile: true },
        },
      },
    })

    // Update thread
    const otherParticipant = thread.participants.find(p => p.id !== user.id)
    const unreadCounts = (thread.unreadCounts as Record<string, number>) || {}
    if (otherParticipant) {
      unreadCounts[otherParticipant.id] = (unreadCounts[otherParticipant.id] || 0) + 1
    }

    await prisma.chatThread.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: data.content.slice(0, 100),
        unreadCounts,
      },
    })

    // TODO: Send push notification to other participant

    return NextResponse.json({
      id: message.id,
      type: message.type,
      content: message.content,
      metadata: message.metadata,
      sender: {
        id: message.sender.id,
        displayName: message.sender.profile?.displayName,
        avatarUrl: message.sender.profile?.avatarUrl,
      },
      isOwn: true,
      createdAt: message.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Send message error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
