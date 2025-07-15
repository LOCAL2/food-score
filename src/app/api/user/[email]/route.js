import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { email } = resolvedParams
    const decodedEmail = decodeURIComponent(email)

    // ดึงข้อมูลผู้ใช้จาก scoreboard table
    const { data: scoreRecord, error: scoreError } = await supabase
      .from('scoreboard')
      .select('user_name, user_id, user_image')
      .eq('user_id', decodedEmail)
      .limit(1)
      .single()

    if (!scoreRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userInfo = {
      email: decodedEmail,
      name: scoreRecord.user_name || 'ผู้ใช้ไม่ระบุชื่อ',
      image: scoreRecord.user_image || null
    }

    // ดึงข้อมูลสถิติของผู้ใช้
    const { data: userData, error: userError } = await supabase
      .from('scoreboard')
      .select('current_score, high_score, high_score_achieved_at, achieved_at, meal_breakdown')
      .eq('user_id', decodedEmail)
      .single()

    // ดึงประวัติคะแนนจาก food_items เพื่อคำนวณคะแนนเฉลี่ย
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('total_score, created_at')
      .eq('user_email', decodedEmail)
      .order('created_at', { ascending: false })

    let averageScore = 0
    let totalRecords = 0
    let recentData = userData ? [userData] : []

    if (foodItems && foodItems.length > 0) {
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
      totalRecords = dailyScores.length
      averageScore = totalRecords > 0
        ? dailyScores.reduce((sum, score) => sum + score, 0) / totalRecords
        : 0

      console.log('Calculated average from food_items:', { totalRecords, averageScore })
    } else {
      // Fallback: ใช้ข้อมูลจาก scoreboard
      totalRecords = userData ? 1 : 0
      averageScore = userData?.current_score || 0
      console.log('Using scoreboard data for average:', { totalRecords, averageScore })
    }

    // Debug log
    console.log('User data from database:', {
      current_score: userData?.current_score,
      high_score: userData?.high_score,
      high_score_achieved_at: userData?.high_score_achieved_at,
      achieved_at: userData?.achieved_at
    })

    const userProfile = {
      user: {
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.image
      },
      stats: {
        highestScore: userData?.high_score || userData?.current_score || 0,
        highestScoreDate: userData?.high_score_achieved_at || userData?.achieved_at || null,
        currentScore: userData?.current_score || 0,
        totalRecords: totalRecords || 0,
        averageScore: Math.round(averageScore * 100) / 100, // ปัดเศษ 2 ตำแหน่ง
        recentActivity: (recentData || []).map(record => ({
          score: record.current_score,
          date: record.achieved_at,
          meals: record.meal_breakdown || {
            breakfast: [],
            lunch: [],
            dinner: [],
            midnight: []
          }
        }))
      }
    }

    console.log('Final userProfile stats:', userProfile.stats)

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
