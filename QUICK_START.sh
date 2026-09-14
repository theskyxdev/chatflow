#!/bin/bash

# ChatFlow - Quick Start Script
# This script helps you set up ChatFlow quickly

echo "╔═══════════════════════════════════════╗"
echo "║   ChatFlow - Quick Start Setup        ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing server dependencies..."
    npm install
else
    echo "✅ Server dependencies already installed"
fi

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your configuration"
    echo ""
    echo "Required settings:"
    echo "  - MONGODB_URI"
    echo "  - JWT_ACCESS_SECRET"
    echo "  - JWT_REFRESH_SECRET"
    echo "  - CLOUDINARY credentials"
    echo "  - EMAIL credentials"
else
    echo "✅ .env already exists"
fi

cd ..

echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing client dependencies..."
    npm install
else
    echo "✅ Client dependencies already installed"
fi

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created with defaults"
else
    echo "✅ .env already exists"
fi

cd ..

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Setup Complete!                     ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure backend:"
echo "   Edit server/.env with your settings:"
echo "   - MongoDB connection string"
echo "   - JWT secrets"
echo "   - Cloudinary credentials"
echo "   - Email settings"
echo ""
echo "2. Start backend (Terminal 1):"
echo "   cd server"
echo "   npm run dev"
echo ""
echo "3. Start frontend (Terminal 2):"
echo "   cd client"
echo "   npm run dev"
echo ""
echo "4. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "5. (Optional) Seed test data:"
echo "   cd server"
echo "   npm run seed"
echo ""
echo "📚 See SETUP_GUIDE.md for detailed instructions"
echo ""
