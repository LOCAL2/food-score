'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatNumber } from '@/utils/formatNumber'
import UserDetailModal from './UserDetailModal'

export default function Scoreboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

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
    }, 1000)

    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription)
      }
      clearInterval(intervalId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUserClick = (userEmail) => {
    if (userEmail) {
      router.push(`/profile/${encodeURIComponent(userEmail)}`)
    }
  }

  const handleShowMeals = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedUser(null)
  }

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

  const getTopMessage = (rank, isCurrentUser) => {
    if (!isCurrentUser) return null

    const messages = {
      1: [
        "คุณคือที่ 1 ของความหยั่ย! 👑",
      ],
      2: [
        "คุณคือที่ 2 ของความหยั่ย! 🔥",
      ],
      3: [
        "คุณคือที่ 3 ของความหยั่ย! ⭐",
      ]
    };

    const rankMessages = messages[rank];
    if (rankMessages) {
      return rankMessages[Math.floor(Math.random() * rankMessages.length)];
    }
    return null;
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
          className="btn btn-outline btn-sm cursor-pointer"
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
          {leaderboard.map((entry) => {
            const isCurrentUser = session?.user?.id === entry.userId || session?.user?.email === entry.userId
            const topMessage = getTopMessage(entry.rank, isCurrentUser)

            return (
              <div key={entry.userId}>
                <div
                  className={`card shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    isCurrentUser
                      ? 'border-primary bg-primary/5'
                      : 'border-base-300 bg-base-100'
                  }`}
                >
                  <div className="card-body p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="text-3xl font-bold text-primary min-w-[60px] text-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info - Clickable */}
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-base-200/30 rounded-lg p-2 transition-colors"
                        onClick={() => handleUserClick(entry.userId)}
                      >
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full">
                            <img
                              src={entry.userImage || 'https://via.placeholder.com/48/96ceb4/ffffff?text=?'}
                              alt={entry.userName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg hover:text-primary transition-colors">
                            {entry.userName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{entry.level.emoji}</span>
                            <span className="font-semibold" style={{ color: entry.level.color }}>
                              {entry.level.name}
                            </span>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatNumber(entry.currentScore)}
                        </div>
                        <div className="text-sm text-base-content/70">
                          คะแนน
                        </div>
                        <div className="text-xs text-base-content/50 flex gap-2 flex-wrap mb-2">
                          {entry.mealBreakdown ? (
                            // โครงสร้างใหม่ - แสดงตามมื้อ
                            Object.entries(entry.mealBreakdown).map(([mealType, data]) => {
                              const mealConfig = {
                                breakfast: { name: 'เช้า' },
                                lunch: { name: 'กลางวัน' },
                                dinner: { name: 'เย็น' },
                                midnight: { name: 'กลางคืน' }
                              }
                              const config = mealConfig[mealType] || { name: mealType }

                              return data.count > 0 ? (
                                <span key={mealType} className="badge badge-xs badge-outline">
                                  {config.name} {data.count}
                                </span>
                              ) : null
                            })
                          ) : (
                            // โครงสร้างเก่า - แสดงเฉพาะที่มีค่ามากกว่า 0
                            <>
                              {entry.mainDishCount > 0 && (
                                <span className="badge badge-xs badge-outline">หลัก {entry.mainDishCount}</span>
                              )}
                              {entry.sideDishCount > 0 && (
                                <span className="badge badge-xs badge-outline">เคียง {entry.sideDishCount}</span>
                              )}
                              {/* ถ้าทั้งคู่เป็น 0 ให้แสดงข้อความสวยๆ แทน */}
                              {entry.mainDishCount === 0 && entry.sideDishCount === 0 && (
                                <span className="badge badge-xs badge-ghost text-base-content/40">
                                  ยังไม่มีข้อมูลอาหาร
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* ปุ่มดูรายละเอียดอาหาร */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            {
                              console.log('Scoreboard - entry data:', entry);
                              handleShowMeals({
                                email: entry.userId,
                                name: entry.userName,
                                score: entry.currentScore,
                                meals: entry.mealBreakdown || {}
                              });
                            }
                          }}
                          className="btn btn-xs btn-outline btn-primary cursor-pointer"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          ดูอาหาร
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={showModal}
        onClose={handleCloseModal}
        userEmail={selectedUser?.email}
        userName={selectedUser?.name}
        userScore={selectedUser?.score}
        userMeals={selectedUser?.meals}
      />
    </div>
  )
}
