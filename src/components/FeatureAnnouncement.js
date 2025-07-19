'use client'

import { useState, useEffect } from 'react'

export default function FeatureAnnouncement() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dismissChecked, setDismissChecked] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่าเคยกดปุ่ม "ไม่แสดง 24 ชั่วโมง" หรือไม่
    const hiddenUntil = localStorage.getItem('featureAnnouncementHiddenUntil')
    const now = new Date().getTime()
    
    if (!hiddenUntil || now > parseInt(hiddenUntil)) {
      setIsVisible(true)
    }
    
    setIsLoading(false)
  }, [])

  const handleDismiss24Hours = () => {
    if (dismissChecked) {
      const now = new Date().getTime()
      const twentyFourHours = 24 * 60 * 60 * 1000 // 24 ชั่วโมงในมิลลิวินาที
      const hiddenUntil = now + twentyFourHours
      
      localStorage.setItem('featureAnnouncementHiddenUntil', hiddenUntil.toString())
    }
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (isLoading || !isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      {/* Main content */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse"></div>
        
        {/* Main card */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl animate-slide-in">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-20 blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl opacity-10"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-3xl mb-2">NEW FEATURE</h3>
                  <p className="text-cyan-200 text-xl font-medium">Google Authentication</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <p className="text-white/90 text-lg leading-relaxed mb-6 text-center max-w-2xl mx-auto"> 
                เข้าสู่ระบบได้ง่ายขึ้นด้วย Google Account ของคุณ
              </p>
              
              {/* Feature highlights with modern design */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mx-auto mb-3"></div>
                  <span className="text-white/80 text-sm">เข้าสู่ระบบด้วย Google Account</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mx-auto mb-3"></div>
                  <span className="text-white/80 text-sm">เลือกลงชื่อเข้าใช้ทั้ง Google และ Discord</span>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mx-auto mb-3"></div>
                  <span className="text-white/80 text-sm">ความปลอดภัยระดับสูง</span>
                </div>
              </div>
            </div>

            {/* Checkbox and buttons */}
            <div className="flex flex-col items-center gap-6">
              {/* Checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="dismiss24h"
                  checked={dismissChecked}
                  onChange={(e) => setDismissChecked(e.target.checked)}
                  className="w-5 h-5 text-cyan-500 bg-white/10 border-white/30 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <label htmlFor="dismiss24h" className="text-white/80 text-sm cursor-pointer">
                  ไม่แสดงอีก 24 ชั่วโมง
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleDismiss24Hours}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>เข้าใจแล้ว</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-white/70 hover:text-white transition-all duration-300 border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>


          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  )
} 