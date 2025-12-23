# 🚀 Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Error handling verified
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] Code committed to Git

---

## 🌐 Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard

1. **Build the project**:
   ```bash
   cd client
   npm run build
   ```

2. **Go to [vercel.com](https://vercel.com)**

3. **Import Git Repository** or **Upload dist folder**

4. **Configure Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

6. **Deploy!**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd client
vercel

# Follow prompts
# Production deployment: vercel --prod
```

### Vercel Configuration

Create `vercel.json` in client folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

---

## ⚡ Backend Deployment (Render)

### Step 1: Prepare for Deployment

1. **Add start script** to `server/package.json`:
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

2. **Create render.yaml** in root:
   ```yaml
   services:
     - type: web
       name: contest-platform-api
       env: node
       region: oregon
       buildCommand: cd server && npm install
       startCommand: cd server && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)**

2. **New Web Service**

3. **Connect Git Repository**

4. **Configure**:
   - Name: contest-platform-api
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-frontend-url.vercel.app
   JUDGE0_API_URL=your_judge0_url
   ```

6. **Deploy!**

### Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd server
railway init

# Deploy
railway up

# Add environment variables
railway variables set MONGODB_URI=...
```

---

## 🍃 MongoDB Atlas (Production Database)

### Setup

1. **Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)**

2. **Create Cluster** (M0 Free Tier)

3. **Database Access**:
   - Create database user
   - Use strong password
   - Save credentials

4. **Network Access**:
   - Add IP: `0.0.0.0/0` (Allow all)
   - Or specific deployment IPs

5. **Get Connection String**:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/contest-platform?retryWrites=true&w=majority
   ```

6. **Replace in backend env**:
   ```
   MONGODB_URI=mongodb+srv://...
   ```

### Database Indexes (Important!)

Run these in MongoDB Atlas:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Contests collection
db.contests.createIndex({ status: 1, startTime: -1 })
db.contests.createIndex({ isPublished: 1 })

// Results collection
db.results.createIndex({ userId: 1, contestId: 1 }, { unique: true })
db.results.createIndex({ contestId: 1, totalScore: -1, timeTaken: 1 })

// Submissions collection
db.submissions.createIndex({ userId: 1, contestId: 1, problemId: 1 })

// MCQ collection
db.mcqs.createIndex({ contestId: 1, order: 1 })

// CodingProblems collection
db.codingproblems.createIndex({ contestId: 1, order: 1 })
```

---

## 🏃 Judge0 Deployment (Optional)

### Option 1: Oracle Cloud Free VM

1. **Create Oracle Cloud Account**

2. **Create VM Instance**:
   - Shape: VM.Standard.A1.Flex (Free)
   - OS: Ubuntu 20.04
   - SSH keys configured

3. **Connect via SSH**

4. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

5. **Install Judge0**:
   ```bash
   git clone https://github.com/judge0/judge0.git
   cd judge0
   docker-compose up -d
   ```

6. **Configure Firewall**:
   ```bash
   sudo ufw allow 2358
   ```

7. **Get Public IP**:
   ```bash
   curl ifconfig.me
   ```

8. **Update Backend .env**:
   ```
   JUDGE0_API_URL=http://your-vm-ip:2358
   ```

### Option 2: Use Judge0 CE (Paid)

1. **Subscribe at [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)**

2. **Get API Key**

3. **Update backend**:
   ```
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your_api_key
   ```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ chars)
- [ ] Enable HTTPS (Vercel/Render do this)
- [ ] Restrict CORS to your domain
- [ ] Enable rate limiting (already done)
- [ ] Add helmet middleware (already done)
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Hide error stack traces in production
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Set up database backups

### Update Production ENV

```bash
# Backend
NODE_ENV=production
JWT_SECRET=<VERY_LONG_RANDOM_STRING>
MONGODB_URI=<PRODUCTION_DB>
CLIENT_URL=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com/api
```

---

## 🔧 Post-Deployment

### 1. Create Admin User

```javascript
// Connect to MongoDB Atlas
// Run in Mongo Shell:

use contest-platform
db.users.findOne({ email: "admin@example.com" })
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### 2. Verify Deployment

```bash
# Check backend
curl https://your-api.com/health

