import mongoose from 'mongoose'

const ScoreboardSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    default: null
  },
  highestScore: {
    type: Number,
    required: true,
    min: 0
  },
  achievedAt: {
    type: Date,
    default: Date.now
  },
  mainDishCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sideDishCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // เพิ่มฟิลด์สำหรับ tracking การอัพเดท
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // จะเพิ่ม createdAt และ updatedAt อัตโนมัติ
  collection: 'scoreboard'
})

// Index สำหรับการเรียงลำดับตามคะแนน
ScoreboardSchema.index({ highestScore: -1 })

// Middleware สำหรับอัพเดท updatedAt ก่อนบันทึก
ScoreboardSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Static method สำหรับหา leaderboard
ScoreboardSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({})
    .sort({ highestScore: -1, achievedAt: 1 }) // เรียงตามคะแนนสูงสุด แล้วตามเวลา
    .limit(limit)
    .lean() // ใช้ lean() เพื่อประสิทธิภาพที่ดีกว่า
}

// Static method สำหรับอัพเดทคะแนน
ScoreboardSchema.statics.updateScore = async function(userData) {
  const { userId, userName, userImage, score, mainDishCount, sideDishCount } = userData
  
  const existingRecord = await this.findOne({ userId })
  
  if (!existingRecord || score > existingRecord.highestScore) {
    const updateData = {
      userName,
      userImage,
      highestScore: score,
      achievedAt: new Date(),
      mainDishCount,
      sideDishCount,
      updatedAt: new Date()
    }
    
    const result = await this.findOneAndUpdate(
      { userId },
      updateData,
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )
    
    return { 
      success: true, 
      isNewRecord: !existingRecord || score > existingRecord.highestScore,
      data: result 
    }
  }
  
  return { 
    success: true, 
    isNewRecord: false,
    data: existingRecord 
  }
}

export default mongoose.models.Scoreboard || mongoose.model('Scoreboard', ScoreboardSchema)
