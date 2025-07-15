import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '1195754440955793442'
    
    console.log('=== DEBUG FOOD API ===')
    console.log('User ID:', userId)
    
    // ทดสอบ query แบบง่าย
    const { data, error, count } = await supabase
      .from('food_items')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
    
    console.log('Supabase response:')
    console.log('- Data:', data)
    console.log('- Error:', error)
    console.log('- Count:', count)
    
    return NextResponse.json({
      success: !error,
      userId,
      data: data || [],
      error: error || null,
      count: count || 0,
      message: error ? 'Query failed' : 'Query successful'
    })
    
  } catch (err) {
    console.error('Debug API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack
    })
  }
}
