import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createReportSchema } from '@/lib/validations'

// POST /api/reports - Create report
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createReportSchema.parse(body)

    // Can't report yourself
    if (data.reportedUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      )
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: data.reportedUserId },
    })

    if (!reportedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check for recent duplicate report
    const recentReport = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        reportedUserId: data.reportedUserId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
      },
    })

    if (recentReport) {
      return NextResponse.json(
        { error: 'You have already reported this user recently' },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedUserId: data.reportedUserId,
        reportedListingId: data.reportedListingId,
        offerId: data.offerId,
        reason: data.reason,
        description: data.description,
        evidenceUrls: data.evidenceUrls || [],
      },
    })

    // TODO: Notify moderation team
    // TODO: Auto-flag user if they have multiple reports

    return NextResponse.json({
      success: true,
      message: 'Report submitted. Our team will review within 24 hours.',
      reportId: report.id,
    }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}
