This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Food Score Calculator

เครื่องคำนวณคะแนนอาหารที่มีระบบ Discord Authentication

## Features

- 🍽️ คำนวณคะแนนอาหารตามจำนวนและประเภท
- 🔐 ระบบ Login ด้วย Discord OAuth
- 📊 บันทึกและแชร์ประวัติการคำนวณ
- 🎨 UI ที่สวยงามด้วย DaisyUI และ Tailwind CSS

## การตั้งค่าก่อนใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Discord OAuth

ดูรายละเอียดใน [DISCORD_SETUP.md](./DISCORD_SETUP.md)

### 3. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env.local` และกรอกข้อมูล:

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
MONGODB_URI=mongodb://localhost:27017/food-score  # Optional
```

**หมายเหตุ:** `MONGODB_URI` เป็น optional - หากไม่ได้ตั้งค่า ระบบจะใช้ in-memory storage แทน

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# food-score
