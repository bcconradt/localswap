import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getNotifications, deleteNotifications } from '@/lib/notifications'
import { notificationListSchema, deleteNotificationsSchema } from '@/lib/validations'

// GET /api/notifications - List notifications (paginated)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const params = notificationListSchema.parse({
      limit: searchParams.get('limit'),
      cursor: searchParams.get('cursor'),
      unreadOnly: searchParams.get('unreadOnly'),
    })

    const result = await getNotifications(user.id, params)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get notifications error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 })
  }
}

// DELETE /api/notifications - Bulk delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds } = deleteNotificationsSchema.parse(body)

    const deletedCount = await deleteNotifications(notificationIds, user.id)

    return NextResponse.json({ deleted: deletedCount })
  } catch (error) {
    console.error('Delete notifications error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 })
  }
}
