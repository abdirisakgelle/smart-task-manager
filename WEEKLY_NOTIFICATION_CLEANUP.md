# Weekly Notification Cleanup System

## Overview

The notification system automatically cleans up old notifications every week to prevent database bloat and maintain performance. Notifications older than 7 days (from Saturday to Friday) are automatically deleted.

## How It Works

### Automatic Cleanup Schedule
- **Frequency**: Every Saturday at 2:00 AM (East Africa Time)
- **Retention Period**: 7 days (Saturday to Friday)
- **Timezone**: Africa/Nairobi (UTC+3)

### Cleanup Process
1. **Calculate cutoff date**: 7 days ago from current date
2. **Find old notifications**: All notifications older than the cutoff date
3. **Delete old notifications**: Permanently remove them from the database
4. **Log results**: Report how many notifications were deleted

## Implementation Details

### Files Involved

1. **`server/scripts/cleanup-notifications.js`**
   - Main cleanup logic
   - Calculates cutoff date (7 days ago)
   - Deletes old notifications
   - Provides detailed logging

2. **`server/utils/scheduler.js`**
   - Uses `node-cron` for scheduling
   - Runs cleanup every Saturday at 2:00 AM
   - Handles timezone configuration

3. **`server/server.js`**
   - Integrates the scheduler on server startup
   - Starts automatic cleanup when server starts

4. **`server/controllers/notificationsController.js`**
   - Provides manual cleanup endpoint
   - Accessible via API for testing

### API Endpoints

#### Manual Cleanup (Admin Only)
```http
POST /api/notifications/cleanup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Manual notification cleanup completed successfully",
  "timestamp": "2025-07-28T15:30:00.000Z"
}
```

## Testing

### Manual Cleanup Test
```bash
# Run cleanup manually
node scripts/cleanup-notifications.js

# Test with old notifications
node scripts/test-cleanup-with-old-notifications.js
```

### API Test
```bash
# Trigger manual cleanup via API
curl -X POST http://localhost:3000/api/notifications/cleanup \
  -H "Authorization: Bearer <your-token>"
```

## Configuration

### Schedule Configuration
The cleanup runs every Saturday at 2:00 AM using cron syntax:
```
0 2 * * 6
```

- `0` - Minute (0)
- `2` - Hour (2 AM)
- `*` - Day of month (any)
- `*` - Month (any)
- `6` - Day of week (Saturday)

### Timezone
Configured for East Africa Time (UTC+3):
```javascript
timezone: "Africa/Nairobi"
```

## Monitoring

### Logs
The system provides detailed logging:
- Number of notifications found for deletion
- Number of notifications actually deleted
- Remaining notification count
- Age distribution of remaining notifications

### Example Log Output
```
🧹 Starting weekly notification cleanup...
📅 Cleaning notifications older than: 2025-07-21 15:23:25
📊 Found 3 notifications to delete
✅ Successfully deleted 3 notifications
📊 Remaining notifications: 12

📈 Notification age distribution:
- Today: 12 notifications
```

## Benefits

1. **Database Performance**: Prevents notification table from growing indefinitely
2. **Storage Efficiency**: Reduces database storage requirements
3. **User Experience**: Keeps notification lists manageable
4. **System Maintenance**: Automatic cleanup reduces manual maintenance

## Safety Features

1. **Automatic Scheduling**: No manual intervention required
2. **Detailed Logging**: Full audit trail of cleanup operations
3. **Manual Override**: API endpoint for manual cleanup if needed
4. **Error Handling**: Graceful error handling and reporting

## Maintenance

### Monitoring Cleanup
Check server logs for cleanup messages:
```
🕐 Running scheduled notification cleanup...
✅ Scheduled notification cleanup completed
```

### Manual Intervention
If needed, trigger manual cleanup:
```bash
node scripts/cleanup-notifications.js
```

### Disable Cleanup
To temporarily disable automatic cleanup, comment out the scheduler in `server/server.js`:
```javascript
// scheduleNotificationCleanup();
```

## Troubleshooting

### Cleanup Not Running
1. Check server logs for scheduler startup messages
2. Verify timezone configuration
3. Check if `node-cron` package is installed

### Notifications Not Being Deleted
1. Verify notification dates are older than 7 days
2. Check database permissions
3. Review cleanup logs for errors

### Manual Cleanup Fails
1. Check database connection
2. Verify user has admin permissions
3. Review error logs for specific issues 