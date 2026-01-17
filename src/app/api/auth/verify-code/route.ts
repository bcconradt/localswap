import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyCodeSchema } from '@/lib/validations'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code } = verifyCodeSchema.parse(body)

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find pending verification
    const verification = await prisma.verification.findFirst({
      where: {
        userId: user.id,
        type: 'phone',
        status: 'pending',
      },
    })

    if (!verification) {
      return NextResponse.json({ error: 'No pending verification' }, { status: 400 })
    }

    // Check expiry
    if (verification.expiresAt && verification.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    // Verify code
    const storedCode = (verification.metadata as { code?: string })?.code
    if (storedCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    // Mark verification as complete
    await prisma.verification.update({
      where: { id: verification.id },
      data: {
        status: 'verified',
        verifiedAt: new Date(),
      },
    })

    // Update user last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    // Generate JWT token
    const token = generateToken({ userId: user.id, role: user.role })

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        hasProfile: !!user.profile,
      },
      token,
    })
  } catch (error) {
    console.error('Verify code error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
