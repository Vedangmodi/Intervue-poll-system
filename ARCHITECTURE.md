# Architecture & Implementation Details

## System Overview

This document explains the architectural decisions, design patterns, and implementation details of the Resilient Live Polling System.

## Backend Architecture

### Separation of Concerns

The backend follows a strict **Controller-Service-Model** pattern:

```
Request → Route → Controller → Service → Model → Database
```

**Models** (`models/`):
- Define database schemas
- No business logic
- Pure data structures with validation

**Services** (`services/`):
- Contain ALL business logic
- Handle database operations
- Perform calculations and validations
- Are called by both controllers and socket handlers

**Controllers** (`controllers/`):
- Handle HTTP requests/responses
- Validate request data
- Delegate to services
- Return appropriate HTTP responses

**Socket Handlers** (`sockets/`):
- Handle real-time events
- Coordinate between services
- Emit socket events
- NO business logic (delegates to services)

### Example Flow: Creating a Poll

1. **HTTP Request**: `POST /api/polls`
2. **Route**: `poll.routes.js` → `pollController.createPoll`
3. **Controller**: Validates request, calls `pollService.createPoll`
4. **Service**: 
   - Checks for active polls
   - Validates options
   - Creates poll in database
   - Returns poll object
5. **Controller**: Returns HTTP response

### Example Flow: Starting a Poll (Socket)

1. **Socket Event**: `start_poll` from client
2. **Socket Handler**: Validates teacher role, calls `pollService.startPoll`
3. **Service**:
   - Validates poll exists
   - Checks if all students answered previous poll
   - Updates poll status and timestamps
   - Returns poll
4. **Socket Handler**: Starts timer, emits `poll_started` to all clients

## Timer Synchronization

### Server-Side Timer (Source of Truth)

**Key Principle**: Server calculates remaining time based on `endTime`, not elapsed time.

```javascript
// In poll.service.js
calculateRemainingTime(poll) {
  const now = new Date();
  const remaining = Math.max(0, Math.floor((poll.endTime - now) / 1000));
  return remaining;
}
```

**How it works:**
1. When poll starts: `endTime = startTime + duration`
2. Server broadcasts remaining time every second
3. Clients sync their local timers with server updates
4. Late-joining students receive correct remaining time

**Example Scenario:**
- Poll duration: 60 seconds
- Start time: 10:00:00
- End time: 10:01:00
- Student joins at: 10:00:20
- Remaining time sent: `40 seconds` (not 60)

### Client-Side Timer

**Purpose**: Provide smooth countdown UI, synced with server

```javascript
// In usePollTimer.js
useEffect(() => {
  if (isRunning && timer > 0) {
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer - 1);
    }, 1000);
  }
}, [isRunning, timer]);
```

**Synchronization:**
- Server sends `timer_update` event every second
- Client receives and calls `startTimer(remainingTime)`
- Local timer resets to server value (prevents drift)

## State Recovery

### Problem Statement

When a user refreshes the browser:
- Active poll should continue
- Timer should show correct remaining time
- Vote status should be preserved
- Results should be available if already voted

### Solution: Dual Recovery Mechanism

#### 1. HTTP API Recovery (Initial Load)

**Endpoint**: `GET /api/polls/state?userId=...`

**Response**:
```json
{
  "poll": {
    "_id": "...",
    "question": "...",
    "options": [...],
    "remainingTime": 45,
    "status": "active"
  },
  "hasVoted": true,
  "votedOption": 0,
  "kickedOut": false
}
```

**Flow**:
1. Component mounts
2. Checks localStorage for `userId`
3. Calls `/api/polls/state?userId=...`
4. Receives current state
5. Updates UI accordingly

#### 2. Socket Recovery (Reconnection)

**Event**: `register` with user info

**Server Response**:
- `poll_state` event (for students)
- `poll_active` event (for teachers)
- `students_list` event (for teachers)

**Flow**:
1. Socket reconnects
2. Client emits `register` with `{ userId, name, role }`
3. Server looks up user state
4. Server emits appropriate events
5. Client updates state

### Why Both?

- **HTTP**: Works even if socket is slow to connect
- **Socket**: Provides real-time updates after recovery
- **Redundancy**: Ensures state is always recovered

## Data Integrity

### One Vote Per Student Per Poll

**Database Level**:
```javascript
// In Vote.model.js
voteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });
```

**Service Level**:
```javascript
// In poll.service.js
const existingVote = await Vote.findOne({ pollId, studentId });
if (existingVote) {
  throw new Error('You have already voted');
}
```

**Why Both?**
- Database index prevents duplicate votes even if service check fails
- Service check provides user-friendly error message
- Race conditions handled at database level

### Vote Validation

**Checks Performed**:
1. Poll exists
2. Poll is active
3. Poll hasn't expired
4. Student hasn't voted (unique constraint)
5. Option index is valid

**Even if client sends multiple requests:**
- Database unique index prevents duplicates
- Service returns error for subsequent attempts
- Only first vote is recorded

## Frontend Architecture

### Custom Hooks Pattern

**Separation of Concerns**:
- `useSocket`: Socket connection management
- `usePollTimer`: Timer logic
- `usePollState`: Poll state management

**Benefits**:
- Logic separated from UI
- Reusable across components
- Easier to test
- Clear responsibilities

### Context API for State Management

**PollContext**:
- Centralized state
- Provides actions to components
- Handles socket events
- Manages user session

