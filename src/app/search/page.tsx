'use client'

import { useState } from 'react'
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ListingCard } from '@/components/features/listing-card'
import { CategoryGrid } from '@/components/features/category-grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [includeTravelers, setIncludeTravelers] = useState(true)
  const [distance, setDistance] = useState(10)

  const conditions = [
    { id: 'new', label: 'New' },
    { id: 'like_new', label: 'Like New' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
  ]

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedConditions([])
    setIncludeTravelers(true)
    setDistance(10)
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedConditions.length +
    (includeTravelers ? 0 : 1) +
    (distance !== 10 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header location="Downtown Austin" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items and services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-600 text-xs text-white flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <CategoryGrid
                selected={selectedCategories}
                onSelect={toggleCategory}
                multiSelect
                compact
              />
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <div className="flex flex-wrap gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() => toggleCondition(cond.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedConditions.includes(cond.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance: {distance} miles
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-green-600"
              />
            </div>

            {/* Include travelers */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Include travelers
              </label>
              <button
                onClick={() => setIncludeTravelers(!includeTravelers)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeTravelers ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeTravelers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Active filters */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <Badge key={cat} variant="info" className="cursor-pointer" onClick={() => toggleCategory(cat)}>
                {cat} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {selectedConditions.map((cond) => (
              <Badge key={cond} variant="info" className="cursor-pointer" onClick={() => toggleCondition(cond)}>
                {cond.replace('_', ' ')} <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            {distance !== 10 && (
              <Badge variant="info" className="cursor-pointer" onClick={() => setDistance(10)}>
                {distance} mi <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        <div className="mt-6">
          <EmptyState
            icon={<SearchIcon className="h-12 w-12" />}
            title="Search for items"
            description="Enter a search term or select filters to find items and services nearby"
          />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
