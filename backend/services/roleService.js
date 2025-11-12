const roleRepository = require('../repositories/roleRepository');

class RoleService {
  async listRoles() {
    return roleRepository.findAll();
  }

  async validateRoleId(id) {
    return roleRepository.existsById(id);
  }
}

module.exports = new RoleService();
