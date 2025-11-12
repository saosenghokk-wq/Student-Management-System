const teacherRepository = require('../repositories/teacherRepository');

class TeacherService {
  async getAllTeachers() {
    return await teacherRepository.findAll();
  }

  async getTeacherById(id) {
    return await teacherRepository.findById(id);
  }

  async createTeacher(data) {
    return await teacherRepository.create(data);
  }

  async updateTeacher(id, data) {
    return await teacherRepository.update(id, data);
  }

  async deleteTeacher(id) {
    return await teacherRepository.delete(id);
  }

  async getTeacherTypes() {
    return await teacherRepository.getTeacherTypes();
  }

  async getPositions() {
    return await teacherRepository.getPositions();
  }
}

module.exports = new TeacherService();
