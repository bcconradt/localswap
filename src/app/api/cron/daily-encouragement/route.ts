import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { notifyDailyEncouragement } from '@/lib/notifications'

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

// POST /api/cron/daily-encouragement - Send daily motivational quotes (9 AM)
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get a random quote that hasn't been used recently
    const quotes = await prisma.dailyQuote.findMany({
      where: { isActive: true },
      orderBy: [
        { usedAt: { sort: 'asc', nulls: 'first' } },
        { createdAt: 'asc' },
      ],
      take: 1,
    })

    if (quotes.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No quotes available',
        usersNotified: 0,
      })
    }

    const quote = quotes[0]

    // Mark quote as used
    await prisma.dailyQuote.update({
      where: { id: quote.id },
      data: { usedAt: new Date() },
    })

    // Get all users who have daily encouragement enabled
    const settings = await prisma.notificationSettings.findMany({
      where: {
        globalEnabled: true,
        dailyEncouragement: true,
      },
      select: { userId: true },
    })

    // Also include users without settings (they get defaults which are ON)
    const usersWithSettings = new Set(settings.map((s) => s.userId))
    const usersWithoutSettings = await prisma.user.findMany({
      where: {
        status: 'active',
        id: { notIn: Array.from(usersWithSettings) },
      },
      select: { id: true },
    })

    const allUserIds = [
      ...settings.map((s) => s.userId),
      ...usersWithoutSettings.map((u) => u.id),
    ]

    // Send notifications
    let successCount = 0
    let errorCount = 0

    for (const userId of allUserIds) {
      try {
        await notifyDailyEncouragement(
          userId,
          quote.content,
          quote.author || undefined
        )
        successCount++
      } catch (error) {
        console.error(`Failed to send encouragement to user ${userId}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      quote: {
        id: quote.id,
        content: quote.content,
        author: quote.author,
        category: quote.category,
      },
      usersNotified: successCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error('Daily encouragement cron error:', error)
    return NextResponse.json(
      { error: 'Failed to send daily encouragement' },
      { status: 500 }
    )
  }
}