**Why Context over Redux?**
- Simpler for this use case
- Less boilerplate
- Sufficient for state management needs
- Easier to understand

### Component Structure

**Pages** (Route components):
- `RoleSelection`: Initial role selection
- `StudentNameEntry`: Student registration
- `StudentDashboard`: Student voting interface
- `TeacherDashboard`: Teacher poll management
- `PollHistory`: Historical poll results
- `KickedOut`: Kicked out screen

**Pattern**:
- Pages handle routing and high-level logic
- Delegate to context for state/actions
- Use custom hooks for specific logic
- Presentational components (can be extracted)

## Real-Time Communication

### Socket.io Event Flow

**Teacher Creates Poll**:
```
Teacher → create_poll → Server
Server → poll_created → All Clients
```

**Teacher Starts Poll**:
```
Teacher → start_poll → Server
Server → poll_started → All Clients
Server → Starts timer (broadcasts every second)
```

**Student Votes**:
```
Student → submit_vote → Server
Server → Validates vote
Server → vote_submitted → Student (confirmation)
Server → poll_results_updated → All Clients
```

**Timer Updates**:
```
Server → timer_update → All Clients (every second)
```

### Event Naming Convention

**Client → Server**: `action_name` (e.g., `create_poll`, `submit_vote`)
**Server → Client**: `entity_action` (e.g., `poll_started`, `vote_submitted`)

## Error Handling

### Backend Error Handling

**Service Layer**:
- Throws descriptive errors
- No HTTP status codes (services don't know about HTTP)

**Controller Layer**:
- Catches service errors
- Maps to appropriate HTTP status codes
- Returns user-friendly messages

**Socket Layer**:
- Catches errors
- Emits `error` event to client
- Logs for debugging

### Frontend Error Handling

**Toast Notifications**:
- Success: Green toast
- Error: Red toast
- Info: Blue toast

**Optimistic Updates**:
- UI updates immediately
- Reverts on error
- Provides feedback

**Connection Errors**:
- Socket reconnects automatically
- State recovery on reconnect
- User notified of disconnection

## Database Schema

### Poll Model

```javascript
{
  question: String (max 100 chars),
  options: [{
    text: String,
    votes: Number
  }],
  duration: Number (10-300 seconds),
  startTime: Date,
  endTime: Date,
  status: 'pending' | 'active' | 'completed',
  totalVotes: Number
}
```

### Vote Model

```javascript
{
  pollId: ObjectId (ref: Poll),
  studentId: String (unique per poll),
  studentName: String,
  optionIndex: Number,
  submittedAt: Date
}
```

**Unique Index**: `{ pollId: 1, studentId: 1 }` ensures one vote per student per poll

### User Model

```javascript
{
  userId: String (unique),
  name: String,
  role: 'teacher' | 'student',
  socketId: String,
  isActive: Boolean,
  kickedOut: Boolean
}
```

## Security Considerations

### Input Validation

- Question: Max 100 characters
- Options: 2-10 options, max 50 chars each
- Duration: 10-300 seconds
- Name: Trimmed, validated

### Authorization

- Socket events check user role
- Teachers can only create/start polls
- Students can only vote
- Backend validates all operations

### Data Integrity

- Database constraints (unique indexes)
- Service-level validation
- No client-side only validation

## Performance Considerations

### Database Indexes

- Poll: `{ status: 1, createdAt: -1 }` for active poll queries
- Vote: `{ pollId: 1, studentId: 1 }` for vote lookups
- User: `{ userId: 1 }`, `{ socketId: 1 }` for user lookups

### Socket Optimization

- Timer updates broadcasted every second (not per-client)
- Results only fetched when needed
- State recovery on demand

### Frontend Optimization

- React.memo for expensive components (can be added)
- Lazy loading for routes (can be added)
- Debouncing for rapid actions (not needed here)

## Testing Strategy

### Manual Testing Scenarios

1. **Basic Flow**: Create poll → Start → Vote → View results
2. **State Recovery**: Refresh mid-poll → Verify state restored
3. **Timer Sync**: Join late → Verify correct remaining time
4. **Multiple Votes**: Try voting twice → Verify prevention
5. **Kick Student**: Remove student → Verify kicked out screen
6. **Poll History**: Complete poll → View history

### Edge Cases Handled

- Student joins after poll expires
- Teacher refreshes during active poll
- Multiple students vote simultaneously
- Network disconnection during vote
- Invalid option selection
- Empty options in poll creation

## Future Enhancements

### Potential Improvements

1. **Chat Feature**: UI placeholder exists, backend can be added
2. **Poll Analytics**: Detailed statistics and insights
3. **Question Templates**: Pre-defined question sets
4. **Student Authentication**: Proper user accounts
5. **Export Results**: CSV/PDF export functionality
6. **Multiple Choice**: Allow multiple option selection
7. **Poll Scheduling**: Schedule polls for future times

### Scalability Considerations

- Redis for session management (if needed)
- Load balancing for multiple server instances
- Database sharding for large datasets
- CDN for static assets

## Conclusion

This architecture prioritizes:
1. **Separation of Concerns**: Clear boundaries between layers
2. **Resilience**: State recovery and error handling
3. **Data Integrity**: Multiple validation layers
4. **Real-time Accuracy**: Server-side timer synchronization
5. **Maintainability**: Clean code structure and patterns

The system is production-ready and follows industry best practices for real-time applications.


