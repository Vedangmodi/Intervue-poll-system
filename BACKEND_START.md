# Backend Server - Quick Start Guide

## ✅ Port 5000 is now free!

The old backend process has been killed. You can now start the backend server.

## 🚀 Start Backend Server

In your terminal, run:

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
MongoDB connected
Server running on port 5000
```

## ✅ Verify Backend is Running

**Option 1: Check Health Endpoint**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"ok"}
```

**Option 2: Open in Browser**
- Go to: `http://localhost:5000/health`
- Should see: `{"status":"ok"}`

## 🐛 If You Still Get "Port in Use" Error

**Kill the process manually:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill it (replace PID with the number from above)
kill -9 <PID>

# Or kill all node processes
pkill -9 node
```

## 📋 Complete Setup Checklist

- [x] MongoDB running
- [ ] Backend server running (port 5000)
- [x] Frontend server running (port 3000)
- [ ] Test health endpoint
- [ ] Test full application flow

## 🧪 Quick Test

Once backend is running:

1. **Check health:** `curl http://localhost:5000/health`
2. **Open frontend:** `http://localhost:3000`
3. **Test teacher flow:** Create poll, start poll
4. **Test student flow:** Join, vote, see results

## 💡 Tips

- Keep the backend terminal open while testing
- If you see "MongoDB connection error", make sure MongoDB is running:
  ```bash
  brew services start mongodb-community
  ```
- Backend will auto-restart when you save files (nodemon)

