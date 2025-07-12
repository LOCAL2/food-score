'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'เกิดข้อผิดพลาดในการตั้งค่าระบบ'
      case 'AccessDenied':
        return 'การเข้าถึงถูกปฏิเสธ - คุณอาจยกเลิกการอนุญาต'
      case 'Verification':
        return 'ไม่สามารถยืนยันตัวตนได้'
      case 'OAuthCallback':
        return 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ Discord - กรุณาลองใหม่'
      case 'OAuthAccountNotLinked':
        return 'บัญชี Discord ไม่สามารถเชื่อมโยงได้'
      case 'EmailCreateAccount':
        return 'ไม่สามารถสร้างบัญชีด้วยอีเมลนี้ได้'
      case 'Callback':
        return 'เกิดข้อผิดพลาดในการ callback จาก Discord'
      default:
        return `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error || 'Unknown error'}`
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

          {/* Additional Help for OAuthCallback */}
          {error === 'OAuthCallback' && (
            <div className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20">
              <h4 className="font-semibold text-info mb-2">💡 วิธีแก้ไข:</h4>
              <ul className="text-sm text-base-content/70 space-y-1">
                <li>• ตรวจสอบว่าอนุญาต Discord app ครบถ้วน</li>
                <li>• ลองล้าง cookies และลองใหม่</li>
                <li>• ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</li>
              </ul>
            </div>
          )}

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
