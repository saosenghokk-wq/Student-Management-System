const settingService = require('../services/settingService');

const settingController = {
  // Get system settings
  async getSettings(req, res) {
    try {
      const settings = await settingService.getSettings();
      
      res.json({ 
        success: true, 
        data: settings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  },

  // Update system settings (admin only)
  async updateSettings(req, res) {
    try {
      const { 
        system_title, 
        system_address, 
        sys_phone, 
        system_email, 
        system_language, 
        system_runnign_year, 
        system_logo 
      } = req.body;

      const settingsData = {
        system_title,
        system_address,
        sys_phone,
        system_email,
        system_language,
        system_runnign_year,
        system_logo
      };

      const settings = await settingService.updateSettings(settingsData);
      
      res.json({ 
        success: true, 
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  }
};

module.exports = settingController;
