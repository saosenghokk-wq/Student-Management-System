const staffRepository = require('../repositories/staffRepository');

class StaffService {
  async getAllStaff() {
    return await staffRepository.findAll();
  }

  async getStaffById(id) {
    return await staffRepository.findById(id);
  }

  async createStaff(staffData) {
    return await staffRepository.create(staffData);
  }

  async updateStaff(id, staffData) {
    return await staffRepository.update(id, staffData);
  }

  async deleteStaff(id) {
    return await staffRepository.delete(id);
  }

  async getPositions() {
    return await staffRepository.getPositions();
  }
}

module.exports = new StaffService();
