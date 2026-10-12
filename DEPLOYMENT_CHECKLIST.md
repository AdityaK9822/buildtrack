# BuildTrack Deployment Checklist

Complete guide for deploying BuildTrack to production.

---

## 📋 Pre-Deployment Checklist

### Environment Variables Required

**Backend (.env / Render Environment Variables)**
- [x] `MONGODB_URI` - MongoDB Atlas connection string
- [x] `JWT_SECRET` - Strong secret key (min 32 characters)
- [x] `NODE_ENV` - Set to `production`
- [x] `PORT` - Set to `3000` (or let Render handle it)
- [ ] `CLIENT_URL` - Your Vercel frontend URL (add after deploying frontend)
- [ ] `FIREBASE_PRIVATE_KEY` - For push notifications (optional)
- [ ] `FIREBASE_PROJECT_ID` - For Firebase (optional)
- [ ] `WEATHER_API_KEY` - For weather features (optional)

**Frontend (.env.production)**
- [x] `VITE_API_BASE_URL` = `https://buildtrack-api-j1lo.onrender.com/api`

---

## 🚀 Deployment Steps

### Step 1: Backend Deployment (Render)

**Status: ✅ COMPLETED**

- **URL**: https://buildtrack-api-j1lo.onrender.com
- **Service ID**: `srv-db6e0lh42hec73btatcg`
- **Region**: Oregon (US West)
- **Instance Type**: Free

**Completed Tasks:**
- [x] Created Render account and service
- [x] Connected GitHub repository
- [x] Set environment variables in Render dashboard
- [x] Configured `render.yaml` for deployment
- [x] Whitelisted `0.0.0.0/0` in MongoDB Atlas Network Access
- [x] Verified `/api/health` endpoint is working
- [x] Added root route handler (`/`)
- [x] Updated CORS configuration

**Verification:**
```bash
# Test health endpoint
curl https://buildtrack-api-j1lo.onrender.com/api/health

# Test root endpoint
curl https://buildtrack-api-j1lo.onrender.com/
```

---

### Step 2: Frontend Deployment (Vercel)

**Status: ⏳ PENDING**

#### Option A: Vercel CLI Deployment

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to client directory**
   ```bash
   cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project/client"
   ```

