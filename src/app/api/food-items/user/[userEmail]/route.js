import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - ดึงรายการอาหารของผู้ใช้คนอื่น (public)
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { userEmail } = resolvedParams
    const decodedEmail = decodeURIComponent(userEmail)

    console.log('Fetching food items for user:', decodedEmail)

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    const limit = parseInt(searchParams.get('limit')) || 50

    // ตรวจสอบว่าเป็น email หรือ user_id
    const isEmail = decodedEmail.includes('@')

    let query = supabase
      .from('food_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // ใช้ field ที่เหมาะสม
    if (isEmail) {
      query = query.eq('user_email', decodedEmail)
    } else {
      query = query.eq('user_id', decodedEmail)
    }

    console.log('Query type:', isEmail ? 'email' : 'user_id')
    console.log('Query field:', isEmail ? 'user_email' : 'user_id')
    console.log('Query value:', decodedEmail)

    // Filter by date if provided (default to today)
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
    } else {
      // ไม่ filter วันที่ - ดึงข้อมูลล่าสุด
      console.log('No date filter - getting latest data')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching food items:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch food items',
          details: error.message,
          supabaseError: error
        },
        { status: 500 }
      )
    }

    console.log('Found food items:', data?.length || 0)

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userEmail: decodedEmail,
          userName: 'ผู้ใช้ไม่ระบุชื่อ',
          userImage: null,
          date: new Date().toISOString(),
          meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            midnight: []
          },
          totalScore: 0
        }
      })
    }

    // Group by meal type
    const groupedByMeal = {
      breakfast: [],
      lunch: [],
      dinner: [],
      midnight: []
    }

    let userName = 'ผู้ใช้ไม่ระบุชื่อ'

    data.forEach(item => {
      if (item.user_name) {
        userName = item.user_name
      }
      
      if (groupedByMeal[item.meal_type]) {
        groupedByMeal[item.meal_type].push({
          id: item.id,
          name: item.food_name,
          amount: item.amount,
          score: item.total_score,
          createdAt: item.created_at
        })
      }
    })

    // Calculate totals
    const totals = {
      breakfast: groupedByMeal.breakfast.reduce((sum, item) => sum + item.score, 0),
      lunch: groupedByMeal.lunch.reduce((sum, item) => sum + item.score, 0),
      dinner: groupedByMeal.dinner.reduce((sum, item) => sum + item.score, 0),
      midnight: groupedByMeal.midnight.reduce((sum, item) => sum + item.score, 0)
    }

    const totalScore = Object.values(totals).reduce((sum, score) => sum + score, 0)

    return NextResponse.json({
      success: true,
      data: {
        userEmail: decodedEmail,
        userName,
        userImage: null,
        date: data[0]?.created_at || new Date().toISOString(),
        meals: groupedByMeal,
        totals,
        totalScore,
        totalItems: data.length
      }
    })

  } catch (error) {
    console.error('Error in food-items user API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
