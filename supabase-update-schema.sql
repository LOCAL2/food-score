-- เพิ่มคอลัมน์ current_score เพื่อเก็บคะแนนล่าสุด
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS current_score INTEGER DEFAULT 0;

-- อัพเดทข้อมูลเดิมให้ current_score = highest_score
UPDATE public.scoreboard 
SET current_score = highest_score 
WHERE current_score IS NULL OR current_score = 0;

-- เพิ่ม comment อธิบายคอลัมน์
COMMENT ON COLUMN public.scoreboard.highest_score IS 'คะแนนสูงสุดที่เคยทำได้';
COMMENT ON COLUMN public.scoreboard.current_score IS 'คะแนนล่าสุดที่บันทึก';

-- ตรวจสอบข้อมูล
SELECT user_id, user_name, highest_score, current_score, achieved_at
FROM public.scoreboard 
ORDER BY highest_score DESC;
