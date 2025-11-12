const pool = require('../config/db').pool;

const settingRepository = {
  // Get system settings
  async getSettings() {
    const query = `SELECT * FROM sitting LIMIT 1`;
    const [rows] = await pool.execute(query);
    return rows[0] || null;
  },

  // Create or update settings
  async upsertSettings(settingsData) {
    // Check if settings exist
    const existing = await this.getSettings();
    
    if (existing) {
      // Update existing
      const query = `
        UPDATE sitting 
        SET system_title = ?, 
            system_address = ?, 
            sys_phone = ?, 
            system_email = ?, 
            system_language = ?, 
            system_runnign_year = ?, 
            system_logo = ?
        WHERE id = ?
      `;
      await pool.execute(query, [
        settingsData.system_title,
        settingsData.system_address,
        settingsData.sys_phone,
        settingsData.system_email,
        settingsData.system_language,
        settingsData.system_runnign_year,
        settingsData.system_logo,
        existing.id
      ]);
      return { ...settingsData, id: existing.id };
    } else {
      // Insert new
      const query = `
        INSERT INTO sitting 
        (system_title, system_address, sys_phone, system_email, system_language, system_runnign_year, system_logo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        settingsData.system_title,
        settingsData.system_address,
        settingsData.sys_phone,
        settingsData.system_email,
        settingsData.system_language,
        settingsData.system_runnign_year,
        settingsData.system_logo
      ]);
      return { ...settingsData, id: result.insertId };
    }
  }
};

module.exports = settingRepository;
