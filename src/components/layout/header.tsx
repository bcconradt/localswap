'use client'

import Link from 'next/link'
import { MapPin, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  location?: string
  showNotifications?: boolean
}

export function Header({ location = 'Set Location', showNotifications = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <span className="font-bold text-lg text-gray-900">LocalSwap</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Location */}
          <Button variant="ghost" size="sm" className="text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm truncate max-w-[120px]">{location}</span>
          </Button>

          {/* Notifications */}
          {showNotifications && (
            <Link href="/notifications">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
