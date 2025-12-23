# 🚀 Contest Platform - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Judge0 instance (optional, for code execution)

## Installation Steps

### 1️⃣ Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Configure your .env file with:
# - MongoDB connection string
# - JWT secret
# - Judge0 API URL (if available)
# - Other configurations

# Start the server
npm run dev
```

The backend will run on **http://localhost:5000**

### 2️⃣ Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Create .env file (optional)
copy .env.example .env

# Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173**

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Judge0
JUDGE0_API_URL=http://localhost:2358
JUDGE0_API_KEY=

# CORS
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Database Setup

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and add it to server/.env

## Judge0 Setup (Optional)

### Using Docker:

```bash
# Clone Judge0
git clone https://github.com/judge0/judge0.git
cd judge0

# Start Judge0
docker-compose up -d
```

Judge0 will be available at **http://localhost:2358**

### Or use Judge0 CE API (Free tier available)

Visit [ce.judge0.com](https://ce.judge0.com/) for hosted solution

## Creating Admin User

By default, all registered users are regular users. To create an admin:

1. Register a new account through the UI
2. Manually update the user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

## Running the Application

1. Start Backend: `cd server && npm run dev`
2. Start Frontend: `cd client && npm run dev`
3. Open browser: http://localhost:5173

## Default Features

✅ User Registration & Login  
✅ Contest Browsing  
✅ Contest Registration  
✅ MCQ Tests (when configured)  
✅ Coding Challenges (requires Judge0)  
✅ Live Leaderboards  
✅ User Dashboard  
✅ Admin Panel (for ADMIN role)

## Admin Features

Admins can:
- Create/Edit/Delete Contests
- Add MCQ Questions
- Add Coding Problems
- Manage Testcases
- View All Submissions
- Download Reports

## Tech Stack Details

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Node-cron for scheduled tasks
- Judge0 for code execution

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
npx kill-port 5000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### MongoDB Connection Error
- Check your connection string
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Judge0 Connection Error
- Verify Judge0 is running
- Check JUDGE0_API_URL in .env
- Test Judge0 directly: http://localhost:2358/about

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **API Testing**: Use the /health endpoint to test backend
3. **Logs**: Check terminal for detailed logs
4. **Database**: Use MongoDB Compass to view database

## Production Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist folder to Vercel
```

### Backend (Render/Railway)
```bash
cd server
# Set environment variables in platform
# Deploy from GitHub
```

### Database (MongoDB Atlas)
- Already production-ready
- Enable backup & monitoring

## Support

For issues or questions:
- Check the troubleshooting section
- Review logs in terminal
- Verify all environment variables

## Next Steps

1. ✅ Setup MongoDB Atlas
2. ✅ Configure environment variables  
3. ✅ Start both servers
4. ✅ Create admin account
5. ✅ Create your first contest!

---

**Happy Coding! 🎉**
