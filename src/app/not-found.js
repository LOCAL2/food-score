import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4" data-theme="cupcake">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border-2 border-error/20">
        <div className="card-body text-center">
          {/* Error Icon */}
          <div className="text-6xl mb-4">🍽️</div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-error mb-2">
            404 - ไม่พบหน้าที่ต้องการ
          </h1>
          
          {/* Message */}
          <p className="text-base-content/70 mb-6">
            หน้าที่คุณกำลังมองหาไม่มีอยู่ หรืออาจถูกย้ายไปแล้ว
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/" className="btn btn-primary w-full">
              🏠 กลับหน้าหลัก
            </Link>
            <Link href="/scoreboard" className="btn btn-ghost w-full">
              🏆 ดู Scoreboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
