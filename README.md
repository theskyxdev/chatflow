# ChatFlow - Real-Time Chat Application

A production-ready real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io.

## Features

✅ Real-time messaging with Socket.io  
✅ JWT authentication with refresh tokens  
✅ Message status (sent, delivered, seen)  
✅ Typing indicators & online status  
✅ User profiles with avatar uploads (Cloudinary)  
✅ Search users and conversations  
✅ Dark/Light mode  
✅ Responsive design (mobile & desktop)  
✅ OAuth support (Google, GitHub - optional)

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Zustand, Socket.io-client, React Hook Form, Zod  
**Backend:** Node.js, Express, MongoDB, Socket.io, JWT, Cloudinary, Nodemailer, Passport.js

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service (Gmail with app password)

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment Variables

**server/.env** (copy from server/.env.example):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatflow
JWT_ACCESS_SECRET=your_random_secret_min_32_chars
JWT_REFRESH_SECRET=your_random_secret_min_32_chars
RESET_PASSWORD_SECRET=your_random_secret_min_32_chars
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=ChatFlow <noreply@chatflow.com>
CLIENT_URL=http://localhost:5173
```

**client/.env** (copy from client/.env.example):
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run the App

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

**Access:**  
Frontend: http://localhost:5173  
Backend: http://localhost:5000

---

## Deployment

### Recommended Setup
**Backend:** Railway, Render, or Heroku  
**Frontend:** Vercel or Netlify  
**Database:** MongoDB Atlas

### Backend Deployment (Railway/Render)

1. **Connect your repository** to Railway or Render
2. **Set environment variables:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_ACCESS_SECRET=strong_random_string_32+_chars
   JWT_REFRESH_SECRET=strong_random_string_32+_chars
   RESET_PASSWORD_SECRET=strong_random_string_32+_chars
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM=ChatFlow <noreply@chatflow.com>
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```
3. **Build command:** `npm install`
4. **Start command:** `npm start`
5. **Root directory:** `server`

### Frontend Deployment (Vercel/Netlify)

1. **Connect your repository**
2. **Set environment variables:**
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SOCKET_URL=https://your-backend.railway.app
   ```
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Root directory:** `client`

### Post-Deployment Checklist
- ✅ Update `CLIENT_URL` in backend to match your frontend domain
- ✅ Update OAuth callback URLs if using Google/GitHub login
- ✅ Test Socket.io connection (check browser console)
- ✅ Test image uploads to Cloudinary
- ✅ Test password reset emails

---

## Project Structure

```
chatflow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── config/        # API & socket config
│   │   └── utils/         # Utilities
│   ├── .env.example
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── socket/        # Socket.io handlers
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utilities
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Available Scripts

### Server
```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run seed     # Seed test data (optional)
```

### Client
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users/me` - Current user
- `GET /api/users/all` - Get all users
- `GET /api/users/search?q=` - Search users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

### Conversations
- `GET /api/conversations` - List conversations
- `POST /api/conversations` - Create conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message (via Socket.io preferred)
- `GET /api/messages/search?q=` - Search messages

### Socket.io Events
**Client → Server:**  
`join_conversation`, `send_message`, `typing`, `stop_typing`, `message_seen`

**Server → Client:**  
`receive_message`, `user_typing`, `user_stop_typing`, `message_delivered`, `message_read`, `user_online`, `user_offline`

---

## Security Features

- ✅ Bcrypt password hashing
- ✅ JWT with short-lived access tokens
- ✅ HTTP-only refresh token cookies
- ✅ Rate limiting on auth routes
- ✅ Input validation (express-validator, zod)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ MongoDB indexes for performance

---

## Troubleshooting

**Socket.io not connecting:**
- Check CORS: `CLIENT_URL` in server must match frontend domain
- Check Socket.io URL in client `.env`

**Images not uploading:**
- Verify Cloudinary credentials in server `.env`

**Emails not sending:**
- Use Gmail app password (not regular password)
- Enable 2FA and create app-specific password in Google Account settings

**MongoDB connection issues:**
- Whitelist your IP in MongoDB Atlas
- Check connection string format

---

-AKASH KUMBHAR
