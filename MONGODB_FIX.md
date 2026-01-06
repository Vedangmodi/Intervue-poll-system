# 🔧 MongoDB Connection Fix

## Problem
You're getting MongoDB connection errors:
```
MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
Operation `polls.find()` buffering timed out after 10000ms
```

This means **MongoDB is not running** or not accessible.

## ✅ Solution: Start MongoDB

### Option 1: Using Homebrew (Recommended for macOS)

Open a **new terminal window** and run:

```bash
# Check MongoDB status
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community

# Or restart if already started
brew services restart mongodb-community
```

### Option 2: Manual Start

```bash
# Start MongoDB daemon
mongod --dbpath /usr/local/var/mongodb

# Or if you have a custom data directory
mongod --dbpath ~/data/db
```

### Option 3: Use MongoDB Atlas (Cloud)

If you prefer using MongoDB Atlas (cloud database):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-poll
   ```

## 🔍 Verify MongoDB is Running

After starting MongoDB, verify it's working:

```bash
# Check if MongoDB is listening on port 27017
lsof -i :27017

# Or test connection
mongosh --eval "db.version()"
```

## 🚀 After Starting MongoDB

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **You should see:**
   ```
   MongoDB connected successfully
   Server running on port 5001
   ```

3. **Test the connection:**
   - Open browser: `http://localhost:5001/health`
   - Should return: `{"status":"ok"}`

## 📝 Quick Commands

```bash
# Start MongoDB
brew services start mongodb-community

# Stop MongoDB
brew services stop mongodb-community

# Check MongoDB status
brew services list | grep mongodb

# View MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

## ⚠️ Common Issues

### Issue: "Port 27017 already in use"
```bash
# Find process using port 27017
lsof -i :27017

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

### Issue: "Permission denied"
```bash
# Fix MongoDB data directory permissions
sudo chown -R $(whoami) /usr/local/var/mongodb
```

### Issue: MongoDB won't start
```bash
# Check MongoDB logs
cat /usr/local/var/log/mongodb/mongo.log

# Create data directory if missing
mkdir -p /usr/local/var/mongodb
```

## ✅ Once MongoDB is Running

Your backend should automatically connect and you'll see:
- ✅ `MongoDB connected successfully` in terminal
- ✅ No more timeout errors
- ✅ API endpoints working correctly

---

**Need help?** Check MongoDB logs: `/usr/local/var/log/mongodb/mongo.log`

