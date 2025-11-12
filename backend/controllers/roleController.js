const asyncHandler = require('../utils/asyncHandler');
const roleService = require('../services/roleService');

exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.listRoles();
  res.json(roles);
});
