-- อัพเดท Scoreboard ให้ใช้คะแนนล่าสุดในการจัดอันดับ

-- 1. เพิ่มคอลัมน์ current_score ถ้ายังไม่มี
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;

-- 2. อัพเดทข้อมูลเดิมให้ current_score = highest_score
UPDATE public.scoreboard 
SET current_score = highest_score 
WHERE current_score IS NULL OR current_score = 0;

-- 3. ตรวจสอบข้อมูลปัจจุบัน
SELECT user_id, user_name, highest_score, current_score, achieved_at
FROM public.scoreboard 
ORDER BY current_score DESC; -- เรียงตามคะแนนล่าสุด

-- 4. ทดสอบ: อัพเดทคะแนนล่าสุดของคุณเป็น 100
UPDATE public.scoreboard 
SET 
    current_score = 100,
    achieved_at = NOW()
WHERE user_id = '1195754440955793442';

-- 5. ตรวจสอบผลลัพธ์หลังอัพเดท
SELECT 
    user_id, 
    user_name, 
    highest_score as "คะแนนสูงสุด", 
    current_score as "คะแนนล่าสุด", 
    achieved_at,
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as "อันดับใหม่"
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 6. ถ้าต้องการรีเซ็ตข้อมูลทั้งหมด (ใช้เมื่อจำเป็น)
-- DELETE FROM public.scoreboard;
