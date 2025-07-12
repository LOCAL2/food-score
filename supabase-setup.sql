-- สร้าง table scoreboard สำหรับ Food Score Calculator
CREATE TABLE IF NOT EXISTS public.scoreboard (
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
CREATE INDEX IF NOT EXISTS idx_scoreboard_highest_score ON public.scoreboard(highest_score DESC);
CREATE INDEX IF NOT EXISTS idx_scoreboard_achieved_at ON public.scoreboard(achieved_at ASC);

-- เปิดใช้งาน Row Level Security (RLS) - ปิดไว้ก่อนเพื่อให้ทำงานได้ง่าย
-- ALTER TABLE public.scoreboard ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (ทุกคนอ่านได้)
-- CREATE POLICY "Anyone can read scoreboard" ON public.scoreboard
--     FOR SELECT USING (true);

-- สร้าง policy สำหรับการเขียนข้อมูล (เฉพาะเจ้าของข้อมูล)
-- CREATE POLICY "Users can insert their own scores" ON public.scoreboard
--     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update their own scores" ON public.scoreboard
--     FOR UPDATE USING (auth.uid()::text = user_id);

-- สร้าง function สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง trigger สำหรับอัพเดท updated_at
CREATE TRIGGER handle_scoreboard_updated_at
    BEFORE UPDATE ON public.scoreboard
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- เปิดใช้งาน Realtime สำหรับ table นี้ (อาจต้องรันแยก)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.scoreboard;

-- ข้อมูลตัวอย่างสำหรับทดสอบ (optional)
-- INSERT INTO public.scoreboard (user_id, user_name, user_image, highest_score, main_dish_count, side_dish_count)
-- VALUES
--     ('test_user_1', 'Test User 1', 'https://via.placeholder.com/40', 15, 3, 2),
--     ('test_user_2', 'Test User 2', 'https://via.placeholder.com/40', 8, 2, 1),
--     ('test_user_3', 'Test User 3', 'https://via.placeholder.com/40', 22, 5, 3)
-- ON CONFLICT (user_id) DO NOTHING;
