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

  const handleSignIn = async (provider) => {
    setIsLoading(true)
    try {
      const result = await signIn(provider, {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      {/* Floating dots */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-green-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/20 rounded-full animate-bounce"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main card */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-600/30">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 469.35 469.35" fill="currentColor">
                <path fill="white" d="M11.305,91.198l6.178,6.178c-16.834,44.26-7.519,96.185,28.133,131.837l194.517,194.517 c24.215,24.215,55.957,36.327,87.699,36.327c14.989,0,29.946-2.796,44.138-8.194l6.186,6.186 c17.728,17.728,49.983,14.217,72.044-7.844c22.061-22.061,25.573-54.315,7.844-72.044l-10.421-10.421 c10.884-41.277,0.26-87.049-32.1-119.409L221.006,53.814c-24.215-24.215-55.957-36.327-87.699-36.327 c-10.673,0-21.321,1.488-31.71,4.227L91.184,11.302C73.456-6.427,41.202-2.915,19.141,19.146 C-2.904,41.215-6.424,73.469,11.305,91.198z M327.832,435.67c-26.613,0-51.633-10.364-70.458-29.182L62.856,211.972 c-18.818-18.818-29.182-43.837-29.182-70.458c0-8.47,1.162-16.745,3.203-24.743l315.698,315.698 C344.577,434.508,336.302,435.67,327.832,435.67z M133.315,41.873c26.613,0,51.633,10.364,70.458,29.182L398.29,265.572 c18.818,18.818,29.182,43.837,29.182,70.458c0,3.674-0.244,7.316-0.634,10.917l-304.44-304.44 C125.999,42.117,129.641,41.873,133.315,41.873z M34.813,51.107c5.17-0.658,10.201-1.065,15.103-1.179 c12.412-0.301,23.914,1.227,34.238,4.975c18.265,6.633,32.864,20.232,42.35,43.09c7.657,18.444,4.845,48.804,33.14,54.478 c10.128,2.032,22.947,3.764,31.701,10.031c17.33,12.412,30.588,26.085,34.985,47.796c7.616,37.546,23.207,61.249,62.549,68.979 c16.729,3.284,37.497,6.844,49.666,20.321c14.599,16.176,22.345,35.522,27.857,56.437c7.072,26.816,16.842,35.4,42.041,38.383 c2.65,0.317,5.406,0.585,8.413,0.788c7.763,0.528,11.681,6.836,11.73,12.908c0.041,5.446-3.04,10.681-9.267,11.404 c-0.78,0.089-1.593,0.138-2.471,0.081c-10.746-0.732-20.338-2.008-28.84-4.284c-21.565-5.763-35.985-18.119-43.228-45.601 c-8.511-32.279-18.403-58.282-54.34-65.337c-18.915-3.715-39.407-7.82-54.437-20.939c-18.671-16.306-26.548-33.904-31.409-57.875 c-8.779-43.301-39.846-42.716-73.043-57.176c-24.142-10.518-16.867-35.701-24.678-54.535 C95.932,87.483,81.292,76.566,59.629,74.615c-7.405-0.667-15.631-0.293-24.817,0.878c-2.357,0.301-4.3-0.057-5.934-0.788 C19.694,70.567,21.758,52.782,34.813,51.107z"/>
              </svg>
            </div>

            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-3">
              Food Score
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              คำนวณคะแนนให้กับอาหารที่เรากินในแต่ละวัน
            </p>

            {/* Features */}
            <div className="relative mb-6">
              {/* Header */}
              <div className="text-center mb-4 relative z-10">
                <h3 className="inline-block text-cyan-400 text-sm font-bold bg-slate-800 px-3 py-1">
                  ฟีเจอร์หลัก
                </h3>
              </div>

              {/* Tech frame around features */}
              <div className="relative border border-cyan-400/20 rounded-xl p-4 bg-slate-900/20">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400 rounded-br-lg"></div>

                {/* Connecting line from header */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-cyan-400"></div>

                <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-slate-300 text-xs">บันทึก</p>
                </div>

                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-xs">แชร์</p>
                </div>

                <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-xs">แข่งขัน</p>
                </div>
              </div>
            </div>
          </div>

          {/* Login buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleSignIn('discord')}
              disabled={isLoading}
              className="group cursor-pointer relative w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-slate-300 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                )}
                <span className="text-sm">
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Discord'}
                </span>
              </div>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600/30"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800/90 px-2 text-slate-400">หรือ</span>
              </div>
            </div>

            <button
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
              className="group cursor-pointer relative w-full bg-white hover:bg-gray-50 disabled:bg-slate-300 text-gray-700 font-medium py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:hover:scale-100 disabled:hover:shadow-none border border-gray-200"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="text-sm">
                  {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                </span>
              </div>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
