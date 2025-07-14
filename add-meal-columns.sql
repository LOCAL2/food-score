-- เพิ่มคอลัมน์ใหม่สำหรับระบบมื้ออาหาร
-- รันใน Supabase SQL Editor

-- 1. เพิ่มคอลัมน์ total_items สำหรับเก็บจำนวนรายการอาหารทั้งหมด
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0;

-- 2. เพิ่มคอลัมน์ meal_breakdown สำหรับเก็บข้อมูลอาหารแยกตามมื้อ (JSON format)
ALTER TABLE public.scoreboard 
ADD COLUMN IF NOT EXISTS meal_breakdown JSONB;

-- 3. อัพเดทข้อมูลเดิมให้ total_items = main_dish_count + side_dish_count
UPDATE public.scoreboard 
SET total_items = COALESCE(main_dish_count, 0) + COALESCE(side_dish_count, 0)
WHERE total_items = 0 OR total_items IS NULL;

-- 4. สร้าง index สำหรับ total_items เพื่อประสิทธิภาพ
CREATE INDEX IF NOT EXISTS idx_scoreboard_total_items ON public.scoreboard(total_items);

-- 5. เพิ่ม comment อธิบายคอลัมน์ใหม่
COMMENT ON COLUMN public.scoreboard.total_items IS 'จำนวนรายการอาหารทั้งหมด';
COMMENT ON COLUMN public.scoreboard.meal_breakdown IS 'ข้อมูลอาหารแยกตามมื้อ (JSON format)';

-- 6. ตรวจสอบโครงสร้างตารางหลังเพิ่มคอลัมน์
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'scoreboard' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. ตรวจสอบข้อมูลปัจจุบัน
SELECT 
    user_id, 
    user_name, 
    current_score, 
    main_dish_count,
    side_dish_count,
    total_items,
    meal_breakdown,
    achieved_at
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 8. ทดสอบการบันทึกข้อมูลรูปแบบใหม่ (ตัวอย่าง)
-- UPDATE public.scoreboard 
-- SET 
--     total_items = 5,
--     meal_breakdown = '{"breakfast": {"count": 2, "items": [{"name": "ข้าวผัด", "amount": 1}, {"name": "ไข่ดาว", "amount": 1}]}, "lunch": {"count": 3, "items": [{"name": "ส้มตำ", "amount": 1}, {"name": "ข้าวเหนียว", "amount": 2}]}}'::jsonb
-- WHERE user_id = 'demo_user_1';

-- 9. ตรวจสอบการทำงานของ JSONB
-- SELECT 
--     user_name,
--     meal_breakdown,
--     meal_breakdown->'breakfast'->>'count' as breakfast_count,
--     meal_breakdown->'lunch'->>'count' as lunch_count
-- FROM public.scoreboard 
-- WHERE meal_breakdown IS NOT NULL;

-- สำเร็จ! ตารางพร้อมรองรับระบบมื้ออาหารใหม่
