import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { removeInterest } from '@/lib/interest-matching'

// DELETE /api/interests/[id] - Remove an interest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const success = await removeInterest(user.id, id)

    if (!success) {
      return NextResponse.json({ error: 'Interest not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove interest error:', error)
    return NextResponse.json({ error: 'Failed to remove interest' }, { status: 500 })
  }
}
