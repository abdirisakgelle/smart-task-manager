require('dotenv').config();
const express = require('express');
const cors = require('cors');
const autoInsertReviewsMiddleware = require('./middleware/autoInsertReviews');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
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

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// Import and run the auto-insert scheduler
const { autoInsertTicketsToReviews } = require('./scripts/autoInsertScheduler');

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Set up periodic auto-insert check (every hour)
  setInterval(autoInsertTicketsToReviews, 60 * 60 * 1000); // 1 hour
  console.log('Auto-insert scheduler started (runs every hour)');
}); 