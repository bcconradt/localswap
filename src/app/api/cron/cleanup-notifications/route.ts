import { NextRequest, NextResponse } from 'next/server'
import { deleteExpiredNotifications } from '@/lib/notifications'
import { prisma } from '@/lib/db'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET not set - allowing request in development')
    return process.env.NODE_ENV === 'development'
  }

  return authHeader === `Bearer ${cronSecret}`
}

// POST /api/cron/cleanup-notifications - Delete expired notifications (3 AM)
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete expired notifications
    const deletedNotifications = await deleteExpiredNotifications()

    // Also clean up old processed pending interest matches (older than 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const deletedMatches = await prisma.pendingInterestMatch.deleteMany({
      where: {
        processed: true,
        createdAt: { lt: sevenDaysAgo },
      },
    })

    return NextResponse.json({
      success: true,
      deletedNotifications,
      deletedPendingMatches: deletedMatches.count,
    })
  } catch (error) {
    console.error('Cleanup notifications cron error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup notifications' },
      { status: 500 }
    )
  }
}
