# Smart Task Manager - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
```

### 3. Initialize Database
```bash
npm run init-db
```

This will:
- Create all necessary database tables
- Create test users:
  - Username: `admin`, Password: `admin123`, Role: `admin`
  - Username: `user`, Password: `user123`, Role: `user`

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users` - Create new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### Other Endpoints
- `/api/employees` - Employee management
- `/api/tickets` - Ticket management
- `/api/ideas` - Ideas management
- `/api/content` - Content management
- `/api/production` - Production management
- `/api/social-media` - Social media management
- `/api/supervisor-reviews` - Supervisor reviews
- `/api/follow-ups` - Follow-ups management
- `/api/employee-assignments` - Employee assignments

## Authentication

The system uses JWT tokens for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

The system includes the following main tables:
- `users` - User authentication and roles
- `employees` - Employee information
- `tickets` - Support tickets
- `ideas` - Content ideas
- `content` - Content management
- `production` - Production tracking
- `social_media` - Social media posts
- `supervisor_reviews` - Supervisor reviews
- `follow_ups` - Follow-up tracking
- `employee_assignments` - Employee assignments 