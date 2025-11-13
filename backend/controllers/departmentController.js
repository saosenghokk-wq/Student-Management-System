const { pool } = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.id, d.department_name, d.staff_id,
             s.eng_name AS staff_eng_name, s.khmer_name AS staff_khmer_name
      FROM department d
      LEFT JOIN staff s ON d.staff_id = s.Id
      ORDER BY d.id ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { department_name, staff_id } = req.body;
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ error: 'department_name is required' });
    }
    if (!staff_id) {
      return res.status(400).json({ error: 'Head staff is required' });
    }
    // Prevent duplicate department_name
    const [existing] = await pool.query('SELECT id FROM department WHERE LOWER(department_name) = LOWER(?) LIMIT 1', [department_name]);
    if (existing.length) {
      return res.status(409).json({ error: 'Department already exists' });
    }
    
    // Verify staff exists
    const [staffExists] = await pool.query('SELECT Id FROM staff WHERE Id = ?', [staff_id]);
    if (!staffExists.length) {
      return res.status(400).json({ error: 'Selected staff member does not exist' });
    }
    
    const [result] = await pool.query('INSERT INTO department (department_name, staff_id) VALUES (?, ?)', [department_name.trim(), staff_id]);
    const [rows] = await pool.query(`
      SELECT d.id, d.department_name, d.staff_id,
             s.eng_name AS staff_eng_name, s.khmer_name AS staff_khmer_name
      FROM department d
      LEFT JOIN staff s ON d.staff_id = s.Id
      WHERE d.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department_name, staff_id } = req.body;
    if (!department_name || !department_name.trim()) {
      return res.status(400).json({ error: 'department_name is required' });
    }
    if (!staff_id) {
      return res.status(400).json({ error: 'Head staff is required' });
    }
    // Check exists
    const [exists] = await pool.query('SELECT id FROM department WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Department not found' });
    }
    // Prevent duplicate name for other departments
    const [duplicate] = await pool.query('SELECT id FROM department WHERE LOWER(department_name)=LOWER(?) AND id <> ? LIMIT 1', [department_name, id]);
    if (duplicate.length) {
      return res.status(409).json({ error: 'Another department already uses this name' });
    }
    
    // Verify staff exists
    const [staffExists] = await pool.query('SELECT Id FROM staff WHERE Id = ?', [staff_id]);
    if (!staffExists.length) {
      return res.status(400).json({ error: 'Selected staff member does not exist' });
    }
    
    await pool.query('UPDATE department SET department_name = ?, staff_id = ? WHERE id = ?', [department_name.trim(), staff_id, id]);
    const [rows] = await pool.query(`
      SELECT d.id, d.department_name, d.staff_id,
             s.eng_name AS staff_eng_name, s.khmer_name AS staff_khmer_name
      FROM department d
      LEFT JOIN staff s ON d.staff_id = s.Id
      WHERE d.id = ?
    `, [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id FROM department WHERE id = ?', [id]);
    if (!exists.length) {
      return res.status(404).json({ error: 'Department not found' });
    }
    await pool.query('DELETE FROM department WHERE id = ?', [id]);
    res.json({ message: 'Department deleted' });
  } catch (err) {
    next(err);
  }
};
