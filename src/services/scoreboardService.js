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
        .order('highest_score', { ascending: false })
        .order('achieved_at', { ascending: true })
        .limit(limit)

      if (error) throw error

      // แปลงข้อมูลให้ตรงกับ format เดิม
      const leaderboard = data.map((entry, index) => ({
        userId: entry.user_id,
        userName: entry.user_name,
        userImage: entry.user_image,
        highestScore: entry.highest_score,
        achievedAt: entry.achieved_at,
        mainDishCount: entry.main_dish_count,
        sideDishCount: entry.side_dish_count,
        rank: index + 1,
        level: getScoreLevel(entry.highest_score)
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
    .sort((a, b) => b.highestScore - a.highestScore)
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      level: getScoreLevel(entry.highestScore)
    }))

  return {
    success: true,
    leaderboard: leaderboardData,
    usingFallback: true
  }
}

// บันทึกคะแนน
export const updateScore = async (userData) => {
  const { userId, userName, userImage, score, mainDishCount, sideDishCount } = userData
  const isSupabaseAvailable = await checkSupabaseConnection()
  
  if (isSupabaseAvailable) {
    try {
      // ตรวจสอบคะแนนเดิม
      const { data: existingData, error: selectError } = await supabase
        .from('scoreboard')
        .select('highest_score')
        .eq('user_id', userId)
        .single()

      const isNewRecord = !existingData || score > existingData.highest_score

      if (isNewRecord) {
        // อัพเดทหรือสร้างใหม่
        const { data, error } = await supabase
          .from('scoreboard')
          .upsert({
            user_id: userId,
            user_name: userName,
            user_image: userImage,
            highest_score: score,
            achieved_at: new Date().toISOString(),
            main_dish_count: mainDishCount,
            side_dish_count: sideDishCount
          })
          .select()
          .single()

        if (error) throw error

        return {
          success: true,
          isNewRecord: true,
          data: { highestScore: score }
        }
      } else {
        return {
          success: true,
          isNewRecord: false,
          data: existingData
        }
      }
    } catch (error) {
      console.error('Supabase update error:', error)
      // Fall back to in-memory storage
    }
  }

  // ใช้ fallback storage
  const existingData = fallbackScoreboardData.get(userId)
  
  if (!existingData || score > existingData.highestScore) {
    fallbackScoreboardData.set(userId, {
      userId,
      userName,
      userImage,
      highestScore: score,
      achievedAt: new Date().toISOString(),
      mainDishCount,
      sideDishCount
    })
    
    return {
      success: true,
      isNewRecord: true,
      data: { highestScore: score }
    }
  } else {
    return {
      success: true,
      isNewRecord: false,
      data: existingData
    }
  }
}
