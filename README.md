# Intervue Poll - Resilient Live Polling System

A real-time polling system built for Intervue.io SDE Intern Assignment. This system supports two personas: **Teacher** (Admin) and **Student** (User), with robust state recovery and real-time synchronization.

## Features

### Teacher Persona
- Create polls with customizable questions, options, and timer duration
- Start polls and view live results in real-time
- View poll history (stored in database)
- Manage participants (view list, kick out students)
- Can only ask a new question if no active poll exists or all students have answered

### Student Persona
- Enter name on first visit (unique per session)
- Receive poll questions instantly when teacher asks
- Submit exactly one vote per question
- View live results after submission
- Timer synchronization (shows correct remaining time even if joining late)
- Handled kicked out state

### System Resilience
- **State Recovery**: Both teacher and student can refresh mid-poll and resume exactly where they left off
- **Timer Synchronization**: Server is the source of truth for timers. Students joining late see correct remaining time
- **Data Integrity**: Backend enforces one vote per student per question, even if API is spammed
- **Real-time Updates**: Socket.io for instant updates across all clients

## Technology Stack

### Backend
- **Node.js** + **Express** - REST API server
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** + **Mongoose** - Database and ODM
- **Architecture**: Controller-Service pattern with separated concerns

### Frontend
- **React.js** with Hooks
- **Context API** - State management
- **Custom Hooks**:
  - `useSocket` - Socket connection management
  - `usePollTimer` - Timer logic separation
  - `usePollState` - Poll state management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - User notifications

## Project Structure

