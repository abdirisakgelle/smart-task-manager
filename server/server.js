require('dotenv').config();
const express = require('express');
const cors = require('cors');
const autoInsertReviewsMiddleware = require('./middleware/autoInsertReviews');
const app = express();
const PORT = 3000;

// Enable CORS with dynamic origin detection
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and common development ports
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:5173',
      'http://0.0.0.0:3000',
      // Developer's machine IP
      'http://192.168.18.25:5173',
      'http://192.168.18.25:3000'
    ];
    
    // Allow any IP address on common development ports (for network access)
    const isLocalNetwork = /^http:\/\/192\.168\.\d+\.\d+:(5173|3000)$/.test(origin) ||
                          /^http:\/\/10\.\d+\.\d+\.\d+:(5173|3000)$/.test(origin) ||
                          /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:(5173|3000)$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isLocalNetwork) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Apply auto-insert middleware
app.use(autoInsertReviewsMiddleware);

// Import routes
const usersRoutes = require('./routes/users');
const employeesRoutes = require('./routes/employees');
const employeeAssignmentsRoutes = require('./routes/employeeAssignments');
const ideasRoutes = require('./routes/ideas');
const contentRoutes = require('./routes/content');
const productionRoutes = require('./routes/production');
const socialMediaRoutes = require('./routes/socialMedia');
const ticketsRoutes = require('./routes/tickets');
const supervisorReviewsRoutes = require('./routes/supervisorReviews');
const followUpsRoutes = require('./routes/followUps');
const dashboardRoutes = require('./routes/dashboard');
const notificationsRoutes = require('./routes/notifications');
const boardsRoutes = require('./routes/boards');
const tasksRoutes = require('./routes/tasks');
const { scheduleNotificationCleanup } = require('./utils/scheduler');

app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/employee-assignments', employeeAssignmentsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/supervisor-reviews', supervisorReviewsRoutes);
app.use('/api/follow-ups', followUpsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/boards', boardsRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Import and run the auto-insert scheduler
const { autoInsertTicketsToReviews } = require('./scripts/autoInsertScheduler');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Network access: http://YOUR_IP_ADDRESS:${PORT}`);
  
  // Set up periodic auto-insert check (every 2 hours instead of every hour)
  setInterval(autoInsertTicketsToReviews, 2 * 60 * 60 * 1000); // 2 hours
  console.log('Auto-insert scheduler started (runs every 2 hours)');
  
  // Start the notification cleanup scheduler
  scheduleNotificationCleanup();
}); 