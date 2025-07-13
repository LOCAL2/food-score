-- ตรวจสอบโครงสร้าง table scoreboard
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scoreboard' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ตรวจสอบข้อมูลปัจจุบัน
SELECT * FROM public.scoreboard 
WHERE user_id = '1195754440955793442';

-- เพิ่มคอลัมน์ current_score ถ้ายังไม่มี
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;

-- อัพเดทข้อมูลเดิม
UPDATE public.scoreboard 
SET current_score = highest_score 
WHERE current_score IS NULL OR current_score = 0;

-- ตรวจสอบอีกครั้งหลังอัพเดท
SELECT * FROM public.scoreboard 
WHERE user_id = '1195754440955793442';

-- ทดสอบ manual update
UPDATE public.scoreboard 
SET 
    current_score = 25000,
    highest_score = 25000,
    achieved_at = NOW()
WHERE user_id = '1195754440955793442';

-- ตรวจสอบผลลัพธ์
SELECT 
    user_name,
    highest_score,
    current_score,
    achieved_at,
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as rank
FROM public.scoreboard 
ORDER BY current_score DESC;
