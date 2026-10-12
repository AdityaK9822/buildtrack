# BuildTrack Deployment Guide

This guide walks you through deploying the BuildTrack application using **Render for Backend** and **Vercel for Frontend**.

## Prerequisites
- GitHub account
- Render account (https://dashboard.render.com/)
- Vercel account (https://vercel.com/)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Firebase project (https://console.firebase.google.com/)

---

## 1. Prepare Your Environment Variables

### Backend (.env)
Update the `.env` file with your production values:

```bash
# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buildtrack?retryWrites=true&w=majority

# JWT (REQUIRED - use a secure random string)
JWT_SECRET=your-secure-32-character-jwt-secret-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# Client (update with your Vercel URL later)
CLIENT_URL=https://your-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Weather API (OPTIONAL)
WEATHER_API_KEY=your-openweathermap-api-key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# Firebase (OPTIONAL - for push notifications)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-FIREBASE-PRIVATE-KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_KEY_FILE=config/firebase-service-account.json
```

### Frontend (client/.env)
Update `client/.env` with your backend URL:

```bash
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## 2. Deploy Backend to Render

### Step 1: Create a Workspace (Optional)
1. Go to https://dashboard.render.com/
2. Click your profile → "Workspaces" → "New Workspace"
3. Name it "BuildTrack" and click "Create Workspace"

### Step 2: Create Web Service
1. In your workspace, click "New +" → "Web Service"
2. Select "GitHub" as the source
3. Connect the repository: `https://github.com/AdityaK9822/buildtrack`

### Step 3: Configure Service
Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `buildtrack-backend` |
| **Branch** | `main` (or your deployment branch) |
| **Root Directory** | `.` (leave empty for root) |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Environment** | `Node` |
| **Instance Type** | `Free` or `Starter` |

### Step 4: Add Environment Variables
In the "Environment" tab, add each variable from your `.env` file:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Your secure JWT secret |
| `JWT_EXPIRES_IN` | `7d` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Your Vercel frontend URL (e.g., `https://your-app.vercel.app`) |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `WEATHER_API_KEY` | Your OpenWeatherMap API key (optional) |
| `WEATHER_API_URL` | `https://api.openweathermap.org/data/2.5` |
| `FIREBASE_PRIVATE_KEY` | Your Firebase private key (optional) |
| `FIREBASE_KEY_FILE` | `config/firebase-service-account.json` |

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (you'll see logs in the dashboard)
3. Once deployed, copy your service URL (e.g., `https://buildtrack-backend.onrender.com`)

---

## 3. Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to https://vercel.com/
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Choose `https://github.com/AdityaK9822/buildtrack`

### Step 2: Configure Project
| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Development Command** | `npm run dev` |

### Step 3: Environment Variables
Add your environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | Your Render backend URL (e.g., `https://buildtrack-backend.onrender.com`) |

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## 4. Final Configuration

### Update Backend with Frontend URL
After deploying the frontend, update your Render backend environment variables:
1. Go to your Render web service
2. Click "Environment" tab
3. Update `CLIENT_URL` to your Vercel URL

### Commit Changes
Update your `.env` file with production values and push to GitHub:

```bash
git add .
git commit -m "Update environment variables for production"
git push
```

This will trigger a new build on Render.

---

## 5. Verify Deployment

### Test Backend API
Visit your Render backend URL:
```
https://buildtrack-backend.onrender.com/api/health
```

### Test Frontend
Visit your Vercel frontend URL:
```
https://your-app.vercel.app
```

---

## 6. Troubleshooting

### Backend Issues
- **Database Connection**: Ensure your MongoDBAtlas connection string is correct and IP is whitelisted
- **Environment Variables**: Double-check all variables in Render dashboard
- **Logs**: Check the "Logs" tab in Render for detailed error messages

### Frontend Issues
- **API Connection**: Verify `VITE_API_BASE_URL` points to the correct backend URL
- **CORS**: Ensure your backend has CORS enabled for your Vercel domain
- **Build Errors**: Check the Vercel deployment logs for build-related issues

---

## Environment Variables Reference

### Required for Backend
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment mode (production) |

### Required for Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend server URL |

### Optional
| Variable | Description |
|----------|-------------|
| `WEATHER_API_KEY` | OpenWeatherMap API key |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |

---

## Support

For issues or questions:
1. Check the logs in Render/Vercel dashboard
2. Review the README.md in the repository
3. Contact the BuildTrack team
