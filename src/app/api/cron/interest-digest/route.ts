import { NextRequest, NextResponse } from 'next/server'
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

// POST /api/cron/interest-digest - Send batched interest alerts (9 AM)
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendInterestDigests()

    return NextResponse.json({
      success: true,
      usersNotified: result.usersNotified,
      matchesProcessed: result.matchesProcessed,
    })
  } catch (error) {
    console.error('Interest digest cron error:', error)
    return NextResponse.json(
      { error: 'Failed to send interest digests' },
      { status: 500 }
    )
  }
}
