import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// สร้าง Supabase client (ถ้ามี credentials)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ฟังก์ชันตรวจสอบการเชื่อมต่อ
export const checkSupabaseConnection = async () => {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Using fallback storage.')
    return false
  }

  try {
    const { data, error } = await supabase.from('scoreboard').select('count', { count: 'exact', head: true })
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (ยังไม่ได้สร้าง table)
      console.warn('Supabase connection failed:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.warn('Supabase connection error:', error.message)
    return false
  }
}

// ฟังก์ชันสร้าง table (ถ้ายังไม่มี)
export const initializeScoreboardTable = async () => {
  if (!supabase) {
    console.log('Supabase not available, skipping table initialization')
    return
  }

  try {
    // ลองสร้าง table ผ่าน SQL
    const { error } = await supabase.rpc('create_scoreboard_table')
    if (error) {
      console.log('Table might already exist or need manual creation:', error.message)
    }
  } catch (error) {
    console.log('Table initialization skipped:', error.message)
  }
}
