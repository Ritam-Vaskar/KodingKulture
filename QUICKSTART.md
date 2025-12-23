# Quick Start Commands

## First Time Setup

### Backend
```powershell
cd server
npm install
copy .env.example .env
# Edit .env with your MongoDB connection string
npm run dev
```

### Frontend  
```powershell
cd client
npm install
npm run dev
```

## After Setup (Quick Start)

### Option 1: Run Both Together
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Option 2: Windows Script
```powershell
# Run this from contest-platform root
start powershell -NoExit -Command "cd server; npm run dev"
start powershell -NoExit -Command "cd client; npm run dev"
```

## Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Default Credentials

After registering, manually set admin role in MongoDB:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "ADMIN" } }
)
```

## Important URLs

- MongoDB Atlas: https://cloud.mongodb.com
- Judge0 Docs: https://judge0.com
- React Docs: https://react.dev

---

**Need help? Check SETUP.md for detailed instructions**
