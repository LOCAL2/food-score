-- ===================================================================
-- Food Score Calculator - Complete Database Reset Script
-- ===================================================================
-- รันใน Supabase SQL Editor เพื่อสร้าง database ใหม่ทั้งหมด

-- 1. ลบ table เดิม (ถ้ามี)
-- ===================================================================
DROP TABLE IF EXISTS public.scoreboard CASCADE;

-- ลบ functions เดิม (ถ้ามี)
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 2. สร้าง table scoreboard ใหม่
-- ===================================================================
CREATE TABLE public.scoreboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    user_image TEXT,
    current_score BIGINT NOT NULL DEFAULT 0,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    main_dish_count INTEGER NOT NULL DEFAULT 0,
    side_dish_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. สร้าง indexes สำหรับ performance
-- ===================================================================
CREATE INDEX idx_scoreboard_current_score ON public.scoreboard(current_score DESC);
CREATE INDEX idx_scoreboard_achieved_at ON public.scoreboard(achieved_at ASC);
CREATE INDEX idx_scoreboard_user_id ON public.scoreboard(user_id);

-- 4. สร้าง function สำหรับ auto-update timestamp
-- ===================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. สร้าง trigger สำหรับ auto-update timestamp
-- ===================================================================
CREATE TRIGGER handle_scoreboard_updated_at
    BEFORE UPDATE ON public.scoreboard
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. เปิดใช้งาน Row Level Security (RLS) - Optional
-- ===================================================================
-- ALTER TABLE public.scoreboard ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (ทุกคนอ่านได้)
-- CREATE POLICY "Anyone can read scoreboard" ON public.scoreboard
--     FOR SELECT USING (true);

-- สร้าง policy สำหรับการเขียนข้อมูล (เฉพาะเจ้าของข้อมูล)
-- CREATE POLICY "Users can insert their own scores" ON public.scoreboard
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update their own scores" ON public.scoreboard
--     FOR UPDATE USING (auth.uid()::text = user_id);

-- 7. เปิดใช้งาน Realtime (Optional)
-- ===================================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.scoreboard;

-- 8. เพิ่มข้อมูลทดสอบ
-- ===================================================================
INSERT INTO public.scoreboard (user_id, user_name, user_image, current_score, main_dish_count, side_dish_count)
VALUES 
    ('demo_user_1', 'Demo Player 1', 'https://via.placeholder.com/40/96ceb4/ffffff?text=D1', 15, 3, 2),
    ('demo_user_2', 'Demo Player 2', 'https://via.placeholder.com/40/feca57/ffffff?text=D2', 8, 2, 1),
    ('demo_user_3', 'Demo Player 3', 'https://via.placeholder.com/40/ff6b6b/ffffff?text=D3', 22, 5, 3),
    ('demo_user_4', 'Demo Player 4', 'https://via.placeholder.com/40/a55eea/ffffff?text=D4', 12, 4, 2),
    ('demo_user_5', 'Demo Player 5', 'https://via.placeholder.com/40/26de81/ffffff?text=D5', 6, 2, 1)
ON CONFLICT (user_id) DO NOTHING;

-- 9. ตรวจสอบผลลัพธ์
-- ===================================================================
-- ตรวจสอบโครงสร้าง table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scoreboard' AND table_schema = 'public'
ORDER BY ordinal_position;

-- ตรวจสอบข้อมูลที่เพิ่ม
SELECT 
    user_id, 
    user_name, 
    current_score, 
    main_dish_count,
    side_dish_count,
    achieved_at,
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as rank
FROM public.scoreboard 
ORDER BY current_score DESC;

-- ตรวจสอบ indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'scoreboard' AND schemaname = 'public';

-- 10. ทดสอบ functions
-- ===================================================================
-- ทดสอบ trigger update timestamp
UPDATE public.scoreboard 
SET current_score = 25 
WHERE user_id = 'demo_user_1';

-- ตรวจสอบว่า updated_at เปลี่ยนแปลง
SELECT user_id, user_name, current_score, updated_at 
FROM public.scoreboard 
WHERE user_id = 'demo_user_1';

-- ===================================================================
-- สำเร็จ! Database พร้อมใช้งาน
-- ===================================================================
-- 
-- ฟีเจอร์ที่ได้:
-- ✅ Table scoreboard ใหม่ (current_score เท่านั้น)
-- ✅ BIGINT รองรับคะแนนสูงมาก (311+ พันล้าน)
-- ✅ Auto-update timestamp
-- ✅ Indexes สำหรับ performance
-- ✅ Demo data สำหรับทดสอบ
-- ✅ Ready for Realtime (แค่ uncomment)
-- ✅ Ready for RLS (แค่ uncomment)
--
-- การใช้งาน:
-- 1. คัดลอก script นี้ทั้งหมด
-- 2. ไปที่ Supabase Dashboard → SQL Editor
-- 3. วาง script และกด Run
-- 4. ตรวจสอบผลลัพธ์ที่ด้านล่าง
-- 5. เสร็จ! พร้อมใช้งาน
--
-- ===================================================================
