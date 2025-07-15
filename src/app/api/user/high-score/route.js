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

    console.log('Fetching high score for user:', session.user.email)

    // ดึง high_score จาก scoreboard
    const { data, error } = await supabase
      .from('scoreboard')
      .select('high_score, high_score_achieved_at, current_score')
      .eq('user_id', session.user.id || session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching high score:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch high score' },
        { status: 500 }
      )
    }

    const result = {
      success: true,
      highScore: data?.high_score || 0,
      highScoreAchievedAt: data?.high_score_achieved_at || null,
      currentScore: data?.current_score || 0,
      hasData: !!data
    }

    console.log('High score result:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in high-score API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
