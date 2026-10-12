# MongoDB Connection Troubleshooting Guide

## Current Error: DNS Resolution Failed
Both connection formats are failing to resolve the MongoDB Atlas hostname.

## Connection String Being Used:
```
mongodb+srv://AdityaK9822:Aditi9822@buildtrack.pz6f33q.mongodb.net/?appName=BuildTrack
```

## ✅ Check These Settings in MongoDB Atlas:

### 1. Network Access (CRITICAL - Most Common Issue)
- Go to: **MongoDB Atlas Dashboard** → **Network Access** (left sidebar)
- Check: Do you see any IP addresses listed?
- Action: Click **"Add IP Address"**
- Choose: **"Allow Access from Anywhere"** (this adds `0.0.0.0/0`)
- Click: **Confirm**
- Wait: 1-2 minutes for changes to take effect

### 2. Database Access
- Go to: **MongoDB Atlas Dashboard** → **Database Access** (left sidebar)
- Check: Does user **"AdityaK9822"** exist?
- Verify: User has **"Read and write to any database"** permission
- Action: If user doesn't exist, create a new user:
  - Click "Add New Database User"
  - Authentication Method: Password
  - Username: AdityaK9822
  - Password: Aditi9822
  - Built-in Role: "Read and write to any database"
  - Click "Add User"

### 3. Cluster Status
- Go to: **MongoDB Atlas Dashboard** → **Database** (left sidebar)
- Check: Is your cluster name **"buildtrack"**?
- Check: Is cluster status **"Active"** (green dot)?
- Check: Is cluster paused? (if paused, click "Resume")

### 4. Get Correct Connection String
- In Atlas Dashboard, click **"Connect"** button on your cluster
- Choose: **"Connect your application"**
- Driver: **Node.js**
- Version: **Latest**
- Copy the connection string shown
- **Important**: Make sure cluster name matches exactly!

## 🔧 Quick Fix Commands:

After checking the above, run:
```bash
npm run test-db
```

If still failing, check your current IP:
```bash
curl -4 https://ifconfig.me
```
Then add that IP to MongoDB Atlas Network Access.

## 📱 Need More Help?

If the issue persists, please check in MongoDB Atlas:
1. Your actual cluster name (might be different from "buildtrack")
2. The exact connection string Atlas provides
3. Whether you can connect using MongoDB Compass

## Alternative: Test with MongoDB Compass

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Use this connection string: 
   ```
   mongodb+srv://AdityaK9822:Aditi9822@buildtrack.pz6f33q.mongodb.net/?appName=BuildTrack
   ```
3. If Compass can connect, the credentials are correct and it's a code issue
4. If Compass fails, it's a MongoDB Atlas configuration issue
