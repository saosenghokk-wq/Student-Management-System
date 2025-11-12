// Require one of the allowed role IDs present on req.user.role_id
module.exports = function requireRoleIds(...allowedRoleIds) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const roleId = req.user.role_id;
    if (allowedRoleIds.includes(roleId)) return next();
    return res.status(403).json({ error: 'Forbidden: insufficient role' });
  };
};
