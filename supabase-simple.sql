-- สร้าง table scoreboard แบบง่าย
CREATE TABLE public.scoreboard (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    user_name TEXT NOT NULL,
    user_image TEXT,
    highest_score INTEGER NOT NULL DEFAULT 0,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    main_dish_count INTEGER NOT NULL DEFAULT 0,
    side_dish_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- สร้าง index สำหรับการเรียงลำดับ
CREATE INDEX idx_scoreboard_highest_score ON public.scoreboard(highest_score DESC);

-- เพิ่มข้อมูลตัวอย่างสำหรับทดสอบ
INSERT INTO public.scoreboard (user_id, user_name, user_image, highest_score, main_dish_count, side_dish_count)
VALUES 
    ('demo_user_1', 'Demo Player 1', 'https://via.placeholder.com/40/96ceb4/ffffff?text=D1', 15, 3, 2),
    ('demo_user_2', 'Demo Player 2', 'https://via.placeholder.com/40/feca57/ffffff?text=D2', 8, 2, 1),
    ('demo_user_3', 'Demo Player 3', 'https://via.placeholder.com/40/ff6b6b/ffffff?text=D3', 22, 5, 3),
    ('demo_user_4', 'Demo Player 4', 'https://via.placeholder.com/40/a55eea/ffffff?text=D4', 12, 4, 2),
    ('demo_user_5', 'Demo Player 5', 'https://via.placeholder.com/40/26de81/ffffff?text=D5', 6, 2, 1)
ON CONFLICT (user_id) DO NOTHING;
