-- แก้ไข Integer Overflow ใน Supabase
-- เปลี่ยน INTEGER เป็น BIGINT เพื่อรองรับคะแนนสูงมาก

-- 1. ตรวจสอบ data type ปัจจุบัน
SELECT column_name, data_type, numeric_precision 
FROM information_schema.columns 
WHERE table_name = 'scoreboard' 
AND column_name IN ('highest_score', 'current_score');

-- 2. เปลี่ยน data type เป็น BIGINT
ALTER TABLE public.scoreboard 
ALTER COLUMN highest_score TYPE BIGINT;

ALTER TABLE public.scoreboard 
ALTER COLUMN current_score TYPE BIGINT;

-- 3. ตรวจสอบ data type หลังเปลี่ยน
SELECT column_name, data_type, numeric_precision 
FROM information_schema.columns 
WHERE table_name = 'scoreboard' 
AND column_name IN ('highest_score', 'current_score');

-- 4. ทดสอบ update คะแนนสูง
UPDATE public.scoreboard 
SET 
    current_score = 311111111110,
    highest_score = 311111111110,
    achieved_at = NOW()
WHERE user_id = '1195754440955793442';

-- 5. ตรวจสอบผลลัพธ์
SELECT 
    user_name,
    highest_score,
    current_score,
    achieved_at
FROM public.scoreboard 
WHERE user_id = '1195754440955793442';

-- 6. ตรวจสอบ leaderboard
SELECT 
    user_name,
    current_score,
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as rank
FROM public.scoreboard 
ORDER BY current_score DESC;
