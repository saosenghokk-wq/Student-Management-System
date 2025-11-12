const ApiError = require('../utils/ApiError');
const studentRepository = require('../repositories/studentRepository');
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class StudentService {
  async listStudents() {
    return studentRepository.findAll();
  }

  async getStudent(id) {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        d.department_name,
        p.name as program_name,
        b.batch_code,
        b.academic_year,
        ss.std_status as status_name,
        st.scholarship as scholarship_name,
    par.id as parent_id,
    par.parent_code,
    par.father_name,
    par.mother_name,
    par.father_occupation,
    par.mother_occupation,
    par.father_phone,
    par.mother_phone,
        prov.name as province_name,
        dist.name as district_name,
        comm.name as commune_name,
        vill.name as village_name,
  u.username,
  u.email,
  u.status AS status,
        u.image as profile_image
      FROM student s
      LEFT JOIN department d ON s.department_id = d.id
      LEFT JOIN programs p ON s.program_id = p.id
      LEFT JOIN batch b ON s.batch_id = b.Id
      LEFT JOIN student_status ss ON s.std_status_id = ss.id
      LEFT JOIN scholarship_type st ON s.schoolarship_id = st.id
      LEFT JOIN parent par ON s.parent_id = par.id
      LEFT JOIN provinces prov ON s.province_no = prov.no
      LEFT JOIN districts dist ON s.district_no = dist.no
      LEFT JOIN communes comm ON s.commune_no = comm.no
      LEFT JOIN villages vill ON s.village_no = vill.no
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) throw new ApiError(404, 'Student not found');
    return rows[0];
  }

  async createStudent(data) {
    console.log('=== START CREATE STUDENT PROCESS ===');
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Step 1: Validating input data');
    
    // Validate required fields
    if (!data.username) throw new ApiError(400, 'Username is required');
    if (!data.email) throw new ApiError(400, 'Email is required');
    if (!data.password) throw new ApiError(400, 'Password is required');
    if (!data.student_code) throw new ApiError(400, 'Student code is required');
    if (!data.std_eng_name) throw new ApiError(400, 'English name is required');
    if (!data.from_high_school) throw new ApiError(400, 'High school is required');
    if (!data.department_id) throw new ApiError(400, 'Department is required');
    
    console.log('Step 2: Prepare and validate student data BEFORE creating user');
    
    // Prepare and validate all data first before creating user
    const safeParseInt = (value, fieldName) => {
      if (!value) return null;
      const parsed = parseInt(value, 10);
      if (isNaN(parsed)) {
        throw new ApiError(400, `Invalid numeric value for ${fieldName}: "${value}"`);
      }
      return parsed;
    };
    
    const studentData = {
      student_code: data.student_code,
      std_eng_name: data.std_eng_name,
      std_khmer_name: data.std_khmer_name || '',
      gender: data.gender || '0',
      dob: data.dob || '2000-01-01',
      phone: safeParseInt(data.phone, 'phone') || 0,
      nationality: data.nationality || 'Cambodian',
      race: data.race || 'Khmer',
      from_high_school: data.from_high_school || '',
      marital_status: data.marital_status || '0',
      department_id: safeParseInt(data.department_id, 'department_id'),
      program_id: safeParseInt(data.program_id, 'program_id') || 1,
      batch_id: safeParseInt(data.batch_id, 'batch_id') || 1,
      parent_id: safeParseInt(data.parent_id, 'parent_id') || 1,
      province_no: safeParseInt(data.province_no, 'province_no') || 1,
      district_no: safeParseInt(data.district_no, 'district_no') || 1,
      commune_no: safeParseInt(data.commune_no, 'commune_no') || 1,
      village_no: safeParseInt(data.village_no, 'village_no') || 1,
      std_status_id: safeParseInt(data.std_status_id, 'std_status_id') || 1,
      schoolarship_id: safeParseInt(data.schoolarship_id, 'schoolarship_id'),
      description: data.description || ''
    };
    
    console.log('✓ All data validated successfully');
    console.log('Student data:', JSON.stringify(studentData, null, 2));
    
    console.log('Step 3: Check for duplicate username');
    const [existingUsername] = await pool.query(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [data.username]
    );
    if (existingUsername.length > 0) {
      throw new ApiError(409, `Username "${data.username}" already exists`);
    }
    
    console.log('Step 4: Check for duplicate email');
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [data.email]
    );
    if (existingEmail.length > 0) {
      throw new ApiError(409, `Email "${data.email}" already exists`);
    }
    
    console.log('Step 5: Check for duplicate student_code');
    const [existingCode] = await pool.query(
      'SELECT id FROM student WHERE student_code = ? LIMIT 1',
      [data.student_code]
    );
    if (existingCode.length > 0) {
      throw new ApiError(409, `Student code "${data.student_code}" already exists`);
    }
    
    console.log('Step 6: Hash password and create user in users table');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [userResult] = await pool.query(
      `INSERT INTO users (username, email, password, role_id, status, created_at) 
       VALUES (?, ?, ?, 4, '1', NOW())`,
      [data.username, data.email, hashedPassword]
    );
    
    const userId = userResult.insertId;
    console.log(`✓ User created with ID: ${userId}`);
    
    console.log('Step 7: Insert student data');
    try {
      const query = `INSERT INTO student 
        (user_id, student_code, std_eng_name, std_khmer_name, gender, dob, from_high_school,
         nationality, race, marital_status, phone, description, parent_id, province_no,
         district_no, commune_no, village_no, department_id, program_id, batch_id,
         std_status_id, schoolarship_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      
      const values = [
        userId,
        studentData.student_code,
        studentData.std_eng_name,
        studentData.std_khmer_name,
        studentData.gender,
        studentData.dob,
        studentData.from_high_school,
        studentData.nationality,
        studentData.race,
        studentData.marital_status,
        studentData.phone,
        studentData.description,
        studentData.parent_id,
        studentData.province_no,
        studentData.district_no,
        studentData.commune_no,
        studentData.village_no,
        studentData.department_id,
        studentData.program_id,
        studentData.batch_id,
        studentData.std_status_id,
        studentData.schoolarship_id || null
      ];
      
      console.log('SQL Query:', query);
      console.log('Values:', values);
      
      const [studentResult] = await pool.query(query, values);
      const studentId = studentResult.insertId;
      console.log(`✓ Student created with ID: ${studentId}`);
      console.log('=== END CREATE STUDENT PROCESS - SUCCESS ===');
      
      return { 
        id: studentId, 
        user_id: userId,
        ...studentData 
      };
    } catch (error) {
      console.error('ERROR inserting student:', error.message);
      console.error('Full error:', error);
      console.log('Attempting to rollback user...');
      
      try {
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        console.log(`✓ Rolled back user ID ${userId}`);
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr.message);
      }
      
      throw new ApiError(500, `Failed to create student: ${error.message}`);
    }
  }

  async updateStudent(id, data) {
    console.log('\n==========================================');
    console.log('STUDENT SERVICE - updateStudent called');
    console.log('Student ID:', id);
    console.log('Data received:', JSON.stringify(data, null, 2));
    console.log('==========================================\n');
    
    const existing = await studentRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Student not found');
    
    console.log('Existing student user_id:', existing.user_id);
    
    // Extract user-related fields
    const { username, email, status, ...studentData } = data;
    console.log('Extracted fields:');
    console.log('  username:', username);
    console.log('  email:', email);
    console.log('  status:', status, 'Type:', typeof status);
    console.log('  studentData keys:', Object.keys(studentData));
    
    // Clean undefined fields from studentData
    Object.keys(studentData).forEach((k) => {
      if (studentData[k] === undefined) delete studentData[k];
    });

    // Update student table only if there are fields to update
    let updated = existing;
    if (Object.keys(studentData).length > 0) {
      updated = await studentRepository.update(id, studentData);
    }
    
    // Update user table if user-related fields are provided
    if (username !== undefined || email !== undefined || status !== undefined) {
      if (!existing.user_id) {
        throw new ApiError(400, 'Student has no linked user account');
      }
      console.log('=== USER UPDATE ===');
      console.log('Received status:', status, 'Type:', typeof status);
      
      const setClauses = [];
      const values = [];
      if (username !== undefined) { setClauses.push('username = ?'); values.push(username); }
      if (email !== undefined) { setClauses.push('email = ?'); values.push(email); }
      if (status !== undefined) { 
        const statusValue = String(status);
        console.log('Converting status to string:', statusValue);
        setClauses.push('status = ?'); 
        values.push(statusValue); 
      }

      if (setClauses.length > 0) {
        const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;
        values.push(existing.user_id);
        console.log('SQL:', sql);
        console.log('Values:', values);
        console.log('Executing query...');
        const [result] = await pool.query(sql, values);
        console.log('Update result - affected rows:', result.affectedRows);
        console.log('Update result - changed rows:', result.changedRows);
        
        // Verify the update actually happened
        const [verification] = await pool.query('SELECT id, username, email, status FROM users WHERE id = ?', [existing.user_id]);
        console.log('VERIFICATION - User in database after update:');
        console.log('  ID:', verification[0].id);
        console.log('  Username:', verification[0].username);
        console.log('  Email:', verification[0].email);
        console.log('  Status:', `"${verification[0].status}"`, 'Type:', typeof verification[0].status);
        console.log('=== USER UPDATE COMPLETE ===');
      }
    }
    
    return updated;
  }

  async deleteStudent(id) {
    const existing = await studentRepository.findById(id);
    if (!existing) throw new ApiError(404, 'Student not found');
    await studentRepository.delete(id);
    return true;
  }

  async updateStudentImage(studentId, imageData) {
    // Get the user_id from student table
    const [student] = await pool.query('SELECT user_id FROM student WHERE id = ? LIMIT 1', [studentId]);
    if (student.length === 0) {
      throw new ApiError(404, 'Student not found');
    }

    const userId = student[0].user_id;

    // Update image in users table with base64 data
    await pool.query('UPDATE users SET image = ? WHERE id = ?', [imageData, userId]);

    return { profile_image: imageData };
  }

  async getStudentsByBatch(batchId) {
    const query = `
      SELECT 
        s.id,
        s.student_code,
        s.std_eng_name as eng_name,
        s.std_khmer_name as khmer_name
      FROM student s
      WHERE s.batch_id = ?
      ORDER BY s.std_eng_name
    `;
    const [rows] = await pool.query(query, [batchId]);
    return rows;
  }
}

module.exports = new StudentService();
