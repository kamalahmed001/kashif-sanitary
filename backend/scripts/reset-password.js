import readline from 'readline';
import { query } from '../src/db.js';
import { hashPassword } from '../src/auth.js';
import { initSchema } from '../src/schema.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('========================================================');
  console.log('  KASHIF SANITARY SUPPLIES - Admin Password Reset Tool  ');
  console.log('========================================================\n');

  try {
    await initSchema();

    let identifier = '';
    let newPassword = '';

    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if ((args[i] === '--user' || args[i] === '--username' || args[i] === '--email') && args[i + 1]) {
        identifier = args[i + 1];
      }
      if (args[i] === '--password' && args[i + 1]) {
        newPassword = args[i + 1];
      }
    }

    if (!identifier) {
      identifier = await ask('Enter Admin Username or Email to reset: ');
    }

    if (!identifier) {
      console.error('\n[Error] Admin username or email is required.');
      process.exit(1);
    }

    const check = await query(
      'SELECT id, username, email FROM admins WHERE username = ? OR email = ?',
      [identifier, identifier]
    );

    if (check.rows.length === 0) {
      console.error(`\n[Error] No admin found matching "${identifier}".`);
      process.exit(1);
    }

    const admin = check.rows[0];
    console.log(`\nFound Admin: ${admin.username} (${admin.email})`);

    if (!newPassword) {
      newPassword = await ask('Enter New Secure Password (min 6 characters): ');
    }

    if (!newPassword || newPassword.length < 6) {
      console.error('\n[Error] New password must be at least 6 characters.');
      process.exit(1);
    }

    console.log('\nHashing new password with bcrypt...');
    const newHash = await hashPassword(newPassword);

    await query(
      `UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
      [newHash, admin.id]
    );

    console.log('\n[SUCCESS] Password has been successfully reset!');
    console.log(`Admin "${admin.username}" can now log in with the new password.\n`);
  } catch (error) {
    console.error('\n[Error resetting password]:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
