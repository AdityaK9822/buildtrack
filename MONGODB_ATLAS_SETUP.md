# MongoDB Atlas Setup Guide - Quick Version

## Current Status ✅
- **Local Development**: MongoDB running at `mongodb://localhost:27017/buildtrack`
- **Production**: Need MongoDB Atlas for cloud deployment

---

## Why MongoDB Atlas?

1. **Free Tier**: M0 cluster (512MB storage) - completely free
2. **Cloud Hosted**: Accessible from anywhere (including Render)
3. **Automatic Backups**: Built-in backup and recovery
4. **Monitoring**: Real-time metrics and alerts
5. **Scaling**: Easy to upgrade when needed

---

## Quick Setup (5-10 minutes)

### Option A: You Already Have MongoDB Atlas Account

Skip to step 2 if you already have an account.

### Option B: New MongoDB Atlas Account

#### Step 1: Create Account & Cluster

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (use Google or email)
3. Answer setup questions (skip if prompted)
4. Choose **M0 FREE** tier
5. Select region (choose closest to you or Render's region: Oregon)
6. Name your cluster: `buildtrack-cluster`
7. Click "Create Cluster" (takes 5-10 minutes to provision)

#### Step 2: Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create credentials:
   - Username: `buildtrack_user` (or your choice)
   - Password: Generate a strong password (or click "Autogenerate Secure Password")
   - ⚠️ **SAVE THESE CREDENTIALS!** You'll need them for the connection string
5. Set privileges: **"Read and write to any database"**
6. Click "Add User"

#### Step 3: Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - This allows connections from Render and anywhere else
   - For better security, you can add Render's specific IPs later
4. Click "Confirm"

#### Step 4: Get Connection String

1. Go to **Clusters** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** driver
5. Copy the connection string (looks like):
   ```
   mongodb+srv://buildtrack_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your database user password
7. Add database name after the host:
   ```
   mongodb+srv://buildtrack_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/buildtrack?retryWrites=true&w=majority
   ```

---

## Your Connection String Format

```bash
MONGODB_URI=mongodb+srv://buildtrack_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/buildtrack?retryWrites=true&w=majority
```

**Important:**
- Replace `YOUR_PASSWORD` with your actual password
- Replace `cluster0.xxxxx` with your actual cluster name
- Keep `/buildtrack` as the database name
- If your password has special characters (@, #, :, etc.), URL encode them:
  - `@` → `%40`
  - `#` → `%23`
  - `:` → `%3A`

---

## Add to Environment Variables

### For Render (Production)

In Render dashboard → Environment tab:

```bash
MONGODB_URI=mongodb+srv://buildtrack_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/buildtrack?retryWrites=true&w=majority
```

### For Local Development

Keep using your local MongoDB:
```bash
MONGODB_URI=mongodb://localhost:27017/buildtrack
```

---

## Verify Connection

### Test Locally

1. Update your `.env` with MongoDB Atlas connection string
2. Run server:
   ```bash
   npm run dev
   ```
3. Check console: "MongoDB Connected" message
4. Test an API endpoint (register user, etc.)

### Test on Render

1. Add `MONGODB_URI` environment variable in Render
2. Deploy/redeploy your service
3. Check Render logs for "MongoDB Connected" message

---

## MongoDB Atlas Dashboard Features

### Monitor Your Database
- **Metrics**: CPU, memory, connections
- **Real-time**: See active connections from Render
- **Logs**: Query logs and slow queries

### Security Features
- **Database Access**: Manage users and roles
- **Network Access**: Whitelist IPs
- **Encryption**: Automatic encryption at rest and in transit

### Backup & Recovery
- **Continuous Backups**: Automatic (paid tiers)
- **Cloud Backups**: Manual snapshots (free tier)
- **Point-in-time Recovery**: Restore to specific moment (paid tiers)

---

## Free Tier Limitations

M0 Sandbox (Free Tier):
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ No credit card required
- ✅ Perfect for development and small apps
- ❌ Not for production workloads
- ❌ Limited performance monitoring
- ❌ No automated backups (manual only)

**When to Upgrade:**
- Storage > 512MB
- Need automated backups
- Production traffic
- Need dedicated resources

---

## Troubleshooting

### Connection Timeout
- **Cause**: IP not whitelisted
- **Fix**: Add `0.0.0.0/0` in Network Access

### Authentication Failed
- **Cause**: Wrong password or username
- **Fix**: Check credentials in Database Access

### Connection String Error
- **Cause**: Special characters in password not URL-encoded
- **Fix**: URL encode special characters

### Can't Connect from Local Machine
- **Cause**: IP not whitelisted
- **Fix**: Add your local IP or enable `0.0.0.0/0`

---

## Quick Reference

| Service | URL |
|---------|-----|
| MongoDB Atlas Dashboard | https://cloud.mongodb.com/ |
| Documentation | https://www.mongodb.com/docs/atlas/ |
| Free Tier Limits | https://www.mongodb.com/pricing |

---

## Next Steps

1. ✅ Create MongoDB Atlas cluster
2. ✅ Add database user and password
3. ✅ Whititelist IP (0.0.0.0/0)
4. ✅ Get connection string
5. ✅ Add to Render environment variables
6. ✅ Deploy to Render

---

**Estimated Time:** 10 minutes (including cluster creation)
**Cost:** FREE (M0 tier)

---

## Your Local MongoDB Still Works!

Your local MongoDB (`mongodb://localhost:27017/buildtrack`) is still great for:
- Local development and testing
- Faster iteration during development
- No internet connection needed

Just switch to MongoDB Atlas for production deployment on Render!
