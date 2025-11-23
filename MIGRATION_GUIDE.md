# Migration Guide - Very Hard Level

## Perubahan yang Dilakukan

### 1. **Maksimum Quiz: 20 → 40 MCQ**
- Input field di upload page sekarang menerima hingga 40 soal MCQ
- Validation schema diupdate untuk max 40 MCQ
- API endpoint sudah mendukung hingga 40 MCQ per request

### 2. **Level Baru: "Very Hard"**
Menambahkan level kesulitan tertinggi untuk quiz yang lebih menantang.

#### File yang Diupdate:
- ✅ Frontend (upload, dashboard, builder pages)
- ✅ Schema & Types (quizSchema.ts, quiz.ts)
- ✅ API & Backend (quizApi.ts, useQuizStore.tsx, quizMapper.ts)
- ✅ Database Schema (prisma/schema.prisma)
- ✅ Adaptive Learning (ELO rating 1500 untuk Very Hard)

## Database Migration

### Opsi 1: Menggunakan Supabase Dashboard (Direkomendasikan)
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Buka SQL Editor
4. Jalankan SQL berikut:

```sql
ALTER TYPE "QuizLevel" ADD VALUE IF NOT EXISTS 'VERY_HARD';
```

5. Verify dengan query:
```sql
SELECT enum_range(NULL::"QuizLevel");
```

### Opsi 2: Menggunakan Prisma Migrate (Ketika Database Online)
```powershell
# Pastikan database sudah online
npx prisma migrate dev --name add-very-hard-level
```

### Opsi 3: Manual Migration File
File SQL migration sudah dibuat di:
`prisma/migrations/manual_add_very_hard_level.sql`

Jalankan file ini di database Anda menggunakan psql atau Supabase SQL Editor.

## Verifikasi

Setelah migration, test dengan:

1. **Test di Upload Page:**
   - Coba buat quiz dengan level "Very Hard"
   - Coba buat quiz dengan 40 MCQ

2. **Test di Dashboard:**
   - Filter quiz berdasarkan level "Very Hard"
   - Lihat quiz statistics

3. **Test di Builder:**
   - Edit quiz dan ubah level ke "Very Hard"

## Rollback (Jika Diperlukan)

Jika perlu rollback, jalankan:

```sql
-- HATI-HATI: Ini akan menghapus data quiz dengan level VERY_HARD
DELETE FROM quizzes WHERE level = 'VERY_HARD';

-- Kemudian drop enum value (PostgreSQL tidak support DROP VALUE, 
-- jadi perlu recreate enum atau biarkan saja)
```

## Catatan Teknis

### ELO Rating untuk Adaptive Learning:
- X (Class X): 1150
- XI (Class XI): 1250
- XII (Class XII): 1350
- **Very Hard: 1500** ← Paling tinggi
- General: 1200

### Database Enum Mapping:
- Frontend: `"Very Hard"`
- Database: `VERY_HARD`
- Schema Validation: Both supported

## Troubleshooting

### Error: "Can't reach database server"
- Pastikan koneksi internet stabil
- Cek Supabase project status
- Verify DATABASE_URL di .env file

### Error: "Drift detected"
- Database sudah ada skema yang berbeda
- Gunakan manual migration atau reset database dengan `prisma migrate reset` (akan hapus semua data)

### Error: "Type QuizLevel already has value VERY_HARD"
- Migration sudah pernah dijalankan
- Skip migration ini

## Update Prisma Client

Setelah migration berhasil, regenerate Prisma Client:

```powershell
npx prisma generate
```

## Testing Checklist

- [ ] Database migration berhasil
- [ ] Prisma client regenerated
- [ ] Upload page menampilkan option "Very Hard"
- [ ] Dashboard filter menampilkan "Very Hard"
- [ ] Builder page menampilkan "Very Hard"
- [ ] Bisa create quiz dengan max 40 MCQ
- [ ] Bisa create quiz dengan level "Very Hard"
- [ ] Quiz tersimpan di database dengan benar

## Support

Jika ada masalah, cek:
1. Logs di browser console (F12)
2. Server logs di terminal
3. Database logs di Supabase Dashboard
