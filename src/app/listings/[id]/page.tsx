'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Share,
  Heart,
  MapPin,
  Clock,
  Flag,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { TrustScore } from '@/components/features/trust-score'
import { formatRelativeTime } from '@/lib/utils'

// Mock listing data
const mockListing = {
  id: '1',
  title: 'Kids Bicycle, 20-inch',
  description:
    'Great condition kids bike. My daughter outgrew it last year. Minor scratches on the frame but works perfectly. Includes training wheels that can be removed.',
  category: 'kids',
  condition: 'like_new',
  isService: false,
  wantsType: 'open',
  wantsCategories: [],
  wantsDescription: null,
  availability: [
    { day: 'weekend', timeOfDay: 'morning' },
    { day: 'weekday', timeOfDay: 'evening' },
  ],
  preferredMeetupArea: 'Downtown or East Side',
  photos: [
    { id: 'p1', url: '/placeholder-1.jpg', thumbnailUrl: '/placeholder-1.jpg' },
    { id: 'p2', url: '/placeholder-2.jpg', thumbnailUrl: '/placeholder-2.jpg' },
  ],
  user: {
    id: 'u1',
    displayName: 'Maria S.',
    avatarUrl: null,
    bio: 'Mom of two, love trading kids items!',
    trustScore: 4.8,
    completedSwaps: 12,
    responseRate: 0.95,
    verifications: ['phone', 'email'],
    isTraveler: false,
    memberSince: new Date('2024-03-01'),
  },
  location: {
    city: 'Austin',
    neighborhood: 'Downtown',
  },
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  isOwner: false,
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [isSaved, setIsSaved] = useState(false)

  const listing = mockListing // Would fetch based on params.id

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Photo gallery */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          {listing.photos.length > 0 ? (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-6xl">
              📦
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">{listing.isService ? '🛠️' : '📦'}</span>
            </div>
          )}
        </div>

        {/* Navigation overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
              <Share className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Photo indicators */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {listing.photos.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  index === currentPhoto ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Traveler badge */}
        {listing.user.isTraveler && (
          <Badge variant="info" className="absolute bottom-4 left-4">
            🌍 Traveler
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Title & meta */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{listing.category}</Badge>
            {listing.condition && (
              <Badge variant="default">
                {listing.condition.replace('_', ' ')}
              </Badge>
            )}
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.location.neighborhood}, {listing.location.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div className="mt-6">
            <h2 className="font-semibold text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
        )}

        {/* What they want */}
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900">Looking for</h2>
          <p className="mt-2 text-gray-600">
            {listing.wantsType === 'open' && 'Open to offers'}
            {listing.wantsType === 'categories' &&
              listing.wantsCategories.join(', ')}
            {listing.wantsType === 'specific' && listing.wantsDescription}
          </p>
        </div>

        {/* Availability */}
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900">Availability</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.availability?.map((slot, i) => (
              <Badge key={i} variant="default">
                {slot.day} {slot.timeOfDay}
              </Badge>
            ))}
          </div>
          {listing.preferredMeetupArea && (
            <p className="mt-2 text-sm text-gray-500">
              Prefers: {listing.preferredMeetupArea}
            </p>
          )}
        </div>

        {/* Seller card */}
        <Card className="mt-6 p-4">
          <div className="flex items-start gap-3">
            <Avatar src={listing.user.avatarUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">
                {listing.user.displayName}
              </h3>
              <TrustScore
                score={listing.user.trustScore}
                swaps={listing.user.completedSwaps}
                verifications={listing.user.verifications}
              />
              {listing.user.bio && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {listing.user.bio}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
        </Card>

        {/* Report */}
        <button className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <Flag className="h-4 w-4" />
          Report this listing
        </button>
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
        <div className="max-w-lg mx-auto flex gap-3">
          <Button variant="outline" className="flex-1">
            <MessageCircle className="h-5 w-5 mr-2" />
            Message
          </Button>
          <Button className="flex-1">Make Offer</Button>
        </div>
      </div>
    </div>
  )
}
