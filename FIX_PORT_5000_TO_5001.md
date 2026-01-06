# 🔴 CRITICAL: Fix Port 5000 → 5001

## The Problem
Your browser is still trying to connect to port 5000, but backend is on 5001. This is because:
1. Frontend .env file was missing (now created)
2. Browser has cached old build
3. Need to restart frontend to pick up new .env

## ✅ FIXED - Do These Steps:

### Step 1: Verify .env File Created
```bash
cd frontend
cat .env
```

**Should show:**
```
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

### Step 2: STOP Frontend Server
Press `Ctrl+C` in the terminal where frontend is running

### Step 3: Clear Browser Cache
**Option A: Hard Refresh**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Safari: `Cmd+Option+R`

**Option B: Clear Cache**
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4: Restart Frontend
```bash
cd frontend
npm start
```

**Wait for:** "Compiled successfully!"

### Step 5: Verify in Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `Socket connected` (should connect to port 5001)
4. Try creating poll
5. Check Network tab - should show requests to `localhost:5001`

## ✅ Verification Checklist

- [ ] Frontend .env file exists with port 5001
- [ ] Frontend server restarted
- [ ] Browser cache cleared
- [ ] Browser console shows connection to port 5001
- [ ] Network tab shows requests to port 5001
- [ ] No more port 5000 errors

## 🐛 If Still Showing Port 5000

1. **Check .env file:**
   ```bash
   cd frontend
   cat .env
   ```

2. **Delete build folder:**
   ```bash
   cd frontend
   rm -rf build
   npm start
   ```

3. **Check browser console:**
   - Should show: `Socket connected` to port 5001
   - Should NOT show: port 5000

4. **Verify backend is on 5001:**
   ```bash
   curl http://localhost:5001/health
   ```

## 🎯 Expected Result

After fix:
- Socket connects to: `ws://localhost:5001/socket.io/`
- API calls go to: `http://localhost:5001/api/polls`
- No more port 5000 errors
- Poll creation works

