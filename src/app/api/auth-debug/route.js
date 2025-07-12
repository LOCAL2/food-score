import { NextResponse } from 'next/server'

export async function GET() {
  // ใช้ได้ใน development เท่านั้น
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const authConfig = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? 'Set' : 'Not set',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? 'Set' : 'Not set',
  }

  const expectedCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/discord`

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    authConfig,
    expectedCallbackUrl,
    troubleshooting: {
      'Check Discord App Settings': 'https://discord.com/developers/applications',
      'Verify Redirect URI': expectedCallbackUrl,
      'Required Scopes': ['identify', 'email']
    }
  })
}
