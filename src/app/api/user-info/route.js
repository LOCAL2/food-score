import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      },
      session: session
    })
  } catch (error) {
    console.error('Error getting user info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get user info' },
      { status: 500 }
    )
  }
}
