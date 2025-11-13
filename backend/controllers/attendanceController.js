const attendanceService = require('../services/attendanceService');

const attendanceController = {
  // Get all attendance records
  async getAttendance(req, res) {
    try {
      const attendance = await attendanceService.getAllAttendance();
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
    }
  },

  // Get attendance by ID
  async getAttendanceById(req, res) {
    try {
      const { id } = req.params;
      const attendance = await attendanceService.getAttendanceById(id);
      
      if (!attendance) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
      }
      
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance record' });
    }
  },

  // Create attendance record
  async createAttendance(req, res) {
    try {
      const attendanceData = {
        ...req.body,
        modified_by: req.user?.id || 1
      };
      
      const attendanceId = await attendanceService.createAttendance(attendanceData);
      res.status(201).json({ 
        success: true, 
        message: 'Attendance record created successfully',
        id: attendanceId 
      });
    } catch (error) {
      console.error('Error creating attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to create attendance record' });
    }
  },

  // Update attendance record
  async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const attendanceData = {
        ...req.body,
        modified_by: req.user?.id || 1
      };
      
      const updated = await attendanceService.updateAttendance(id, attendanceData);
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
      }
      
      res.json({ success: true, message: 'Attendance record updated successfully' });
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to update attendance record' });
    }
  },

  // Delete attendance record
  async deleteAttendance(req, res) {
    try {
      const { id } = req.params;
      const deleted = await attendanceService.deleteAttendance(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
      }
      
      res.json({ success: true, message: 'Attendance record deleted successfully' });
    } catch (error) {
      console.error('Error deleting attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to delete attendance record' });
    }
  },

  // Get status types
  async getStatusTypes(req, res) {
    try {
      const statusTypes = await attendanceService.getStatusTypes();
      res.json({ success: true, data: statusTypes });
    } catch (error) {
      console.error('Error fetching status types:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch status types' });
    }
  },

  // Get students
  async getStudents(req, res) {
    try {
      const students = await attendanceService.getStudents();
      res.json({ success: true, data: students });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
  },

  // Get subject enrollments
  async getSubjectEnrollments(req, res) {
    try {
      // If user is a teacher (role_id = 3), filter by their teacher_id
      const teacherId = req.user?.role_id === 3 ? req.user.teacher_id : null;
      const enrollments = await attendanceService.getSubjectEnrollments(teacherId);
      res.json({ success: true, data: enrollments });
    } catch (error) {
      console.error('Error fetching subject enrollments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subject enrollments' });
    }
  },

  // Get attendance by filters
  async getAttendanceByFilters(req, res) {
    try {
      const filters = req.query;
      const attendance = await attendanceService.getAttendanceByFilters(filters);
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error filtering attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to filter attendance records' });
    }
  },

  // Get attendance by class and date
  async getAttendanceByClassAndDate(req, res) {
    try {
      const { subjectEnrollId, date } = req.params;
      const attendance = await attendanceService.getAttendanceByClassAndDate(subjectEnrollId, date);
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
  },

  // Save bulk attendance
  async saveBulkAttendance(req, res) {
    try {
      const { records } = req.body;
      const modifiedBy = req.user?.id || 1;
      
      const result = await attendanceService.saveBulkAttendance(records, modifiedBy);
      res.json({ 
        success: true, 
        message: `Attendance saved for ${result.saved} students`,
        data: result 
      });
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to save attendance' });
    }
  },

  // Get attendance by student
  async getAttendanceByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { subjectEnrollId } = req.query;
      const attendance = await attendanceService.getAttendanceByStudent(studentId, subjectEnrollId);
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student attendance' });
    }
  },

  // Get student's classes with attendance statistics (for student role)
  async getMyAttendanceClasses(req, res) {
    try {
      const studentId = req.user.student_id;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID not found' });
      }

      const classes = await attendanceService.getMyAttendanceClasses(studentId);
      res.json({ success: true, data: classes });
    } catch (error) {
      console.error('Error fetching my attendance classes:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch classes' });
    }
  },

  // Get student's attendance records for a specific class (for student role)
  async getMyClassAttendance(req, res) {
    try {
      const studentId = req.user.student_id;
      const { subjectEnrollId } = req.params;
      
      if (!studentId) {
        return res.status(400).json({ success: false, message: 'Student ID not found' });
      }

      const attendance = await attendanceService.getMyClassAttendance(studentId, subjectEnrollId);
      res.json({ success: true, data: attendance });
    } catch (error) {
      console.error('Error fetching my class attendance:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch attendance records' });
    }
  }
};

module.exports = attendanceController;
