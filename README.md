# Intervue Poll - Resilient Live Polling System

A real-time polling system built for Intervue.io SDE Intern Assignment. Supports **Teacher** (Admin) and **Student** (User) personas with robust state recovery and real-time synchronization.

## 🎯 Features

### Teacher Persona
- Create polls with questions, options, and timer duration (30s, 60s, 90s, 120s)
- Mark options as correct/incorrect during creation
- Start polls and view live results with real-time percentage bars
- View poll history (all completed polls)
- Manage participants (view list, kick out students)
- Real-time timer synchronization
- Auto-redirects to create poll form on first visit

### Student Persona
- Enter name on first visit (unique per session)
- Receive poll questions instantly when teacher starts poll
- Submit exactly one vote per question
- View live results after submission
- Timer synchronization (correct remaining time even if joining late)
- Kicked out state handling with dedicated screen
- State recovery on page refresh

### System Resilience
- **State Recovery**: Both personas can refresh mid-poll and resume exactly where they left off
- **Timer Synchronization**: Server is source of truth. Students joining late see correct remaining time
- **Data Integrity**: Backend enforces one vote per student per question (unique database index)
- **Real-time Updates**: Socket.io for instant updates across all clients

## 🛠 Technology Stack

**Backend:** Node.js + Express, Socket.io, MongoDB + Mongoose  
**Frontend:** React.js with Hooks, Context API, React Router, Axios, React Hot Toast  
**Architecture:** Controller-Service pattern with strict separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start backend
npm run dev
```

Backend runs on `http://localhost:5001`

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
EOF

# Start frontend
npm start
```

Frontend runs on `http://localhost:3000`

## 📖 Usage

### For Teachers
1. Select "I'm a Teacher" → Auto-redirects to create poll form
2. Enter question, select duration, add options (mark correct/incorrect)
3. Click "Ask Question" → Poll is created
4. Click "Start Poll" → Poll broadcasts to all students
5. View live results with percentage bars
6. Access participants list via floating chat button (bottom-right)
7. Click "View Poll History" in header to see all completed polls

### For Students
1. Select "I'm a Student" → Enter your name
2. Wait for teacher to start poll
3. Select an option and click "Submit Vote"
4. View live results immediately

## 📁 Project Structure

```
intervue.ioassignment/
├── backend/
│   ├── models/          # Database schemas
│   ├── services/        # Business logic
│   ├── controllers/     # HTTP handlers
│   ├── routes/          # API routes
│   ├── sockets/         # Socket.io handlers
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── contexts/    # State management
│   │   ├── hooks/       # Custom hooks
│   │   └── pages/       # Page components
│   └── package.json
└── README.md
```

## 🏗 Architecture

### Backend
- **Models**: Database schemas (Poll, Vote, User)
- **Services**: All business logic (`poll.service.js`, `user.service.js`)
- **Controllers**: HTTP request/response handling
- **Sockets**: Real-time event coordination

**Key Principle:** Business logic is NEVER in routes or socket listeners - always in services.

### Frontend
- **Custom Hooks**: `useSocket`, `usePollTimer`, `usePollState`
- **Context API**: `PollContext` for centralized state
- **Pages**: Route-level components

## ⏱ Timer Synchronization

Server calculates remaining time: `remainingTime = endTime - now`

**Example:** Student joins 10s after poll starts (60s duration) → sees 50s remaining, not 60s.

## 🔄 State Recovery

On page refresh:
- **Student**: Fetches `/api/polls/state?userId=...` → receives `{ poll, hasVoted, votedOption, kickedOut }`
- **Teacher**: Fetches `/api/polls/active` → receives `{ poll, remainingTime }`

Socket automatically reconnects and syncs state.

## 📡 API Endpoints

### Polls
- `POST /api/polls` - Create poll
- `GET /api/polls/active` - Get active poll
- `GET /api/polls/state?userId=...` - Get user's poll state
- `POST /api/polls/:pollId/start` - Start poll
- `GET /api/polls/:pollId/results` - Get results

### Users
- `GET /api/users/students` - Get active students
- `POST /api/users/students/:studentId/kick` - Kick student

### History
- `GET /api/history` - Get all completed polls

### Health
- `GET /health` - Health check

## 🔌 Socket Events

### Client → Server
- `register` - Register user
- `start_poll` - Start poll (teacher)
- `submit_vote` - Submit vote (student)
- `kick_student` - Kick student (teacher)
- `get_state` - Request current state

### Server → Client
- `poll_started` - Poll started
- `poll_completed` - Poll completed
- `poll_results_updated` - Results updated
- `timer_update` - Timer update (every second)
- `kicked_out` - User kicked out
- `students_list` - Updated students list
- `poll_state` - Current poll state

## 🔒 Data Integrity

- Unique index on `{ pollId, studentId }` in Vote model → prevents duplicate votes
- Server validates all operations
- Timer calculated server-side (source of truth)

## 🧪 Testing

1. Teacher creates and starts poll
2. Student joins and votes
3. Student joins late → verify correct timer
4. Refresh mid-poll → verify state recovery
5. Try voting twice → verify prevention
6. Teacher kicks student → verify kicked-out screen
7. View poll history

## 🚀 Deployment

### Environment Variables

**Backend (.env):**
```env
PORT=5001
MONGODB_URI=mongodb://your-connection-string/intervue-poll
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Deploy build/ folder
```

**Backend:**
```bash
cd backend
npm start
# Use PM2: pm2 start server.js --name intervue-poll
```

## 📝 Key Notes

- Correct answer tracking: Teachers mark options as Yes/No during creation (stored for future use)
- Floating chat panel: Bottom-right button toggles participants list
- State recovery: Works for both teacher and student on refresh
- Timer sync: Server broadcasts every second, clients sync

## 📄 License

Created for Intervue.io SDE Intern Assignment.

## 📧 Contact

pallavi@intervue.info

---

**Built with ❤️ for Intervue.io**
