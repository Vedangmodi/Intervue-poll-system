const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io accessible globally
global.io = io;

// Middleware - CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
};

app.use(cors(corsOptions));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervue-poll';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('\n⚠️  MongoDB is not running or not accessible.');
  console.error('Please start MongoDB using one of these methods:');
  console.error('  1. brew services start mongodb-community');
  console.error('  2. mongod (if installed manually)');
  console.error('  3. Or use MongoDB Atlas connection string in .env file');
  console.error('\nThe server will continue but database operations will fail until MongoDB is started.\n');
});

// Import routes
const pollRoutes = require('./routes/poll.routes');
const historyRoutes = require('./routes/history.routes');
const userRoutes = require('./routes/user.routes');

// Routes
app.use('/api/polls', pollRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import socket handler
const { initializeSocket } = require('./sockets/poll.socket');
initializeSocket(io);

// Force port 5001 if PORT is not set or is 5000
const PORT = process.env.PORT && process.env.PORT !== '5000' ? process.env.PORT : 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

