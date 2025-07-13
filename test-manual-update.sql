-- ทดสอบการอัพเดทคะแนนใน Database โดยตรง

-- 1. ตรวจสอบข้อมูลปัจจุบัน
SELECT user_id, user_name, current_score, achieved_at, updated_at
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 2. ทดสอบ Manual Update (ใส่ Discord ID ของคุณ)
UPDATE public.scoreboard 
SET 
    current_score = 999999,
    achieved_at = NOW(),
    updated_at = NOW()
WHERE user_id = '1195754440955793442';

-- 3. ตรวจสอบผลลัพธ์หลัง Update
SELECT user_id, user_name, current_score, achieved_at, updated_at
FROM public.scoreboard 
WHERE user_id = '1195754440955793442';

-- 4. ตรวจสอบ Leaderboard ใหม่
SELECT 
    user_name,
    current_score,
    achieved_at,
    ROW_NUMBER() OVER (ORDER BY current_score DESC) as rank
FROM public.scoreboard 
ORDER BY current_score DESC;

-- 5. ทดสอบ Insert ใหม่ (ถ้าไม่มีข้อมูล)
INSERT INTO public.scoreboard (user_id, user_name, user_image, current_score, main_dish_count, side_dish_count)
VALUES ('test_user_manual', 'Manual Test User', 'https://via.placeholder.com/40', 777777, 5, 3)
ON CONFLICT (user_id) 
DO UPDATE SET
    current_score = EXCLUDED.current_score,
    achieved_at = NOW(),
    updated_at = NOW();

-- 6. ตรวจสอบผลลัพธ์สุดท้าย
SELECT user_id, user_name, current_score, achieved_at, updated_at
FROM public.scoreboard 
ORDER BY current_score DESC;
