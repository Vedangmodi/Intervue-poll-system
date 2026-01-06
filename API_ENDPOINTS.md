# API Endpoints Reference

Base URL: `http://localhost:5001`

## 📋 Table of Contents
- [Health Check](#health-check)
- [Polls](#polls)
- [Users](#users)
- [History](#history)

---

## Health Check

### GET /health
Check if the server is running.

**Request:**
```
GET http://localhost:5001/health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

## Polls

### POST /api/polls
Create a new poll.

**Request:**
```
POST http://localhost:5001/api/polls
Content-Type: application/json

{
  "question": "Which planet is known as the Red Planet?",
  "options": ["Mars", "Venus", "Jupiter", "Saturn"],
  "duration": 60
}
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "question": "Which planet is known as the Red Planet?",
  "options": [
    { "text": "Mars", "votes": 0 },
    { "text": "Venus", "votes": 0 },
    { "text": "Jupiter", "votes": 0 },
    { "text": "Saturn", "votes": 0 }
  ],
  "duration": 60,
  "status": "pending",
  "createdAt": "2024-01-05T12:00:00.000Z"
}
```

**Note:** Save the `_id` for use in other endpoints.

---

### GET /api/polls/active
Get the currently active poll.

**Request:**
```
GET http://localhost:5001/api/polls/active
```

**Response (if active poll exists):**
```json
{
  "poll": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "question": "Which planet is known as the Red Planet?",
    "options": [
      { "text": "Mars", "votes": 0 },
      { "text": "Venus", "votes": 0 },
      { "text": "Jupiter", "votes": 0 },
      { "text": "Saturn", "votes": 0 }
    ],
    "duration": 60,
    "startTime": "2024-01-05T12:00:00.000Z",
    "endTime": "2024-01-05T12:01:00.000Z",
    "remainingTime": 45,
    "status": "active"
  }
}
```

**Response (if no active poll):**
```json
{
  "poll": null
}
```

---

### GET /api/polls/state?userId={userId}
Get poll state for a specific user (for state recovery).

**Request:**
```
GET http://localhost:5001/api/polls/state?userId=user_1234567890_abc123
```

**Response:**
```json
{
  "poll": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "question": "Which planet is known as the Red Planet?",
    "options": [
      { "text": "Mars", "votes": 0 },
      { "text": "Venus", "votes": 0 },
      { "text": "Jupiter", "votes": 0 },
      { "text": "Saturn", "votes": 0 }
    ],
    "remainingTime": 45,
    "status": "active"
  },
  "hasVoted": false,
  "votedOption": null,
  "kickedOut": false
}
```

**Response (if user is kicked out):**
```json
{
  "kickedOut": true
}
```

---

### POST /api/polls/:pollId/start
Start an existing poll.

**Request:**
```
POST http://localhost:5001/api/polls/65a1b2c3d4e5f6g7h8i9j0k1/start
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "question": "Which planet is known as the Red Planet?",
  "options": [
    { "text": "Mars", "votes": 0 },
    { "text": "Venus", "votes": 0 },
    { "text": "Jupiter", "votes": 0 },
    { "text": "Saturn", "votes": 0 }
  ],
  "duration": 60,
  "startTime": "2024-01-05T12:00:00.000Z",
  "endTime": "2024-01-05T12:01:00.000Z",
  "status": "active"
}
```

**Error Response:**
```json
{
  "error": "An active poll already exists. Please wait for it to complete."
}
```

---

### POST /api/polls/vote
Submit a vote for a poll.

**Request:**
```
POST http://localhost:5001/api/polls/vote
Content-Type: application/json

{
  "pollId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "studentId": "user_1234567890_abc123",
  "studentName": "John Doe",
  "optionIndex": 0
}
```

**Note:** `optionIndex` is 0-based:
- 0 = first option
- 1 = second option
- 2 = third option
- etc.

**Response:**
```json
{
  "success": true,
  "vote": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "pollId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "studentId": "user_1234567890_abc123",
    "studentName": "John Doe",
    "optionIndex": 0,
    "submittedAt": "2024-01-05T12:00:15.000Z"
  }
}
```

**Error Response:**
```json
{
  "error": "You have already voted for this poll"
}
```

---

### GET /api/polls/:pollId/results
Get results for a specific poll.

**Request:**
```
GET http://localhost:5001/api/polls/65a1b2c3d4e5f6g7h8i9j0k1/results
```

**Response:**
```json
{
  "poll": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "question": "Which planet is known as the Red Planet?",
    "status": "completed"
  },
  "results": [
    {
      "optionIndex": 0,
      "text": "Mars",
      "votes": 8,
      "percentage": 80
    },
    {
      "optionIndex": 1,
      "text": "Venus",
      "votes": 1,
      "percentage": 10
    },
    {
      "optionIndex": 2,
      "text": "Jupiter",
      "votes": 1,
      "percentage": 10
    },
    {
      "optionIndex": 3,
      "text": "Saturn",
      "votes": 0,
      "percentage": 0
    }
  ],
  "totalVotes": 10
}
```

---

### POST /api/polls/:pollId/complete
Manually complete a poll.

**Request:**
```
POST http://localhost:5001/api/polls/65a1b2c3d4e5f6g7h8i9j0k1/complete
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "question": "Which planet is known as the Red Planet?",
  "status": "completed",
  "endTime": "2024-01-05T12:01:00.000Z"
}
```

---

## Users

### POST /api/users
Create a new user.

**Request:**
```
POST http://localhost:5001/api/users
Content-Type: application/json

