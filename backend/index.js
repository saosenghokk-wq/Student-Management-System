const express = require('express');
const path = require('path');
require('dotenv').config();
const { db } = require('./config/db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// DB connection is handled in config/db.js

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const programRoutes = require('./routes/programRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const degreeRoutes = require('./routes/degreeRoutes');
const parentRoutes = require('./routes/parentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const departmentChangeRoutes = require('./routes/departmentChangeRoutes');
const roleRoutes = require('./routes/roleRoutes');
const subjectEnrollmentRoutes = require('./routes/subjectEnrollmentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const batchRoutes = require('./routes/batchRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const feeRoutes = require('./routes/feeRoutes');
const settingRoutes = require('./routes/settingRoutes');
const reportRoutes = require('./routes/reportRoutes');

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/degrees', degreeRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/department-changes', departmentChangeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/subject-enrollments', subjectEnrollmentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/reports', reportRoutes);

// Error handling (should be last middleware)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


