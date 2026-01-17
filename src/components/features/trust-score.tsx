import { Star, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustScoreProps {
  score: number
  swaps?: number
  responseRate?: number
  verifications?: string[]
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
}

export function TrustScore({
  score,
  swaps = 0,
  responseRate,
  verifications = [],
  size = 'md',
  showDetails = false,
}: TrustScoreProps) {
  const formattedScore = score > 0 ? score.toFixed(1) : 'New'

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        <span>{formattedScore}</span>
        {swaps > 0 && <span>• {swaps} swaps</span>}
      </div>
    )
  }

  if (size === 'lg' || showDetails) {
    return (
      <div className="space-y-3">
        {/* Main score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            <span className="text-2xl font-bold text-gray-900">{formattedScore}</span>
          </div>
          <div className="text-sm text-gray-500">
            {swaps > 0 ? `${swaps} completed swaps` : 'No swaps yet'}
          </div>
        </div>

        {/* Stats */}
        {(responseRate !== undefined || verifications.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {responseRate !== undefined && (
              <div className="text-sm">
                <span className="font-medium text-gray-900">
                  {Math.round(responseRate * 100)}%
                </span>
                <span className="text-gray-500"> response rate</span>
              </div>
            )}
          </div>
        )}

        {/* Verifications */}
        {verifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {verifications.map((v) => (
              <div
                key={v}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {v === 'phone' && 'Phone Verified'}
                {v === 'email' && 'Email Verified'}
                {v === 'id_document' && 'ID Verified'}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Default (md)
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="font-medium text-gray-900">{formattedScore}</span>
      </div>
      {swaps > 0 && (
        <span className="text-gray-500">• {swaps} swaps</span>
      )}
      {verifications.includes('phone') && (
        <CheckCircle className="h-4 w-4 text-blue-500" />
      )}
    </div>
  )
}
