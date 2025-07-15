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

    // ใช้ updated_at จาก scoreboard แทน
    const lastUpdated = userData?.achieved_at || null
    console.log('Last updated from scoreboard:', lastUpdated)

    const recentData = userData ? [userData] : []
    const totalRecords = userData ? 1 : 0

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
        lastUpdated: lastUpdated,
        averageScore: userData?.current_score || 0,
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

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
