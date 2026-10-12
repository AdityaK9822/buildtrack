# BuildTrack API

Backend API for BuildTrack construction management platform built with Node.js, Express, MongoDB, and Firebase.

## Features

- **Authentication**: Hybrid JWT + Firebase Auth
- **Role-based Access Control**: Client, Contractor, Architect, Admin
- **Project Management**: CRUD operations for projects
- **Milestones**: Track project milestones with approval workflow
- **Tasks**: Task management with assignments
- **Materials**: Track material deliveries and inventory
- **Labor**: Log worker hours and calculate earnings
- **Reports**: Daily progress reports with photos
- **Photos**: Upload photos to Firebase Storage
- **Budget**: Track project budget and expenses
- **Real-time Updates**: Socket.io for live progress
- **Push Notifications**: Firebase Cloud Messaging
- **Weather Predictions**: OpenWeatherMap integration

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose ODM
- **Authentication**: JWT + Firebase Auth
- **File Storage**: Firebase Storage
- **Real-time**: Socket.io
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Validation**: Joi
- **Weather API**: OpenWeatherMap

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `FIREBASE_CLIENT_EMAIL`: Firebase service account email
- `FIREBASE_STORAGE_BUCKET`: Firebase Storage bucket name
- `WEATHER_API_KEY`: OpenWeatherMap API key

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Save the JSON file and extract the values for `.env`

### 4. MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Replace `<password>` with your database user password
5. Add to `.env` as `MONGODB_URI`

### 5. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Register new user |
| POST | /login | Login with email/password |
| POST | /firebase-login | Login with Firebase ID token |
| GET | /me | Get current user profile |
| PUT | /me | Update profile |
| POST | /fcm-token | Register FCM token |

### Projects (`/api/projects`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get user's projects |
| GET | /:id | All roles | Get project by ID |
| GET | /:id/dashboard | All roles | Project dashboard stats |
| POST | / | Admin, Contractor | Create project |
| PUT | /:id | Admin, Contractor | Update project |
| DELETE | /:id | Admin | Delete project |

### Milestones (`/api/milestones`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get milestones |
| GET | /:id | All roles | Get milestone |
| POST | / | Contractor | Create milestone |
| PUT | /:id | Contractor | Update milestone |
| POST | /:id/request-approval | Contractor | Request approval |
| PUT | /:id/approve | Architect | Approve milestone |

### Tasks (`/api/tasks`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get tasks |
| GET | /:id | All roles | Get task |
| POST | / | Contractor | Create task |
| PUT | /:id | Contractor | Update task |
| PUT | /:id/complete | Worker | Mark complete |

### Materials (`/api/materials`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get materials |
| GET | /:id | All roles | Get material |
| POST | / | Contractor | Add material |
| PUT | /:id | Contractor | Update material |

### Labor (`/api/labor`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get labor records |
| GET | /:id | All roles | Get labor record |
| GET | /summary/project/:id | All roles | Labor summary |
| POST | / | Contractor | Log labor hours |
| PUT | /:id | Contractor | Update labor |

### Reports (`/api/reports`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get reports |
| GET | /:id | All roles | Get report |
| POST | / | Contractor | Create report |
| PUT | /:id | Contractor | Update report |

### Photos (`/api/photos`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get photos |
| GET | /:id | All roles | Get photo |
| POST | / | Contractor, Architect | Upload photo |
| POST | /drone | Contractor, Architect | Upload drone photo |
| DELETE | /:id | Admin | Delete photo |

### Budget (`/api/budget`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | Contractor, Admin | Get budgets |
| GET | /project/:id | All roles | Get project budget |
| POST | / | Contractor | Create budget |
| PUT | /project/:id | Contractor | Update budget |

### Approvals (`/api/approvals`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /pending | Architect | Get pending approvals |
| GET | /history | Architect | Get approval history |
| PUT | /milestones/:id | Architect | Approve milestone |

### Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | / | All roles | Get notifications |
| PUT | /:id/read | All roles | Mark as read |
| PUT | /read-all | All roles | Mark all as read |
| DELETE | /:id | All roles | Delete notification |

### Weather (`/api/weather`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /project/:id | All roles | Get weather prediction |

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Client** | View projects, photos, budget, approve milestones |
| **Contractor** | Create reports, materials, labor, photos, manage tasks |
| **Architect** | View & approve milestones, view reports |
| **Admin** | Full access to all features |

## Socket.io Events

### Client → Server

- `join-project`: Join a project room
- `leave-project`: Leave a project room

### Server → Client

- `progress-update`: Project progress updated
- `milestone-update`: Milestone status changed
- `photo-uploaded`: New photo uploaded
- `material-delivered`: Material delivery status updated
- `notification`: New notification

## Example User Flow

1. Contractor creates daily report → POST `/api/reports`
2. Material delivery recorded → POST `/api/materials`
3. Architect approves milestone → PUT `/api/approvals/milestones/:id`
4. Client views photos → GET `/api/photos/project/:id`
5. Client checks budget → GET `/api/budget/project/:id`
6. Weather delay prediction → GET `/api/weather/project/:id`

## Deployment

### Render (Recommended)

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy!

### Heroku

```bash
heroku create buildtrack-api
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."
# ... add all env vars
git push heroku main
```

## Testing

Use Postman or any REST client to test the endpoints.

Import the Postman collection (coming soon).

## License

ISC

## Support

For issues, contact the BuildTrack team.
