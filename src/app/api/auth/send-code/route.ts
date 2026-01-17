import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendCodeSchema } from '@/lib/validations'
import { generateVerificationCode, sendVerificationSMS, formatPhoneNumber } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = sendCodeSchema.parse(body)

    // Format phone number
    const formattedPhone = formatPhoneNumber(phone)

    // Generate verification code
    const code = generateVerificationCode()

    // Check if user exists or create placeholder
    let user = await prisma.user.findUnique({
      where: { phone: formattedPhone },
    })

    if (!user) {
      user = await prisma.user.create({
        data: { phone: formattedPhone },
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

    const verificationData = {
      metadata: { code, sentAt: new Date().toISOString() },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    }

    if (existingVerification) {
      // Update existing verification
      await prisma.verification.update({
        where: { id: existingVerification.id },
        data: verificationData,
      })
    } else {
      // Create new verification
      await prisma.verification.create({
        data: {
          userId: user.id,
          type: 'phone',
          status: 'pending',
          ...verificationData,
        },
      })
    }

    // Send SMS
    const smsResult = await sendVerificationSMS(formattedPhone, code)

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'Failed to send verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // Only include code in development for testing
      ...(process.env.NODE_ENV === 'development' && { devCode: code }),
    })
  } catch (error) {
    console.error('Send code error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 })
  }
}
