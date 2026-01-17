import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { markManyAsRead, markAllAsRead } from '@/lib/notifications'
import { markReadSchema } from '@/lib/validations'

// POST /api/notifications/mark-read - Bulk mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // If markAll flag is present, mark all as read
    if (body.markAll === true) {
      const count = await markAllAsRead(user.id)
      return NextResponse.json({ markedRead: count })
    }

    // Otherwise, mark specific notifications
    const { notificationIds } = markReadSchema.parse(body)
    const count = await markManyAsRead(notificationIds, user.id)

    return NextResponse.json({ markedRead: count })
  } catch (error) {
    console.error('Mark notifications read error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}
