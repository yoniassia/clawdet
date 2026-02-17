import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
