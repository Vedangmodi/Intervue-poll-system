# 🚨 BACKEND NOT RUNNING - START IT NOW!

## The Problem
Your backend server is **NOT running**. That's why you're getting the network error.

## ✅ IMMEDIATE FIX

### Step 1: Start Backend Server

**Open a NEW terminal window and run:**

```bash
cd /Users/apple/Project/Intervue.io/intervue.ioassignment/backend
npm run dev
```

**You should see:**
```
MongoDB connected
Server running on port 5001
```

### Step 2: Verify It's Running

**In another terminal, test:**
```bash
curl http://localhost:5001/health
```

**Should return:** `{"status":"ok"}`

### Step 3: Try Creating Poll Again

Now go back to your browser and try creating a poll. It should work!

## 🔍 If Backend Won't Start

### Check MongoDB is Running:
```bash
brew services list | grep mongodb
```

**If not running:**
```bash
brew services start mongodb-community
```

### Check Port 5001 is Free:
```bash
lsof -i:5001
```

**If something is using it:**
```bash
lsof -ti:5001 | xargs kill -9
```

### Check .env File:
```bash
cd backend
cat .env
```

**Should show:**
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## ✅ Complete Setup

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Frontend (if not already running):**
   ```bash
   cd frontend
   npm start
   ```

3. **Browser:**
   - Open: `http://localhost:3000`
   - Try creating poll
   - Should work now!

## 🎯 Quick Test

Once backend is running, test in browser console:
```javascript
fetch('http://localhost:5001/api/polls', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    question: 'Test?',
    options: ['A', 'B'],
    duration: 60
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If this works, the UI will work too!

