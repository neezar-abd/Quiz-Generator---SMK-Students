# Supabase Connection Testing Guide

## 🔍 How to Check if Supabase is Connected

### Method 1: Visual UI Test (Recommended) 
**Visit: `http://localhost:3000/test-connection`**

This provides a comprehensive visual interface to:
- ✅ Test database connection
- ✅ Verify table structure  
- ✅ Check environment variables
- ✅ Display database statistics
- ✅ Show troubleshooting tips if errors occur

### Method 2: API Endpoint Test
**Make a request to: `GET /api/test-connection`**

```bash
# Using curl
curl http://localhost:3000/api/test-connection

# Using browser
http://localhost:3000/api/test-connection
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "✅ Supabase connection successful!",
  "tests": {
    "connection": {
      "success": true,
      "message": "Database connection successful!",
      "details": {
        "tablesFound": [...],
        "connectionStatus": "Connected"
      }
    },
    "operations": {
      "success": true,
      "results": [
        {"test": "User count", "result": 1, "status": "success"},
        {"test": "Quiz count", "result": 0, "status": "success"}
      ]
    }
  },
  "environment": {
    "hasDatabaseUrl": true,
    "databaseUrlFormat": true,
    "nodeEnv": "development"
  }
}
```

### Method 3: Terminal Script (Quick)
**Run: `npm run db:test`**

```bash
npm run db:test
```

**Expected Output (Success):**
```
🔍 Testing Supabase Connection...

📋 Environment Check:
- NODE_ENV: development
- DATABASE_URL exists: true
- DATABASE_URL format valid: true
- DATABASE_URL preview: postgresql://postgres...

🔌 Testing Database Connection...
✅ Basic connection successful
✅ Table check completed
📊 Tables found: 4
Tables: User, Quiz, QuestionMCQ, QuestionEssay
📈 Record counts:
- Users: 1
- Quizzes: 0

🎉 Supabase connection test PASSED!
Your database is ready for the AI Quiz Generator.
```

### Method 4: Manual Prisma Test
```bash
# Generate Prisma client
npx prisma generate

# Test database push (creates tables if needed)
npx prisma db push

# Open Prisma Studio to browse data
npx prisma studio
```

## 🚨 Common Error Scenarios

### 1. No DATABASE_URL
```
❌ DATABASE_URL not found in environment variables
💡 Make sure to create .env.local with your Supabase DATABASE_URL
```

**Solution:**
1. Create `.env.local` file in project root
2. Add: `DATABASE_URL="your-supabase-connection-string"`

### 2. Invalid DATABASE_URL Format
```
❌ Invalid DATABASE_URL format
💡 Should start with postgresql:// or postgres://
```

**Solution:**
- Check connection string format from Supabase dashboard
- Should look like: `postgresql://postgres:[password]@[host]:5432/postgres`

### 3. Tables Don't Exist
```
⚠️ No quiz tables found. You may need to run the SQL setup script.
```

**Solution:**
1. Open Supabase SQL Editor
2. Run the setup SQL script from `scripts/setup-supabase.sql`
3. Or run: `npx prisma db push`

### 4. Connection Refused
```
❌ Database connection FAILED
Error: connect ECONNREFUSED
```

**Solution:**
1. Check if Supabase project is paused/sleeping
2. Verify network connectivity
3. Check DATABASE_URL host and port
4. Ensure project is in active region

### 5. Authentication Failed  
```
❌ password authentication failed for user "postgres"
```

**Solution:**
1. Check password in DATABASE_URL
2. Reset database password in Supabase dashboard
3. Update .env.local with new credentials

## 🔧 Troubleshooting Steps

### Step 1: Check Environment
```bash
# Verify .env.local exists and has DATABASE_URL
cat .env.local

# Test environment loading
npm run db:test
```

### Step 2: Verify Supabase Project
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Check project status (Active/Paused)
3. Go to Settings → Database
4. Copy fresh connection string

### Step 3: Test Basic Connection
```bash
# Generate Prisma client
npm run prisma:generate

# Test with Prisma
npm run db:test
```

### Step 4: Check Tables
```bash
# Push schema to create tables
npm run prisma:push

# Open Prisma Studio to browse
npx prisma studio
```

### Step 5: Visual Test
1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/test-connection`
3. Click "Test Supabase Connection"
4. Review detailed results

## 📊 What Success Looks Like

### ✅ Fully Connected & Ready:
- DATABASE_URL exists and valid format
- Basic connection works
- All 4 tables exist (User, Quiz, QuestionMCQ, QuestionEssay)
- Can perform CRUD operations
- Sample data loads successfully

### ⚠️ Partially Connected:
- Connection works but tables missing
- Tables exist but no sample data
- Operations work but slow response

### ❌ Not Connected:
- No DATABASE_URL or invalid format
- Connection refused/timeout
- Authentication errors
- Missing tables entirely

## 🎯 Quick Commands Reference

```bash
# Test connection
npm run db:test

# Setup database
npm run db:setup  

# Generate Prisma client
npm run prisma:generate

# Create/update tables
npm run prisma:push

# Visual connection test
# Visit: http://localhost:3000/test-connection

# API connection test  
curl http://localhost:3000/api/test-connection
```

## 🚀 Next Steps After Successful Connection

1. **✅ Connection Confirmed** → Continue with quiz testing
2. **✅ Tables Ready** → Test quiz generation on `/upload`
3. **✅ Sample Data** → Check dashboard at `/dashboard`
4. **✅ Full CRUD** → Test creating, editing, deleting quizzes

Your Supabase is now ready for the AI Quiz Generator! 🎉