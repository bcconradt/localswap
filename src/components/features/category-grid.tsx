'use client'

import { cn } from '@/lib/utils'

const categories = [
  { id: 'household', label: 'Home', icon: '🏠' },
  { id: 'kids', label: 'Kids', icon: '👶' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'tools', label: 'Tools', icon: '🔧' },
  { id: 'garden', label: 'Garden', icon: '🌱' },
  { id: 'services', label: 'Services', icon: '🛠️' },
  { id: 'other', label: 'Other', icon: '📦' },
]

interface CategoryGridProps {
  selected?: string | string[]
  onSelect?: (category: string) => void
  multiSelect?: boolean
  compact?: boolean
}

export function CategoryGrid({
  selected,
  onSelect,
  multiSelect = false,
  compact = false,
}: CategoryGridProps) {
  const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : []

  const handleSelect = (categoryId: string) => {
    if (!onSelect) return
    onSelect(categoryId)
  }

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => {
          const isSelected = selectedArray.includes(category.id)
          return (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {category.icon} {category.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
      {categories.map((category) => {
        const isSelected = selectedArray.includes(category.id)
        return (
          <button
            key={category.id}
            onClick={() => handleSelect(category.id)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl transition-colors',
              isSelected
                ? 'bg-green-50 border-2 border-green-600'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            )}
          >
            <span className="text-2xl">{category.icon}</span>
            <span
              className={cn(
                'mt-1 text-xs font-medium',
                isSelected ? 'text-green-700' : 'text-gray-600'
              )}
            >
              {category.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { categories }
