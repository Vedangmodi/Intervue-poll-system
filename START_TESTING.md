# 🚀 Start Testing - Quick Reference

## Current Status
✅ Dependencies installed
✅ Environment files created

## Next Steps

### Step 1: Start MongoDB

**Option A: If MongoDB is installed locally**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# OR start manually
mongod --dbpath ~/data/db
```

**Option B: Use MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free tier available)
3. Create a cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-poll
   ```

### Step 2: Start Backend Server

**Open Terminal 1:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
MongoDB connected
Server running on port 5000
```

✅ Backend is ready!

### Step 3: Start Frontend Server

**Open Terminal 2 (NEW terminal):**
```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view intervue-poll-frontend in the browser.
  Local:            http://localhost:3000
```

✅ Frontend is ready!

---

## 🧪 Quick Test

### Test 1: Basic Flow (2 minutes)

1. **Open browser:** `http://localhost:3000`

2. **Teacher Side:**
   - Click "I'm a Teacher"
   - Click "Create New Poll"
   - Question: `Which planet is known as the Red Planet?`
   - Options: `Mars`, `Venus`, `Jupiter`, `Saturn`
   - Duration: `60 seconds`
   - Click "Create Poll"
   - Click "Start Poll"

3. **Student Side (New Tab/Incognito):**
   - Open `http://localhost:3000` in new tab
   - Click "I'm a Student"
   - Enter name: `Test Student`
   - Click "Continue"
   - ✅ Should see question immediately!
   - Select an option
   - Click "Submit"
   - ✅ Should see results!

4. **Check Teacher Dashboard:**
   - ✅ Should see live vote counts
   - ✅ Results updating in real-time

---

## 🐛 Troubleshooting

### MongoDB Connection Error

**If you see:** `MongoDB connection error`

**Solution:**
- **Local MongoDB:** Make sure MongoDB is running
  ```bash
  brew services start mongodb-community  # macOS
  ```
- **MongoDB Atlas:** Update connection string in `backend/.env`

### Port Already in Use

**If you see:** `Port 5000/3000 already in use`

**Solution:**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill
```

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running (Terminal 1)
2. Backend shows "Server running on port 5000"
3. Open browser console (F12) → Check for errors
4. Verify `frontend/.env` has correct URLs

---

## 📋 Full Test Checklist

See `TESTING_GUIDE.md` for complete test scenarios:
- ✅ Basic poll creation and voting
- ✅ State recovery on refresh
- ✅ Late join timer sync
- ✅ Multiple votes prevention
- ✅ Kick student functionality
- ✅ Poll history
- ✅ Multiple students
- ✅ Timer expiration

---

## 🎯 What to Test

1. **Core Functionality:**
   - [ ] Teacher creates poll
   - [ ] Teacher starts poll
   - [ ] Student receives question
   - [ ] Student votes
   - [ ] Results update live

2. **Resilience:**
   - [ ] Refresh browser → State recovers
   - [ ] Join late → Timer shows correct time
   - [ ] Try voting twice → Prevented

3. **Features:**
   - [ ] Kick student → Shows kicked out screen
   - [ ] View history → Shows completed polls
   - [ ] Timer expires → Poll completes

---

## 💡 Tips

- Use **Incognito/Private windows** for multiple students
- Open **Browser DevTools** (F12) to see console logs
- Check **Network tab** to see API calls
- Watch **both terminals** for errors

---

## ✅ Ready!

Once both servers are running:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

Open `http://localhost:3000` in your browser and start testing!


