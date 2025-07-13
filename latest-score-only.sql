-- อัพเดท Scoreboard ให้เก็บเฉพาะคะแนนล่าสุด

-- 1. เปลี่ยน data type เป็น BIGINT เพื่อรองรับคะแนนสูง
ALTER TABLE public.scoreboard 
ALTER COLUMN highest_score TYPE BIGINT;

ALTER TABLE public.scoreboard 
ALTER COLUMN current_score TYPE BIGINT;

-- 2. ตรวจสอบ data type หลังเปลี่ยน
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scoreboard' 
AND column_name IN ('highest_score', 'current_score');

-- 3. ตรวจสอบข้อมูลปัจจุบัน
SELECT user_id, user_name, highest_score, current_score, achieved_at
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 4. ทดสอบ: บันทึกคะแนนใหม่ (311 พันล้าน)
UPDATE public.scoreboard 
SET 
    highest_score = 311111111110,
    current_score = 311111111110,
    achieved_at = NOW()
WHERE user_id = '1195754440955793442';

-- 5. ตรวจสอบผลลัพธ์
SELECT 
    user_name,
    highest_score as "คะแนน",
    achieved_at as "เวลา",
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as "อันดับ"
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 6. ถ้าต้องการลบข้อมูลทั้งหมดเพื่อเริ่มใหม่
-- DELETE FROM public.scoreboard;
