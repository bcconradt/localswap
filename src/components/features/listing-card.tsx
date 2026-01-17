'use client'

import Link from 'next/link'
import { MapPin, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { TrustScore } from './trust-score'
import { formatRelativeTime } from '@/lib/utils'

interface ListingCardProps {
  listing: {
    id: string
    title: string
    category: string
    condition?: string | null
    isService: boolean
    wantsType: string
    primaryPhoto?: {
      thumbnailUrl: string
    } | null
    user: {
      id: string
      displayName?: string | null
      avatarUrl?: string | null
      trustScore?: number | string | null
      completedSwaps?: number | null
      isTraveler?: boolean
    }
    location: {
      city: string
      neighborhood?: string | null
    }
    createdAt: string | Date
  }
}

export function ListingCard({ listing }: ListingCardProps) {
  const timeAgo = formatRelativeTime(new Date(listing.createdAt))

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100">
          {listing.primaryPhoto ? (
            <img
              src={listing.primaryPhoto.thumbnailUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <span className="text-4xl">{listing.isService ? '🛠️' : '📦'}</span>
            </div>
          )}
          {listing.user.isTraveler && (
            <Badge variant="info" className="absolute top-2 left-2">
              🌍 Traveler
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>

          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <Badge size="sm">{listing.category}</Badge>
            {listing.condition && (
              <span className="capitalize">{listing.condition.replace('_', ' ')}</span>
            )}
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {listing.location.neighborhood || listing.location.city}
            </span>
          </div>

          {/* User & Time */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <Avatar src={listing.user.avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {listing.user.displayName || 'User'}
                </p>
                <TrustScore
                  score={Number(listing.user.trustScore) || 0}
                  swaps={listing.user.completedSwaps || 0}
                  size="sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
