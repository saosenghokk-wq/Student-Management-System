const admissionRepository = require('../repositories/admissionRepository');

class AdmissionService {
  async getAllAdmissions() {
    return await admissionRepository.findAll();
  }

  async getAdmissionById(id) {
    return await admissionRepository.findById(id);
  }

  async createAdmission(data) {
    return await admissionRepository.create(data);
  }

  async updateAdmission(id, data) {
    return await admissionRepository.update(id, data);
  }

  async deleteAdmission(id) {
    return await admissionRepository.delete(id);
  }
}

module.exports = new AdmissionService();
