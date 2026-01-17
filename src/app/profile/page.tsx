'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Settings,
  MapPin,
  Shield,
  HelpCircle,
  ChevronRight,
  Plane,
  Star,
  Package,
  LogOut,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TrustScore } from '@/components/features/trust-score'
import { cn } from '@/lib/utils'

// Mock user data
const mockUser = {
  id: 'u1',
  displayName: 'Brian C.',
  avatarUrl: null,
  bio: 'Love trading vintage items and helping neighbors!',
  neighborhood: 'Downtown Austin',
  trustScore: 4.8,
  completedSwaps: 12,
  responseRate: 0.95,
  verifications: ['phone', 'email'],
  memberSince: new Date('2024-06-01'),
  isTraveler: false,
  activeListings: 3,
}

const menuItems = [
  {
    icon: Package,
    label: 'My Listings',
    href: '/profile/listings',
    badge: mockUser.activeListings,
  },
  {
    icon: Star,
    label: 'My Reviews',
    href: '/profile/reviews',
  },
  {
    icon: Plane,
    label: 'Traveler Mode',
    href: '/profile/traveler',
    description: mockUser.isTraveler ? 'Active' : 'Off',
  },
  {
    icon: MapPin,
    label: 'Location Settings',
    href: '/profile/location',
  },
  {
    icon: Shield,
    label: 'Safety Center',
    href: '/profile/safety',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    href: '/help',
  },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header location={mockUser.neighborhood} showNotifications={false} />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Profile header */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Avatar src={mockUser.avatarUrl} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {mockUser.displayName}
                </h1>
                {mockUser.isTraveler && (
                  <Badge variant="info">🌍 Traveler</Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {mockUser.neighborhood}
              </p>
              {mockUser.bio && (
                <p className="mt-2 text-sm text-gray-600">{mockUser.bio}</p>
              )}
            </div>
          </div>

          {/* Trust score */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <TrustScore
              score={mockUser.trustScore}
              swaps={mockUser.completedSwaps}
              responseRate={mockUser.responseRate}
              verifications={mockUser.verifications}
              size="lg"
            />
          </div>

          {/* Edit button */}
          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{mockUser.completedSwaps}</p>
            <p className="text-xs text-gray-500">Swaps</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{mockUser.activeListings}</p>
            <p className="text-xs text-gray-500">Active</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(mockUser.responseRate * 100)}%
            </p>
            <p className="text-xs text-gray-500">Response</p>
          </Card>
        </div>

        {/* Menu */}
        <Card className="mt-4 divide-y divide-gray-100">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{item.label}</p>
                  {item.description && (
                    <p className="text-sm text-gray-500">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge>{item.badge}</Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            )
          })}
        </Card>

        {/* Logout */}
        <Button
          variant="ghost"
          className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>

        {/* Member since */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Member since {mockUser.memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </main>

      <BottomNav />
    </div>
  )
}
