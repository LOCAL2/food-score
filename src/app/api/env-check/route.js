import { NextResponse } from 'next/server'

export async function GET() {
  // ใช้ได้3ใน development เท่านั้น
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const requiredVars = [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET'
  ]

  const missing = []
  const present = []

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  })

  return NextResponse.json({
    missing,
    present,
    status: missing.length === 0 ? 'ok' : 'missing_vars'
  })
}
