import type { Metadata, Viewport } from 'next'
import './globals.css'
import FeedbackWidget from '@/components/FeedbackWidget'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

export const metadata: Metadata = {
  title: 'Clawdet - Your AI Companion',
  description: 'Get your own personal AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  )
}
