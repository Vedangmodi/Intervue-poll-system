# Postman Setup Guide

## 📥 Import Postman Collection

### Method 1: Import JSON File

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `POSTMAN_COLLECTION.json` from the project root
5. Click **Import**

### Method 2: Import from URL

1. Open Postman
2. Click **Import** button
3. Select **Link** tab
4. Paste the collection JSON URL (if hosted)
5. Click **Import**

---

## 🔧 Configure Environment Variables

After importing, set up environment variables:

1. Click on the collection name: **"Intervue Poll API"**
2. Go to **Variables** tab
3. Set the following variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:5001` | `http://localhost:5001` |
| `pollId` | (empty) | (will be set automatically) |
| `userId` | (empty) | (will be set automatically) |
| `studentId` | (empty) | (will be set automatically) |

---

## 🧪 Testing Workflow

### Step 1: Health Check
1. Run **Health Check** request
2. Should return: `{"status":"ok"}`

### Step 2: Create Users

**Create Teacher:**
1. Run **Create User** request
2. Body: `{ "name": "Teacher", "role": "teacher" }`
3. Copy the `userId` from response
4. Update collection variable `userId` with this value

**Create Student:**
1. Run **Create User** request again
2. Body: `{ "name": "Student 1", "role": "student" }`
3. Copy the `userId` from response
4. Update collection variable `studentId` with this value

### Step 3: Create Poll

1. Run **Create Poll** request
2. Body:
   ```json
   {
     "question": "Which planet is known as the Red Planet?",
     "options": ["Mars", "Venus", "Jupiter", "Saturn"],
     "duration": 60
   }
   ```
3. Copy the `_id` from response
4. Update collection variable `pollId` with this value

### Step 4: Start Poll

1. Run **Start Poll** request
2. Uses `{{pollId}}` variable automatically
3. Should return poll with `status: "active"`

### Step 5: Get Active Poll

1. Run **Get Active Poll** request
2. Should return the active poll with `remainingTime`

### Step 6: Submit Vote

1. Run **Submit Vote** request
2. Body:
   ```json
   {
     "pollId": "{{pollId}}",
     "studentId": "{{studentId}}",
     "studentName": "Student 1",
     "optionIndex": 0
   }
   ```
3. `optionIndex: 0` = first option (Mars)
4. Should return success

### Step 7: Get Poll Results

1. Run **Get Poll Results** request
2. Uses `{{pollId}}` variable automatically
3. Should return results with percentages

### Step 8: Get Active Students

1. Run **Get Active Students** request
2. Should return list of students

### Step 9: Kick Student

1. Run **Kick Student** request
2. Uses `{{studentId}}` variable automatically
3. Student should be marked as kicked out

### Step 10: Get Poll History

1. Run **Get Poll History** request
2. Should return list of completed polls

---

## 🔄 Auto-Save Variables (Advanced)

To automatically save `pollId` and `userId` from responses:

1. Go to **Tests** tab in each request
2. Add script to save variables:

**For Create Poll:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("pollId", jsonData._id);
    console.log("Saved pollId:", jsonData._id);
}
```

**For Create User:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("userId", jsonData.userId);
    console.log("Saved userId:", jsonData.userId);
}
```

---

## 📋 Quick Test Checklist

- [ ] Health check works
- [ ] Create user (teacher) works
- [ ] Create user (student) works
- [ ] Create poll works
- [ ] Start poll works
- [ ] Get active poll works
- [ ] Submit vote works
- [ ] Get poll results works
- [ ] Get active students works
- [ ] Kick student works
- [ ] Get poll history works
- [ ] Get poll state works
- [ ] Complete poll works

---

## 🐛 Troubleshooting

### Variables Not Working

- Make sure variables are set in collection variables (not environment)
- Use `{{variableName}}` syntax in URLs and body
- Check variable names match exactly (case-sensitive)

### CORS Errors

- Make sure backend is running on port 5001
- Check backend `.env` has `FRONTEND_URL=http://localhost:3000`
- Backend has CORS enabled for all origins

### Connection Refused

- Verify backend is running: `curl http://localhost:5001/health`
- Check port in `baseUrl` variable matches backend port
- Make sure MongoDB is running

### 404 Not Found

- Check `pollId` and `userId` variables are set
- Verify the IDs exist in database
- Check URL path is correct

---

## 💡 Tips

1. **Use Collection Variables**: Set once, use everywhere
2. **Save Responses**: Right-click response → Save Response
3. **Use Pre-request Scripts**: Set variables before request
4. **Use Tests**: Automatically validate responses
5. **Organize in Folders**: Group related requests

---

## 📚 Additional Resources

- See `API_ENDPOINTS.md` for detailed endpoint documentation
- See `README.md` for system overview
- See `SETUP.md` for installation instructions

