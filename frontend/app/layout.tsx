import type { Metadata } from 'next'
import './globals.css'
import TopNav from '@/components/TopNav'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'WanderKit — Hiking Operator Platform',
  description: 'Find, compare and book the world\'s best hiking operators',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-warm-bg">
        <div className="flex flex-col h-screen overflow-hidden">
          <TopNav />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-warm-bg">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
