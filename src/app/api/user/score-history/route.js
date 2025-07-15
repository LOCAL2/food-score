import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Fetching score history for user:', session.user.email)

    // ดึงประวัติคะแนนทั้งหมดจาก scoreboard (ถ้ามีหลาย records)
    // หรือจาก food_items เพื่อคำนวณคะแนนเฉลี่ย
    
    // วิธีที่ 1: ดึงจาก food_items (มีประวัติการบันทึกหลายครั้ง)
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('total_score, created_at')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false })

    if (foodError) {
      console.error('Error fetching food items:', foodError)
      // Fallback: ใช้ข้อมูลจาก scoreboard
      const { data: scoreboardData, error: scoreError } = await supabase
        .from('scoreboard')
        .select('current_score, high_score')
        .eq('user_id', session.user.id || session.user.email)
        .single()

      if (scoreError) {
        return NextResponse.json({
          success: true,
          averageScore: 0,
          totalRecords: 0,
          allScores: [],
          source: 'none'
        })
      }

      return NextResponse.json({
        success: true,
        averageScore: scoreboardData.current_score || 0,
        totalRecords: 1,
        allScores: [scoreboardData.current_score || 0],
        highestScore: scoreboardData.high_score || scoreboardData.current_score || 0,
        source: 'scoreboard'
      })
    }

    // คำนวณจาก food_items
    if (!foodItems || foodItems.length === 0) {
      return NextResponse.json({
        success: true,
        averageScore: 0,
        totalRecords: 0,
        allScores: [],
        source: 'food_items_empty'
      })
    }

    // จัดกลุ่มตามวันเพื่อคำนวณคะแนนรายวัน
    const scoresByDate = {}
    
    foodItems.forEach(item => {
      const date = new Date(item.created_at).toDateString()
      if (!scoresByDate[date]) {
        scoresByDate[date] = 0
      }
      scoresByDate[date] += item.total_score || 0
    })

    const dailyScores = Object.values(scoresByDate)
    const totalRecords = dailyScores.length
    const averageScore = totalRecords > 0 
      ? dailyScores.reduce((sum, score) => sum + score, 0) / totalRecords 
      : 0

    console.log('Score calculation:', {
      totalRecords,
      dailyScores: dailyScores.slice(0, 5), // แสดงแค่ 5 วันแรก
      averageScore
    })

    return NextResponse.json({
      success: true,
      averageScore: Math.round(averageScore * 100) / 100, // ปัดเศษ 2 ตำแหน่ง
      totalRecords,
      allScores: dailyScores.sort((a, b) => b - a), // เรียงจากมากไปน้อย
      source: 'food_items'
    })

  } catch (error) {
    console.error('Error in score-history API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
