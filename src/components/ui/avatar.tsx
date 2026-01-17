import { cn } from '@/lib/utils'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gray-200 text-gray-500',
          sizes[size],
          className
        )}
      >
        <User className="h-1/2 w-1/2" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt || 'Avatar'}
      className={cn('rounded-full object-cover', sizes[size], className)}
    />
  )
}
