'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-semibold text-[var(--color-text)] mb-2">
          Something went wrong
        </h1>
        <p className="text-[var(--color-text-muted)] mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full h-12 bg-[var(--color-primary)] text-white rounded-xl font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <a
            href="/"
            className="w-full h-12 bg-gray-100 text-[var(--color-text)] rounded-xl font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Home className="w-5 h-5" />
            Go Home
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-[var(--color-text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
