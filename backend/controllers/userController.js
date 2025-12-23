const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  res.json(users);
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.params.id);
  res.json(user);
});

exports.createUser = asyncHandler(async (req, res) => {
  // Add create_by and update_by fields from authenticated user
  const userData = {
    ...req.body,
    create_by: req.user.id, // Get current logged-in user ID from JWT token
    update_by: req.user.id
  };
  const created = await userService.createUser(userData);
  res.status(201).json(created);
});

exports.updateUser = asyncHandler(async (req, res) => {
  // Add update_by field from authenticated user
  const userData = {
    ...req.body,
    update_by: req.user.id // Get current logged-in user ID from JWT token
  };
  const updated = await userService.updateUser(req.params.id, userData);
  res.json(updated);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.json({ success: true });
});
