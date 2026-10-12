# BuildTrack: Custom Domains & CI/CD Pipeline Setup

Complete guide for configuring custom domains and automating deployments.

---

## 🌐 Custom Domain Setup

### Option 1: Use Your Own Domain

**Prerequisites:**
- A domain name purchased from a registrar (GoDaddy, Namecheap, Google Domains, etc.)
- Access to DNS management console

#### Backend (Render) - Custom Domain

1. Go to Render Dashboard: https://dashboard.render.com/web/srv-db6e0lh42hec73btatcg
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain: `api.yourdomain.com`
5. Choose certificate type: **Managed** (free SSL)
6. Add DNS records to your domain registrar:

   **DNS Configuration:**
   ```
   Type: CNAME
   Name: api
   Value: buildtrack-api-j1lo.onrender.com
   TTL: 3600 (or default)
   ```

7. Wait for DNS propagation (5-60 minutes)
8. Render will automatically provision SSL certificate

**Verification:**
```bash
# Check DNS propagation
nslookup api.yourdomain.com
dig api.yourdomain.com

# Test HTTPS
curl https://api.yourdomain.com/api/health
```

#### Frontend (Vercel) - Custom Domain

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `buildtrack-client`
3. Click **"Settings"** → **"Domains"**
4. Click **"Add Domain"**
5. Enter your domain: `yourdomain.com` (or `www.yourdomain.com`)

**DNS Configuration Options:**

**Option A: Apex Domain (yourdomain.com)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Option B: Subdomain (app.yourdomain.com)**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**Option C: WWW Subdomain**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

6. Vercel will automatically provision SSL certificate
7. Wait for verification and certificate provisioning

**Recommended Domain Structure:**
- Frontend: `yourdomain.com` or `app.yourdomain.com`
- Backend API: `api.yourdomain.com`

---

### Option 2: Using Free Subdomains

**Render Backend:**
- URL: `buildtrack-api-j1lo.onrender.com` (already configured)
- Custom subdomain: Can change to `your-app.onrender.com` (if available)
- Go to Settings → Change subdomain name

**Vercel Frontend:**
- URL: `buildtrack-client.vercel.app` (auto-assigned after deployment)
- Custom subdomain: Can change to `your-app.vercel.app`
- Go to Settings → Domains → Add domain

---

## 🔄 CI/CD Pipeline with GitHub Actions

Automate testing and deployment on every push.

### Step 1: Create GitHub Actions Workflows

#### Backend CI/CD Pipeline

**File: `.github/workflows/backend.yml`**

```yaml
name: BuildTrack Backend CI/CD

on:
  push:
    branches: [master, main]
    paths:
      - 'server.js'
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/backend.yml'
  pull_request:
    branches: [master, main]
    paths:
      - 'server.js'
      - 'src/**'
      - 'package.json'
      - 'package-lock.json'

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint
        continue-on-error: true

      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NODE_ENV: test

  deploy:
    name: Deploy to Render
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/master' || github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Render
        uses: johnbeynon/render-deploy@v1.0.0
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

#### Frontend CI/CD Pipeline

**File: `.github/workflows/frontend.yml`**

```yaml
name: BuildTrack Frontend CI/CD

on:
  push:
    branches: [master, main]
    paths:
      - 'client/**'
      - '.github/workflows/frontend.yml'
  pull_request:
    branches: [master, main]
    paths:
      - 'client/**'

jobs:
  build:
    name: Build & Test
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: client
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          VITE_API_BASE_URL: https://buildtrack-api-j1lo.onrender.com/api

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: client/dist

  deploy-preview:
    name: Deploy Preview
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Preview)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: client

  deploy-production:
    name: Deploy to Production
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/master' || github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: client
```

---

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

#### Required Secrets:

**Render Secrets:**
1. `RENDER_SERVICE_ID`
   - Value: `srv-db6e0lh42hec73btatcg`
2. `RENDER_API_KEY`
   - Get from: https://dashboard.render.com/user/account/settings/api-keys

**Vercel Secrets:**
1. `VERCEL_TOKEN`
   - Get from: https://vercel.com/account/tokens
2. `VERCEL_ORG_ID`
   - From Vercel dashboard: Settings → General
3. `VERCEL_PROJECT_ID`
   - From Vercel project settings after first deployment

**Application Secrets:**
1. `MONGODB_URI_TEST`
   - MongoDB Atlas connection string for testing
2. `JWT_SECRET`
   - Your JWT secret key

---

### Step 3: Create Additional Workflow Files

#### Database Migration Check

**File: `.github/workflows/db-check.yml`**

```yaml
name: Database Health Check

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:

jobs:
  check-db:
    name: Check MongoDB Connection
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install axios

      - name: Check health endpoint
        run: |
          node -e "
            const axios = require('axios');
            axios.get('https://buildtrack-api-j1lo.onrender.com/api/health')
              .then(res => {
                console.log('✅ Health check passed:', res.data);
                process.exit(0);
              })
              .catch(err => {
                console.error('❌ Health check failed:', err.message);
                process.exit(1);
              });
          "
```

#### Security Audit

**File: `.github/workflows/security.yml`**

```yaml
name: Security Audit

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  push:
    paths:
      - 'package.json'
      - 'package-lock.json'
      - 'client/package.json'
      - 'client/package-lock.json'

