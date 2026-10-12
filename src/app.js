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
app.use(
  cors({
    origin: config.clientUrl || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
