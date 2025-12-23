const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const ApiError = require('../utils/ApiError');
const roleRepository = require('../repositories/roleRepository');

class UserService {
  async listUsers() {
    return userRepository.findAll();
  }

  async getUser(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  }

  async createUser(data) {
    if (await userRepository.emailExists(data.email)) {
      throw new ApiError(400, 'Email already in use');
    }
    // Validate role relationship if provided
    if (data.role_id !== undefined && data.role_id !== null) {
      const roleId = parseInt(data.role_id, 10);
      if (!(await roleRepository.existsById(roleId))) {
        throw new ApiError(400, 'Invalid role_id');
      }
      data.role_id = roleId;
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    // Add created_at if not provided
    if (!data.created_at) {
      data.created_at = new Date();
    }
    const created = await userRepository.create(data);
    delete created.password;
    return created;
  }

  async updateUser(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    // Validate role relationship if updating role_id
    if (data.role_id !== undefined) {
      const roleId = parseInt(data.role_id, 10);
      if (!(await roleRepository.existsById(roleId))) {
        throw new ApiError(400, 'Invalid role_id');
      }
      data.role_id = roleId;
    }
    const existing = await userRepository.findById(id);
    if (!existing) throw new ApiError(404, 'User not found');
    const updated = await userRepository.update(id, data);
    delete updated.password;
    return updated;
  }

  async deleteUser(id) {
    const existing = await userRepository.findById(id);
    if (!existing) throw new ApiError(404, 'User not found');
    await userRepository.delete(id);
    return true;
  }
}

module.exports = new UserService();
