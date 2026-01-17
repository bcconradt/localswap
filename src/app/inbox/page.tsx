'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Package } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { OfferCard } from '@/components/features/offer-card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

// Mock data
const mockOffers = [
  {
    id: '1',
    status: 'pending',
    listing: {
      id: 'l1',
      title: 'Kids Bicycle',
      photo: null,
    },
    items: [
      {
        id: 'i1',
        description: 'Kids scooter + helmet',
        listing: null,
      },
    ],
    offerer: {
      id: 'u2',
      displayName: 'Alex K.',
      avatarUrl: null,
    },
    owner: {
      id: 'u1',
      displayName: 'You',
      avatarUrl: null,
    },
    isOfferer: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    meetup: null,
  },
  {
    id: '2',
    status: 'accepted',
    listing: {
      id: 'l2',
      title: 'Vintage Camera',
      photo: null,
    },
    items: [
      {
        id: 'i2',
        description: null,
        listing: {
          id: 'l3',
          title: 'Guitar Lessons',
          photo: null,
        },
      },
    ],
    offerer: {
      id: 'u1',
      displayName: 'You',
      avatarUrl: null,
    },
    owner: {
      id: 'u3',
      displayName: 'Jordan K.',
      avatarUrl: null,
    },
    isOfferer: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    meetup: {
      location: 'Starbucks - Main St',
      time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },
]

export default function InboxPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received')

  const filteredOffers = mockOffers.filter((offer) =>
    tab === 'received' ? !offer.isOfferer : offer.isOfferer
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header location="Downtown Austin" />

      <main className="max-w-lg mx-auto">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setTab('received')}
              className={cn(
                'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === 'received'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Received
            </button>
            <button
              onClick={() => setTab('sent')}
              className={cn(
                'flex-1 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === 'sent'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              Sent
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          {filteredOffers.length > 0 ? (
            <div className="space-y-4">
              {filteredOffers.map((offer) => (
                <Link key={offer.id} href={`/offers/${offer.id}`}>
                  <OfferCard
                    offer={offer}
                    onAccept={() => {}}
                    onDecline={() => {}}
                    onCounter={() => {}}
                    onMessage={() => {}}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={tab === 'received' ? <Package className="h-12 w-12" /> : <MessageSquare className="h-12 w-12" />}
              title={tab === 'received' ? 'No offers yet' : 'No offers sent'}
              description={
                tab === 'received'
                  ? 'When someone makes an offer on your listings, it will appear here.'
                  : 'Browse listings and make offers to start trading!'
              }
              action={{
                label: tab === 'received' ? 'Create a listing' : 'Browse listings',
                onClick: () => (window.location.href = tab === 'received' ? '/create' : '/'),
              }}
            />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