```
intervue.ioassignment/
├── backend/
│   ├── models/
│   │   ├── Poll.model.js
│   │   ├── Vote.model.js
│   │   └── User.model.js
│   ├── services/
│   │   ├── poll.service.js
│   │   └── user.service.js
│   ├── controllers/
│   │   ├── poll.controller.js
│   │   └── user.controller.js
│   ├── routes/
│   │   ├── poll.routes.js
│   │   ├── history.routes.js
│   │   └── user.routes.js
│   ├── sockets/
│   │   └── poll.socket.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── contexts/
│   │   │   └── PollContext.js
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── usePollTimer.js
│   │   │   └── usePollState.js
│   │   ├── pages/
│   │   │   ├── RoleSelection.js
│   │   │   ├── StudentNameEntry.js
│   │   │   ├── StudentDashboard.js
│   │   │   ├── TeacherDashboard.js
│   │   │   ├── PollHistory.js
│   │   │   └── KickedOut.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults provided):
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

4. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Architecture Details

### Backend Architecture

**Separation of Concerns:**
- **Models**: Database schemas (Poll, Vote, User)
- **Services**: Business logic (poll.service.js, user.service.js)
- **Controllers**: Request/response handling (poll.controller.js, user.controller.js)
- **Routes**: API endpoint definitions
- **Sockets**: Real-time event handlers (poll.socket.js)

**Key Design Decisions:**
- Business logic is NEVER in routes or socket listeners
- Services handle all database operations
- Controllers are thin and delegate to services
- Socket handlers coordinate between services and emit events

### Frontend Architecture

**Custom Hooks:**
- `useSocket`: Manages socket connection lifecycle
- `usePollTimer`: Handles timer countdown logic
- `usePollState`: Manages poll-related state

**Context API:**
- `PollContext`: Centralized state management
- Provides poll state, user info, and actions to all components

**Component Structure:**
- Pages are top-level route components
- Reusable UI components (can be extracted)
- Separation of UI and business logic

## Poll Lifecycle

1. **Teacher creates poll**: Question, options, duration set
2. **Teacher starts poll**: Poll becomes active, timer starts on server
3. **Students receive poll**: Socket event broadcasts to all students
4. **Students vote**: One vote per student enforced by backend
5. **Results update**: Real-time percentage updates via socket
6. **Poll completes**: Either timer expires or all students vote
7. **Results persist**: Saved to database for history

## Timer Synchronization

**Server-side Timer:**
- Server calculates `endTime = startTime + duration`
- Server broadcasts remaining time every second
- Clients sync their local timers with server updates

**Late Join Scenario:**
- Student joins 10 seconds after poll starts (60s duration)
- Server calculates: `remainingTime = endTime - now = 50s`
- Student receives `remainingTime: 50` in poll state
- Student's timer starts at 50s, not 60s

## State Recovery

**On Page Refresh:**

1. **Student:**
   - Fetches current poll state from `/api/polls/state?userId=...`
   - Receives: `{ poll, hasVoted, votedOption, kickedOut }`
   - If `hasVoted`: Fetches results
   - Timer syncs with server's remaining time

2. **Teacher:**
   - Fetches active poll from `/api/polls/active`
   - Receives: `{ poll, remainingTime }`
   - Timer syncs with server
   - Fetches students list

**Socket Reconnection:**
- Socket automatically reconnects
- Emits `register` event with user info
- Server sends current state via socket events

## API Endpoints

### Polls
- `POST /api/polls` - Create a new poll
- `GET /api/polls/active` - Get active poll
- `GET /api/polls/state?userId=...` - Get poll state for user
- `POST /api/polls/:pollId/start` - Start a poll
- `POST /api/polls/vote` - Submit a vote
- `GET /api/polls/:pollId/results` - Get poll results
- `POST /api/polls/:pollId/complete` - Complete a poll

### History
- `GET /api/history` - Get poll history

### Users
- `POST /api/users` - Create user
- `GET /api/users/students` - Get active students
- `POST /api/users/students/:studentId/kick` - Kick out student

## Socket Events

### Client → Server
- `register` - Register user with socket
- `create_poll` - Create a poll (teacher only)
- `start_poll` - Start a poll (teacher only)
- `submit_vote` - Submit a vote (student only)
- `kick_student` - Kick out a student (teacher only)
- `get_poll_results` - Request poll results
- `get_state` - Request current state

### Server → Client
- `registered` - Registration confirmation
- `poll_created` - Poll created event
- `poll_started` - Poll started event
- `poll_completed` - Poll completed event
- `poll_results_updated` - Results updated
- `timer_update` - Timer update (every second)
- `kicked_out` - User kicked out
- `students_list` - Updated students list
- `all_students_answered` - All students voted
- `error` - Error message

## Data Integrity

**Vote Validation:**
- Backend checks: poll exists, poll is active, poll not expired
- Backend checks: student hasn't voted (unique index on `pollId + studentId`)
- Backend checks: valid option index
- Even if client sends multiple requests, only one vote is recorded

**Timer Validation:**
- Server calculates remaining time based on `endTime`
- Client timers are synchronized with server every second
- If client timer drifts, server correction applies

## Error Handling

- Database connection errors: Graceful degradation, user-friendly messages
- Socket disconnects: Automatic reconnection with state recovery
- Vote submission failures: Toast notifications, optimistic UI updates
- Invalid operations: Clear error messages via socket events

## Testing Scenarios

1. **Teacher creates and starts poll** ✓
2. **Student joins and votes** ✓
3. **Student joins late (timer sync)** ✓
4. **Teacher refreshes mid-poll** ✓
5. **Student refreshes mid-poll** ✓
6. **Multiple students vote simultaneously** ✓
7. **Student tries to vote twice** ✓
8. **Teacher kicks out student** ✓
9. **Poll expires automatically** ✓
10. **View poll history** ✓

## Deployment Notes

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_URL` - Socket.io server URL

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```
Deploy the `build` folder to your hosting service.

**Backend:**
```bash
cd backend
npm start
```
Use PM2 or similar for process management.

## Future Enhancements

- Chat feature (UI placeholder exists)
- Poll analytics and insights
- Export poll results
- Multiple choice questions
- Question templates
- Student authentication

## License

This project is created for Intervue.io SDE Intern Assignment.

## Contact

For questions or issues, please contact: pallavi@intervue.info


