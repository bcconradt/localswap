'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { useServiceWorker } from '@/hooks/use-service-worker'

export function PushPrompt() {
  const [isDismissed, setIsDismissed] = useState(true)
  const { isSupported, pushPermission, isPushSubscribed, requestPushPermission, subscribePush } = useServiceWorker()

  useEffect(() => {
    // Check if we should show the prompt
    if (typeof window === 'undefined') return

    const dismissed = localStorage.getItem('push-prompt-dismissed')
    const lastDismissed = dismissed ? parseInt(dismissed, 10) : 0
    const daysSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24)

    // Show prompt if:
    // - Push is supported
    // - Permission not yet decided (default)
    // - Not already subscribed
    // - Haven't dismissed recently (7 days)
    if (
      isSupported &&
      pushPermission === 'default' &&
      !isPushSubscribed &&
      daysSinceDismissed > 7
    ) {
      // Delay showing the prompt
      const timer = setTimeout(() => setIsDismissed(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSupported, pushPermission, isPushSubscribed])

  const handleEnable = async () => {
    const granted = await requestPushPermission()
    if (granted) {
      await subscribePush()
    }
    setIsDismissed(true)
    localStorage.setItem('push-prompt-dismissed', Date.now().toString())
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('push-prompt-dismissed', Date.now().toString())
  }

  if (isDismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--color-text)]">
              Enable notifications
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Get notified when you receive offers and messages
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg active:scale-[0.98] transition-transform"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-[var(--color-text-muted)] text-sm font-medium rounded-lg hover:bg-gray-100 active:scale-[0.98] transition-transform"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
