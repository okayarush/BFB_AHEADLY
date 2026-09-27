#!/bin/bash

# NASA Healthy Cities - Startup Script
echo "🚀 Starting NASA Healthy Cities Application"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo

# Install server dependencies
echo "📡 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Server dependency installation failed"
    exit 1
fi

# Install client dependencies
echo "🌐 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Client dependency installation failed"
    exit 1
fi

echo
echo "✅ Dependencies installed successfully!"
echo
echo "🌍 Starting the NASA Healthy Cities application..."
echo "📊 Backend will run on: http://localhost:5000"
echo "🖥️ Frontend will run on: http://localhost:3000"
echo

# Function to cleanup background processes
cleanup() {
    echo
    echo "🛑 Shutting down servers..."
    kill $SERVER_PID 2>/dev/null
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server in background
echo "🔧 Starting backend server..."
cd ../server
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Failed to start backend server"
    exit 1
fi

# Start frontend
echo "🎉 Starting frontend..."
cd ../client
npm start

# Wait for background processes
wait
