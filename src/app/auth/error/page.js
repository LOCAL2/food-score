'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [glitchText, setGlitchText] = useState('ERROR')
  const [shakeIntensity, setShakeIntensity] = useState(0)

  useEffect(() => {
    const glitchChars = ['3RR0R', 'ERR0R', 'ERRØR', 'ĒRR0R', 'ERROR', '€RR0R', 'ƐRR0R']
    let index = 0

    const glitchInterval = setInterval(() => {
      setGlitchText(glitchChars[index % glitchChars.length])
      index++
    }, 150)

    const shakeInterval = setInterval(() => {
      setShakeIntensity(Math.random() * 5)
    }, 100)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(shakeInterval)
    }
  }, [])

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'ระบบพังแล้วครับ! 💥 เซิร์ฟเวอร์กำลังไฟไหม้'
      case 'AccessDenied':
        return 'ห้ามเข้า! 🚫 คุณไม่ใช่คนพิเศษ'
      case 'Verification':
        return 'ไม่รู้จักคุณ! 🤔 คุณใครเหรอ?'
      case 'OAuthCallback':
        return 'Discord โกรธเรา! 😡 มันไม่ยอมคุยด้วย'
      case 'OAuthAccountNotLinked':
        return 'Discord ไม่ยอมเป็นเพื่อน! 💔'
      case 'EmailCreateAccount':
        return 'อีเมลนี้มีปัญหา! 📧💀'
      case 'Callback':
        return 'Discord หายไปไหน? 👻'
      default:
        return 'อะไรก็ไม่รู้ แต่มันพัง! 🔥💀'
    }
  }

  const getErrorEmoji = (error) => {
    switch (error) {
      case 'Configuration': return '⚙️💥'
      case 'AccessDenied': return '🚫🔒'
      case 'Verification': return '❓👤'
      case 'OAuthCallback': return '😡💬'
      case 'OAuthAccountNotLinked': return '💔🔗'
      case 'EmailCreateAccount': return '📧💀'
      case 'Callback': return '👻🔍'
      default: return '💀🔥'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* Glitch Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse delay-300"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-pulse delay-700"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Main Error Card */}
        <div
          className="bg-gradient-to-br from-red-900/80 via-black/90 to-purple-900/80 backdrop-blur-xl rounded-3xl p-8 border border-red-500/30 shadow-2xl text-center relative overflow-hidden group"
          style={{ transform: `translate(${shakeIntensity}px, ${shakeIntensity}px)` }}
        >
          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 animate-spin-slow"></div>
          <div className="absolute inset-1 bg-gradient-to-br from-red-900/90 via-black/95 to-purple-900/90 rounded-3xl"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Glitch Error Title */}
            <div className="mb-8">
              <div className="text-6xl mb-4 animate-bounce">
                {getErrorEmoji(error)}
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 mb-2 font-mono tracking-wider animate-pulse">
                {glitchText}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-purple-500 mx-auto rounded-full animate-pulse"></div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <p className="text-xl text-red-300 font-bold mb-2">
                {getErrorMessage(error)}
              </p>
              <p className="text-gray-400 text-sm">
                Error Code: <span className="text-red-400 font-mono">{error || 'UNKNOWN'}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="w-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 hover:from-red-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-red-500/25 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 group-hover:rotate-12 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="relative z-10">ลองใหม่อีกครั้ง!</span>
              </Link>

              <Link
                href="/"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-gray-500/25 hover:scale-105 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="relative z-10">หนีกลับบ้าน</span>
              </Link>
            </div>

            {/* Fun Footer */}
            <div className="mt-8 pt-6 border-t border-red-500/20">
              <p className="text-gray-500 text-xs">
                💡 <span className="text-red-400">Pro Tip:</span> ลองปิดเปิดใหม่ดู บางทีมันอาจจะหาย 🤷‍♂️
              </p>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-6 p-3 bg-red-900/30 rounded-lg border border-red-500/20 text-xs text-left">
                <strong className="text-red-400">Debug Info:</strong><br />
                <span className="text-gray-300">Error: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating Error Codes */}
        <div className="absolute -top-10 -left-10 text-red-500/20 font-mono text-xs animate-float">
          404 500 403 401
        </div>
        <div className="absolute -bottom-10 -right-10 text-purple-500/20 font-mono text-xs animate-bounce">
          ERROR ERROR ERROR
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center" data-theme="cupcake">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
