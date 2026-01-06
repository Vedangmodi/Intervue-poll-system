#!/bin/bash

echo "🚀 Intervue Poll - Quick Start Script"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null && ! command -v mongosh &> /dev/null; then
    echo "⚠️  MongoDB not found. You can:"
    echo "   1. Install MongoDB locally"
    echo "   2. Use MongoDB Atlas (cloud)"
    echo ""
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVEOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ENVEOF
    echo "✅ Created backend/.env"
    echo "⚠️  If using MongoDB Atlas, update MONGODB_URI in backend/.env"
else
    echo "✅ Backend .env already exists"
fi

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'ENVEOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
ENVEOF
    echo "✅ Created frontend/.env"
else
    echo "✅ Frontend .env already exists"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Start backend:  cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm start"
echo ""
echo "See TESTING_GUIDE.md for detailed testing instructions"
