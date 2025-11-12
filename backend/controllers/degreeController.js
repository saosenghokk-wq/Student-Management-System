const { pool } = require('../config/db');

// minimal list endpoint for degrees
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, degree FROM degree_level ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
