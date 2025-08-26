const pool = require('../config/db');

async function main() {
  try {
    console.log('Previewing users to delete (keeping only employee_id = 1)...');
    const [keepRows] = await pool.query('SELECT user_id, username FROM users WHERE employee_id = 1');
    const [delRows] = await pool.query('SELECT user_id, username, employee_id FROM users WHERE employee_id IS NULL OR employee_id <> 1');
    console.table(keepRows);
    console.table(delRows);
    console.log(`Will delete ${delRows.length} users.`);

    if (delRows.length === 0) {
      console.log('Nothing to delete.');
      return;
    }

    // Build list of user_ids to delete
    const userIds = delRows.map(r => r.user_id);

    console.log('Cleaning dependent rows...');
    await pool.query('DELETE FROM permissions WHERE user_id IN (?)', [userIds]);
    await pool.query('DELETE FROM notifications WHERE user_id IN (?)', [userIds]);

    console.log('Deleting users...');
    await pool.query('DELETE FROM users WHERE user_id IN (?)', [userIds]);

    const [remaining] = await pool.query('SELECT user_id, username, employee_id FROM users ORDER BY user_id');
    console.log('Remaining users:');
    console.table(remaining);
    console.log('Done.');
  } catch (err) {
    console.error('Error deleting users:', err);
  } finally {
    await pool.end();
  }
}

main();


