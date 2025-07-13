import { supabase, checkSupabaseConnection } from '@/lib/supabase'

// Fallback in-memory storage
const fallbackScoreboardData = new Map()

// ฟังก์ชันหาระดับจากคะแนน
const getScoreLevel = (score) => {
  const SCORE_LEVELS = [
    { maxScore: 4, name: "Normal", emoji: "😊", color: "#96ceb4" },
    { maxScore: 7, name: "Big", emoji: "😋", color: "#feca57" },
    { maxScore: 10, name: "Very Big", emoji: "🤤", color: "#ff6b6b" },
    { maxScore: 13, name: "Very Very Big", emoji: "😵", color: "#ff9ff3" },
    { maxScore: 16, name: "Double Very Big", emoji: "🤯", color: "#a55eea" },
    { maxScore: 19, name: "Triple Very Big", emoji: "💀", color: "#26de81" },
    { maxScore: 24, name: "Double Double Very Big", emoji: "👻", color: "#fd79a8" },
    { maxScore: Infinity, name: "Elephant Food", emoji: "🐘", color: "#6c5ce7" }
  ]
  
  return SCORE_LEVELS.find(level => score <= level.maxScore) || SCORE_LEVELS[SCORE_LEVELS.length - 1]
}

// ดึงข้อมูล leaderboard
export const getLeaderboard = async (limit = 10) => {
  const isSupabaseAvailable = await checkSupabaseConnection()
  
  if (isSupabaseAvailable) {
    try {
      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .order('current_score', { ascending: false }) // เรียงตามคะแนนล่าสุด
        .order('achieved_at', { ascending: true }) // ถ้าคะแนนเท่ากัน เรียงตามเวลา
        .limit(limit)

      if (error) throw error

      // แปลงข้อมูลให้ตรงกับ format เดิม
      const leaderboard = data.map((entry, index) => ({
        userId: entry.user_id,
        userName: entry.user_name,
        userImage: entry.user_image,
        highestScore: entry.current_score || entry.highest_score, // คะแนนล่าสุด
        currentScore: entry.current_score || entry.highest_score, // คะแนนล่าสุด
        achievedAt: entry.achieved_at,
        mainDishCount: entry.main_dish_count,
        sideDishCount: entry.side_dish_count,
        rank: index + 1,
        level: getScoreLevel(entry.current_score || entry.highest_score) // ใช้คะแนนล่าสุดสำหรับ level
      }))

      return {
        success: true,
        leaderboard,
        usingFallback: false
      }
    } catch (error) {
      console.error('Supabase query error:', error)
      // Fall back to in-memory storage
    }
  }

  // ใช้ fallback storage
  const leaderboardData = Array.from(fallbackScoreboardData.values())
    .sort((a, b) => (b.currentScore || b.highestScore) - (a.currentScore || a.highestScore)) // เรียงตามคะแนนล่าสุด
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      highestScore: entry.currentScore || entry.highestScore, // คะแนนล่าสุด
      rank: index + 1,
      level: getScoreLevel(entry.currentScore || entry.highestScore) // ใช้คะแนนล่าสุดสำหรับ level
    }))

  return {
    success: true,
    leaderboard: leaderboardData,
    usingFallback: true
  }
}

// บันทึกคะแนน
export const updateScore = async (userData) => {
  // Validate input data
  if (!userData || typeof userData !== 'object') {
    throw new Error('Invalid user data')
  }

  const {
    userId,
    userName = 'Unknown User',
    userImage = null,
    score = 0,
    mainDishCount = 0,
    sideDishCount = 0
  } = userData

  // Validate required fields
  if (!userId || typeof score !== 'number' || score < 0) {
    throw new Error('Invalid user data: missing userId or invalid score')
  }

  const isSupabaseAvailable = await checkSupabaseConnection()
  
  if (isSupabaseAvailable) {
    try {
      console.log('New score:', score)

      // บันทึกคะแนนล่าสุดทุกครั้ง (ไม่เก็บสถิติสูงสุด)
      const updateData = {
        user_id: userId,
        user_name: userName,
        user_image: userImage,
        highest_score: score, // ใช้คะแนนล่าสุด
        current_score: score, // ใช้คะแนนล่าสุด
        achieved_at: new Date().toISOString(), // อัพเดทเวลาทุกครั้ง
        main_dish_count: mainDishCount, // อัพเดทข้อมูลล่าสุด
        side_dish_count: sideDishCount // อัพเดทข้อมูลล่าสุด
      }

      console.log('Update data:', updateData)

      const { data, error } = await supabase
        .from('scoreboard')
        .upsert(updateData)
        .select()
        .single()

      if (error) throw error

      console.log('Supabase update result:', data)

      return {
        success: true,
        isNewRecord: true, // ถือว่าเป็น record ใหม่ทุกครั้ง
        data: {
          highestScore: score, // คะแนนล่าสุด
          currentScore: score, // คะแนนล่าสุด
          updatedData: data
        }
      }
    } catch (error) {
      console.error('Supabase update error:', error)
      // Fall back to in-memory storage
    }
  }

  // ใช้ fallback storage
  // บันทึกคะแนนล่าสุดทุกครั้ง (ไม่เก็บสถิติสูงสุด)
  fallbackScoreboardData.set(userId, {
    userId,
    userName,
    userImage,
    highestScore: score, // คะแนนล่าสุด
    currentScore: score, // คะแนนล่าสุด
    achievedAt: new Date().toISOString(), // อัพเดทเวลาทุกครั้ง
    mainDishCount,
    sideDishCount
  })

  return {
    success: true,
    isNewRecord: true, // ถือว่าเป็น record ใหม่ทุกครั้ง
    data: {
      highestScore: score, // คะแนนล่าสุด
      currentScore: score // คะแนนล่าสุด
    }
  }
}
