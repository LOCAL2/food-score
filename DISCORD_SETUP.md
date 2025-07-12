# การตั้งค่า Discord OAuth สำหรับ Food Score Calculator

## ขั้นตอนการสร้าง Discord Application

### 1. เข้าสู่ Discord Developer Portal
- ไปที่ https://discord.com/developers/applications
- เข้าสู่ระบบด้วยบัญชี Discord ของคุณ

### 2. สร้าง Application ใหม่
- คลิก "New Application"
- ตั้งชื่อแอปพลิเคชัน เช่น "Food Score Calculator"
- คลิก "Create"

### 3. ตั้งค่า OAuth2
- ไปที่แท็บ "OAuth2" ในเมนูด้านซ้าย
- ในส่วน "Redirects" เพิ่ม URL:
  - สำหรับ development: `http://localhost:3000/api/auth/callback/discord`
  - สำหรับ production: `https://yourdomain.com/api/auth/callback/discord`

### 4. คัดลอก Client ID และ Client Secret
- ในหน้า "OAuth2" > "General"
- คัดลอก "Client ID"
- คลิก "Reset Secret" และคัดลอก "Client Secret"

### 5. ตั้งค่า Environment Variables
- สร้างไฟล์ `.env.local` ในโฟลเดอร์ root ของโปรเจค
- เพิ่มค่าต่อไปนี้:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
MONGODB_URI=mongodb://localhost:27017/food-score
```

### 6. สร้าง NEXTAUTH_SECRET
สร้าง secret key แบบสุ่มด้วยคำสั่ง:
```bash
openssl rand -base64 32
```

### 7. ตั้งค่า MongoDB
#### ตัวเลือก 1: MongoDB Local
1. ติดตั้ง MongoDB Community Server
2. รัน MongoDB service
3. ใช้ URI: `mongodb://localhost:27017/food-score`

#### ตัวเลือก 2: MongoDB Atlas (Cloud)
1. สร้างบัญชีที่ https://cloud.mongodb.com
2. สร้าง cluster ใหม่
3. ตั้งค่า database user และ whitelist IP
4. ใช้ URI: `mongodb+srv://username:password@cluster.mongodb.net/food-score`

## การทดสอบ
1. รันเซิร์ฟเวอร์ development: `npm run dev`
2. เข้าไปที่ http://localhost:3000
3. ทดสอบการ login ด้วย Discord
4. ทดสอบระบบ Scoreboard แบบ real-time

## หมายเหตุ
- เก็บ Client Secret ให้ปลอดภัย อย่าแชร์หรือ commit ลง Git
- สำหรับ production ให้เปลี่ยน NEXTAUTH_URL เป็น domain จริง
- ตรวจสอบให้แน่ใจว่า redirect URL ตรงกับที่ตั้งค่าใน Discord
