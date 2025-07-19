# Environment Variables Example

สร้างไฟล์ `.env.local` ในโฟลเดอร์หลักของโปรเจค และเพิ่ม environment variables ต่อไปนี้:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_CLIENT_SECRET=your_discord_client_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Database (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# MongoDB (if using MongoDB)
MONGODB_URI=your_mongodb_connection_string_here
```

## วิธีการสร้าง NEXTAUTH_SECRET

รันคำสั่งนี้ใน terminal เพื่อสร้าง secret:

```bash
openssl rand -base64 32
```

หรือใช้เว็บไซต์: https://generate-secret.vercel.app/32 