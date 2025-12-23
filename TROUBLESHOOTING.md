# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Backend Issues

#### 1. MongoDB Connection Failed

**Error**: `MongoDB Connection Error`

**Solutions**:
```bash
# Check your connection string in .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...

# Verify:
1. Username and password are correct
2. IP address is whitelisted in MongoDB Atlas
3. Network connection is stable
4. Database name exists
```

**Quick Test**:
```javascript
// Test in MongoDB Compass or Atlas UI
// If connection works there, copy exact string to .env
```

---

#### 2. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:
```powershell
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Or change port in server/.env
PORT=5001
```

---

#### 3. JWT Secret Error

**Error**: `secretOrPrivateKey must have a value`

**Solution**:
```bash
# Ensure JWT_SECRET is set in .env
JWT_SECRET=your_very_long_and_secure_secret_key_here_change_in_production
```

---

#### 4. Judge0 Connection Failed

**Error**: `Judge0 submission error`

**Solutions**:
1. **Judge0 not running**:
   ```bash
   # Start Judge0 with Docker
   cd judge0
   docker-compose up -d
   ```

2. **Wrong URL**:
   ```bash
   # Check .env
   JUDGE0_API_URL=http://localhost:2358
   ```

3. **Test Judge0**:
   ```bash
   curl http://localhost:2358/about
   ```

4. **Temporary Solution**:
   - Comment out Judge0 calls
   - Use mock responses for testing

---

#### 5. CORS Error

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
```javascript
// server/app.js - Verify CORS config
app.use(cors({
  origin: 'http://localhost:5173', // Must match frontend URL
  credentials: true
}));
```

---

### 🔵 Frontend Issues

#### 1. Cannot Connect to Backend

**Error**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions**:
1. **Check backend is running**:
   ```bash
   # Terminal should show:
   # 🚀 Contest Platform Server
   # Running on port 5000
   ```

2. **Verify API URL**:
   ```javascript
   // client/src/utils/constants.js
   export const API_BASE_URL = 'http://localhost:5000/api';
   ```

3. **Check Vite proxy** (if using):
   ```javascript
   // client/vite.config.js
   server: {
     proxy: {
       '/api': 'http://localhost:5000'
     }
   }
   ```

---

#### 2. 401 Unauthorized Error

**Error**: `Not authorized, token failed`

**Solutions**:
1. **Token expired**: Login again
2. **Clear storage**:
   ```javascript
   // Browser console
   localStorage.clear();
   // Then login again
   ```

3. **Check token format**:
   ```javascript
   // Should be: Bearer <token>
   // Check authService.js interceptor
   ```

---

#### 3. Blank Page After Build

**Error**: White screen in production

**Solutions**:
1. **Check console** for errors
2. **Build correctly**:
   ```bash
   npm run build
   # Check dist/ folder exists
   ```

3. **Base URL issue**:
   ```javascript
   // vite.config.js
   base: '/' // or your subdirectory
   ```

---

#### 4. Styles Not Loading

**Error**: Page looks unstyled

**Solutions**:
1. **Tailwind not loaded**:
   ```bash
   # Reinstall
   npm install -D tailwindcss postcss autoprefixer
   ```

2. **Check imports**:
   ```javascript
   // main.jsx
   import './index.css' // Must be imported
   ```

3. **Verify Tailwind config**:
   ```javascript
   // tailwind.config.js
   content: [
     "./index.html",
     "./src/**/*.{js,jsx}" // Must include all JSX
   ]
   ```

---

### 🟡 Installation Issues

#### 1. npm install Fails

**Error**: `npm ERR! code ERESOLVE`

**Solutions**:
```bash
# Use legacy peer deps
npm install --legacy-peer-deps

# Or
npm install --force

# Or clear cache
npm cache clean --force
npm install
```

---

#### 2. Module Not Found

**Error**: `Cannot find module 'express'`

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install

# Or specific package
npm install express
```

---

#### 3. Permission Denied

**Error**: `EACCES: permission denied`

**Solutions**:
```bash
# Run as administrator
# Or fix npm permissions

