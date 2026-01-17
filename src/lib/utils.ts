import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Geohash encoding for efficient geo queries
export function encodeGeohash(lat: number, lng: number, precision: number = 8): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'
  let idx = 0
  let bit = 0
  let evenBit = true
  let geohash = ''
  let minLat = -90, maxLat = 90
  let minLng = -180, maxLng = 180

  while (geohash.length < precision) {
    if (evenBit) {
      const midLng = (minLng + maxLng) / 2
      if (lng >= midLng) {
        idx = idx * 2 + 1
        minLng = midLng
      } else {
        idx = idx * 2
        maxLng = midLng
      }
    } else {
      const midLat = (minLat + maxLat) / 2
      if (lat >= midLat) {
        idx = idx * 2 + 1
        minLat = midLat
      } else {
        idx = idx * 2
        maxLat = midLat
      }
    }
    evenBit = !evenBit

    if (++bit === 5) {
      geohash += BASE32[idx]
      bit = 0
      idx = 0
    }
  }

  return geohash
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length - 3) + '...'
}

// Generate offer expiry date (72 hours from now)
export function getOfferExpiry(): Date {
  return new Date(Date.now() + 72 * 60 * 60 * 1000)
}
