'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import Header from '@/components/Header'

export default function SharedMenu({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [menuData, setMenuData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (resolvedParams?.id) {
      // ตรวจสอบว่ามีข้อมูลใน URL parameter หรือไม่
      const urlParams = new URLSearchParams(window.location.search)
      const encodedData = urlParams.get('data')

      if (encodedData) {
        // ใช้ข้อมูลจาก URL parameter
        try {
          const decodedData = JSON.parse(decodeURIComponent(atob(encodedData)))
          setMenuData(decodedData)
          setLoading(false)
        } catch (error) {
          console.error('Error decoding share data:', error)
          // ถ้าไม่สามารถ decode ได้ ให้ดึงจาก database
          fetchMenuData(resolvedParams.id)
        }
      } else {
        // ไม่มีข้อมูลใน URL ให้ดึงจาก database
        fetchMenuData(resolvedParams.id)
      }
    } else {
      setError('ไม่พบ ID ผู้ใช้')
      setLoading(false)
    }
  }, [resolvedParams])

  const fetchMenuData = async (userId) => {
    try {
      const response = await fetch(`/api/food-items/${userId}`)
      const data = await response.json()

      if (data.success) {
        setMenuData(data.data)
      } else {
        setError('ไม่พบข้อมูลเมนูอาหาร')
      }
    } catch (error) {
      console.error('Error fetching menu data:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      midnight: '🌌'
    }
    return icons[mealType] || '🍽️'
  }

  const getMealName = (mealType) => {
    const names = {
      breakfast: 'เช้า',
      lunch: 'กลางวัน',
      dinner: 'เย็น',
      midnight: 'กลางคืน'
    }
    return names[mealType] || mealType
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังโหลดเมนูอาหาร...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">ไม่พบข้อมูล</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">เมนูอาหารที่แชร์</h1>
          <p className="text-gray-400">โดย {menuData?.userName || 'ผู้ใช้ไม่ระบุชื่อ'}</p>
        </div>

        {/* Score Summary */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl p-6 text-center border border-yellow-500/30">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">
              {menuData?.totalScore?.toLocaleString() || 0} คะแนน
            </h2>
            <p className="text-yellow-200">คะแนนรวมทั้งหมด</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['breakfast', 'lunch', 'dinner', 'midnight'].map((mealType) => {
              const mealItems = menuData?.meals?.[mealType] || []
              const mealScore = mealItems.reduce((sum, item) => sum + (item.score || 0), 0)

              return (
                <div key={mealType} className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-600/30">
                  {/* Meal Header */}
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{getMealIcon(mealType)}</div>
                    <h3 className="text-xl font-bold text-white">{getMealName(mealType)}</h3>
                    <p className="text-gray-400 text-sm">
                      {mealItems.length} รายการ • {mealScore.toLocaleString()} คะแนน
                    </p>
                  </div>

                  {/* Food Items */}
                  <div className="space-y-3">
                    {mealItems.length > 0 ? (
                      mealItems.map((item, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-xl p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-gray-400 text-sm">{item.amount} หน่วย</p>
                            </div>
                            <div className="text-right">
                              <p className="text-yellow-400 font-bold">+{item.score || 0}</p>
                              <p className="text-gray-400 text-xs">คะแนน</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p className="text-gray-400">ไม่มีรายการอาหาร</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto mt-8 space-y-4">
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            สร้างเมนูของฉัน
          </button>

          <button
            onClick={() => router.push(`/profile/${resolvedParams.id}`)}
            className="cursor-pointer w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ดูโปรไฟล์
          </button>
        </div>
      </div>
    </div>
  )
}
