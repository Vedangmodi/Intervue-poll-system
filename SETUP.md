# Setup Guide - Intervue Poll System

## Quick Start

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Start MongoDB (if running locally)
# On macOS with Homebrew:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# Or use MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/intervue-poll

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
# Open a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional - defaults are provided)
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
EOF

# Start the development server
npm start
```

Frontend will run on `http://localhost:3000`

## Testing the System

### Test Flow 1: Basic Poll Creation and Voting

1. **Teacher Side:**
   - Open `http://localhost:3000` in browser
   - Select "I'm a Teacher"
   - You'll be auto-registered as "Teacher"
   - Click "Create New Poll"
   - Enter question: "Which planet is known as the Red Planet?"
   - Add options: "Mars", "Venus", "Jupiter", "Saturn"
   - Set duration: 60 seconds
   - Click "Create Poll"
   - Click "Start Poll"

2. **Student Side:**
   - Open `http://localhost:3000` in a new tab/incognito window
   - Select "I'm a Student"
   - Enter your name (e.g., "Rahul Bajaj")
   - Click "Continue"
   - You should see the question immediately
   - Select an option and click "Submit"
   - View live results

### Test Flow 2: State Recovery

1. **Teacher creates and starts a poll**
2. **Student joins and sees the question**
3. **Refresh the student's browser** (F5)
4. **Verify:** Student should see the same question with correct remaining time
5. **Refresh the teacher's browser**
6. **Verify:** Teacher should see the active poll with current results

### Test Flow 3: Late Join Timer Sync

1. **Teacher starts a 60-second poll**
2. **Wait 20 seconds**
3. **Student joins**
4. **Verify:** Student's timer shows ~40 seconds, not 60 seconds

### Test Flow 4: Multiple Votes Prevention

1. **Student votes for a question**
2. **Try to vote again** (or spam the submit button)
3. **Verify:** Only one vote is recorded, error message shown

### Test Flow 5: Kick Student

1. **Teacher views participants**
2. **Click "Kick out" on a student**
3. **Verify:** Student sees "You've been kicked out" screen
4. **Verify:** Student is removed from participants list

### Test Flow 6: Poll History

1. **Complete a poll** (wait for timer or all students vote)
2. **Teacher clicks "View Poll History"**
3. **Verify:** Previous poll appears with results

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: MongoDB connection error
```
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in `.env` file
- For MongoDB Atlas, ensure IP is whitelisted

**Port Already in Use:**
```
Error: Port 5001 is already in use
```
- Change PORT in `.env` file
- Or kill the process using port 5001: `lsof -ti:5001 | xargs kill`

**Socket.io Connection Issues:**
- Ensure CORS is properly configured
- Check `FRONTEND_URL` in backend `.env`
- Verify frontend `.env` has correct `REACT_APP_SOCKET_URL`

### Frontend Issues

**Cannot Connect to Backend:**
- Verify backend is running on port 5001
- Check `REACT_APP_API_URL` in frontend `.env`
- Check browser console for CORS errors

**Socket Not Connecting:**
- Verify `REACT_APP_SOCKET_URL` in frontend `.env`
- Check backend socket.io CORS configuration
- Ensure backend is running

**State Not Recovering:**
- Check browser console for errors
- Verify user ID is stored in localStorage
- Check network tab for API calls to `/api/polls/state`

## Production Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)

1. Set environment variables:
   - `PORT` (usually auto-set by platform)
   - `MONGODB_URI` (your MongoDB connection string)
   - `FRONTEND_URL` (your frontend URL)
   - `NODE_ENV=production`

2. Ensure `package.json` has:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```

### Frontend Deployment (e.g., Vercel, Netlify)

1. Set environment variables:
   - `REACT_APP_API_URL` (your backend API URL)
   - `REACT_APP_SOCKET_URL` (your backend Socket.io URL)

2. Build the app:
   ```bash
   npm run build
   ```

3. Deploy the `build` folder

## Architecture Verification

### Backend Structure ✓
- ✅ Models separated from business logic
- ✅ Services contain all business logic
- ✅ Controllers are thin (delegate to services)
- ✅ Socket handlers coordinate, don't contain business logic
- ✅ Routes only define endpoints

### Frontend Structure ✓
- ✅ Custom hooks for logic separation
- ✅ Context API for state management
- ✅ Components are presentational
- ✅ State recovery implemented
- ✅ Timer synchronization implemented

## Key Features Verification

- ✅ Poll creation with options and timer
- ✅ Real-time vote submission
- ✅ Live results updates
- ✅ Timer synchronization (server-side)
- ✅ State recovery on refresh
- ✅ One vote per student enforcement
- ✅ Student kick-out functionality
- ✅ Poll history from database
- ✅ Error handling and user feedback

## Next Steps

1. Test all flows mentioned above
2. Deploy to hosting platforms
3. Share the deployed links in submission email
4. Ensure both frontend and backend are accessible

## Support

For issues or questions:
- Check browser console for errors
- Check backend terminal for server logs
- Verify MongoDB connection
- Ensure all environment variables are set correctly


