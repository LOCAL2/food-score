-- ตรวจสอบโครงสร้าง table ปัจจุบัน
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scoreboard' 
ORDER BY ordinal_position;

-- เพิ่มคอลัมน์ current_score ถ้ายังไม่มี
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;

-- อัพเดทข้อมูลเดิมให้ current_score = highest_score
UPDATE public.scoreboard 
SET current_score = highest_score 
WHERE current_score IS NULL OR current_score = 0;

-- ตรวจสอบข้อมูลปัจจุบัน
SELECT user_id, user_name, highest_score, current_score, achieved_at
FROM public.scoreboard 
ORDER BY highest_score DESC;

-- ลบข้อมูลทดสอบ (ถ้าต้องการเริ่มใหม่)
-- DELETE FROM public.scoreboard WHERE user_id = 'YOUR_DISCORD_ID_HERE';

-- หรือ reset คะแนนเป็น 0 (ถ้าต้องการทดสอบใหม่)
-- UPDATE public.scoreboard 
-- SET highest_score = 0, current_score = 0 
-- WHERE user_id = 'YOUR_DISCORD_ID_HERE';
