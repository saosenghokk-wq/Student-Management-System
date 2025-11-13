const gradeService = require('../services/gradeService');

const gradeController = {
  // Get all grades
  async getAllGrades(req, res) {
    try {
      const grades = await gradeService.getAllGrades();
      res.json({ success: true, data: grades });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
  },

  // Get grade by ID
  async getGradeById(req, res) {
    try {
      const { id } = req.params;
      const grade = await gradeService.getGradeById(id);
      
      if (!grade) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
      }
      
      res.json({ success: true, data: grade });
    } catch (error) {
      console.error('Error fetching grade:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grade' });
    }
  },

  // Create grade record
  async createGrade(req, res) {
    try {
      const gradeData = {
        ...req.body,
        grade_by: req.user?.id || 1
      };
      
      const gradeId = await gradeService.createGrade(gradeData);
      res.status(201).json({ 
        success: true, 
        message: 'Grade created successfully',
        id: gradeId 
      });
    } catch (error) {
      console.error('Error creating grade:', error);
      res.status(500).json({ success: false, message: 'Failed to create grade' });
    }
  },

  // Update grade record
  async updateGrade(req, res) {
    try {
      const { id } = req.params;
      const gradeData = {
        ...req.body,
        grade_by: req.user?.id || 1
      };
      
      const updated = await gradeService.updateGrade(id, gradeData);
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
      }
      
      res.json({ success: true, message: 'Grade updated successfully' });
    } catch (error) {
      console.error('Error updating grade:', error);
      res.status(500).json({ success: false, message: 'Failed to update grade' });
    }
  },

  // Delete grade record
  async deleteGrade(req, res) {
    try {
      const { id } = req.params;
      const deleted = await gradeService.deleteGrade(id);
      
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Grade not found' });
      }
      
      res.json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
      console.error('Error deleting grade:', error);
      res.status(500).json({ success: false, message: 'Failed to delete grade' });
    }
  },

  // Get grade types
  async getGradeTypes(req, res) {
    try {
      const gradeTypes = await gradeService.getGradeTypes();
      res.json({ success: true, data: gradeTypes });
    } catch (error) {
      console.error('Error fetching grade types:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grade types' });
    }
  },

  // Get subject enrollments for grades (filtered by teacher if applicable)
  async getSubjectEnrollments(req, res) {
    try {
      // If user is a teacher (role_id = 3), filter by their teacher_id
      const teacherId = req.user?.role_id === 3 ? req.user.teacher_id : null;
      const enrollments = await gradeService.getSubjectEnrollments(teacherId);
      res.json({ success: true, data: enrollments });
    } catch (error) {
      console.error('Error fetching subject enrollments:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch subject enrollments' });
    }
  },

  // Get grades by class
  async getGradesByClass(req, res) {
    try {
      const { subjectEnrollId } = req.params;
      const { gradeTypeId } = req.query;
      const grades = await gradeService.getGradesByClass(subjectEnrollId, gradeTypeId);
      res.json({ success: true, data: grades });
    } catch (error) {
      console.error('Error fetching grades:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
  },

  // Get grades by student
  async getGradesByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { subjectEnrollId } = req.query;
      const grades = await gradeService.getGradesByStudent(studentId, subjectEnrollId);
      res.json({ success: true, data: grades });
    } catch (error) {
      console.error('Error fetching student grades:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch student grades' });
    }
  },

  // Save bulk grades
  async saveBulkGrades(req, res) {
    try {
      const { records } = req.body;
      const gradedBy = req.user?.id || 1;
      
      const result = await gradeService.saveBulkGrades(records, gradedBy);
      res.json({ 
        success: true, 
        message: `Grades saved for ${result.total} students`,
        data: result 
      });
    } catch (error) {
      console.error('Error saving bulk grades:', error);
      res.status(500).json({ success: false, message: 'Failed to save grades' });
    }
  },

  // Get student's active classes
  async getMyClasses(req, res) {
    try {
      const studentId = req.user.student_id;
      
      if (!studentId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized as student' 
        });
      }

      const classes = await gradeService.getStudentActiveClasses(studentId);
      res.json({ success: true, data: classes });
    } catch (error) {
      console.error('Error fetching student classes:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch classes' });
    }
  },

  // Get student's grades for a specific class
  async getMyClassGrades(req, res) {
    try {
      const studentId = req.user.student_id;
      const { subjectEnrollId } = req.params;
      
      if (!studentId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized as student' 
        });
      }

      const grades = await gradeService.getStudentClassGrades(studentId, subjectEnrollId);
      res.json({ success: true, data: grades });
    } catch (error) {
      console.error('Error fetching student class grades:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
  }
};

module.exports = gradeController;
