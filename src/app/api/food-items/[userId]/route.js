import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const userId = resolvedParams.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching food items for user:', userId)

    // ดึงข้อมูลล่าสุดจาก food_items table
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('*')
      .or(`user_email.eq.${userId},user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50) // จำกัดแค่ 50 รายการล่าสุด

    if (foodError) {
      console.error('Error fetching food items:', foodError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch food items' },
        { status: 500 }
      )
    }

    if (!foodItems || foodItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          userName: 'ผู้ใช้ไม่ระบุชื่อ',
          totalScore: 0,
          meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            midnight: []
          }
        }
      })
    }

    // จัดกลุ่มอาหารตามมื้อ
    const meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      midnight: []
    }

    let totalScore = 0
    let userName = 'ผู้ใช้ไม่ระบุชื่อ'

    // ใช้ข้อมูลจากรายการล่าสุด
    const latestRecord = foodItems[0]
    if (latestRecord) {
      userName = latestRecord.user_name || 'ผู้ใช้ไม่ระบุชื่อ'
    }

    // รวบรวมข้อมูลอาหารจากทุกรายการ
    foodItems.forEach(item => {
      if (item.meal_type && meals[item.meal_type]) {
        meals[item.meal_type].push({
          name: item.food_name,
          amount: item.amount || 1,
          score: item.total_score || (item.amount || 1) * 2
        })
        totalScore += item.total_score || (item.amount || 1) * 2
      }
    })

    // ลบรายการที่ซ้ำกัน (เก็บแค่รายการล่าสุด)
    Object.keys(meals).forEach(mealType => {
      const uniqueItems = []
      const seenNames = new Set()
      
      meals[mealType].forEach(item => {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name)
          uniqueItems.push(item)
        }
      })
      
      meals[mealType] = uniqueItems
    })

    // คำนวณคะแนนรวมใหม่
    totalScore = 0
    Object.values(meals).forEach(mealItems => {
      mealItems.forEach(item => {
        totalScore += item.score
      })
    })

    const result = {
      success: true,
      data: {
        userName,
        totalScore,
        meals
      }
    }

    console.log('Food items result:', {
      userName,
      totalScore,
      mealCounts: {
        breakfast: meals.breakfast.length,
        lunch: meals.lunch.length,
        dinner: meals.dinner.length,
        midnight: meals.midnight.length
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in food-items API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
