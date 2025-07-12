import { NextResponse } from 'next/server'

export async function GET() {
  // ตรวจสอบ environment variables (ไม่แสดงค่าจริงเพื่อความปลอดภัย)
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? '✅ Set' : '❌ Missing',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
  }

  const allSet = Object.values(envCheck).every(status => status.includes('✅'))

  return NextResponse.json({
    status: allSet ? 'All environment variables are set' : 'Some environment variables are missing',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    variables: envCheck,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    recommendations: {
      'If NEXTAUTH_URL is wrong': 'Update to match your domain',
      'If NEXTAUTH_SECRET is missing': 'Generate with: openssl rand -base64 32',
      'If Discord credentials are missing': 'Check Discord Developer Portal',
      'If Supabase credentials are missing': 'Check Supabase Dashboard → Settings → API'
    }
  })
}
