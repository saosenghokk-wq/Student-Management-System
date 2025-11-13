const batchRepository = require('../repositories/batchRepository');

class BatchService {
  async getAllBatches(departmentId = null) {
    return await batchRepository.findAll(departmentId);
  }

  async getBatchById(id) {
    return await batchRepository.findById(id);
  }

  async createBatch(data) {
    return await batchRepository.create(data);
  }

  async updateBatch(id, data) {
    return await batchRepository.update(id, data);
  }

  async deleteBatch(id) {
    return await batchRepository.delete(id);
  }

  async getAdmissions() {
    return await batchRepository.getAdmissions();
  }
}

module.exports = new BatchService();
