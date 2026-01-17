import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gray-200',
        className
      )}
    />
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Skeleton className="aspect-square rounded-none" />
      <div className="p-3">
        <Skeleton className="h-4 mb-2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function OfferCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-16 h-16 rounded-lg" />
        <Skeleton className="w-6 h-6 rounded-full self-center" />
        <Skeleton className="w-16 h-16 rounded-lg" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  )
}
