#!/bin/bash

echo "🚀 Starting Smart Task Manager for Network Access..."
echo ""

# Get local IP address
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

echo "📍 Your local IP address: $IP_ADDRESS"
echo "🎯 Allowed IP: 192.168.18.28"
echo ""
echo "📱 Access URLs:"
echo "   Local: http://localhost:5173"
echo "   Network: http://$IP_ADDRESS:5173"
echo "   Specific IP: http://192.168.18.28:5173"
echo ""
echo "⚠️  Starting servers..."
echo ""

# Start backend server
echo "Starting backend server..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are running!"
echo "📱 Access from 192.168.18.28 using: http://$IP_ADDRESS:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user to stop
wait 