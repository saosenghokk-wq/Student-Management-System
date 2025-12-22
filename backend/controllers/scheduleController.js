const scheduleService = require('../services/scheduleService');

const scheduleController = {
  // Get all schedules
  async getSchedules(req, res) {
    try {
      const { batch_id, semester } = req.query;
      
      let schedules;
      if (batch_id && semester) {
        schedules = await scheduleService.getSchedulesByBatchAndSemester(batch_id, semester);
      } else if (batch_id) {
        schedules = await scheduleService.getSchedulesByBatch(batch_id);
      } else {
        schedules = await scheduleService.getAllSchedules();
      }
      
      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Error fetching schedules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schedules'
      });
    }
  },

  // Upload new schedule
  async uploadSchedule(req, res) {
    try {
      const { batch_id, semester, image } = req.body;
      
      if (!batch_id || !semester || !image) {
        return res.status(400).json({
          success: false,
          error: 'Batch ID, semester, and image are required'
        });
      }

      const scheduleData = {
        batch_id,
        semester,
        image,
        create_by: req.user.id
      };

      const scheduleId = await scheduleService.createSchedule(scheduleData);
      
      res.status(201).json({
        success: true,
        message: 'Schedule uploaded successfully',
        data: { id: scheduleId }
      });
    } catch (error) {
      console.error('Error uploading schedule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload schedule'
      });
    }
  },

  // Update schedule
  async updateSchedule(req, res) {
    try {
      const { id } = req.params;
      const { batch_id, semester, image } = req.body;
      
      if (!batch_id || !semester) {
        return res.status(400).json({
          success: false,
          error: 'Batch ID and semester are required'
        });
      }

      const schedule = await scheduleService.getScheduleById(id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      const scheduleData = {
        batch_id,
        semester,
        image: image || schedule.image // Keep existing image if not provided
      };

      await scheduleService.updateSchedule(id, scheduleData);
      
      res.json({
        success: true,
        message: 'Schedule updated successfully'
      });
    } catch (error) {
      console.error('Error updating schedule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update schedule'
      });
    }
  },

  // Delete schedule
  async deleteSchedule(req, res) {
    try {
      const { id } = req.params;
      
      const schedule = await scheduleService.getScheduleById(id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      await scheduleService.deleteSchedule(id);
      
      res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete schedule'
      });
    }
  },

  // Get schedules for logged-in student
  async getMySchedules(req, res) {
    try {
      const studentId = req.user.student_id;
      
      if (!studentId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized as student'
        });
      }

      const schedules = await scheduleService.getSchedulesByStudentId(studentId);
      
      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Error fetching student schedules:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch schedules'
      });
    }
  }
};

module.exports = scheduleController;
