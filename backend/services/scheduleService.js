const scheduleRepository = require('../repositories/scheduleRepository');

const scheduleService = {
  async getAllSchedules() {
    return await scheduleRepository.getAll();
  },

  async getSchedulesByBatch(batchId) {
    return await scheduleRepository.getByBatch(batchId);
  },

  async getSchedulesByBatchAndSemester(batchId, semester) {
    return await scheduleRepository.getByBatchAndSemester(batchId, semester);
  },

  async createSchedule(scheduleData) {
    return await scheduleRepository.create(scheduleData);
  },

  async deleteSchedule(id) {
    const schedule = await scheduleRepository.getById(id);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Delete the file from filesystem if needed
    // You can add file deletion logic here if storing files locally

    return await scheduleRepository.delete(id);
  },

  async getScheduleById(id) {
    return await scheduleRepository.getById(id);
  },

  async getSchedulesByStudentId(studentId) {
    return await scheduleRepository.getByStudentId(studentId);
  }
};

module.exports = scheduleService;
