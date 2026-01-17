import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCodeSchema } from '@/lib/validations'

// In production, integrate with Twilio or similar
// For now, we'll use a mock verification code stored in the database
const MOCK_CODE = '123456' // Remove in production

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = sendCodeSchema.parse(body)

    // Check if user exists or create placeholder
    let user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { phone },
      })
    }

    // Check for existing pending verification
    const existingVerification = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        type: 'phone',
        status: 'pending',
      },
    })

    if (existingVerification) {
      // Update existing verification
      await prisma.verification.update({
        where: { id: existingVerification.id },
        data: {
          metadata: { code: MOCK_CODE, sentAt: new Date().toISOString() },
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      })
    } else {
      // Create new verification
      await prisma.verification.create({
        data: {
          userId: user.id,
          type: 'phone',
          status: 'pending',
          metadata: { code: MOCK_CODE, sentAt: new Date().toISOString() },
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      })
    }

    // TODO: Send SMS via Twilio in production
    // await twilio.messages.create({ to: phone, body: `Your LocalSwap code is: ${code}` })

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // Remove in production - only for development testing
      ...(process.env.NODE_ENV === 'development' && { devCode: MOCK_CODE })
    })
  } catch (error) {
    console.error('Send code error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