4. **Deploy to preview**
   ```bash
   vercel
   ```
   
   Follow prompts:
   - Link to existing project? → **No**
   - Project name? → **buildtrack-client**
   - In which directory? → **./**
   - Override settings? → **No**

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard Deployment

1. Go to https://vercel.com/login
2. Click **"Add New"** → **"Project"**
3. Import GitHub repository: `AdityaK9822/buildtrack`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - `VITE_API_BASE_URL` = `https://buildtrack-api-j1lo.onrender.com/api`
6. Click **"Deploy"**

**After Deployment:**
- [ ] Note your production URL (e.g., `https://buildtrack-client.vercel.app`)
- [ ] Test frontend loads correctly
- [ ] Test API connectivity

---

### Step 3: Update Backend CORS with Frontend URL

**Status: ⏳ PENDING (after Step 2)**

1. Go to Render Dashboard: https://dashboard.render.com/web/srv-db6e0lh42hec73btatcg
2. Click **"Environment"** tab
3. Add/Edit environment variable:
   ```
   CLIENT_URL = https://your-vercel-app.vercel.app
   ```
4. Click **"Save Changes"**
5. Wait for automatic redeploy (1-2 minutes)

**Note:** The CORS configuration now automatically allows all `.vercel.app` URLs, but setting `CLIENT_URL` is recommended for production.

---

### Step 4: Push Latest Changes to GitHub

**Status: ⏳ PENDING**

Some changes (CORS update) need to be pushed:

```bash
cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project"
git status
git push origin master
```

**If authentication fails:**
1. Generate GitHub Personal Access Token (PAT):
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Select `repo` scope
2. Use PAT as password when prompted

---

## ✅ Post-Deployment Verification

### Backend Health Checks

```bash
# Health endpoint
curl https://buildtrack-api-j1lo.onrender.com/api/health

# Root endpoint
curl https://buildtrack-api-j1lo.onrender.com/

# Expected response:
# {"success":true,"message":"Welcome to BuildTrack API",...}
```

### Frontend Verification

1. Open your Vercel URL in browser
2. Check browser console for errors
3. Test user registration
4. Test user login
5. Test project creation
6. Verify all API calls work

### Full-Stack Integration Test

```bash
# Test CORS from frontend
curl -I -X OPTIONS \
  -H "Origin: https://your-vercel-app.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  https://buildtrack-api-j1lo.onrender.com/api/health

# Should return:
# Access-Control-Allow-Origin: https://your-vercel-app.vercel.app
# Access-Control-Allow-Credentials: true
```

---

## 🔧 Configuration Files Summary

### Backend Files

**render.yaml** - Render deployment config
```yaml
services:
  - type: web
    name: buildtrack-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
```

**src/app.js** - CORS configuration
- Allows localhost for development
- Allows all `.vercel.app` preview deployments
- Supports `CLIENT_URL` environment variable
- Credentials enabled for authentication

### Frontend Files

**client/vercel.json** - Vercel deployment config
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**client/.env.production** - Production environment
```
VITE_API_BASE_URL=https://buildtrack-api-j1lo.onrender.com/api
```

---

## 🔐 MongoDB Atlas Configuration

**Status: ✅ CONFIGURED**

- **Cluster Name**: BuildTrack
- **Connection String**: `mongodb+srv://AdityaK9822:Aditi9822@ac-akuinwv-shard-00-XX.pz6f33q.mongodb.net`
- **Network Access**: `0.0.0.0/0` (Allow access from anywhere)
- **Database User**: `AdityaK9822`

**Security Note:** For production, consider:
- [ ] Creating IP-specific whitelist (requires static IP)
- [ ] Creating production-specific database user
- [ ] Enabling MongoDB Atlas encryption at rest

---

## 🌐 Production URLs

| Service | URL |
|---------|-----|
| Backend API | https://buildtrack-api-j1lo.onrender.com |
| Health Check | https://buildtrack-api-j1lo.onrender.com/api/health |
| Frontend | https://YOUR-APP.vercel.app (pending deployment) |
| GitHub Repo | https://github.com/AdityaK9822/buildtrack |

---

## 🚨 Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms:**
- CORS errors in browser console
- Network requests fail
- 401/403 errors

**Solutions:**
1. Check CORS configuration in `src/app.js`
2. Verify `CLIENT_URL` in Render environment
3. Check browser network tab for blocked requests
4. Verify `VITE_API_BASE_URL` in Vercel environment

### Issue: Render deployment fails

**Symptoms:**
- Build fails
- Server won't start
- Health check fails

**Solutions:**
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check `render.yaml` configuration
4. Verify `package.json` scripts are correct

### Issue: MongoDB connection fails

**Symptoms:**
- "Connection timeout"
- "IP not whitelisted"
- Server crashes on startup

**Solutions:**
1. Verify Network Access in MongoDB Atlas
2. Check database user credentials
3. Verify connection string format
4. Check MongoDB Atlas cluster status

### Issue: Git push hangs/fails

**Symptoms:**
- Push timeout
- Authentication failed
- Permission denied

**Solutions:**
1. Use GitHub Personal Access Token (PAT)
2. Check internet connection
3. Verify repository permissions
4. Try SSH instead of HTTPS

---

## 📊 Monitoring & Maintenance

### Render Dashboard
- URL: https://dashboard.render.com/web/srv-db6e0lh42hec73btatcg
- Monitor: CPU, Memory, Response time
- Logs: Real-time server logs
- Alerts: Set up email notifications

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Monitor: Deployments, Analytics
- Logs: Function logs, build logs
- Domains: Custom domain setup

### MongoDB Atlas
- URL: https://cloud.mongodb.com
- Monitor: Connections, Operations, Storage
- Alerts: Set up performance alerts
- Backups: Enable cloud backup (paid plans)

---

## 🎯 Next Steps After Deployment

1. [ ] Set up custom domain (optional)
2. [ ] Configure SSL certificates (automatic with Vercel/Render)
3. [ ] Set up monitoring and alerts
4. [ ] Implement rate limiting (already configured)
5. [ ] Set up CI/CD pipeline (GitHub Actions)
6. [ ] Add database backups
7. [ ] Configure Firebase for push notifications
8. [ ] Add email service for notifications
9. [ ] Set up error tracking (Sentry, LogRocket)
10. [ ] Performance optimization and caching

---

## 📝 Notes

- **Free Tier Limits:**
  - Render: 750 hours/month, spins down after inactivity
  - Vercel: 100GB bandwidth, 100 builds/day
  - MongoDB Atlas: 512MB storage, shared cluster

- **Cold Start:**
  - Render free tier spins down after 15 min inactivity
  - First request after spin-down takes 30-60 seconds
  - Consider upgrading to paid tier for production

- **Rate Limiting:**
  - Backend has rate limiting: 100 requests per 15 min
  - Adjust in `src/app.js` if needed

---

## 🆘 Support

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Last Updated**: October 12, 2026  
**Deployment Version**: 1.0.0  
**Maintained By**: BuildTrack Team
