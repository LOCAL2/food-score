'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'เกิดข้อผิดพลาดในการตั้งค่าระบบ'
      case 'AccessDenied':
        return 'การเข้าถึงถูกปฏิเสธ'
      case 'Verification':
        return 'ไม่สามารถยืนยันตัวตนได้'
      default:
        return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4" data-theme="cupcake">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border-2 border-error/20">
        <div className="card-body text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-4">❌</div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-error mb-2">
            เกิดข้อผิดพลาด
          </h1>
          
          {/* Error Message */}
          <p className="text-base-content/70 mb-6">
            {getErrorMessage(error)}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/signin" className="btn btn-primary w-full">
              ลองเข้าสู่ระบบอีกครั้ง
            </Link>
            <Link href="/" className="btn btn-ghost w-full">
              กลับหน้าหลัก
            </Link>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-3 bg-base-200 rounded text-xs text-left">
              <strong>Debug Info:</strong><br />
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
