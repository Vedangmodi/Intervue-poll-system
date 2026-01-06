# 🔧 Fix Backend Port Issue - Step by Step

## The Problem
The backend is trying to use port 5000 even though we changed it to 5001. This is because:
1. The .env file might have PORT=5000
2. There's a process still using port 5000
3. The .env file might not be in the correct format

## ✅ Solution - Run These Commands

### Step 1: Kill All Processes on Ports 5000 and 5001

```bash
# Kill processes on port 5000
lsof -ti:5000 | xargs kill -9

# Kill processes on port 5001
lsof -ti:5001 | xargs kill -9

# Or kill all node processes
pkill -9 node
pkill -9 nodemon
```

### Step 2: Update backend/.env File

```bash
cd backend

# Delete old .env and create new one
rm -f .env

# Create new .env file with correct port
cat > .env << 'EOF'
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Verify the file
cat .env
```

**Expected output:**
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Step 3: Verify Environment Variable

```bash
cd backend
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT);"
```

**Should output:** `PORT: 5001`

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
MongoDB connected
Server running on port 5001
```

## 🚀 Quick Fix Script

I've created a fix script. Run this:

```bash
cd backend
chmod +x FIX_PORT.sh
./FIX_PORT.sh
```

Then:
```bash
npm run dev
```

## ✅ Verification

After starting the server:

1. **Check the terminal output:**
   - Should say: `Server running on port 5001`
   - Should NOT say: `port 5000`

2. **Test health endpoint:**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"ok"}`

3. **Check in browser:**
   - Go to: `http://localhost:5001/health`
   - Should see: `{"status":"ok"}`

## 🐛 If Still Not Working

### Option 1: Hardcode Port in server.js (Temporary)

Edit `backend/server.js` line 51:
```javascript
const PORT = 5001; // Force port 5001
```

### Option 2: Check for Multiple .env Files

```bash
cd backend
find . -name ".env*" -type f
```

Make sure there's only one `.env` file in the `backend` directory.

### Option 3: Check .env File Format

Make sure your `.env` file:
- Has no spaces around the `=` sign
- Has no quotes around values
- Uses Unix line endings (LF, not CRLF)
- Is in the `backend` directory (same directory as `server.js`)

### Option 4: Restart Terminal

Sometimes environment variables are cached. Try:
1. Close the terminal
2. Open a new terminal
3. Navigate to backend
4. Run `npm run dev`

## 📋 Complete Command Sequence

Copy and paste this entire block:

```bash
# Kill processes
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

# Go to backend
cd backend

# Remove old .env
rm -f .env

# Create new .env
cat > .env << 'EOF'
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Verify
cat .env
echo ""
echo "Testing PORT variable:"
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT);"

# Start server
echo ""
echo "Starting server..."
npm run dev
```

## ✅ Success Indicators

When it works, you'll see:
- ✅ `MongoDB connected`
- ✅ `Server running on port 5001`
- ✅ NO errors about port 5000
- ✅ Health endpoint works: `curl http://localhost:5001/health`

