-- เพิ่ม column high_score ใน scoreboard table
-- รันใน Supabase SQL Editor

-- 1. เพิ่ม column high_score
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS high_score INTEGER DEFAULT 0;

-- 2. เพิ่ม column high_score_achieved_at สำหรับเก็บวันที่ทำคะแนนสูงสุด
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS high_score_achieved_at TIMESTAMPTZ;

-- 3. อัปเดทข้อมูลเดิมให้ high_score = current_score
UPDATE public.scoreboard 
SET high_score = current_score,
    high_score_achieved_at = achieved_at
WHERE high_score = 0 OR high_score IS NULL;

-- 4. สร้าง index สำหรับ high_score
CREATE INDEX IF NOT EXISTS idx_scoreboard_high_score ON public.scoreboard(high_score DESC);

-- 5. เพิ่ม comment
COMMENT ON COLUMN public.scoreboard.high_score IS 'คะแนนสูงสุดที่เคยทำได้';
COMMENT ON COLUMN public.scoreboard.high_score_achieved_at IS 'วันที่ทำคะแนนสูงสุด';

-- 6. ตัวอย่างการ query
-- SELECT user_name, current_score, high_score, high_score_achieved_at 
-- FROM public.scoreboard 
-- ORDER BY high_score DESC;
