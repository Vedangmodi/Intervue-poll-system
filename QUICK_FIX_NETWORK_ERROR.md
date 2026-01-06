# Quick Fix for Network Error

## The Problem
- UI shows "Network Error" when creating poll
- Works fine in Postman
- This indicates a CORS or connection issue

## ✅ Fixes Applied

1. **Enhanced CORS Configuration** - Now allows all origins in development
2. **Added Request Logging** - Backend now logs all requests
3. **Better Error Messages** - Frontend shows specific error details
4. **Axios Configuration** - Added proper headers and timeout

## 🚀 Quick Fix Steps

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

**Look for:** `Server running on port 5001`

### Step 2: Verify Backend is Running
```bash
curl http://localhost:5001/health
```

**Should return:** `{"status":"ok"}`

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try creating a poll
4. Look for detailed error messages

### Step 4: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try creating a poll
4. Find the failed request (red)
5. Check:
   - Request URL
   - Status code
   - Response body
   - CORS headers

## 🔍 Common Issues

### Issue 1: Backend Not Running
**Symptom:** Network Error, ECONNREFUSED
**Solution:** Start backend: `cd backend && npm run dev`

### Issue 2: Wrong Port
**Symptom:** Network Error
**Solution:** Verify backend is on port 5001, frontend connects to `http://localhost:5001/api`

### Issue 3: CORS Error
**Symptom:** CORS error in console
**Solution:** Backend CORS is now configured to allow all origins

### Issue 4: Request Format
**Symptom:** 400 Bad Request
**Solution:** Check browser console for request details

## 📋 Debug Checklist

- [ ] Backend is running on port 5001
- [ ] Health endpoint works: `curl http://localhost:5001/health`
- [ ] Frontend is running on port 3000
- [ ] Browser console shows detailed errors
- [ ] Network tab shows the actual request
- [ ] No CORS errors in console
- [ ] API URL is correct: `http://localhost:5001/api`

## 🧪 Test in Browser Console

Open browser console and run:
```javascript
fetch('http://localhost:5001/api/polls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
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

This will show you the exact error.

## ✅ Expected Behavior After Fix

1. **Backend Terminal:**
   - Should show: `POST /api/polls` with request body
   - Should show: `MongoDB connected`
   - Should show: `Server running on port 5001`

2. **Browser Console:**
   - Should show: "Creating poll with: ..."
   - Should show: "Poll created successfully: ..."
   - No network errors

3. **UI:**
   - Should show success toast
   - Poll should be created
   - Form should close

## 🐛 If Still Not Working

1. **Share Browser Console Output:**
   - Copy all console errors
   - Copy network request details

2. **Share Backend Terminal Output:**
   - Copy all logs when creating poll

3. **Verify:**
   - Backend URL: `http://localhost:5001`
   - Frontend URL: `http://localhost:3000`
   - Both are running

