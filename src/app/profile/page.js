'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [highScore, setHighScore] = useState(0)
  const [highScoreDate, setHighScoreDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user) {
      fetchHighScore()
    }
  }, [session, status, router])

  const fetchHighScore = async () => {
    try {
      const response = await fetch('/api/user/high-score')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setHighScore(data.highScore)
          setHighScoreDate(data.highScoreAchievedAt)
        }
      }
    } catch (error) {
      console.error('Error fetching high score:', error)
    } finally {
      setLoading(false)
    }
  }



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">โปรไฟล์ของฉัน</h1>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-600/40 shadow-2xl relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-500/10 rounded-full blur-2xl animate-pulse"></div>

            {/* Content */}
            <div className="relative z-10">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-xl">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                {/* Online Status */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-slate-800 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">{session.user.name}</h2>
                <p className="text-slate-400 text-lg mb-3">{session.user.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    ผู้เข้าแข่งขันความหยั่ย
                  </div>
                </div>
              </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* High Score */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 text-center border border-yellow-500/30">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">คะแนนสูงสุด</h3>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-slate-600 rounded mb-1"></div>
                    <div className="h-3 bg-slate-700 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-yellow-400 text-xl font-bold">
                      {highScore.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {highScoreDate ? new Date(highScoreDate).toLocaleDateString('th-TH') : 'ยังไม่มีข้อมูล'}
                    </p>
                  </>
                )}
              </div>

              {/* Join Date */}
              <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">เข้าร่วมเมื่อ</h3>
                <p className="text-slate-400 text-sm">
                  {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Account Type */}
              <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">ประเภทบัญชี</h3>
                <p className="text-slate-400 text-sm">ผู้ใช้ทั่วไป</p>
              </div>

              {/* Status */}
              <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">สถานะ</h3>
                <p className="text-green-400 text-sm font-medium">ใช้งานปกติ</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                กลับหน้าหลัก
              </button>

              <button
                onClick={() => window.location.href = '/scoreboard'}
                className="cursor-pointer flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ดู Scoreboard
              </button>

              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="cursor-pointer flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                ออกจากระบบ
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
