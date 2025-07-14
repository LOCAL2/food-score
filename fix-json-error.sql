-- แก้ไขปัญหา JSON parse error ทันที
-- รันใน Supabase SQL Editor

-- 1. ตรวจสอบข้อมูลปัจจุบันที่มีปัญหา
SELECT 
    user_id, 
    user_name, 
    current_score,
    meal_breakdown,
    pg_typeof(meal_breakdown) as data_type
FROM public.scoreboard 
WHERE meal_breakdown IS NOT NULL
LIMIT 5;

-- 2. ถ้า meal_breakdown เป็น text ให้แปลงเป็น JSONB
-- (ปกติ JSONB ควรเป็น object อยู่แล้ว)
UPDATE public.scoreboard 
SET meal_breakdown = meal_breakdown::jsonb
WHERE meal_breakdown IS NOT NULL 
  AND pg_typeof(meal_breakdown) = 'text'::regtype;

-- 3. ตรวจสอบผลลัพธ์หลังแก้ไข
SELECT 
    user_id, 
    user_name, 
    current_score,
    meal_breakdown,
    pg_typeof(meal_breakdown) as data_type
FROM public.scoreboard 
WHERE meal_breakdown IS NOT NULL
LIMIT 5;

-- 4. ทดสอบ query JSONB
SELECT 
    user_name,
    current_score,
    meal_breakdown->'breakfast'->>'count' as breakfast_count,
    meal_breakdown->'lunch'->>'count' as lunch_count,
    meal_breakdown->'dinner'->>'count' as dinner_count
FROM public.scoreboard 
WHERE meal_breakdown IS NOT NULL
LIMIT 5;

-- สำเร็จ! ตอนนี้ API ควรทำงานได้แล้ว
