import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing food_items table...')
    
    // ทดสอบดึงข้อมูลจาก food_items table
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .limit(5)

    console.log('Supabase response:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      message: 'food_items table exists and accessible',
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
