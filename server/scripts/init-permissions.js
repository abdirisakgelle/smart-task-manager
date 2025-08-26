const pool = require('../config/db');

// Default permissions for different roles
const defaultRolePermissions = {
  admin: [
    'dashboard', 'users', 'employees', 'tickets', 'ideas', 'content', 
    'production', 'social_media', 'supervisor_reviews', 'follow_ups', 
    'tasks', 'calendar', 'boards', 'notifications', 'profile'
  ],
  manager: [
    'dashboard', 'employees', 'tickets', 'ideas', 'content', 
    'production', 'social_media', 'supervisor_reviews', 'follow_ups', 
    'tasks', 'calendar', 'boards', 'notifications', 'profile'
  ],
  supervisor: [
    'dashboard', 'tickets', 'supervisor_reviews', 'follow_ups', 
    'notifications', 'profile'
  ],
  agent: [
    'dashboard', 'tickets', 'notifications', 'profile'
  ],
  media: [
    'dashboard', 'ideas', 'content', 'production', 'social_media', 
    'notifications', 'profile'
  ],
  follow_up: [
    'dashboard', 'follow_ups', 'notifications', 'profile'
  ]
};

async function initializePermissions() {
  try {
    console.log('🚀 Initializing permissions for existing users...');
    
    // Get all active users
    const [users] = await pool.query(`
      SELECT user_id, username, role 
      FROM users 
      WHERE status = 'active'
    `);

    console.log(`Found ${users.length} active users`);

    for (const user of users) {
      console.log(`Setting permissions for ${user.username} (${user.role})`);
      
      // Delete existing permissions for this user
      await pool.query('DELETE FROM permissions WHERE user_id = ?', [user.user_id]);
      
      // Get default permissions for this role
      const defaultPermissions = defaultRolePermissions[user.role] || [];
      
      // Insert permissions for this user
      for (const pageName of defaultPermissions) {
        await pool.query(`
          INSERT INTO permissions (user_id, page_name, can_access) 
          VALUES (?, ?, TRUE)
        `, [user.user_id, pageName]);
      }
      
      console.log(`✅ Set ${defaultPermissions.length} permissions for ${user.username}`);
    }
    
    console.log('🎉 Permissions initialization completed successfully!');
    
    // Show summary
    const [summary] = await pool.query(`
      SELECT 
        u.username,
        u.role,
        COUNT(p.permission_id) as permission_count
      FROM users u
      LEFT JOIN permissions p ON u.user_id = p.user_id AND p.can_access = TRUE
      WHERE u.status = 'active'
      GROUP BY u.user_id, u.username, u.role
      ORDER BY u.username
    `);
    
    console.log('\n📊 Permission Summary:');
    console.log('Username\t\tRole\t\tPermissions');
    console.log('--------\t\t----\t\t-----------');
    summary.forEach(user => {
      console.log(`${user.username.padEnd(16)}\t${user.role.padEnd(12)}\t${user.permission_count}`);
    });
    
  } catch (err) {
    console.error('❌ Error initializing permissions:', err);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initializePermissions(); 