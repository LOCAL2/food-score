'use client'

import { useEffect, useState } from 'react'

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState(null)

  useEffect(() => {
    // ตรวจสอบ environment variables ผ่าน API
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/env-check')
        const data = await response.json()
        setEnvStatus(data)
      } catch (error) {
        console.error('Error checking environment:', error)
      }
    }

    if (process.env.NODE_ENV === 'development') {
      checkEnv()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development' || !envStatus) {
    return null
  }

  const missingVars = envStatus.missing || []

  if (missingVars.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="alert alert-warning shadow-lg max-w-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h3 className="font-bold">Environment Variables Missing!</h3>
          <div className="text-xs">
            Missing: {missingVars.join(', ')}
          </div>
        </div>
      </div>
    </div>
  )
}
