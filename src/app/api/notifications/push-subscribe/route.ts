import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

// POST /api/notifications/push-subscribe - Save push subscription
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = subscriptionSchema.parse(body)

    // Upsert subscription (update if endpoint already exists)
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      create: {
        userId: user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent: request.headers.get('user-agent') || undefined,
      },
      update: {
        userId: user.id,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({ success: true, id: subscription.id })
  } catch (error) {
    console.error('Push subscribe error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

// DELETE /api/notifications/push-subscribe - Remove push subscription
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId: user.id,
        endpoint,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
