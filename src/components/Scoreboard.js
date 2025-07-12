'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

export default function Scoreboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    fetchLeaderboard()

    // ลอง setup Supabase real-time subscription
    let subscription = null

    const setupRealtimeSubscription = async () => {
      if (!supabase) {
        console.log('Supabase not available, using polling only')
        return
      }

      try {
        subscription = supabase
          .channel('scoreboard_changes')
          .on('postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'scoreboard'
            },
            (payload) => {
              console.log('Real-time update:', payload)
              fetchLeaderboard(true) // silent update เมื่อมีการเปลี่ยนแปลง
            }
          )
          .subscribe()
      } catch (error) {
        console.log('Real-time subscription failed, using polling fallback')
      }
    }

    setupRealtimeSubscription()

    // Fallback polling ทุก 2 วินาที (ลดลงจาก 100ms เพื่อประสิทธิภาพ)
    const intervalId = setInterval(() => {
      fetchLeaderboard(true) // silent update
    }, 2000)

    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription)
      }
      clearInterval(intervalId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLeaderboard = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      const response = await fetch('/api/scoreboard', {
        cache: 'no-store', // ป้องกัน cache เพื่อให้ได้ข้อมูลล่าสุด
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()

      if (data.success) {
        // เช็คว่าข้อมูลมีการเปลี่ยนแปลงหรือไม่
        const newTimestamp = data.timestamp
        if (!lastUpdate || newTimestamp !== lastUpdate) {
          setLeaderboard(data.leaderboard)
          setLastUpdate(newTimestamp)
          setUsingFallback(data.usingFallback || false)
        }
      } else {
        if (!silent) {
          setError(data.error)
        }
      }
    } catch (err) {
      if (!silent) {
        setError('Failed to fetch leaderboard')
        console.error('Error fetching leaderboard:', err)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
      default: return 'bg-base-200'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="ml-3 text-base-content/70">กำลังโหลดตารางคะแนน...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>เกิดข้อผิดพลาด: {error}</span>
        <button onClick={fetchLeaderboard} className="btn btn-sm">
          ลองใหม่
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Scoreboard

        </h2>
        {lastUpdate && (
          <p className="text-xs text-base-content/50 mt-1">
            อัพเดทล่าสุด: {new Date(lastUpdate).toLocaleTimeString('th-TH')}
          </p>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => fetchLeaderboard(false)}
          className="btn btn-outline btn-sm"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-base-content/70 mb-2">
            ยังไม่มีข้อมูลคะแนน
          </h3>
          <p className="text-base-content/50">
            คุณจะเป็นคนแรกที่จะมาประลองความใหย่!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`card shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                session?.user?.id === entry.userId || session?.user?.email === entry.userId
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 bg-base-100'
              }`}
            >
              <div className="card-body p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <div className="avatar">
                      <div className="w-10 h-10 rounded-full">
                        <img
                          src={entry.userImage || `https://via.placeholder.com/40x40/667eea/ffffff?text=${entry.userName?.charAt(0) || 'U'}`}
                          alt={entry.userName}
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/40x40/667eea/ffffff?text=${entry.userName?.charAt(0) || 'U'}`
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-base-content">
                        {entry.userName}
                        {(session?.user?.id === entry.userId || session?.user?.email === entry.userId) && (
                          <span className="badge badge-primary badge-sm ml-2">คุณ</span>
                        )}
                      </div>
                      <div className="text-sm text-base-content/60">
                        {new Date(entry.achievedAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-2xl">{entry.level.emoji}</span>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: entry.level.color }}>
                          {entry.highestScore}
                        </div>
                        <div className="text-sm font-medium" style={{ color: entry.level.color }}>
                          {entry.level.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/50">
                      🍛 {entry.mainDishCount} | 🥗 {entry.sideDishCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
