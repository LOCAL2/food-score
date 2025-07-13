import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getLeaderboard, updateScore } from '@/services/scoreboardService'



// GET - ดึงข้อมูล scoreboard
export async function GET() {
  try {
    const result = await getLeaderboard(10)

    return NextResponse.json({
      success: result.success,
      leaderboard: result.leaderboard,
      timestamp: new Date().toISOString(),
      usingFallback: result.usingFallback
    })
  } catch (error) {
    console.error('Error fetching scoreboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scoreboard' },
      { status: 500 }
    )
  }
}

// POST - บันทึกคะแนนใหม่
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { score, mainDishes, sideDishes } = await request.json()

    console.log('=== SCOREBOARD API DEBUG ===')
    console.log('Received score:', score)
    console.log('User ID:', session.user.id || session.user.email)
    console.log('User name:', session.user.name)

    if (typeof score !== 'number' || score < 0) {
      console.log('Invalid score detected:', score)
      return NextResponse.json(
        { success: false, error: 'Invalid score' },
        { status: 400 }
      )
    }

    const userId = session.user.id || session.user.email
    const userName = session.user.name || 'Unknown User'
    const userImage = session.user.image || null

    // ตรวจสอบและกรองข้อมูลให้ปลอดภัย
    const validMainDishes = Array.isArray(mainDishes)
      ? mainDishes.filter(d => d && typeof d === 'object' && d.name && typeof d.name === 'string' && d.name.trim())
      : [];

    const validSideDishes = Array.isArray(sideDishes)
      ? sideDishes.filter(d => d && typeof d === 'object' && d.name && typeof d.name === 'string' && d.name.trim())
      : [];

    console.log('Calling updateScore with:', {
      userId,
      userName,
      userImage,
      score,
      mainDishCount: validMainDishes.length,
      sideDishCount: validSideDishes.length
    })

    const result = await updateScore({
      userId,
      userName,
      userImage,
      score,
      mainDishCount: validMainDishes.length,
      sideDishCount: validSideDishes.length
    })

    console.log('updateScore result:', result)

    if (result.success) {
      const response = {
        success: true,
        message: `Score ${score} recorded successfully!`,
        isNewRecord: result.isNewRecord,
        score,
        currentScore: score, // คะแนนปัจจุบันที่บันทึก
        highestScore: result.data.highestScore, // คะแนนล่าสุด
        timestamp: new Date().toISOString(),
        debug: {
          userId,
          userName,
          scoreReceived: score,
          updateData: result.data.updatedData
        }
      }
      console.log('API Response:', response)
      return NextResponse.json(response)
    } else {
      console.log('updateScore failed:', result)
      throw new Error('Failed to update score')
    }
  } catch (error) {
    console.error('Error saving score:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save score' },
      { status: 500 }
    )
  }
}
