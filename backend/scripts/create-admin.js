import readline from 'readline';
import { query } from '../src/db.js';
import { hashPassword } from '../src/auth.js';
import { initSchema } from '../src/schema.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, isPassword = false) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('========================================================');
  console.log('  KASHIF SANITARY SUPPLIES - Admin Account Creator      ');
  console.log('========================================================\n');

  try {
    await initSchema();

    // Check args or interactive
    let username = '';
    let email = '';
    let password = '';

    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--username' && args[i + 1]) username = args[i + 1];
      if (args[i] === '--email' && args[i + 1]) email = args[i + 1];
      if (args[i] === '--password' && args[i + 1]) password = args[i + 1];
    }

    if (!username) {
      username = await ask('Enter Admin Username (e.g. kashif_admin): ');
    }
    if (!email) {
      email = await ask('Enter Admin Email (e.g. admin@kashifsanitary.com): ');
    }
    if (!password) {
      password = await ask('Enter Secure Admin Password (min 6 characters): ');
    }

    if (!username || !email || !password) {
      console.error('\n[Error] Username, email, and password are all required.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('\n[Error] Password must be at least 6 characters.');
      process.exit(1);
    }

    // Check if user exists
    const existing = await query(
      'SELECT id, username, email FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.rows.length > 0) {
      console.error(
        `\n[Error] An admin with username "${username}" or email "${email}" already exists.`
      );
      console.log('To reset the password instead, run: npm run reset-password');
      process.exit(1);
    }

    console.log('\nHashing password securely with bcrypt...');
    const passwordHash = await hashPassword(password);

    await query(
      `INSERT INTO admins (username, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [username, email, passwordHash]
    );

    console.log('\n[SUCCESS] Admin account created successfully!');
    console.log('--------------------------------------------------------');
    console.log(`Username : ${username}`);
    console.log(`Email    : ${email}`);
    console.log(`Status   : Active & Verified`);
    console.log('--------------------------------------------------------');
    console.log('You can now log in at the admin portal.\n');
  } catch (error) {
    console.error('\n[Error creating admin]:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

main();
