import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { notifyDailyEncouragement } from '@/lib/notifications'
import { sendInterestDigests } from '@/lib/interest-matching'

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

// POST /api/cron/daily - Combined daily cron job (9 AM)
// Sends daily encouragement quotes and interest digest notifications
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = {
      encouragement: { success: false, usersNotified: 0, errors: 0, quote: null as { id: string; content: string; author: string | null; category: string } | null },
      digest: { success: false, usersNotified: 0, matchesProcessed: 0 },
    }

    // 1. Send daily encouragement
    try {
      const quotes = await prisma.dailyQuote.findMany({
        where: { isActive: true },
        orderBy: [
          { usedAt: { sort: 'asc', nulls: 'first' } },
          { createdAt: 'asc' },
        ],
        take: 1,
      })

      if (quotes.length > 0) {
        const quote = quotes[0]

        await prisma.dailyQuote.update({
          where: { id: quote.id },
          data: { usedAt: new Date() },
        })

        const settings = await prisma.notificationSettings.findMany({
          where: {
            globalEnabled: true,
            dailyEncouragement: true,
          },
          select: { userId: true },
        })

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

        results.encouragement = {
          success: true,
          usersNotified: successCount,
          errors: errorCount,
          quote: {
            id: quote.id,
            content: quote.content,
            author: quote.author,
            category: quote.category,
          },
        }
      }
    } catch (error) {
      console.error('Daily encouragement error:', error)
    }

    // 2. Send interest digests
    try {
      const digestResult = await sendInterestDigests()
      results.digest = {
        success: true,
        usersNotified: digestResult.usersNotified,
        matchesProcessed: digestResult.matchesProcessed,
      }
    } catch (error) {
      console.error('Interest digest error:', error)
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Daily cron error:', error)
    return NextResponse.json(
      { error: 'Failed to run daily cron job' },
      { status: 500 }
    )
  }
}
