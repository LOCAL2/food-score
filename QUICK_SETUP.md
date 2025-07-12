# 🚀 Quick Setup สำหรับ Supabase

## ขั้นตอนง่ายๆ ใน 5 นาที

### 1. สร้าง Supabase Project (2 นาที)
1. ไปที่ https://supabase.com
2. คลิก "Start your project" 
3. Sign up ด้วย GitHub
4. คลิก "New Project"
5. ตั้งชื่อ: `food-score-calculator`
6. ตั้งรหัสผ่าน database (จำไว้)
7. เลือก region: `Southeast Asia (Singapore)`
8. คลิก "Create new project"

### 2. รัน SQL Script (1 นาที)
1. รอ project สร้างเสร็จ (ประมาณ 2 นาที)
2. ไปที่ **SQL Editor** (ในเมนูซ้าย)
3. คลิก **"New query"**
4. คัดลอกโค้ดนี้:

```sql
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

CREATE INDEX idx_scoreboard_highest_score ON public.scoreboard(highest_score DESC);

INSERT INTO public.scoreboard (user_id, user_name, user_image, highest_score, main_dish_count, side_dish_count)
VALUES 
    ('demo_user_1', 'Demo Player 1', 'https://via.placeholder.com/40/96ceb4/ffffff?text=D1', 15, 3, 2),
    ('demo_user_2', 'Demo Player 2', 'https://via.placeholder.com/40/feca57/ffffff?text=D2', 8, 2, 1),
    ('demo_user_3', 'Demo Player 3', 'https://via.placeholder.com/40/ff6b6b/ffffff?text=D3', 22, 5, 3)
ON CONFLICT (user_id) DO NOTHING;
```

5. คลิก **"Run"** (ปุ่มสีเขียว)
6. ดูข้อความ "Success. No rows returned" = สำเร็จ!

### 3. คัดลอก API Keys (1 นาที)
1. ไปที่ **Settings** → **API** (ในเมนูซ้าย)
2. คัดลอก 2 ค่านี้:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...`

### 4. ตั้งค่า Environment Variables (1 นาที)

#### ใน Vercel:
1. ไปที่ Vercel Dashboard → Project → Settings → Environment Variables
2. เพิ่ม 2 ตัวนี้:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...`
3. คลิก "Save"

#### ใน Local (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
```

### 5. Deploy และทดสอบ
1. Push code ไป GitHub (ถ้ายังไม่ได้ push)
2. Vercel จะ auto-deploy
3. เข้าไปที่ website
4. ลอง login และดู scoreboard

## ✅ ตรวจสอบว่าทำงาน

### ใน Supabase Dashboard:
1. ไปที่ **Table Editor** → **scoreboard**
2. ควรเห็นข้อมูล demo 3 แถว

### ใน Website:
1. เข้าไปที่ `/scoreboard`
2. ควรเห็นข้อมูล demo players
3. ลองบันทึกคะแนนใหม่
4. ดูว่าข้อมูลอัพเดทใน Supabase Dashboard

## 🚨 ถ้ามีปัญหา

### Error: "Configuration"
- ตรวจสอบ environment variables ใน Vercel
- ตรวจสอบว่า API keys ถูกต้อง

### Error: "Table doesn't exist"
- รัน SQL script ใหม่ใน Supabase SQL Editor
- ตรวจสอบว่า table สร้างแล้วใน Table Editor

### ไม่เห็นข้อมูล real-time
- ไปที่ Database → Replication
- เพิ่ม table scoreboard ใน realtime publication

## 🎉 เสร็จแล้ว!

ตอนนี้คุณมี:
- ✅ Supabase database พร้อมใช้งาน
- ✅ Real-time scoreboard
- ✅ Demo data สำหรับทดสอบ
- ✅ Production-ready deployment

ใช้เวลาแค่ 5 นาที! 🚀
