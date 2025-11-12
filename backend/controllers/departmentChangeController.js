const db = require('../config/db');

exports.createDepartmentChange = async (req, res) => {
  try {
    const { student_id, old_department_id, new_department_id, change_date } = req.body;
    
    if (!student_id || !old_department_id || !new_department_id) {
      return res.status(400).json({ error: 'Student ID, old department, and new department are required' });
    }
    
    const query = `
      INSERT INTO department_change (student_id, old_department_id, new_department_id, change_date)
      VALUES (?, ?, ?, ?)
    `;
    
    await db.query(query, [student_id, old_department_id, new_department_id, change_date || new Date()]);
    
    res.json({ message: 'Department change recorded successfully' });
  } catch (err) {
    console.error('Error recording department change:', err);
    res.status(500).json({ error: 'Failed to record department change' });
  }
};

exports.getDepartmentChangesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT 
        dc.*,
        d1.department_name as old_department_name,
        d2.department_name as new_department_name
      FROM department_change dc
      LEFT JOIN departments d1 ON dc.old_department_id = d1.id
      LEFT JOIN departments d2 ON dc.new_department_id = d2.id
      WHERE dc.student_id = ?
      ORDER BY dc.change_date DESC
    `;
    
    const [changes] = await db.query(query, [studentId]);
    res.json(changes);
  } catch (err) {
    console.error('Error fetching department changes:', err);
    res.status(500).json({ error: 'Failed to fetch department changes' });
  }
};
