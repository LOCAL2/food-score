import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  console.log('=== API /user/stats called ===')
  try {
    const { userEmail } = await request.json()
    console.log('Request body userEmail:', userEmail)

    if (!userEmail) {
      console.log('No userEmail provided')
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }
    // หาคะแนนสูงสุด
    const { data: highestScoreData, error: highestError } = await supabase
      .from('scoreboard')
      .select('current_score, achieved_at')
      .eq('user_id', userEmail)
      .order('current_score', { ascending: false })
      .limit(1)

    // นับจำนวนบันทึกทั้งหมด (ใน scoreboard จะมีแค่ 1 record ต่อ user)
    const { count: totalRecords, error: countError } = await supabase
      .from('scoreboard')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userEmail)

    // ดึงข้อมูลล่าสุด (ใน scoreboard จะมีแค่ 1 record)
    const { data: recentData, error: recentError } = await supabase
      .from('scoreboard')
      .select('current_score, achieved_at, meal_breakdown')
      .eq('user_id', userEmail)
      .limit(1)

    // คำนวณคะแนนเฉลี่ย (ใน scoreboard จะเป็นคะแนนเดียว)
    const { data: allScores, error: avgError } = await supabase
      .from('scoreboard')
      .select('current_score')
      .eq('user_id', userEmail)

    const averageScore = allScores?.length > 0
      ? allScores.reduce((sum, record) => sum + (record.current_score || 0), 0) / allScores.length
      : 0

    const highestRecord = highestScoreData?.[0] || null

    // Debug logging
    console.log('User email:', userEmail)
    console.log('Highest score data:', highestScoreData)
    console.log('Highest error:', highestError)
    console.log('Total records:', totalRecords)
    console.log('Recent data:', recentData)
    console.log('All scores:', allScores)

    const stats = {
      highestScore: highestRecord?.current_score || 0,
      highestScoreDate: highestRecord?.achieved_at || null,
      totalRecords: totalRecords || 0,
      averageScore: Math.round(averageScore),
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

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
