import cron from 'node-cron';
import { cleanupNotifications } from '../scripts/cleanup-notifications.js';

// Schedule notification cleanup to run every Saturday at 2:00 AM
const scheduleNotificationCleanup = () => {
  console.log('📅 Scheduling weekly notification cleanup...');
  
  // Run cleanup every Saturday at 2:00 AM
  cron.schedule('0 2 * * 6', async () => {
    console.log('🕐 Running scheduled notification cleanup...');
    try {
      await cleanupNotifications();
      console.log('✅ Scheduled notification cleanup completed');
    } catch (error) {
      console.error('❌ Scheduled notification cleanup failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "Africa/Nairobi" // East Africa Time
  });
  
  console.log('✅ Notification cleanup scheduled for every Saturday at 2:00 AM');
};

// Manual cleanup function for testing
const runManualCleanup = async () => {
  console.log('🔧 Running manual notification cleanup...');
  try {
    await cleanupNotifications();
    console.log('✅ Manual cleanup completed');
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
  }
};

export {
  scheduleNotificationCleanup,
  runManualCleanup
}; 