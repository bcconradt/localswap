import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { getOrCreateSettings } from '@/lib/notifications'
import { updateNotificationSettingsSchema } from '@/lib/validations'

// GET /api/notifications/settings - Get notification preferences
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getOrCreateSettings(user.id)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get notification settings error:', error)
    return NextResponse.json({ error: 'Failed to get notification settings' }, { status: 500 })
  }
}

// PATCH /api/notifications/settings - Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateNotificationSettingsSchema.parse(body)

    // Ensure settings exist first
    await getOrCreateSettings(user.id)

    // Update settings
    const settings = await prisma.notificationSettings.update({
      where: { userId: user.id },
      data,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Update notification settings error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
  }
}
