# 🔧 แก้ไขให้เป็นข้อความธรรมดา

## ปัญหา
มี emoji ที่เสียใน code ทำให้แก้ไขไม่ได้ ต้องแก้ไขด้วยมือ

## วิธีแก้ไข

### 1. แก้ไขในไฟล์ `src/app/page.js`

**ค้นหาบรรทัดที่ 959:**
```javascript
{ key: 'breakfast', name: 'มื้อเช้า', emoji: '�', color: 'btn-warning' },
```

**แทนที่ด้วย:**
```javascript
{ key: 'breakfast', name: 'เช้า', color: 'btn-warning' },
```

**ค้นหาบรรทัดที่ 960:**
```javascript
{ key: 'lunch', name: 'กลางวัน', color: 'btn-info' },
```
(อันนี้ถูกแล้ว)

**ค้นหาบรรทัดที่ 961:**
```javascript
{ key: 'dinner', name: 'เย็น', color: 'btn-secondary' }
```
(อันนี้ถูกแล้ว)

### 2. แก้ไขในบรรทัดที่ 989:
```javascript
breakfast: { name: 'มื้อเช้า', emoji: '�', color: 'warning' },
```

**แทนที่ด้วย:**
```javascript
breakfast: { name: 'เช้า', color: 'warning' },
```

### 3. แก้ไขในบรรทัดที่ 990:
```javascript
lunch: { name: 'มื้อกลางวัน', emoji: '🍽️', color: 'info' },
```

**แทนที่ด้วย:**
```javascript
lunch: { name: 'กลางวัน', color: 'info' },
```

### 4. แก้ไขในบรรทัดที่ 991:
```javascript
dinner: { name: 'มื้อเย็น', emoji: '🌙', color: 'secondary' }
```

**แทนที่ด้วย:**
```javascript
dinner: { name: 'เย็น', color: 'secondary' }
```

### 5. ลบส่วนแสดง emoji ในปุ่ม

**ค้นหาบรรทัดที่มี:**
```javascript
<span className="text-3xl mr-2">{config.emoji}</span>
```

**ลบออกทั้งบรรทัด**

## ผลลัพธ์ที่ได้

### ปุ่มเลือกมื้อ:
```
[เช้า]  [กลางวัน]  [เย็น]
```

### ฟอร์มกรอกอาหาร:
```
เช้า
├─ ชื่อเมนูอาหาร: [_______]
└─ จำนวน: [1]

กลางวัน  
├─ ชื่อเมนูอาหาร: [_______]
└─ จำนวน: [1]
```

### Scoreboard:
```
เช้า 2  กลางวัน 1  เย็น 3
```

## ข้อดี
- ✅ เข้าใจง่ายที่สุด
- ✅ ไม่มี emoji สับสน
- ✅ ข้อความสั้น กระชับ
- ✅ ไม่มีปัญหา encoding
