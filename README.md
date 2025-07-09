# Smart Task Manager

A comprehensive full-stack task management application built with React (frontend) and Node.js/Express (backend) with MySQL database.

## 🚀 Features

- **Task Management**: Create, assign, and track tasks
- **Employee Management**: Manage employee profiles and assignments
- **Dashboard Analytics**: Real-time statistics and insights
- **Supervisor Reviews**: Automated review system
- **Follow-up System**: Track task completion and follow-ups
- **Content Management**: Handle various content types
- **Production Tracking**: Monitor production metrics
- **Social Media Integration**: Social media content management
- **Ticket System**: Support ticket management
- **Real-time Updates**: Live data synchronization

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **SCSS** for styling
- **Chart.js** for analytics
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **CORS** enabled

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL database
- Git

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd smart-task-manager
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 3. Database Setup
1. Create a MySQL database
2. Copy `server/env.example` to `server/.env`
3. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
```

### 4. Initialize Database
```bash
cd server
npm run init-db
```

## 🚀 Running the Application

### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both client (port 5173) and server (port 3000) concurrently.

### Production Mode
```bash
# Build the client
npm run build

# Start production servers
npm start
```

## 📁 Project Structure

```
smart-task-manager/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── assets/        # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── routes/            # API routes
│   ├── scripts/           # Database scripts
│   └── package.json
└── package.json           # Root package.json
```

## 🔐 Security Features

- Environment variables for sensitive data
- JWT-based authentication
- Password hashing with bcryptjs
- CORS configuration
- Input validation and sanitization

## 🌐 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Tasks & Assignments
- `GET /api/employee-assignments` - Get assignments
- `POST /api/employee-assignments` - Create assignment
- `PUT /api/employee-assignments/:id` - Update assignment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts` - Get chart data

### Content Management
- `GET /api/content` - Get content
- `POST /api/content` - Create content
- `PUT /api/content/:id` - Update content

## 🔄 Deployment

### GitHub Deployment
1. Push your code to GitHub
2. Set up environment variables in your deployment platform
3. Configure your database connection
4. Deploy using your preferred hosting service

### Environment Variables Required
Make sure to set these in your production environment:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `CLIENT_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository. 