require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const milestoneRoutes = require('./routes/milestone.routes');
const taskRoutes = require('./routes/task.routes');
const materialRoutes = require('./routes/material.routes');
const laborRoutes = require('./routes/labor.routes');
const reportRoutes = require('./routes/report.routes');
const photoRoutes = require('./routes/photo.routes');
const budgetRoutes = require('./routes/budget.routes');
const approvalRoutes = require('./routes/approval.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:3001',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:3001',
];

// Add production frontend URL if configured
if (config.clientUrl) {
  allowedOrigins.push(config.clientUrl);
}

// Allow all Vercel preview deployments in production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is a Vercel deployment
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.includes('.vercel.app') ||
                      origin.includes('localhost');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to BuildTrack API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      milestones: '/api/milestones',
      tasks: '/api/tasks',
      materials: '/api/materials',
      labor: '/api/labor',
      reports: '/api/reports',
      photos: '/api/photos',
      budget: '/api/budget',
      approvals: '/api/approvals',
      notifications: '/api/notifications',
      health: '/api/health',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BuildTrack API is running',
    timestamp: new Date(),
    environment: config.nodeEnv,
  });
});

// Weather API endpoint
app.get('/api/weather/project/:projectId', async (req, res) => {
  try {
    const WeatherService = require('./services/weather.service');
    const prediction = await WeatherService.getProjectWeatherPrediction(req.params.projectId);
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
