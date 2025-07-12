'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import Scoreboard from '@/components/Scoreboard'

export default function ScoreboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200" data-theme="cupcake">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Scoreboard />
        </div>
      </div>
    </ProtectedRoute>
  )
}
