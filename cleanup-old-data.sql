-- ทำความสะอาดข้อมูลเก่าใน Scoreboard
-- รันใน Supabase SQL Editor หลังจากรัน add-meal-columns.sql แล้ว

-- 1. ตรวจสอบข้อมูลปัจจุบันที่มี main_dish_count = 0 และ side_dish_count = 0
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
WHERE main_dish_count = 0 AND side_dish_count = 0
ORDER BY current_score DESC;

-- 2. อัพเดทข้อมูลเก่าที่มี main_dish_count = 0 และ side_dish_count = 0
-- ให้มี total_items = 1 และสร้าง meal_breakdown เบื้องต้น
UPDATE public.scoreboard 
SET 
    total_items = CASE 
        WHEN current_score > 0 THEN GREATEST(1, current_score / 2) -- ประมาณการจากคะแนน
        ELSE 1 
    END,
    meal_breakdown = CASE
        WHEN current_score > 0 THEN
            jsonb_build_object(
                'breakfast', jsonb_build_object(
                    'count', GREATEST(1, current_score / 2),
                    'items', jsonb_build_array(
                        jsonb_build_object(
                            'name', '🍳 อาหารเช้าที่บันทึกไว้',
                            'amount', GREATEST(1, current_score / 2)
                        )
                    )
                )
            )
        ELSE
            jsonb_build_object(
                'breakfast', jsonb_build_object(
                    'count', 1,
                    'items', jsonb_build_array(
                        jsonb_build_object(
                            'name', 'อาหารที่บันทึกไว้',
                            'amount', 1
                        )
                    )
                )
            )
    END
WHERE main_dish_count = 0 AND side_dish_count = 0 AND current_score > 0;

-- 3. สำหรับข้อมูลที่มี current_score = 0 ให้ลบออก (ถ้าต้องการ)
-- DELETE FROM public.scoreboard WHERE current_score = 0;

-- 4. อัพเดทข้อมูลเก่าที่มีค่า main_dish_count หรือ side_dish_count > 0
-- แปลงเป็น meal_breakdown รูปแบบใหม่
UPDATE public.scoreboard 
SET 
    meal_breakdown = (
        CASE 
            WHEN main_dish_count > 0 AND side_dish_count > 0 THEN
                jsonb_build_object(
                    'breakfast', jsonb_build_object(
                        'count', main_dish_count,
                        'items', (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', 'อาหารหลัก ' || generate_series,
                                    'amount', 1
                                )
                            )
                            FROM generate_series(1, main_dish_count)
                        )
                    ),
                    'lunch', jsonb_build_object(
                        'count', side_dish_count,
                        'items', (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', 'เครื่องเคียง ' || generate_series,
                                    'amount', 1
                                )
                            )
                            FROM generate_series(1, side_dish_count)
                        )
                    )
                )
            WHEN main_dish_count > 0 THEN
                jsonb_build_object(
                    'breakfast', jsonb_build_object(
                        'count', main_dish_count,
                        'items', (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', 'อาหารหลัก ' || generate_series,
                                    'amount', 1
                                )
                            )
                            FROM generate_series(1, main_dish_count)
                        )
                    )
                )
            WHEN side_dish_count > 0 THEN
                jsonb_build_object(
                    'lunch', jsonb_build_object(
                        'count', side_dish_count,
                        'items', (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', 'เครื่องเคียง ' || generate_series,
                                    'amount', 1
                                )
                            )
                            FROM generate_series(1, side_dish_count)
                        )
                    )
                )
        END
    ),
    total_items = main_dish_count + side_dish_count
WHERE meal_breakdown IS NULL 
  AND (main_dish_count > 0 OR side_dish_count > 0);

-- 5. ตรวจสอบผลลัพธ์หลังอัพเดท
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

-- 6. ตรวจสอบการทำงานของ JSONB queries
SELECT 
    user_name,
    current_score,
    meal_breakdown->'breakfast'->>'count' as breakfast_count,
    meal_breakdown->'lunch'->>'count' as lunch_count,
    meal_breakdown->'dinner'->>'count' as dinner_count
FROM public.scoreboard 
WHERE meal_breakdown IS NOT NULL
ORDER BY current_score DESC;

-- สำเร็จ! ข้อมูลเก่าถูกแปลงเป็นรูปแบบใหม่แล้ว
-- ตอนนี้ Scoreboard จะไม่แสดง "🍛 0 | 🥗 0" อีกต่อไป
