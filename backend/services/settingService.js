const settingRepository = require('../repositories/settingRepository');

const settingService = {
  async getSettings() {
    return await settingRepository.getSettings();
  },

  async updateSettings(settingsData) {
    return await settingRepository.upsertSettings(settingsData);
  }
};

module.exports = settingService;
