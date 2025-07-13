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
        .order('current_score', { ascending: false }) // เรียงตาม current_score
        .order('achieved_at', { ascending: true }) // ถ้าคะแนนเท่ากัน เรียงตามเวลา
        .limit(limit)

      if (error) throw error

      // แปลงข้อมูลให้ตรงกับ format เดิม
      const leaderboard = data.map((entry, index) => ({
        userId: entry.user_id,
        userName: entry.user_name,
        userImage: entry.user_image,
        highestScore: entry.current_score, // ใช้ current_score เป็นคะแนนล่าสุด
        achievedAt: entry.achieved_at,
        mainDishCount: entry.main_dish_count,
        sideDishCount: entry.side_dish_count,
        rank: index + 1,
        level: getScoreLevel(entry.current_score) // ใช้ current_score สำหรับ level
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
    .sort((a, b) => b.currentScore - a.currentScore) // เรียงตาม currentScore
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      highestScore: entry.currentScore, // แสดง currentScore
      rank: index + 1,
      level: getScoreLevel(entry.currentScore) // ใช้ currentScore สำหรับ level
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

      // ลองอัพเดทก่อน ถ้าไม่มีค่อย insert
      const { data: updateResult, error: updateError } = await supabase
        .from('scoreboard')
        .update({
          user_name: userName,
          user_image: userImage,
          current_score: score,
          achieved_at: new Date().toISOString(),
          main_dish_count: mainDishCount,
          side_dish_count: sideDishCount
        })
        .eq('user_id', userId)
        .select()

      console.log('Update result:', updateResult)
      console.log('Update error:', updateError)

      let finalData = updateResult

      // ถ้าไม่มีข้อมูลเดิม ให้ insert ใหม่
      if (!updateResult || updateResult.length === 0) {
        console.log('No existing record, inserting new one')
        const { data: insertResult, error: insertError } = await supabase
          .from('scoreboard')
          .insert({
            user_id: userId,
            user_name: userName,
            user_image: userImage,
            current_score: score,
            achieved_at: new Date().toISOString(),
            main_dish_count: mainDishCount,
            side_dish_count: sideDishCount
          })
          .select()

        console.log('Insert result:', insertResult)
        console.log('Insert error:', insertError)

        if (insertError) throw insertError
        finalData = insertResult
      }

      if (updateError && !finalData) throw updateError

      console.log('Final data:', finalData)

      return {
        success: true,
        isNewRecord: true, // ถือว่าเป็น record ใหม่ทุกครั้ง
        data: {
          highestScore: score, // คะแนนล่าสุด (สำหรับ API response)
          currentScore: score, // คะแนนล่าสุด
          updatedData: finalData
        }
      }
    } catch (error) {
      console.error('Supabase update error:', error)
      // Fall back to in-memory storage
    }
  }

  // ใช้ fallback storage
  // บันทึกคะแนนล่าสุดใน currentScore
  fallbackScoreboardData.set(userId, {
    userId,
    userName,
    userImage,
    currentScore: score, // บันทึกคะแนนล่าสุดใน currentScore
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
