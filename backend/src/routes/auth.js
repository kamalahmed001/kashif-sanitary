import express from 'express';
import { query } from '../db.js';
import { verifyPassword, hashPassword, generateToken, requireAdmin } from '../auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { identifier (username or email), password }
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both username/email and password',
      });
    }

    const trimmedIdentifier = identifier.trim();

    const result = await query(
      'SELECT id, username, email, password_hash FROM admins WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)',
      [trimmedIdentifier, trimmedIdentifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your username and password.',
      });
    }

    const admin = result.rows[0];
    const isMatch = await verifyPassword(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please check your username and password.',
      });
    }

    const token = generateToken(admin);

    return res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred during login',
    });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated admin profile
 */
router.get('/me', requireAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Admin user not found',
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Auth Me Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile',
    });
  }
});

/**
 * POST /api/auth/change-password
 * Allows an authenticated admin to change their password
 */
router.post('/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Both current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
      });
    }

    const result = await query(
      'SELECT password_hash FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    const isMatch = await verifyPassword(currentPassword, result.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    const newHash = await hashPassword(newPassword);
    await query(
      `UPDATE admins SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`,
      [newHash, req.admin.id]
    );

    return res.json({
      success: true,
      message: 'Password successfully updated',
    });
  } catch (error) {
    console.error('[Change Password Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
