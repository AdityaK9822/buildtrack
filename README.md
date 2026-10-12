# BuildTrack API

Backend API for BuildTrack construction management platform.

## Features

- User authentication with JWT
- MongoDB database integration
- Firebase integration
- Real-time notifications with Socket.io
- RESTful API endpoints

## Environment Variables

Create a `.env` file with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=your_frontend_url
```

## Installation

```bash
npm install
```

## Running the App

```bash
# Development
npm run dev

# Production
npm start
```

## Deployment

This app is configured for Render deployment using the `render.yaml` file.

1. Push to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy!

## API Endpoints

- `/api/auth` - Authentication routes
- `/api/projects` - Project management
- `/api/tasks` - Task management
- `/api/materials` - Material tracking
- `/api/labor` - Labor management
- `/api/budget` - Budget tracking
- `/api/milestones` - Milestone management
- `/api/photos` - Photo uploads
- `/api/reports` - Report generation
- `/api/notifications` - Notifications

## License

ISC
