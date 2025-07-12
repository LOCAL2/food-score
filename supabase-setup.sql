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

-- เปิดใช้งาน Row Level Security (RLS)
ALTER TABLE public.scoreboard ENABLE ROW LEVEL SECURITY;

-- สร้าง policy สำหรับการอ่านข้อมูล (ทุกคนอ่านได้)
CREATE POLICY "Anyone can read scoreboard" ON public.scoreboard
    FOR SELECT USING (true);

-- สร้าง policy สำหรับการเขียนข้อมูล (เฉพาะเจ้าของข้อมูล)
CREATE POLICY "Users can insert their own scores" ON public.scoreboard
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own scores" ON public.scoreboard
    FOR UPDATE USING (auth.uid()::text = user_id);

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

-- เปิดใช้งาน Realtime สำหรับ table นี้
ALTER PUBLICATION supabase_realtime ADD TABLE public.scoreboard;

-- สร้าง function สำหรับ upsert score (optional)
CREATE OR REPLACE FUNCTION public.upsert_score(
    p_user_id TEXT,
    p_user_name TEXT,
    p_user_image TEXT,
    p_score INTEGER,
    p_main_dish_count INTEGER,
    p_side_dish_count INTEGER
)
RETURNS TABLE(is_new_record BOOLEAN, highest_score INTEGER) AS $$
DECLARE
    existing_score INTEGER;
    is_new BOOLEAN := false;
BEGIN
    -- ตรวจสอบคะแนนเดิม
    SELECT scoreboard.highest_score INTO existing_score
    FROM public.scoreboard
    WHERE user_id = p_user_id;
    
    -- ถ้าไม่มีข้อมูลเดิม หรือคะแนนใหม่สูงกว่า
    IF existing_score IS NULL OR p_score > existing_score THEN
        is_new := true;
        
        INSERT INTO public.scoreboard (
            user_id, user_name, user_image, highest_score, 
            main_dish_count, side_dish_count, achieved_at
        )
        VALUES (
            p_user_id, p_user_name, p_user_image, p_score,
            p_main_dish_count, p_side_dish_count, NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            user_name = EXCLUDED.user_name,
            user_image = EXCLUDED.user_image,
            highest_score = EXCLUDED.highest_score,
            main_dish_count = EXCLUDED.main_dish_count,
            side_dish_count = EXCLUDED.side_dish_count,
            achieved_at = EXCLUDED.achieved_at,
            updated_at = NOW();
            
        RETURN QUERY SELECT is_new, p_score;
    ELSE
        RETURN QUERY SELECT is_new, existing_score;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