{
  "name": "John Doe",
  "role": "student"
}
```

**Note:** `role` can be `"teacher"` or `"student"`

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "userId": "user_1234567890_abc123",
  "name": "John Doe",
  "role": "student",
  "isActive": true,
  "kickedOut": false,
  "createdAt": "2024-01-05T12:00:00.000Z"
}
```

**Note:** Save the `userId` for use in other endpoints.

---

### GET /api/users/students
Get list of all active students.

**Request:**
```
GET http://localhost:5001/api/users/students
```

**Response:**
```json
{
  "students": [
    {
      "userId": "user_1234567890_abc123",
      "name": "John Doe",
      "socketId": "socket_abc123"
    },
    {
      "userId": "user_0987654321_xyz789",
      "name": "Jane Smith",
      "socketId": "socket_xyz789"
    }
  ]
}
```

---

### POST /api/users/students/:studentId/kick
Kick out a student.

**Request:**
```
POST http://localhost:5001/api/users/students/user_1234567890_abc123/kick
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "userId": "user_1234567890_abc123",
    "name": "John Doe",
    "kickedOut": true,
    "isActive": false
  }
}
```

---

## History

### GET /api/history
Get history of completed polls.

**Request:**
```
GET http://localhost:5001/api/history?limit=50
```

**Query Parameters:**
- `limit` (optional): Number of polls to return (default: 50)

**Response:**
```json
{
  "history": [
    {
      "pollId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "question": "Which planet is known as the Red Planet?",
      "createdAt": "2024-01-05T12:00:00.000Z",
      "results": [
        {
          "optionIndex": 0,
          "text": "Mars",
          "votes": 8,
          "percentage": 80
        },
        {
          "optionIndex": 1,
          "text": "Venus",
          "votes": 1,
          "percentage": 10
        },
        {
          "optionIndex": 2,
          "text": "Jupiter",
          "votes": 1,
          "percentage": 10
        },
        {
          "optionIndex": 3,
          "text": "Saturn",
          "votes": 0,
          "percentage": 0
        }
      ],
      "totalVotes": 10
    }
  ]
}
```

---

## 🧪 Testing Workflow

### Complete Test Flow:

1. **Health Check**
   ```
   GET /health
   ```

2. **Create Teacher User**
   ```
   POST /api/users
   Body: { "name": "Teacher", "role": "teacher" }
   Save: userId
   ```

3. **Create Student User**
   ```
   POST /api/users
   Body: { "name": "Student 1", "role": "student" }
   Save: userId (as studentId)
   ```

4. **Create Poll**
   ```
   POST /api/polls
   Body: { "question": "Test?", "options": ["A", "B"], "duration": 60 }
   Save: _id (as pollId)
   ```

5. **Start Poll**
   ```
   POST /api/polls/{pollId}/start
   ```

6. **Get Active Poll**
   ```
   GET /api/polls/active
   ```

7. **Submit Vote**
   ```
   POST /api/polls/vote
   Body: { "pollId": "...", "studentId": "...", "studentName": "...", "optionIndex": 0 }
   ```

8. **Get Poll Results**
   ```
   GET /api/polls/{pollId}/results
   ```

9. **Get Active Students**
   ```
   GET /api/users/students
   ```

10. **Kick Student**
    ```
    POST /api/users/students/{studentId}/kick
    ```

11. **Get Poll History**
    ```
    GET /api/history
    ```

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- `optionIndex` is 0-based (starts from 0)
- `pollId` and `userId` are MongoDB ObjectIds or UUIDs
- All endpoints return JSON
- Error responses have `error` field with message
- CORS is enabled for `http://localhost:3000`

---

## 🔍 Common Error Responses

### 400 Bad Request
```json
{
  "error": "Question and at least 2 options are required"
}
```

### 404 Not Found
```json
{
  "error": "Poll not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection error"
}
```

