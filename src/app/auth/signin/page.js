'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ login แล้วหรือไม่
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleDiscordSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('discord', {
        callbackUrl: '/',
        redirect: false
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
        // แสดง error message 3ผู้ใช้
        alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + result.error)
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4" data-theme="cupcake">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border-2 border-primary/20">
        <div className="card-body text-center">
          {/* Logo/Icon */}
          <div className="text-6xl mb-4">🍽️</div>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Food Score Calculator
          </h1>
          <p className="text-base-content/70 mb-8">
            เข้าสู่ระบบเพื่อใช้งานเครื่องคำนวณคะแนนอาหาร
          </p>

          {/* Discord Login Button */}
          <button
            onClick={handleDiscordSignIn}
            disabled={isLoading}
            className="btn btn-primary btn-lg w-full gap-3 text-white"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            )}
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Discord'}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-info/10 rounded-lg border border-info/20">
            <div className="flex items-center gap-2 text-info">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-base-content/70 mt-2">
                การเข้าสู่ระบบจะช่วยให้คุณสามารถบันทึกและแชร์ผลการคำนวณคะแนนอาหารได้ Login เถอะนะบักหยั่ยถือว่าพี่ขอ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
