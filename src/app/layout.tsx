import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'

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
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
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
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
