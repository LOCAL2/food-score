'use client'

import { useState, useEffect } from 'react'

export default function UserDetailModal({ isOpen, onClose, userEmail, userName, userScore, userMeals }) {
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && userEmail) {
      console.log('UserDetailModal - data received:', { userEmail, userName, userScore, userMeals })

      // Reset ข้อมูลเก่าก่อน
      setUserDetails(null)
      setLoading(true)
      setError(null)

      // เรียก API เสมอเพื่อดึงข้อมูลล่าสุด
      console.log('Always fetching from API for latest data')

      // เพิ่ม delay เล็กน้อยเพื่อให้ database อัปเดต
      setTimeout(() => {
        fetchUserDetails()
      }, 100)
    }
  }, [isOpen, userEmail, userName, userScore, userMeals])

  const fetchUserDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      // ลองดึงจาก food_items API ก่อน (สำหรับข้อมูลใหม่)
      console.log('Trying to fetch from food-items API for:', userEmail)
      const foodItemsResponse = await fetch(`/api/food-items/user/${encodeURIComponent(userEmail)}`)
      console.log('Food items response status:', foodItemsResponse.status)

      if (foodItemsResponse.ok) {
        const foodData = await foodItemsResponse.json()
        console.log('UserDetailModal - food items data:', foodData)

        if (foodData.success && foodData.data) {
          console.log('Using food items data')
          console.log('Meals breakdown:', foodData.data.meals)
          console.log('Total score from API:', foodData.data.totalScore)
          setUserDetails(foodData.data)
          setLoading(false)
          return
        }
      } else {
        console.log('Food items API failed, trying old API')
      }

      // ถ้าไม่มีข้อมูลใน food_items ให้ลองดึงจาก API เก่า
      const response = await fetch(`/api/user/${encodeURIComponent(userEmail)}/meals`)
      if (response.ok) {
        const data = await response.json()
        console.log('UserDetailModal - received data:', data)
        setUserDetails(data)
      } else {
        setError('ไม่สามารถโหลดข้อมูลได้')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast': return '🌅'
      case 'lunch': return '☀️'
      case 'dinner': return '🌙'
      case 'midnight': return '🌌'
      default: return '🍽️'
    }
  }

  const getMealName = (mealType) => {
    switch (mealType) {
      case 'breakfast': return 'เช้า'
      case 'lunch': return 'กลางวัน'
      case 'dinner': return 'เย็น'
      case 'midnight': return 'กลางคืน'
      default: return 'อื่นๆ'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h3 className="text-xl font-bold">{userName}</h3>
            <p className="text-base-content/70 text-sm">
              คะแนน: {userScore?.toLocaleString()} คะแนน
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-base-content/70">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-error">{error}</p>
              <button
                onClick={fetchUserDetails}
                className="btn btn-outline btn-sm mt-4"
              >
                ลองใหม่
              </button>
            </div>
          ) : userDetails ? (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">รายการอาหารที่บันทึก</h4>
                <p className="text-base-content/70 text-sm">
                  {new Date(userDetails.date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Meals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(userDetails.meals || {}).map(([mealType, foods]) => (
                  <div key={mealType} className="bg-base-200/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getMealIcon(mealType)}</span>
                      <h5 className="font-semibold">{getMealName(mealType)}</h5>
                      <span className="text-sm text-base-content/70">
                        ({Array.isArray(foods) ? foods.length : 0} รายการ)
                      </span>
                    </div>
                    
                    {Array.isArray(foods) && foods.length > 0 ? (
                      <div className="space-y-2">
                        {foods.map((food, index) => (
                          <div key={index} className="flex items-center justify-between bg-base-100 rounded-lg p-3">
                            <div>
                              <p className="font-medium">{food.name}</p>
                              <p className="text-sm text-base-content/70">
                                จำนวน: {food.amount} หน่วย
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">
                                +{(food.score || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-base-content/70">คะแนน</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-base-content/50 text-sm">
                          {userDetails?.totalScore > 0
                            ? 'ไม่มีข้อมูลรายละเอียดอาหารในมื้อนี้'
                            : 'ไม่มีอาหารในมื้อนี้'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="text-center">
                  <h5 className="font-semibold mb-2">สรุปคะแนนรวม</h5>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {userDetails.totalScore?.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-base-content/70">คะแนน</p>
                  
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                    {['breakfast', 'lunch', 'dinner', 'midnight'].map((mealType) => {
                      const foods = userDetails.meals?.[mealType] || []
                      // ใช้ food.score ที่คำนวณแล้วจาก API แทนการคำนวณใหม่
                      const score = Array.isArray(foods) ? foods.reduce((sum, food) => sum + (food.score || 0), 0) : 0

                      // Debug log
                      if (mealType === 'midnight' && foods.length > 0) {
                        console.log(`${mealType} foods:`, foods)
                        console.log(`${mealType} calculated score:`, score)
                      }

                      return (
                        <div key={mealType} className="bg-base-100/50 rounded-lg p-2">
                          <div className="text-lg">{getMealIcon(mealType)}</div>
                          <div className="text-sm font-medium">
                            {score.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-base-content/70">ไม่มีข้อมูลอาหาร</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-base-300">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  )
}
