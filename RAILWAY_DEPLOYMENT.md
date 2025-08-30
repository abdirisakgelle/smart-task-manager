# Railway Deployment Guide

This guide explains how to deploy the Smart Task Manager backend to Railway with MySQL database integration.

## Prerequisites

1. Railway account (https://railway.app)
2. GitHub repository connected to Railway
3. MySQL service provisioned on Railway

## Environment Variables Setup

### 1. Railway Environment Variables

Set these environment variables in your Railway project dashboard:

#### Database Configuration (Production)
```
DB_HOST=mysql-z10u.railway.internal
DB_PORT=3306
DB_USER=app_user
DB_PASS=StrongRandomPass!#2025
DB_NAME=nasiye_tasks
```

#### JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
```

#### Server Configuration
```
PORT=3000
NODE_ENV=production
```

### 2. Netlify Environment Variables

Set these in your Netlify dashboard:

```
VITE_API_URL=https://your-backend-service.up.railway.app
```

## Database Setup

### 1. Create MySQL Service on Railway

1. Go to your Railway project
2. Click "New Service" → "Database" → "MySQL"
3. Note the connection details provided

### 2. Update Database Credentials

After creating the MySQL service:

1. Go to the MySQL service in Railway
2. Copy the connection details
3. Update the environment variables with the correct values
4. **Important**: Change the root password and create an `app_user` for security

### 3. Database Schema

The database schema is automatically created when the application starts. Make sure the `nasiye_tasks` database exists.

## Deployment Steps

### 1. Backend Deployment

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js application
3. Set the environment variables in Railway dashboard
4. Deploy the service

### 2. Frontend Configuration

1. Update your Netlify environment variables with the Railway backend URL
2. Redeploy your frontend if needed

## Health Check

After deployment, test the health endpoint:

```bash
curl https://your-backend-service.up.railway.app/api/health
```

Expected response:
```json
{
  "ok": true,
  "db": "up",
  "timestamp": "2025-01-XX...",
  "environment": "production"
}
```

## Security Considerations

1. **Password Rotation**: After first connection, rotate the root password
2. **App User**: Use `app_user` instead of root for application connections
3. **Environment Variables**: Never commit `.env` files to version control
4. **CORS**: Update CORS settings to allow your Netlify domain

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables are set correctly
   - Verify MySQL service is running
   - Check network connectivity between services

2. **CORS Errors**
   - Update CORS configuration in `server.js`
   - Add your Netlify domain to allowed origins

3. **Health Check Failing**
   - Check database credentials
   - Verify database exists
   - Check Railway logs for errors

### Logs

View Railway logs:
```bash
railway logs
```

## Local Development

For local development, use the `.env.local` file with Railway's public proxy:

```
DB_HOST=maglev.proxy.rlwy.net
DB_PORT=42719
DB_USER=root
DB_PASS=uzQihkZPTIfZsjuZuYsSIguVlsyIKoGb
DB_NAME=nasiye_tasks
```

## Monitoring

- Railway provides built-in monitoring
- Use the health endpoint for external monitoring
- Set up alerts for health check failures
