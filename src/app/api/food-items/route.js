import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// POST - บันทึกรายการอาหาร
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { foodName, amount, mealType } = await request.json()

    // Validate input
    if (!foodName || !amount || !mealType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['breakfast', 'lunch', 'dinner', 'midnight'].includes(mealType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meal type' },
        { status: 400 }
      )
    }

    // บันทึกลง food_items table
    const { data, error } = await supabase
      .from('food_items')
      .insert({
        user_id: session.user.id || session.user.email,
        user_name: session.user.name,
        user_email: session.user.email,
        food_name: foodName,
        amount: parseInt(amount),
        meal_type: mealType,
        score: 2 // คะแนนต่อหน่วย
      })
      .select()

    if (error) {
      console.error('Error inserting food item:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save food item' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Food item saved successfully'
    })

  } catch (error) {
    console.error('Error in food-items API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - ดึงรายการอาหารของผู้ใช้
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') // YYYY-MM-DD format
    const mealType = searchParams.get('mealType')

    let query = supabase
      .from('food_items')
      .select('*')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false })

    // Filter by date if provided
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
    }

    // Filter by meal type if provided
    if (mealType) {
      query = query.eq('meal_type', mealType)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching food items:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch food items' },
        { status: 500 }
      )
    }

    // Group by meal type
    const groupedByMeal = {
      breakfast: [],
      lunch: [],
      dinner: [],
      midnight: []
    }

    data.forEach(item => {
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
        meals: groupedByMeal,
        totals,
        totalScore,
        totalItems: data.length
      }
    })

  } catch (error) {
    console.error('Error in food-items GET API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - ลบรายการอาหารของผู้ใช้ทั้งหมด
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Deleting all food items for user:', session.user.email)

    // ลบข้อมูลทั้งหมดของผู้ใช้
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('user_email', session.user.email)

    if (error) {
      console.error('Error deleting food items:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete food items' },
        { status: 500 }
      )
    }

    console.log('All food items deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'All food items deleted successfully'
    })

  } catch (error) {
    console.error('Error in food-items DELETE API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
