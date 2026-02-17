import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clawdet - Your AI Companion',
  description: 'Get your own personal AI assistant',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
