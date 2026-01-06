# Quick Testing Guide

## Step-by-Step Testing Instructions

### Prerequisites Check
1. ✅ Node.js installed (v14+)
2. ✅ MongoDB installed and running (or MongoDB Atlas account)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath ~/data/db

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Use it in `.env` file

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# If using MongoDB Atlas, replace MONGODB_URI with your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-poll

# Start backend server
npm run dev
```

**Expected Output:**
```
MongoDB connected
Server running on port 5000
```

✅ Backend is running on `http://localhost:5000`

### Step 3: Setup Frontend

**Open a NEW terminal window/tab:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults work)
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
EOF

# Start frontend server
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view intervue-poll-frontend in the browser.
  Local:            http://localhost:3000
```

✅ Frontend is running on `http://localhost:3000`

---

## 🧪 Test Scenarios

### Test 1: Basic Poll Flow ⭐ (Start Here)

**Teacher Side:**
1. Open browser: `http://localhost:3000`
2. Click **"I'm a Teacher"**
3. You'll be auto-registered as "Teacher"
4. Click **"Create New Poll"**
5. Fill in:
   - Question: `Which planet is known as the Red Planet?`
   - Option 1: `Mars`
   - Option 2: `Venus`
   - Option 3: `Jupiter`
   - Option 4: `Saturn`
   - Duration: `60 seconds`
6. Click **"Create Poll"**
7. Click **"Start Poll"**

**Student Side:**
1. Open **NEW TAB** or **Incognito Window**: `http://localhost:3000`
2. Click **"I'm a Student"**
3. Enter name: `Rahul Bajaj`
4. Click **"Continue"**
5. ✅ You should see the question immediately!
6. Select an option (e.g., "Mars")
7. Click **"Submit"**
8. ✅ You should see live results with percentages!

**Teacher Side (check):**
- ✅ You should see live vote counts updating
- ✅ Results show percentages in real-time

---

### Test 2: State Recovery 🔄

**While poll is active:**

1. **Student Side:** Refresh the browser (F5 or Cmd+R)
   - ✅ Question should still be visible
   - ✅ Timer should show correct remaining time
   - ✅ If you voted, results should be visible

2. **Teacher Side:** Refresh the browser
   - ✅ Active poll should still be visible
   - ✅ Current results should be displayed
   - ✅ Participants list should be visible

---

### Test 3: Late Join Timer Sync ⏱️

1. **Teacher:** Start a 60-second poll
2. **Wait 20 seconds** (watch the timer)
3. **Student:** Join in a new tab
4. ✅ Student's timer should show **~40 seconds**, NOT 60 seconds!

---

### Test 4: Multiple Votes Prevention 🚫

1. **Student:** Vote for a question
2. **Try to vote again** (click submit multiple times)
3. ✅ Should see error: "You have already voted"
4. ✅ Only ONE vote is recorded

---

### Test 5: Kick Student 👢

1. **Teacher:** Click **"Participants"** button
2. You should see list of students
3. Click **"Kick out"** next to a student
4. **Student Side:** ✅ Should see "You've been kicked out!" screen
5. **Teacher Side:** ✅ Student removed from participants list

---

### Test 6: Poll History 📚

1. **Complete a poll** (wait for timer to expire OR all students vote)
2. **Teacher:** Click **"View Poll History"**
3. ✅ Should see completed polls with results
4. ✅ Results show percentages for each option

---

### Test 7: Multiple Students 👥

1. **Teacher:** Start a poll
2. **Open 3-4 student tabs** (each with different names)
3. **Each student votes**
4. ✅ Teacher sees all votes updating in real-time
5. ✅ Results show correct percentages

---

### Test 8: Timer Expiration ⏰

1. **Teacher:** Start a 30-second poll
2. **Student:** Join but DON'T vote
3. **Wait for timer to reach 0**
4. ✅ Poll should automatically complete
5. ✅ Results should be shown
6. ✅ Student can't vote after timer expires

---

## 🐛 Troubleshooting

### Backend won't start

**MongoDB Connection Error:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community  # macOS
# OR
mongod --dbpath ~/data/db
```

**Port 5000 already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Or change port in backend/.env
PORT=5001
```

### Frontend won't start

**Port 3000 already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm start
```

### Socket.io not connecting

**Check:**
1. Backend is running (`http://localhost:5000`)
2. Frontend `.env` has correct `REACT_APP_SOCKET_URL`
3. Browser console for errors
4. CORS is configured in backend

### State not recovering

**Check:**
1. Browser console for errors
2. Network tab → Look for `/api/polls/state` request
3. localStorage → Should have `pollUser` and `pollRole`

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Teacher can create polls
- [ ] Teacher can start polls
- [ ] Students receive questions instantly
- [ ] Students can vote
- [ ] Live results update in real-time
- [ ] Timer shows correct remaining time
- [ ] Late-joining students see correct timer
- [ ] Page refresh recovers state
- [ ] Students can't vote twice
- [ ] Teacher can kick students
- [ ] Poll history shows completed polls
- [ ] Timer expiration works correctly

---

## 🎯 Quick Test Commands

**Check if servers are running:**
```bash
# Backend health check
curl http://localhost:5000/health

# Should return: {"status":"ok"}

# Frontend (just open in browser)
open http://localhost:3000
```

**Check MongoDB connection:**
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/intervue-poll

# List collections
show collections

# View polls
db.polls.find().pretty()
```

---

## 📝 Testing Tips

1. **Use Incognito/Private windows** for multiple students
2. **Open browser DevTools** to see console logs and network requests
3. **Check both terminals** (backend and frontend) for errors
4. **Test on different browsers** (Chrome, Firefox, Safari)
5. **Test with slow network** (Chrome DevTools → Network → Throttling)

---

## 🚀 Ready for Production?

Once all tests pass:
1. Deploy backend to hosting (Heroku, Railway, Render)
2. Deploy frontend to hosting (Vercel, Netlify)
3. Update environment variables with production URLs
4. Test again with production URLs

---

## Need Help?

- Check `SETUP.md` for detailed setup
- Check `ARCHITECTURE.md` for technical details
- Check browser console for errors
- Check backend terminal for server logs


