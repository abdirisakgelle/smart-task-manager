const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Map usernames to desired role and password
const USERS = [
  // Admins
  { username: 'admin', role: 'admin', password: 'admin123' },
  { username: 'gelle', role: 'admin', password: 'gelle123' },

  // Support (agents/managers/supervisors use Support dashboard)
  { username: 'abdimudalib.mohamed.5', role: 'agent', password: 'agent123' },
  { username: 'agent', role: 'agent', password: 'agent123' },
  { username: 'testagent', role: 'agent', password: 'agent123' },
  { username: 'user', role: 'agent', password: 'agent123' },
  { username: 'user1', role: 'agent', password: 'agent123' },

  // Content (media)
  { username: 'abdullahi.rage.dahir.8', role: 'media', password: 'adna123' },
  { username: 'adna', role: 'media', password: 'adna123' },
  { username: 'ahmed.hussein.abdi.24', role: 'media', password: 'adna123' },
  { username: 'ahmed.hussein.abdi.9', role: 'media', password: 'adna123' },
  { username: 'dhagacadde', role: 'media', password: 'adna123' }
];

async function upsertUser({ username, role, password }) {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Ensure role is valid in current enum: ('admin','manager','agent','supervisor','media','follow_up')
  const validRole = ['admin','manager','agent','supervisor','media','follow_up'].includes(role) ? role : 'agent';

  // Try update first
  const [update] = await pool.query(
    `UPDATE users SET password_hash = ?, role = ?, status = 'active' WHERE username = ?`,
    [passwordHash, validRole, username]
  );

  if (update.affectedRows > 0) {
    console.log(`✅ Updated ${username} → role=${validRole}`);
    return;
  }

  // Insert if not exists
  const [insert] = await pool.query(
    `INSERT INTO users (username, password_hash, role, status) VALUES (?, ?, ?, 'active')`,
    [username, passwordHash, validRole]
  );
  console.log(`🆕 Created ${username} (id=${insert.insertId}) → role=${validRole}`);
}

async function main() {
  try {
    console.log('Syncing demo users (activate, set roles, reset passwords)...');
    for (const u of USERS) {
      try {
        await upsertUser(u);
      } catch (e) {
        console.error(`❌ Failed for ${u.username}:`, e.message);
      }
    }
    console.log('\nDone. You can now login with:');
    console.log('- Admin: admin/admin123, gelle/gelle123');
    console.log('- Support: agent/agent123, testagent/agent123, user/agent123, user1/agent123, abdimudalib.mohamed.5/agent123');
    console.log('- Content: adna/adna123, abdullahi.rage.dahir.8/adna123, ahmed.hussein.abdi.24/adna123, ahmed.hussein.abdi.9/adna123, dhagacadde/adna123');
  } catch (err) {
    console.error('Error syncing demo users:', err);
  } finally {
    await pool.end();
  }
}

main();


