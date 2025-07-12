-- เพิ่มข้อมูลทดสอบใน Supabase
-- รันใน SQL Editor ของ Supabase

-- ลบข้อมูลเก่า (ถ้ามี)
DELETE FROM public.scoreboard;

-- เพิ่มข้อมูลทดสอบ
INSERT INTO public.scoreboard (user_id, user_name, user_image, highest_score, main_dish_count, side_dish_count, achieved_at)
VALUES 
    -- ใส่ Discord ID ของคุณที่นี่ (เปลี่ยนเป็น ID จริงของคุณ)
    ('YOUR_DISCORD_ID_HERE', 'Your Name', 'https://via.placeholder.com/40/ff6b6b/ffffff?text=YOU', 25, 5, 3, NOW()),
    
    -- ข้อมูลทดสอบอื่นๆ
    ('demo_user_1', 'Demo Player 1', 'https://via.placeholder.com/40/96ceb4/ffffff?text=D1', 20, 4, 2, NOW() - INTERVAL '1 hour'),
    ('demo_user_2', 'Demo Player 2', 'https://via.placeholder.com/40/feca57/ffffff?text=D2', 15, 3, 2, NOW() - INTERVAL '2 hours'),
    ('demo_user_3', 'Demo Player 3', 'https://via.placeholder.com/40/a55eea/ffffff?text=D3', 12, 3, 1, NOW() - INTERVAL '3 hours'),
    ('demo_user_4', 'Demo Player 4', 'https://via.placeholder.com/40/26de81/ffffff?text=D4', 8, 2, 1, NOW() - INTERVAL '4 hours')
ON CONFLICT (user_id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    user_image = EXCLUDED.user_image,
    highest_score = EXCLUDED.highest_score,
    main_dish_count = EXCLUDED.main_dish_count,
    side_dish_count = EXCLUDED.side_dish_count,
    achieved_at = EXCLUDED.achieved_at;

-- ตรวจสอบข้อมูล
SELECT user_id, user_name, highest_score, 
       ROW_NUMBER() OVER (ORDER BY highest_score DESC) as rank
FROM public.scoreboard 
ORDER BY highest_score DESC;
