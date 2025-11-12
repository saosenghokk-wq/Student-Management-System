const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [rows] = await pool.query(
      'SELECT id, username, email, Image, role_id, status, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;
    
    // Convert image buffer to base64 if file is uploaded
    let imageData = null;
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      imageData = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    const updates = {};
    if (username && username.trim()) updates.username = username;
    if (email && email.trim()) updates.email = email;
    if (imageData) updates.Image = imageData;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No data to update' });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), userId];

    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    // Get updated user data
    const [rows] = await pool.query(
      'SELECT id, username, email, Image, role_id, status FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete profile image
exports.deleteProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET Image = NULL WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
