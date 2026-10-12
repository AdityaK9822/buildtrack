// Load environment variables first
require('dotenv').config();

const http = require('http');
const socketIO = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeFirebase } = require('./src/config/firebase');
const socketService = require('./src/services/socket.service');
const config = require('./src/config');

// Connect to MongoDB
connectDB();

// Initialize Firebase
initializeFirebase();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: config.clientUrl || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket service
socketService.init(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join project room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project-${projectId}`);
    socketService.joinProject(socket.id, projectId);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`Socket ${socket.id} left project-${projectId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     BuildTrack API Server Running        ║
  ╠══════════════════════════════════════════╣
  ║  Port: ${PORT}                           ║
  ║  Environment: ${config.nodeEnv}          ║
  ║  Socket.io: Enabled                      ║
  ╚══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = server;
