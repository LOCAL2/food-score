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

    const body = await request.json()
    const { score, meals, selectedMeals, mainDishes, sideDishes } = body

    console.log('=== SCOREBOARD API DEBUG ===')
    console.log('Received score:', score)
    console.log('User ID:', session.user.id || session.user.email)
    console.log('User name:', session.user.name)
    console.log('Received data structure:', { meals, selectedMeals, mainDishes, sideDishes })

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

    // รองรับทั้งโครงสร้างใหม่และเก่า
    let mealBreakdown = {}
    let totalItems = 0

    if (meals && selectedMeals) {
      // โครงสร้างใหม่ - แยกตามมื้อ
      selectedMeals.forEach(mealType => {
        const mealItems = meals.filter(item => item.mealType === mealType) || []
        const validItems = mealItems.filter(item => item && typeof item === 'object' && item.name && typeof item.name === 'string' && item.name.trim())

        mealBreakdown[mealType] = {
          count: validItems.length,
          items: validItems
        }
        totalItems += validItems.length
      })
    } else {
      // โครงสร้างเก่า - backward compatibility
      const validMainDishes = Array.isArray(mainDishes)
        ? mainDishes.filter(d => d && typeof d === 'object' && d.name && typeof d.name === 'string' && d.name.trim())
        : []

      const validSideDishes = Array.isArray(sideDishes)
        ? sideDishes.filter(d => d && typeof d === 'object' && d.name && typeof d.name === 'string' && d.name.trim())
        : []

      // แปลงเป็นรูปแบบใหม่
      if (validMainDishes.length > 0) {
        mealBreakdown.breakfast = {
          count: validMainDishes.length,
          items: validMainDishes
        }
        totalItems += validMainDishes.length
      }

      if (validSideDishes.length > 0) {
        mealBreakdown.lunch = {
          count: validSideDishes.length,
          items: validSideDishes
        }
        totalItems += validSideDishes.length
      }
    }

    console.log('Calling updateScore with:', {
      userId,
      userName,
      userImage,
      score,
      totalItems,
      mealBreakdown
    })

    const result = await updateScore({
      userId,
      userName,
      userImage,
      score,
      totalItems,
      mealBreakdown,
      // เก็บ backward compatibility
      mainDishCount: mealBreakdown.breakfast?.count || 0,
      sideDishCount: mealBreakdown.lunch?.count || 0
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
