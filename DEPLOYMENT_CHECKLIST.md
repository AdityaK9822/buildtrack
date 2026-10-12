# BuildTrack Deployment Checklist

## Pre-Deployment Status ✅

- ✅ Code is on GitHub: `https://github.com/AdityaK9822/buildtrack`
- ✅ JWT_SECRET updated with secure 128-character key
- ✅ `.env` file configured (local)
- ✅ `.gitignore` excludes sensitive files
- ✅ Backend structure: Node.js/Express (root directory)
- ✅ Frontend structure: React/Vite (client directory)
- ✅ Deployment guide created: `DEPLOYMENT_GUIDE.md`

---

## Step 1: Set Up MongoDB Atlas 💾

**What you need to do:**

1. **Create MongoDB Atlas Account** (if you don't have one)
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up or log in

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select your preferred region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges: "Read and write to any database"

4. **Whitelist IP Address**
   - Go to "Network Access" → "Add IP Address"
   - For Render: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For local dev: Add your current IP

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Save this connection string - you'll need it for Render!

**Example connection string:**
```
mongodb+srv://buildtrack_user:your_password@cluster0.xxxxx.mongodb.net/buildtrack?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render 🚀

### 2.1 Create Render Account
**What you need to do:**

1. Go to: https://dashboard.render.com/
2. Sign up or log in (you already have an account: asukathreads@gmail.com)

### 2.2 Create Web Service
**What you need to do:**

1. Click "New +" → "Web Service"
2. Connect GitHub repository:
   - Click "Connect GitHub"
   - Authorize Render to access GitHub
   - Select repository: `AdityaK9822/buildtrack`

3. Configure service:
   ```
   Name:            buildtrack-backend
   Region:          Oregon (or your preferred region)
   Branch:          main
   Root Directory:  . (leave empty or ".")
   Runtime:         Node
   Build Command:   npm install
   Start Command:   node server.js
   Instance Type:   Starter ($7/month) or Free (if available)
   ```

### 2.3 Add Environment Variables
**What you need to do:**

In the "Environment" section, add these variables:

```bash
# REQUIRED
MONGODB_URI=mongodb+srv://buildtrack_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/buildtrack?retryWrites=true&w=majority
JWT_SECRET=7e1c9709a9184915467cc3c3fc823d2a123ed40663200475b0916785e049dcf1342510ba5c3b0b16be08494f78fe44310a1fd93d3cb3ab49e11b358069e241c4
NODE_ENV=production
PORT=3000

# OPTIONAL (but recommended)
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-url.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# OPTIONAL - Firebase (if using push notifications)
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_KEY\n-----END PRIVATE KEY-----\n
FIREBASE_KEY_FILE=config/firebase-service-account.json

# OPTIONAL - Weather API
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

4. Click "Create Web Service"

### 2.4 Wait for Deployment
- Render will build and deploy your backend
- This usually takes 5-10 minutes
- Check "Logs" tab for any errors
- Once deployed, copy your backend URL (e.g., `https://buildtrack-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel ▲

### 3.1 Install Vercel CLI
**What you need to do:**

```bash
npm install -g vercel
```

### 3.2 Authenticate with Vercel
**What you need to do:**

```bash
vercel login
```

This will open a browser window. Log in with your preferred method (GitHub, GitLab, Bitbucket, or email).

### 3.3 Deploy to Vercel
**What you need to do:**

Option A: Deploy using CLI (Recommended)
```bash
cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project/client"
vercel
```

Follow the prompts:
1. Link to existing project? **No**
2. Project name: **buildtrack-client**
3. Directory: **.** (current directory)
4. Modify settings? **No**

Option B: Deploy using Dashboard
1. Go to: https://vercel.com/
2. Click "Add New..." → "Project"
3. Import `AdityaK9822/buildtrack`
4. Configure:
   ```
   Framework Preset:  Vite
   Root Directory:     client
   Build Command:      npm run build
   Output Directory:   dist
   ```
5. Add Environment Variable:
   ```
   VITE_API_BASE_URL=https://buildtrack-backend.onrender.com
   ```
   (Replace with your actual Render backend URL)
6. Click "Deploy"

### 3.4 Get Frontend URL
- After deployment, Vercel will provide a URL (e.g., `https://buildtrack-client.vercel.app`)
- Copy this URL for the next step

---

## Step 4: Update Backend with Frontend URL 🔄

**What you need to do:**

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your `buildtrack-backend` service
3. Go to "Environment" tab
4. Update `CLIENT_URL` to your Vercel frontend URL
   ```
   CLIENT_URL=https://buildtrack-client.vercel.app
   ```
5. Click "Save Changes"
6. Render will automatically redeploy

---

## Step 5: Test Your Deployment ✅

### Test Backend
Visit your backend URL:
```
https://buildtrack-backend.onrender.com/api/health
```

Expected response: API health status or welcome message

### Test Frontend
Visit your frontend URL:
```
https://buildtrack-client.vercel.app
```

Expected: Your BuildTrack React application loads

### Test API Integration
- Try to register/login
- Create a test project
- Upload a test photo
- Check if data persists in MongoDB Atlas

---

## Troubleshooting 🔧

### Backend Issues

**Problem: "MONGODB_URI must be set in production"**
- Solution: Make sure MongoDB Atlas connection string is added correctly
- Check for typos in password (URL encode special characters)
- Ensure IP whitelist includes `0.0.0.0/0`

**Problem: Build fails**
- Solution: Check Render logs
- Verify `npm install` runs without errors
- Check Node.js version compatibility (requires Node 18+)

**Problem: "Cannot GET /"**
- Solution: This is normal - your API routes start with `/api`
- Try `/api/health` or `/api/projects`

### Frontend Issues

**Problem: "Failed to fetch" or API connection errors**
- Solution: Verify `VITE_API_BASE_URL` points to Render backend
- Check CORS settings in backend `CLIENT_URL`
- Ensure both URLs use HTTPS

**Problem: Build fails on Vercel**
- Solution: Check Vercel build logs
- Verify `npm run build` runs locally
- Check for missing dependencies in `package.json`

### Database Issues

**Problem: Connection timeout**
- Solution: Check MongoDB Atlas IP whitelist
- Ensure `0.0.0.0/0` is added
- Verify connection string is correct

**Problem: Authentication failed**
- Solution: Double-check database username and password
- Ensure password is URL-encoded if it contains special characters

---

## Estimated Costs 💰

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Render** | Starter | $7/month |
| **Vercel** | Hobby | Free |
| **MongoDB Atlas** | M0 (Free) | $0 |
| **Total** | | **$7/month** |

**Free tier alternative:**
- Render: Free tier (limited, spins down after inactivity)
- Vercel: Free tier
- MongoDB Atlas: Free tier
- **Total: $0/month** (with limitations)

---

## Next Steps After Deployment 📝

1. ✅ Set up monitoring and alerts (Render dashboard)
2. ✅ Configure custom domain (optional)
3. ✅ Set up CI/CD for automatic deployments
4. ✅ Add Firebase push notifications (optional)
5. ✅ Configure rate limiting and security headers
6. ✅ Set up MongoDB Atlas backups
7. ✅ Add SSL certificates (automatic with Render/Vercel)

---

## Quick Reference 🔖

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/AdityaK9822/buildtrack |
| Render Dashboard | https://dashboard.render.com/ |
| Vercel Dashboard | https://vercel.com/ |
| MongoDB Atlas | https://cloud.mongodb.com/ |
| Firebase Console | https://console.firebase.google.com/ |

---

## Support

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Review Render logs: Dashboard → Service → Logs
- Review Vercel logs: Dashboard → Project → Deployments
- MongoDB Atlas support: https://www.mongodb.com/docs/atlas/

---

**Last Updated:** 2026-10-12
**Status:** Ready to deploy ✅
