#!/bin/bash

echo "🔧 Fixing Backend Port Configuration..."
echo ""

# Kill any processes on ports 5000 and 5001
echo "1. Killing processes on ports 5000 and 5001..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
echo "✅ Ports cleared"

# Update .env file
echo ""
echo "2. Updating .env file..."
cd "$(dirname "$0")"
cat > .env << 'EOF'
PORT=5001
MONGODB_URI=mongodb://localhost:27017/intervue-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF
echo "✅ .env file updated with PORT=5001"

# Verify .env file
echo ""
echo "3. Verifying .env file contents:"
cat .env
echo ""

# Test if dotenv can read it
echo "4. Testing environment variable loading:"
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT || 'NOT SET');"

echo ""
echo "✅ Setup complete! Now run: npm run dev"

