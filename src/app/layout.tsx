import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { ServiceWorkerProvider } from '@/components/service-worker-provider'
import { PushPrompt } from '@/components/push-prompt'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LocalSwap - Trade with your neighbors',
  description: 'A hyper-local bartering marketplace where people trade goods and services within nearby communities.',
  keywords: ['barter', 'trade', 'local', 'marketplace', 'swap', 'community'],
  authors: [{ name: 'LocalSwap' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LocalSwap',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'LocalSwap - Trade with your neighbors',
    description: 'A hyper-local bartering marketplace where people trade goods and services within nearby communities.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2D7D46',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ServiceWorkerProvider>
          <ToastProvider>
            {children}
            <PushPrompt />
          </ToastProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  )
}
