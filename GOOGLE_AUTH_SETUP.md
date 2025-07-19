# Google Authentication Setup Guide

## ขั้นตอนการตั้งค่า Google OAuth

### 1. สร้าง Google Cloud Project

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Google+ API และ Google Identity API

### 2. สร้าง OAuth 2.0 Credentials

1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "OAuth 2.0 Client IDs"
3. เลือก "Web application"
4. ตั้งชื่อให้กับ Client ID
5. เพิ่ม Authorized redirect URIs:
   - สำหรับ development: `http://localhost:3000/api/auth/callback/google`
   - สำหรับ production: `https://yourdomain.com/api/auth/callback/google`

### 3. ตั้งค่า Environment Variables

เพิ่ม environment variables ต่อไปนี้ในไฟล์ `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth (ถ้ายังไม่มี)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4. สำหรับ Production

เมื่อ deploy ไปยัง production:

1. อัพเดท Authorized redirect URIs ใน Google Cloud Console
2. ตั้งค่า environment variables ใน hosting platform (Vercel, Netlify, etc.)
3. เปลี่ยน `NEXTAUTH_URL` เป็น production URL

### 5. การใช้งาน

หลังจากตั้งค่าเสร็จแล้ว ผู้ใช้จะสามารถ:
- เข้าสู่ระบบด้วย Google Account
- ระบบจะเก็บข้อมูล Google ID และ email
- สามารถใช้งานได้พร้อมกับ Discord authentication

### 6. ข้อมูลที่ได้จาก Google

- Email address
- Profile picture
- Display name
- Google ID (sub)

### 7. Troubleshooting

หากมีปัญหา:
1. ตรวจสอบ environment variables
2. ตรวจสอบ redirect URIs ใน Google Cloud Console
3. ตรวจสอบ console logs สำหรับ error messages
4. ตรวจสอบว่า API ถูกเปิดใช้งานแล้ว

### 8. Security Notes

- เก็บ Client Secret ไว้เป็นความลับ
- ใช้ HTTPS ใน production
- ตรวจสอบ domain verification ใน Google Cloud Console 