# Windows: Run PowerShell as Admin
# Then: npm install
```

---

### 🟢 Runtime Issues

#### 1. Contest Status Not Updating

**Error**: Contest stays in UPCOMING

**Solutions**:
1. **Cron job not running**:
   ```javascript
   // Check server logs for:
   // ✅ Cron jobs started
   ```

2. **Time zone issue**:
   ```javascript
   // Ensure dates are in UTC
   startTime: new Date().toISOString()
   ```

3. **Manual trigger**:
   ```javascript
   // Call cron function manually for testing
   ```

---

#### 2. Leaderboard Not Updating

**Error**: Scores not reflected

**Solutions**:
1. **Refresh page** (no WebSocket yet)
2. **Check result saved**:
   ```javascript
   // Verify in MongoDB
   db.results.find({ contestId: "..." })
   ```

3. **Recalculate ranks**:
   ```bash
   # API call to trigger recalculation
   ```

---

#### 3. File Upload Issues

**Error**: Cannot upload testcases

**Solutions**:
```javascript
// Backend needs multer configured
npm install multer

// Add to controller
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
```

---

### 🔴 Database Issues

#### 1. Duplicate Key Error

**Error**: `E11000 duplicate key error`

**Solutions**:
```javascript
// User with email exists
// Use different email

// Or clear test data
db.users.deleteMany({ email: /test/ })
```

---

#### 2. Validation Error

**Error**: `Validation failed`

**Solutions**:
```javascript
// Check required fields in model
// Ensure all required data is sent

// Example:
{
  "name": "Required",
  "email": "Required",
  "password": "Required"
}
```

---

#### 3. Cannot Read Properties

**Error**: `Cannot read property '_id' of null`

**Solutions**:
```javascript
// Add null checks
if (!contest) {
  return res.status(404).json({ message: 'Not found' });
}

// Use optional chaining
const id = contest?._id;
```

---

## 🛠️ Development Tools

### Useful Commands

```bash
# Check Node version
node --version  # Should be v18+

# Check npm version
npm --version

# Check running processes
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# View MongoDB logs
# In MongoDB Atlas dashboard

# Test backend endpoint
curl http://localhost:5000/health

# Test with POST
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Browser DevTools

```javascript
// Check API calls
// Network tab -> Filter by XHR

// Check localStorage
localStorage.getItem('token')
localStorage.getItem('user')

// Clear storage
localStorage.clear()

// Check Context state
// React DevTools -> Components -> AuthProvider
```

### VS Code Extensions

Recommended:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)
- Error Lens

---

## 🚨 Emergency Fixes

### Nuclear Option (Reset Everything)

```bash
# Backend
cd server
rm -rf node_modules
rm package-lock.json
npm install
npm run dev

# Frontend
cd client
rm -rf node_modules
rm package-lock.json
npm install
npm run dev

# Database
# Drop database in MongoDB Atlas
# Restart server to recreate
```

### Quick Health Check

```bash
# 1. Backend running?
curl http://localhost:5000/health

# 2. Frontend running?
# Open http://localhost:5173

# 3. MongoDB connected?
# Check server logs for: ✅ MongoDB Connected

# 4. Can register user?
# Try registration form

# 5. Can login?
# Try login form
```

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Read error message carefully
3. ✅ Check browser console (F12)
4. ✅ Check server terminal logs
5. ✅ Verify .env variables
6. ✅ Try restarting servers
7. ✅ Google the exact error message

### What to Include

When reporting issues:
1. Exact error message
2. Which file/component
3. What you tried
4. Your environment (OS, Node version)
5. Screenshots if helpful

### Debug Checklist

```markdown
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] MongoDB is connected
- [ ] .env files configured
- [ ] All dependencies installed
- [ ] Ports are not in use
- [ ] No console errors
- [ ] Network tab shows API calls
- [ ] Token is being sent
- [ ] CORS is configured
```

---

## 💡 Pro Tips

1. **Always check logs first** - Most errors are visible in terminal
2. **Use browser DevTools** - Network tab shows API calls
3. **Test backend independently** - Use Postman/Thunder Client
4. **Read error messages carefully** - They usually tell you what's wrong
5. **One change at a time** - Easier to identify issues
6. **Keep backups** - Commit to git frequently
7. **Don't panic** - Most issues are simple to fix

---

## ✅ Verification Script

Use this to verify everything works:

```bash
# 1. Backend health
curl http://localhost:5000/health

# 2. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 4. Get contests
curl http://localhost:5000/api/contests

# All should return success: true
```

---

**Still stuck? Review SETUP.md and API.md** 📚
