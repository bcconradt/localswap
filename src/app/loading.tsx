export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {/* Category chips skeleton */}
        <div className="flex gap-2 mb-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>

        {/* Listing cards skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe">
        <div className="max-w-lg mx-auto px-6 py-2 flex justify-around">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 py-1">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
