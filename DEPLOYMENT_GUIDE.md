# Database Deployment Guide

This guide will help you deploy your MySQL database to various online platforms.

## 🚀 Quick Start - PlanetScale (Recommended)

### Step 1: Create PlanetScale Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up for a free account
3. Create a new organization

### Step 2: Create Database
1. Click "New Database"
2. Choose "Create new database"
3. Name it `nasiye_tasks`
4. Select your region (choose closest to your users)
5. Click "Create database"

### Step 3: Get Connection Details
1. Go to your database dashboard
2. Click "Connect"
3. Select "Connect with MySQL"
4. Copy the connection string

### Step 4: Update Environment Variables
Create a `.env` file in your `server` directory:

```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=nasiye_tasks
DB_PORT=3306
```

### Step 5: Deploy Schema
```bash
cd server
npm install
node deploy_database.js
```

## 🌐 Alternative Platforms

### Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add MySQL database service
4. Get connection details from service variables

### AWS RDS
1. Create AWS account
2. Navigate to RDS console
3. Create MySQL instance
4. Configure security groups
5. Get endpoint and credentials

### Google Cloud SQL
1. Create Google Cloud account
2. Enable Cloud SQL API
3. Create MySQL instance
4. Configure connection

### DigitalOcean Managed Databases
1. Create DigitalOcean account
2. Create managed database cluster
3. Configure firewall rules
4. Get connection details

## 🔧 Environment Variables

Your `.env` file should contain:

```env
# Database Configuration
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=nasiye_tasks
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=production
```

## 📋 Pre-deployment Checklist

- [ ] Database platform account created
- [ ] Database instance created
- [ ] Connection details obtained
- [ ] Environment variables configured
- [ ] Schema file ready (`server/database/schema.sql`)
- [ ] Dependencies installed (`npm install`)

## 🚀 Deployment Commands

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Deploy Database Schema
```bash
node deploy_database.js
```

### 3. Start Server
```bash
npm start
```

## 🔍 Troubleshooting

### Connection Issues
- Check if database host is correct
- Verify username and password
- Ensure database exists
- Check firewall/security group settings

### Schema Deployment Issues
- Ensure you have proper permissions
- Check if tables already exist
- Verify SQL syntax

### Environment Variables
- Make sure `.env` file is in correct location
- Verify all required variables are set
- Check for typos in variable names

## 📊 Database Monitoring

After deployment, monitor your database:
- Connection pool usage
- Query performance
- Storage usage
- Backup status

## 🔒 Security Best Practices

1. **Use strong passwords**
2. **Enable SSL connections**
3. **Restrict IP access**
4. **Regular backups**
5. **Monitor access logs**
6. **Use environment variables**

## 💰 Cost Considerations

### Free Tiers Available:
- **PlanetScale**: 1 database, 1 billion reads/month
- **Railway**: $5 credit monthly
- **AWS RDS**: Free tier available
- **Google Cloud SQL**: Free tier available

### Paid Plans:
- **PlanetScale**: $29/month for production
- **Railway**: Pay-as-you-use
- **AWS RDS**: ~$15-50/month depending on size
- **Google Cloud SQL**: ~$10-40/month depending on size

## 📞 Support

If you encounter issues:
1. Check platform documentation
2. Review error logs
3. Contact platform support
4. Check our troubleshooting guide

## 🔄 Migration from Local to Online

1. **Backup local database** (if needed)
2. **Deploy schema to online database**
3. **Update environment variables**
4. **Test connection**
5. **Migrate data** (if needed)
6. **Update application configuration**

---

**Note**: Always test your deployment in a staging environment before going to production!

