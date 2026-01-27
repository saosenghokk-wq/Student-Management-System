const staffService = require('../services/staffService');

// Get all staff
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await staffService.getAllStaff();
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

// Get staff by ID
exports.getStaffById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staff = await staffService.getStaffById(id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

// Create new staff
exports.createStaff = async (req, res, next) => {
  try {
    const { username, email, password, eng_name, khmer_name, phone, province_no, district_no, commune_no, village_no } = req.body;
    
    const staffId = await staffService.createStaff({
      username,
      email,
      password,
      eng_name,
      khmer_name,
      phone,
      province_no,
      district_no,
      commune_no,
      village_no
    });

    res.status(201).json({ 
      message: 'Staff created successfully', 
      id: staffId 
    });
  } catch (err) {
    next(err);
  }
};

// Update staff
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await staffService.updateStaff(id, req.body);
    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete staff
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await staffService.deleteStaff(id);
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Legacy list method for backward compatibility
exports.list = async (req, res, next) => {
  try {
    const staff = await staffService.getAllStaff();
    res.json(staff);
  } catch (err) {
    next(err);
  }
};
