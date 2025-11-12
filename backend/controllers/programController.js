const { pool } = require('../config/db');

// List all programs with department and degree names
exports.list = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id,
             p.name,
             p.description,
             p.code,
             p.department_id,
             d.department_name,
             p.degree_id,
             dl.degree AS degree_name,
             p.status,
             p.created_at,
             p.update_at
      FROM programs p
      LEFT JOIN department d ON p.department_id = d.id
  LEFT JOIN degree_level dl ON p.degree_id = dl.id
  ORDER BY p.id ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Create a new program
exports.create = async (req, res, next) => {
  try {
    const { name, description, code, department_id, degree_id, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'code is required' });
    }
    if (!department_id) {
      return res.status(400).json({ error: 'department_id is required' });
    }
    if (!degree_id) {
      return res.status(400).json({ error: 'degree_id is required' });
    }

    // uniqueness: name is unique by schema
    const [dupName] = await pool.query('SELECT id FROM programs WHERE LOWER(name)=LOWER(?) LIMIT 1', [name]);
    if (dupName.length) {
      return res.status(409).json({ error: 'Program name already exists' });
    }

    const [result] = await pool.query(
      'INSERT INTO programs (name, description, code, department_id, degree_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name.trim(), description || '', code.trim(), department_id, degree_id, status && ['active','inactive'].includes(status) ? status : 'active']
    );

    const [rows] = await pool.query(`
      SELECT p.id,
             p.name,
             p.description,
             p.code,
             p.department_id,
             d.department_name,
             p.degree_id,
             dl.degree AS degree_name,
             p.status,
             p.created_at,
             p.update_at
      FROM programs p
      LEFT JOIN department d ON p.department_id = d.id
  LEFT JOIN degree_level dl ON p.degree_id = dl.id
  WHERE p.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update program
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, code, department_id, degree_id, status } = req.body;

    // existence
    const [exists] = await pool.query('SELECT id FROM programs WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Program not found' });

    if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
    if (!code || !code.trim()) return res.status(400).json({ error: 'code is required' });
    if (!department_id) return res.status(400).json({ error: 'department_id is required' });
    if (!degree_id) return res.status(400).json({ error: 'degree_id is required' });

    // uniqueness for name excluding current id
    const [dupName] = await pool.query('SELECT id FROM programs WHERE LOWER(name)=LOWER(?) AND id <> ? LIMIT 1', [name, id]);
    if (dupName.length) return res.status(409).json({ error: 'Another program already uses this name' });

    await pool.query(
      'UPDATE programs SET name=?, description=?, code=?, department_id=?, degree_id=?, status=? WHERE id=?',
      [name.trim(), description || '', code.trim(), department_id, degree_id, status && ['active','inactive'].includes(status) ? status : 'active', id]
    );

    const [rows] = await pool.query(`
      SELECT p.id,
             p.name,
             p.description,
             p.code,
             p.department_id,
             d.department_name,
             p.degree_id,
             dl.degree AS degree_name,
             p.status,
             p.created_at,
             p.update_at
      FROM programs p
      LEFT JOIN department d ON p.department_id = d.id
  LEFT JOIN degree_level dl ON p.degree_id = dl.id
  WHERE p.id = ?
    `, [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete program
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id FROM programs WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Program not found' });
    await pool.query('DELETE FROM programs WHERE id = ?', [id]);
    res.json({ message: 'Program deleted' });
  } catch (err) {
    next(err);
  }
};