# Check frontend
# Open in browser: https://your-app.com

# Test registration
# Try creating account

# Test login
# Login with credentials

# Test API
# Check network tab in DevTools
```

### 3. Monitor Logs

- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → View Logs
- **MongoDB**: Atlas → Metrics

### 4. Set Up Monitoring (Optional)

- **Uptime Robot**: Monitor uptime
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: Usage tracking

---

## 🌍 Custom Domain (Optional)

### For Frontend (Vercel)

1. **Buy domain** (Namecheap, GoDaddy, etc.)

2. **Vercel Dashboard**:
   - Project → Settings → Domains
   - Add your domain
   - Follow DNS instructions

3. **Update CORS in backend**:
   ```
   CLIENT_URL=https://your-domain.com
   ```

### For Backend (Render)

1. **Render Dashboard**:
   - Service → Settings → Custom Domain
   - Add domain
   - Configure DNS

2. **Update frontend .env**:
   ```
   VITE_API_URL=https://api.your-domain.com/api
   ```

---

## 📊 Performance Optimization

### Backend

```javascript
// Enable compression
import compression from 'compression';
app.use(compression());

// Cache static responses
// Use Redis for session storage
// Enable MongoDB indexes (done!)
// Use CDN for static assets
```

### Frontend

```javascript
// Code splitting
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Image optimization
// Use WebP format
// Lazy load images

// Bundle optimization
// Already done by Vite!
```

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
```

---

## 💰 Cost Estimate

### Free Tier (Sufficient for MVP)

- **Frontend**: Vercel Free
- **Backend**: Render Free (or Railway Free)
- **Database**: MongoDB Atlas M0 (512 MB)
- **Judge0**: Self-hosted on Oracle Cloud Free VM

**Total**: $0/month ✅

### Production Tier

- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Render Standard ($7/month)
- **Database**: MongoDB Atlas M10 ($57/month)
- **Judge0**: Oracle Cloud or RapidAPI (~$10/month)

**Total**: ~$94/month

---

## 📈 Scaling Considerations

When you grow:

1. **Database**:
   - Upgrade MongoDB cluster
   - Add read replicas
   - Enable sharding

2. **Backend**:
   - Add more instances
   - Use load balancer
   - Add caching (Redis)

3. **Frontend**:
   - Use CDN
   - Optimize assets
   - Enable service workers

4. **Judge0**:
   - Multiple instances
   - Queue system
   - Load balancing

---

## ✅ Deployment Checklist

### Pre-Deploy
- [ ] Code tested locally
- [ ] All features working
- [ ] Environment variables ready
- [ ] Git repository up to date

### Deploy
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

### Post-Deploy
- [ ] Health check passes
- [ ] Can register user
- [ ] Can login
- [ ] Can create contest (admin)
- [ ] Can view leaderboard
- [ ] All API endpoints working

### Monitor
- [ ] Set up error tracking
- [ ] Monitor uptime
- [ ] Check logs regularly
- [ ] Database backups enabled

---

## 🆘 Rollback Plan

If deployment fails:

1. **Frontend**: Revert in Vercel Dashboard
2. **Backend**: Revert in Render Dashboard
3. **Database**: Restore from backup
4. **Emergency**: Point to old URLs

---

## 📞 Support After Deployment

### Common Issues

1. **503 Service Unavailable**: Backend not running
2. **CORS Error**: Check CLIENT_URL
3. **401 Errors**: Token/Auth issues
4. **Database Connection**: Check MongoDB IP whitelist

### Debug Production

```bash
# View logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Functions → Logs

# Test API
curl https://your-api.com/health

# Check database
# MongoDB Atlas → Metrics
```

---

## 🎉 You're Live!

Your contest platform is now deployed and accessible worldwide! 🌍

**Share your platform**:
- Social media
- Developer communities
- College groups
- LinkedIn

**Next steps**:
- Monitor usage
- Gather feedback
- Add features
- Scale as needed

---

**Need help? Check TROUBLESHOOTING.md** 🛠️
