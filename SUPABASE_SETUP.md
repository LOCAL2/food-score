# การตั้งค่า Supabase สำหรับ Food Score Calculator

## 🚀 ขั้นตอนการตั้งค่า Supabase

### 1. สร้าง Supabase Project
1. ไปที่ https://supabase.com
2. สร้างบัญชีหรือเข้าสู่ระบบ
3. คลิก "New Project"
4. เลือก Organization และตั้งชื่อ project เช่น "food-score-calculator"
5. ตั้งรหัสผ่าน database
6. เลือก region ที่ใกล้ที่สุด
7. คลิก "Create new project"

### 2. รัน SQL Script
1. ไปที่ Supabase Dashboard → SQL Editor
2. คลิก "New query"
3. คัดลอกเนื้อหาจากไฟล์ `supabase-setup.sql`
4. วางลงใน SQL Editor
5. คลิก "Run" เพื่อสร้าง table และ functions

### 3. ดึง API Keys
1. ไปที่ Settings → API
2. คัดลอก:
   - **Project URL** (ใน Project URL)
   - **anon public** key (ใน Project API keys)

### 4. ตั้งค่า Environment Variables

#### Local Development (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Vercel Production:
1. ไปที่ Vercel Dashboard → Project Settings → Environment Variables
2. เพิ่ม:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`

### 5. ตรวจสอบ Row Level Security (RLS)
1. ไปที่ Table Editor → scoreboard table
2. ตรวจสอบว่า RLS เปิดใช้งานแล้ว
3. ตรวจสอบ Policies:
   - "Anyone can read scoreboard" (SELECT)
   - "Users can insert their own scores" (INSERT)
   - "Users can update their own scores" (UPDATE)

### 6. เปิดใช้งาน Realtime
1. ไปที่ Database → Replication
2. ตรวจสอบว่า table `scoreboard` อยู่ใน Realtime publications
3. ถ้าไม่มี ให้เพิ่มด้วยคำสั่ง:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.scoreboard;
   ```

## 🔧 การทดสอบ

### ทดสอบการเชื่อมต่อ:
1. รันแอป: `npm run dev`
2. เข้าไปที่ `/scoreboard`
3. ตรวจสอบ console ว่าไม่มี error
4. ลองบันทึกคะแนนและดูว่าข้อมูลปรากฏใน Supabase Dashboard

### ทดสอบ Real-time:
1. เปิด 2 browser tabs
2. บันทึกคะแนนใน tab หนึ่ง
3. ดู tab อื่นอัพเดทแบบ real-time

## 📊 Database Schema

### Table: scoreboard
```sql
- id: BIGSERIAL PRIMARY KEY
- user_id: TEXT UNIQUE (Discord user ID)
- user_name: TEXT (Discord username)
- user_image: TEXT (Discord avatar URL)
- highest_score: INTEGER (คะแนนสูงสุด)
- achieved_at: TIMESTAMPTZ (วันที่ทำสถิติ)
- main_dish_count: INTEGER (จำนวนอาหารหลัก)
- side_dish_count: INTEGER (จำนวนเครื่องเคียง)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🔒 Security Features

- **Row Level Security (RLS)**: ป้องกันการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต
- **API Keys**: ใช้ anon key สำหรับ public access
- **Policies**: กำหนดสิทธิ์การอ่าน/เขียนข้อมูล

## 🚨 หมายเหตุสำคัญ

1. **API Keys**: เก็บ anon key ให้ปลอดภัย แม้จะเป็น public key
2. **RLS**: ต้องเปิดใช้งาน RLS เพื่อความปลอดภัย
3. **Realtime**: ต้องเพิ่ม table ใน realtime publication
4. **Fallback**: แอปจะใช้ in-memory storage ถ้าไม่มี Supabase

## 🔄 Migration จาก MongoDB

ถ้าคุณมีข้อมูลเดิมใน MongoDB:
1. Export ข้อมูลจาก MongoDB
2. แปลงรูปแบบให้ตรงกับ Supabase schema
3. Import ข้อมูลผ่าน Supabase Dashboard หรือ SQL

## 📞 การขอความช่วยเหลือ

ถ้ามีปัญหา:
1. ตรวจสอบ Supabase Dashboard → Logs
2. ดู browser console สำหรับ error messages
3. ตรวจสอบ environment variables
4. ทดสอบการเชื่อมต่อด้วย SQL Editor
