'use client'

import { useState } from 'react'
import { RefreshCw, Package } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ListingCard } from '@/components/features/listing-card'
import { CategoryGrid } from '@/components/features/category-grid'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

// Mock data for development
const mockListings = [
  {
    id: '1',
    title: 'Kids Bicycle, 20-inch',
    category: 'kids',
    condition: 'like_new',
    isService: false,
    wantsType: 'open',
    primaryPhoto: { thumbnailUrl: '/placeholder-bike.jpg' },
    user: {
      id: 'u1',
      displayName: 'Maria S.',
      avatarUrl: null,
      trustScore: 4.8,
      completedSwaps: 12,
      isTraveler: false,
    },
    location: { city: 'Austin', neighborhood: 'Downtown' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Guitar Lessons (1 hour)',
    category: 'services',
    condition: null,
    isService: true,
    wantsType: 'categories',
    primaryPhoto: null,
    user: {
      id: 'u2',
      displayName: 'Marcus T.',
      avatarUrl: null,
      trustScore: 4.9,
      completedSwaps: 24,
      isTraveler: false,
    },
    location: { city: 'Austin', neighborhood: 'East Side' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Vintage Camera Collection',
    category: 'electronics',
    condition: 'good',
    isService: false,
    wantsType: 'specific',
    primaryPhoto: null,
    user: {
      id: 'u3',
      displayName: 'Jordan K.',
      avatarUrl: null,
      trustScore: 4.5,
      completedSwaps: 3,
      isTraveler: true,
    },
    location: { city: 'Austin', neighborhood: 'South Congress' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredListings = selectedCategory
    ? mockListings.filter((l) => l.category === selectedCategory)
    : mockListings

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header location="Downtown Austin" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Welcome message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            What can you swap today?
          </h1>
          <p className="mt-1 text-gray-600">
            Browse items and services in your community
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-6">
          <CategoryGrid
            selected={selectedCategory || undefined}
            onSelect={(cat) => setSelectedCategory(cat === selectedCategory ? null : cat)}
            compact
          />
        </div>

        {/* Listings header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} nearby` : 'Nearby listings'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Listings grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No listings found"
            description={
              selectedCategory
                ? `No ${selectedCategory} items nearby. Try a different category.`
                : 'Be the first to post something in your area!'
            }
            action={{
              label: 'Create Listing',
              onClick: () => (window.location.href = '/create'),
            }}
          />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
