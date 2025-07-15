'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function UserProfile({ params }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Unwrap params using React.use()
  const resolvedParams = use(params)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user && resolvedParams?.email) {
      fetchUserProfile()
    }
  }, [session, status, router, resolvedParams])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${encodeURIComponent(resolvedParams.email)}`)
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      } else if (response.status === 404) {
        setError('ไม่พบผู้ใช้นี้')
      } else {
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="btn btn-outline btn-sm cursor-pointer"
          >
            กลับ
          </button>
        </div>
      </div>
    )
  }

  if (!session?.user || !userProfile) {
    return null
  }

  const isOwnProfile = session.user.email === resolvedParams.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            กลับ
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">
            {isOwnProfile ? 'โปรไฟล์ของฉัน' : `โปรไฟล์ของ ${userProfile.user.name}`}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  {userProfile.user.image ? (
                    <img
                      src={userProfile.user.image}
                      alt="Profile"
                      className="w-full h-full rounded-full border-4 border-green-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-4 border-green-500">
                      <span className="text-white text-2xl font-bold">
                        {userProfile.user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-3">{userProfile.user.name}</h2>

                {/* User Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-center p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-white text-sm font-mono">{userProfile.user.email}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Highest Score */}
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">คะแนนสูงสุด</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {userProfile.stats.highestScore?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              {/* Total Records */}
              <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-xs mb-1">อัปเดทล่าสุด</p>
                  <p className="text-lg font-bold text-blue-400">
                    {userProfile.stats.lastUpdated ?
                      new Date(userProfile.stats.lastUpdated).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'ยังไม่มีข้อมูล'
                    }
                  </p>
                </div>
              </div>


            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-600/30">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                กิจกรรมล่าสุด
              </h3>

              {userProfile.stats.recentActivity?.length > 0 ? (
                <div className="space-y-3">
                  {userProfile.stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-medium">
                          บันทึกคะแนน {activity.score?.toLocaleString()} คะแนน
                        </p>
                        <p className="text-slate-400 text-xs">
                          {new Date(activity.date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-green-400 font-semibold">
                        +{activity.score?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400">ยังไม่มีกิจกรรม</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
