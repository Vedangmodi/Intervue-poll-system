# Port Changed from 5000 to 5001 ✅

## Changes Applied

All code files have been updated to use port **5001** instead of 5000.

### ✅ Code Files Updated:
- `backend/server.js` - Default port changed to 5001
- `frontend/src/pages/TeacherDashboard.js` - API URL updated
- `frontend/src/pages/PollHistory.js` - API URL updated
- `frontend/src/pages/StudentDashboard.js` - API URL updated
- `frontend/src/hooks/usePollState.js` - API URL updated
- `frontend/src/hooks/useSocket.js` - Socket URL updated
- `README.md` - Documentation updated
- `SETUP.md` - Documentation updated

## ⚠️ Manual Step Required

You need to manually update the `.env` files:

### 1. Update `backend/.env`:
```bash
cd backend
```

Create or edit `.env` file with:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Update `frontend/.env`:
```bash
cd frontend
```

Create or edit `.env` file with:
```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

## 🚀 Quick Commands

**Update backend/.env:**
```bash
cat > backend/.env << 'EOF'
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
```

**Update frontend/.env:**
```bash
cat > frontend/.env << 'EOF'
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
EOF
```

## ✅ Verification

After updating `.env` files:

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Should show: `Server running on port 5001`

2. **Test health endpoint:**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"ok"}`

3. **Start frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Test in browser:**
   - Frontend: `http://localhost:3000`
   - Backend health: `http://localhost:5001/health`

## 📋 Summary

- ✅ All code files updated to port 5001
- ✅ Documentation updated
- ⚠️ **You need to update `.env` files manually** (see commands above)

After updating `.env` files, restart both servers and everything should work!

