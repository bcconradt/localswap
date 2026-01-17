import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserInterests, addInterest, replaceInterests } from '@/lib/interest-matching'
import { addInterestSchema, replaceInterestsSchema } from '@/lib/validations'
import { ListingCategory } from '@/generated/prisma'

// GET /api/interests - List watched categories
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const interests = await getUserInterests(user.id)

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Get interests error:', error)
    return NextResponse.json({ error: 'Failed to get interests' }, { status: 500 })
  }
}

// POST /api/interests - Add a new interest
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = addInterestSchema.parse(body)

    const interest = await addInterest(
      user.id,
      data.category as ListingCategory,
      {
        keywords: data.keywords,
        radiusMiles: data.radiusMiles,
      }
    )

    return NextResponse.json(interest, { status: 201 })
  } catch (error) {
    console.error('Add interest error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add interest' }, { status: 500 })
  }
}

// PUT /api/interests - Bulk replace all interests
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = replaceInterestsSchema.parse(body)

    const interests = await replaceInterests(
      user.id,
      data.interests.map((i) => ({
        category: i.category as ListingCategory,
        keywords: i.keywords,
        radiusMiles: i.radiusMiles,
      }))
    )

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Replace interests error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to replace interests' }, { status: 500 })
  }
}
