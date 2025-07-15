-- สร้าง table สำหรับเก็บรายการอาหารที่ผู้ใช้บันทึก
-- ===================================================================

-- 1. สร้าง table food_items
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.food_items (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    food_name TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 1,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'midnight')),
    score INTEGER NOT NULL DEFAULT 2, -- คะแนนต่อหน่วย (2 คะแนน/หน่วย)
    total_score INTEGER GENERATED ALWAYS AS (amount * score) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. สร้าง indexes สำหรับการค้นหา
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_food_items_user_id ON public.food_items(user_id);
CREATE INDEX IF NOT EXISTS idx_food_items_user_email ON public.food_items(user_email);
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON public.food_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_items_meal_type ON public.food_items(meal_type);

-- 3. สร้าง function สำหรับอัพเดท updated_at
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. สร้าง trigger สำหรับอัพเดท updated_at อัตโนมัติ
-- ===================================================================
DROP TRIGGER IF EXISTS update_food_items_updated_at ON public.food_items;
CREATE TRIGGER update_food_items_updated_at
    BEFORE UPDATE ON public.food_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. เพิ่ม comments อธิบาย table
-- ===================================================================
COMMENT ON TABLE public.food_items IS 'เก็บรายการอาหารที่ผู้ใช้บันทึกในแต่ละมื้อ';
COMMENT ON COLUMN public.food_items.user_id IS 'Discord User ID';
COMMENT ON COLUMN public.food_items.user_email IS 'อีเมลผู้ใช้';
COMMENT ON COLUMN public.food_items.food_name IS 'ชื่อเมนูอาหาร';
COMMENT ON COLUMN public.food_items.amount IS 'จำนวนหน่วย';
COMMENT ON COLUMN public.food_items.meal_type IS 'ประเภทมื้อ: breakfast, lunch, dinner, midnight';
COMMENT ON COLUMN public.food_items.score IS 'คะแนนต่อหน่วย (ปกติ 2 คะแนน)';
COMMENT ON COLUMN public.food_items.total_score IS 'คะแนนรวม (amount × score)';

-- 6. ตัวอย่างการใช้งาน
-- ===================================================================
-- INSERT INTO public.food_items (user_id, user_name, user_email, food_name, amount, meal_type)
-- VALUES ('1195754440955793442', 'barronxsl', 'yaho27535@gmail.com', 'ข้าวผัด', 2, 'lunch');

-- 7. Query สำหรับดูข้อมูลทดสอบ
-- ===================================================================
-- SELECT 
--     user_name,
--     food_name,
--     amount,
--     meal_type,
--     total_score,
--     created_at
-- FROM public.food_items 
-- ORDER BY created_at DESC;

-- 8. Query สำหรับดูสรุปคะแนนตามมื้อ
-- ===================================================================
-- SELECT 
--     user_name,
--     meal_type,
--     COUNT(*) as food_count,
--     SUM(amount) as total_amount,
--     SUM(total_score) as total_score
-- FROM public.food_items 
-- GROUP BY user_name, meal_type
-- ORDER BY user_name, meal_type;