jobs:
  audit:
    name: Run Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Audit backend dependencies
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Audit frontend dependencies
        run: cd client && npm audit --audit-level=moderate
        continue-on-error: true

      - name: Check for outdated dependencies
        run: npm outdated || true
```

---

## 🎯 Advanced CI/CD Features

### Feature Branch Deployments (Preview)

Automatically deploy pull requests to preview URLs:

**Automatically configured by Vercel:**
- Every PR gets a preview URL: `pr-123-buildtrack-client.vercel.app`
- Preview deployments include latest changes
- Review before merging to production

### Environment-Based Deployments

Create different environments for different branches:

**`.github/workflows/deploy-env.yml`**

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging, develop]

jobs:
  deploy-staging:
    name: Deploy Staging Environment
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_TEAM_ID }}
          vercel-args: '--env STAGING=true'
          working-directory: client
```

### Automatic Version Bumping

**`.github/workflows/version.yml`**

```yaml
name: Version Bump

on:
  push:
    branches: [master, main]

jobs:
  version:
    name: Bump Version
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, 'skip ci')"
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Configure Git
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"

      - name: Bump version
        run: npm version patch -m "chore: bump version to %s"

      - name: Push changes
        run: git push
```

---

## 📊 Monitoring & Alerts Setup

### Render Monitoring

**Built-in Monitoring:**
1. Go to Render Dashboard
2. Select your service
3. View **"Metrics"** tab for:
   - CPU usage
   - Memory usage
   - Response time
   - Request count

**Set Up Alerts:**
1. Click **"Settings"** → **"Notifications"**
2. Add email address for alerts
3. Configure alert thresholds:
   - CPU > 80% for 5 min
   - Memory > 80% for 5 min
   - Response time > 30s

### Vercel Analytics

**Enable Analytics:**
1. Go to Vercel Dashboard
2. Select project
3. Click **"Analytics"** tab
4. Enable **"Web Analytics"**

**Features:**
- Page views
- Top pages
- Countries
- Devices
- Browsers

### Uptime Monitoring

**Create `.github/workflows/uptime.yml`:**

```yaml
name: Uptime Check

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  uptime:
    name: Check Uptime
    runs-on: ubuntu-latest
    
    steps:
      - name: Check Backend
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://buildtrack-api-j1lo.onrender.com/api/health)
          if [ $response -ne 200 ]; then
            echo "Backend is down! HTTP Status: $response"
            exit 1
          fi
          echo "✅ Backend is up"

      - name: Check Frontend
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://your-frontend.vercel.app)
          if [ $response -ne 200 ]; then
            echo "Frontend is down! HTTP Status: $response"
            exit 1
          fi
          echo "✅ Frontend is up"
```

---

## 🔧 Webhook Integrations

### Slack Notifications

**Create `.github/workflows/notify.yml`:**

```yaml
name: Deployment Notifications

on:
  workflow_run:
    workflows: ["*"]
    types:
      - completed

jobs:
  notify:
    name: Send Slack Notification
    runs-on: ubuntu-latest
    if: github.event.workflow_run.conclusion == 'success'
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            ✅ Deployment Successful!
            Project: BuildTrack
            Branch: ${{ github.ref }}
            Commit: ${{ github.sha }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Discord Notifications

```yaml
      - name: Notify Discord
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          status: ${{ job.status }}
          title: "BuildTrack Deployment"
          description: "Deployment to production completed"
```

---

## 📝 Implementation Checklist

### Immediate Actions (Do These Now)

1. [ ] Deploy frontend to Vercel
2. [ ] Push committed changes to GitHub
3. [ ] Note Vercel project ID for CI/CD

### Custom Domain Setup

1. [ ] Purchase domain (if needed)
2. [ ] Configure DNS for backend (`api.yourdomain.com`)
3. [ ] Configure DNS for frontend (`yourdomain.com`)
4. [ ] Add custom domains in Render
5. [ ] Add custom domains in Vercel
6. [ ] Update environment variables with new URLs
7. [ ] Test SSL certificates

### CI/CD Pipeline Setup

1. [ ] Create `.github/workflows` directory
2. [ ] Add backend workflow file
3. [ ] Add frontend workflow file
4. [ ] Add security audit workflow
5. [ ] Configure GitHub Secrets
6. [ ] Test pipeline with a commit

### Monitoring Setup

1. [ ] Configure Render alerts
2. [ ] Enable Vercel Analytics
3. [ ] Set up uptime monitoring
4. [ ] Add Slack/Discord notifications

---

## 🚀 Quick Start Commands

**Push changes and deploy:**
```bash
cd "/Users/aditya/Coding/NodeJS & MongoDB & Firebase/Major Project"

# Push all pending commits
git push origin master

# Navigate to client
cd client

# Deploy to Vercel
vercel --prod
```

**Set up CI/CD:**
```bash
# Create workflows directory
mkdir -p .github/workflows

# Copy workflow files (from above)
# Add secrets in GitHub repository settings
```

---

## 🔐 Security Best Practices

1. **Never commit secrets** to repository
2. Use **GitHub Secrets** for sensitive data
3. Enable **branch protection** rules
4. Require **PR reviews** before merging
5. Run **security audits** regularly
6. Keep dependencies **up to date**
7. Use **environment-specific** secrets

---

**Need Help?**

- GitHub Actions Docs: https://docs.github.com/en/actions
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

**Last Updated**: October 12, 2026  
**Version**: 1.0.0
