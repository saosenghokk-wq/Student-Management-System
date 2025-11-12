const { pool } = require('../config/db');

// Get all provinces
exports.getProvinces = async (req, res, next) => {
  try {
    console.log('Fetching provinces from database...');
    
    // Query database
    const [rows] = await pool.query('SELECT * FROM provinces ORDER BY id ASC');
    
    console.log('Raw data from database:', JSON.stringify(rows.slice(0, 2), null, 2));
    console.log(`Total provinces found: ${rows.length}`);
    
    if (rows.length === 0) {
      console.warn('WARNING: No provinces found in database!');
      return res.json([]);
    }
    
    // Map each row to expected format
    const result = rows.map(row => {
      const mapped = {
        province_no: row.no,  // Use numeric 'no' field, not string 'id'
        province_name: row.name
      };
      return mapped;
    });
    
    console.log('Mapped result:', JSON.stringify(result.slice(0, 2), null, 2));
    res.json(result);
    
  } catch (err) {
    console.error('ERROR in getProvinces:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get districts by province
exports.getDistricts = async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    console.log(`Fetching districts for province_no: ${provinceId}`);
    
    // First get the province's string ID from its numeric no
    const [province] = await pool.query('SELECT id FROM provinces WHERE no = ?', [provinceId]);
    if (!province[0]) {
      return res.json([]);
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM districts WHERE province_id = ? ORDER BY id ASC',
      [province[0].id]
    );
    
    console.log(`Districts found: ${rows.length}`);
    
    const result = rows.map(row => ({
      district_no: row.no,  // Use numeric 'no' field
      district_name: row.name
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting districts:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get communes by district
exports.getCommunes = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    console.log(`Fetching communes for district_no: ${districtId}`);
    
    // First get the district's string ID from its numeric no
    const [district] = await pool.query('SELECT id FROM districts WHERE no = ?', [districtId]);
    if (!district[0]) {
      return res.json([]);
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM communes WHERE district_id = ? ORDER BY id ASC',
      [district[0].id]
    );
    
    console.log(`Communes found: ${rows.length}`);
    
    const result = rows.map(row => ({
      commune_no: row.no,  // Use numeric 'no' field
      commune_name: row.name
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting communes:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get villages by commune
exports.getVillages = async (req, res, next) => {
  try {
    const { communeId } = req.params;
    console.log(`Fetching villages for commune_no: ${communeId}`);
    
    // First get the commune's string ID from its numeric no
    const [commune] = await pool.query('SELECT id FROM communes WHERE no = ?', [communeId]);
    if (!commune[0]) {
      return res.json([]);
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM villages WHERE commune_id = ? ORDER BY id ASC',
      [commune[0].id]
    );
    
    console.log(`Villages found: ${rows.length}`);
    
    const result = rows.map(row => ({
      village_no: row.no,  // Use numeric 'no' field
      village_name: row.name
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting villages:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Get all batches
exports.getBatches = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM batch ORDER BY Id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get all student statuses
exports.getStudentStatuses = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_status ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get all scholarship types
exports.getScholarships = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM scholarship_type ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get programs by department
exports.getProgramsByDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const [rows] = await pool.query(`
      SELECT id, name, code, description, department_id, degree_id
      FROM programs 
      WHERE department_id = ?
      ORDER BY name ASC
    `, [departmentId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Get batches by program
exports.getBatchesByProgram = async (req, res, next) => {
  try {
    const { programId } = req.params;
    const [rows] = await pool.query(`
      SELECT Id, batch_code, program_id, academic_year
      FROM batch 
      WHERE program_id = ?
      ORDER BY academic_year DESC, batch_code ASC
    `, [programId]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
