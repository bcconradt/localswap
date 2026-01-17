'use client'

import { ArrowRight, Clock, Check, X, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { formatRelativeTime } from '@/lib/utils'

interface OfferCardProps {
  offer: {
    id: string
    status: string
    listing: {
      id: string
      title: string
      photo?: { thumbnailUrl: string } | null
    }
    items: Array<{
      id: string
      description?: string | null
      listing?: {
        id: string
        title: string
        photo?: { thumbnailUrl: string } | null
      } | null
    }>
    offerer: {
      id: string
      displayName?: string | null
      avatarUrl?: string | null
    }
    owner: {
      id: string
      displayName?: string | null
      avatarUrl?: string | null
    }
    isOfferer: boolean
    createdAt: string | Date
    meetup?: {
      location: string
      time: string | Date
    } | null
  }
  onAccept?: () => void
  onDecline?: () => void
  onCounter?: () => void
  onMessage?: () => void
  compact?: boolean
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  countered: { label: 'Countered', variant: 'info' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'danger' },
  completed: { label: 'Completed', variant: 'success' },
  expired: { label: 'Expired', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'default' },
  disputed: { label: 'Disputed', variant: 'danger' },
}

export function OfferCard({
  offer,
  onAccept,
  onDecline,
  onCounter,
  onMessage,
  compact = false,
}: OfferCardProps) {
  const status = statusConfig[offer.status] || statusConfig.pending
  const otherParty = offer.isOfferer ? offer.owner : offer.offerer
  const canRespond = !offer.isOfferer && (offer.status === 'pending' || offer.status === 'countered')

  const offerItem = offer.items[0]
  const offerTitle = offerItem?.listing?.title || offerItem?.description || 'Custom offer'
  const offerPhoto = offerItem?.listing?.photo?.thumbnailUrl

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border-2 border-white">
              {offerPhoto ? (
                <img src={offerPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl">📦</div>
              )}
            </div>
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border-2 border-white">
              {offer.listing.photo ? (
                <img src={offer.listing.photo.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xl">📦</div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">{offerTitle}</span>
              <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500 truncate">{offer.listing.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={status.variant} size="sm">{status.label}</Badge>
              <span className="text-xs text-gray-400">{formatRelativeTime(new Date(offer.createdAt))}</span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar src={otherParty.avatarUrl} size="sm" />
            <span className="font-medium text-gray-900">
              {offer.isOfferer ? 'To' : 'From'} {otherParty.displayName || 'User'}
            </span>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Trade visualization */}
        <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-lg bg-white border overflow-hidden">
              {offerPhoto ? (
                <img src={offerPhoto} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl">📦</div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 max-w-[100px] truncate">
              {offerTitle}
            </p>
            <p className="text-xs text-gray-500">{offer.isOfferer ? 'You offer' : 'They offer'}</p>
          </div>

          <ArrowRight className="h-6 w-6 text-gray-400" />

          <div className="text-center">
            <div className="h-16 w-16 mx-auto rounded-lg bg-white border overflow-hidden">
              {offer.listing.photo ? (
                <img src={offer.listing.photo.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-2xl">📦</div>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900 max-w-[100px] truncate">
              {offer.listing.title}
            </p>
            <p className="text-xs text-gray-500">{offer.isOfferer ? 'For' : 'Your item'}</p>
          </div>
        </div>

        {/* Meetup info */}
        {offer.meetup && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <Clock className="h-4 w-4" />
              <span>Meetup: {offer.meetup.location}</span>
            </div>
            <p className="mt-1 text-green-600">
              {new Date(offer.meetup.time).toLocaleString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {canRespond && (
            <>
              <Button size="sm" onClick={onAccept} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={onCounter} className="flex-1">
                Counter
              </Button>
              <Button size="sm" variant="ghost" onClick={onDecline}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {onMessage && (
            <Button size="sm" variant="outline" onClick={onMessage} className={canRespond ? '' : 'flex-1'}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
