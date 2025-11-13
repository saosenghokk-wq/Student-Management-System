const { pool } = require('../config/db');

// List subjects with program and department linkage and program code
exports.list = async (req, res, next) => {
  try {
    // If user is a dean (role_id = 2), filter by their department_id
    const departmentId = req.user?.role_id === 2 ? req.user.department_id : null;
    
    let query = `
      SELECT s.id,
             s.subject_code,
             s.subject_name,
             s.program_id,
             s.credit,
             p.name AS program_name,
             p.code AS program_code,
             p.department_id,
             d.department_name
      FROM subject s
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
    `;
    
    const params = [];
    if (departmentId) {
      query += ' WHERE p.department_id = ?';
      params.push(departmentId);
    }
    
    query += ' ORDER BY s.id ASC';
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};// Create subject
exports.create = async (req, res, next) => {
  try {
    const { subject_code, subject_name, program_id, credit } = req.body;
    if (!subject_code || !subject_code.trim()) return res.status(400).json({ error: 'subject_code is required' });
    if (!subject_name || !subject_name.trim()) return res.status(400).json({ error: 'subject_name is required' });
    if (!program_id) return res.status(400).json({ error: 'program_id is required' });
    if (credit == null || credit === '') return res.status(400).json({ error: 'credit is required' });

    // uniqueness checks
    const [dupCode] = await pool.query('SELECT id FROM subject WHERE LOWER(subject_code)=LOWER(?) LIMIT 1', [subject_code]);
    if (dupCode.length) return res.status(409).json({ error: 'subject_code already exists' });
    const [dupName] = await pool.query('SELECT id FROM subject WHERE LOWER(subject_name)=LOWER(?) LIMIT 1', [subject_name]);
    if (dupName.length) return res.status(409).json({ error: 'subject_name already exists' });

    const [result] = await pool.query(
      'INSERT INTO subject (subject_code, subject_name, program_id, credit) VALUES (?, ?, ?, ?)',
      [subject_code.trim(), subject_name.trim(), program_id, credit]
    );

    const [rows] = await pool.query(`
      SELECT s.id,
             s.subject_code,
             s.subject_name,
             s.program_id,
             s.credit,
             p.name AS program_name,
             p.code AS program_code,
             p.department_id,
             d.department_name
      FROM subject s
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE s.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update subject
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject_code, subject_name, program_id, credit } = req.body;
    const [exists] = await pool.query('SELECT id FROM subject WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Subject not found' });

    if (!subject_code || !subject_code.trim()) return res.status(400).json({ error: 'subject_code is required' });
    if (!subject_name || !subject_name.trim()) return res.status(400).json({ error: 'subject_name is required' });
    if (!program_id) return res.status(400).json({ error: 'program_id is required' });
    if (credit == null || credit === '') return res.status(400).json({ error: 'credit is required' });

    const [dupCode] = await pool.query('SELECT id FROM subject WHERE LOWER(subject_code)=LOWER(?) AND id <> ? LIMIT 1', [subject_code, id]);
    if (dupCode.length) return res.status(409).json({ error: 'Another subject already uses this code' });
    const [dupName] = await pool.query('SELECT id FROM subject WHERE LOWER(subject_name)=LOWER(?) AND id <> ? LIMIT 1', [subject_name, id]);
    if (dupName.length) return res.status(409).json({ error: 'Another subject already uses this name' });

    await pool.query('UPDATE subject SET subject_code=?, subject_name=?, program_id=?, credit=? WHERE id=?', [subject_code.trim(), subject_name.trim(), program_id, credit, id]);

    const [rows] = await pool.query(`
      SELECT s.id,
             s.subject_code,
             s.subject_name,
             s.program_id,
             s.credit,
             p.name AS program_name,
             p.code AS program_code,
             p.department_id,
             d.department_name
      FROM subject s
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE s.id = ?
    `, [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete subject
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT id FROM subject WHERE id = ?', [id]);
    if (!exists.length) return res.status(404).json({ error: 'Subject not found' });
    await pool.query('DELETE FROM subject WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};
