import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

// ใช้ in-memory storage เป็น fallback เมื่อไม่มี MongoDB
const fallbackScoreboardData = new Map()

// Dynamic import สำหรับ Scoreboard model
let Scoreboard = null
try {
  Scoreboard = require('@/models/Scoreboard').default
} catch (error) {
  console.warn('Scoreboard model not available, using fallback storage')
}

// ฟังก์ชันหาระดับจากคะแนน
const getScoreLevel = (score) => {
  const SCORE_LEVELS = [
    { maxScore: 4, name: "Normal", emoji: "😊", color: "#96ceb4" },
    { maxScore: 7, name: "Big", emoji: "😋", color: "#feca57" },
    { maxScore: 10, name: "Very Big", emoji: "🤤", color: "#ff6b6b" },
    { maxScore: 13, name: "Very Very Big", emoji: "😵", color: "#ff9ff3" },
    { maxScore: 16, name: "Double Very Big", emoji: "🤯", color: "#a55eea" },
    { maxScore: 19, name: "Triple Very Big", emoji: "💀", color: "#26de81" },
    { maxScore: 24, name: "Double Double Very Big", emoji: "👻", color: "#fd79a8" },
    { maxScore: Infinity, name: "Elephant Food", emoji: "🐘", color: "#6c5ce7" }
  ]
  
  return SCORE_LEVELS.find(level => score <= level.maxScore) || SCORE_LEVELS[SCORE_LEVELS.length - 1]
}

// GET - ดึงข้อมูล scoreboard
export async function GET() {
  try {
    const dbConnection = await connectDB()

    let leaderboardData = []

    if (dbConnection && Scoreboard) {
      // ใช้ MongoDB ถ้ามี
      leaderboardData = await Scoreboard.getLeaderboard(10)
    } else {
      // ใช้ fallback storage
      leaderboardData = Array.from(fallbackScoreboardData.values())
        .sort((a, b) => b.highestScore - a.highestScore)
        .slice(0, 10)
    }

    // เพิ่ม rank และ level
    const leaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      level: getScoreLevel(entry.highestScore)
    }))

    return NextResponse.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString(),
      usingFallback: !dbConnection || !Scoreboard
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
    const dbConnection = await connectDB()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { score, mainDishes, sideDishes } = await request.json()

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid score' },
        { status: 400 }
      )
    }

    const userId = session.user.id || session.user.email
    const userName = session.user.name || 'Unknown User'
    const userImage = session.user.image || null

    let result

    if (dbConnection && Scoreboard) {
      // ใช้ MongoDB
      result = await Scoreboard.updateScore({
        userId,
        userName,
        userImage,
        score,
        mainDishCount: mainDishes?.filter(d => d.name?.trim()).length || 0,
        sideDishCount: sideDishes?.filter(d => d.name?.trim()).length || 0
      })
    } else {
      // ใช้ fallback storage
      const existingData = fallbackScoreboardData.get(userId)

      if (!existingData || score > existingData.highestScore) {
        fallbackScoreboardData.set(userId, {
          userId,
          userName,
          userImage,
          highestScore: score,
          achievedAt: new Date().toISOString(),
          mainDishCount: mainDishes?.filter(d => d.name?.trim()).length || 0,
          sideDishCount: sideDishes?.filter(d => d.name?.trim()).length || 0
        })

        result = {
          success: true,
          isNewRecord: true,
          data: { highestScore: score }
        }
      } else {
        result = {
          success: true,
          isNewRecord: false,
          data: existingData
        }
      }
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.isNewRecord ? 'New high score recorded!' : 'Score recorded',
        isNewRecord: result.isNewRecord,
        score,
        highestScore: result.data.highestScore,
        level: getScoreLevel(score),
        timestamp: new Date().toISOString(),
        usingFallback: !dbConnection || !Scoreboard
      })
    } else {
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
