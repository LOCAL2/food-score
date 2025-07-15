import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  console.log('=== API /user/[email]/meals called ===')
  try {
    const resolvedParams = await params
    const { email } = resolvedParams
    const decodedEmail = decodeURIComponent(email)
    console.log('Decoded email:', decodedEmail)

    // ดึงข้อมูลคะแนนล่าสุดของผู้ใช้
    const { data: latestScore, error: scoreError } = await supabase
      .from('scoreboard')
      .select('user_name, user_id, user_image, achieved_at, current_score, meal_breakdown')
      .eq('user_id', decodedEmail)
      .single()

    console.log('Latest score data:', latestScore)
    console.log('Score error:', scoreError)

    if (!latestScore) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }

    // จัดรูปแบบข้อมูลอาหาร
    const meals = latestScore.meal_breakdown || {}
    console.log('Meals data:', meals)
    
    // คำนวณคะแนนรวม
    let totalScore = 0
    Object.values(meals).forEach(mealFoods => {
      if (Array.isArray(mealFoods)) {
        mealFoods.forEach(food => {
          totalScore += (food.amount || 1) * 2
        })
      }
    })

    const userMealDetails = {
      userEmail: decodedEmail,
      userName: latestScore.user_name,
      userImage: latestScore.user_image,
      date: latestScore.achieved_at,
      meals: {
        breakfast: meals.breakfast || [],
        lunch: meals.lunch || [],
        dinner: meals.dinner || [],
        midnight: meals.midnight || []
      },
      totalScore: latestScore.current_score || totalScore
    }

    return NextResponse.json(userMealDetails)
  } catch (error) {
    console.error('Error fetching user meal details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
