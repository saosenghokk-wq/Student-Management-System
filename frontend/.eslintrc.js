// ESLint configuration for production build
// This suppresses non-critical warnings while keeping the app functional

module.exports = {
  extends: ['react-app', 'react-app/jest'],
  rules: {
    // Temporarily allow unused variables (will be cleaned up gradually)
    'no-unused-vars': 'warn',
    
    // Temporarily allow == instead of === (will be fixed gradually) 
    'eqeqeq': 'warn',
    
    // Temporarily allow missing dependencies in useEffect
    'react-hooks/exhaustive-deps': 'warn',
  }
};
