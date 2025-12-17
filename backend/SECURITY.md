# Security Configuration Documentation

## Environment Variables Setup

### Required Variables
- `DB_HOST`: Database host (default: localhost)
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password (can be empty for local dev)
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Generate Secure JWT Secret
Run this command to generate a secure random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Features Implemented

### 1. Environment-Based Configuration ✅
- Database credentials moved to .env file
- JWT secret required (no fallback)
- CORS origins configurable
- Validation on startup

### 2. Authentication Security ✅
- JWT token-based authentication
- bcrypt password hashing (salt rounds: 10)
- Token expiration (15min default, 7 days with remember me)
- Removed plain password comparison

### 3. Rate Limiting ✅
- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 login attempts per 15 minutes per IP
- Prevents brute force attacks

### 4. HTTP Security Headers ✅
- Helmet.js for security headers
- Protection against common web vulnerabilities
- XSS protection
- Content Security Policy

### 5. CORS Configuration ✅
- Configurable allowed origins
- Credentials support
- Development mode flexibility

### 6. Error Handling ✅
- Centralized error handler
- Stack traces only in development
- Secure error messages

### 7. File Upload Security ✅
- Image validation (jpeg, jpg, png, gif)
- 5MB size limit
- Memory storage (buffer-based)

### 8. Database Security ✅
- Connection pooling
- Parameterized queries (SQL injection protection)
- Environment-based credentials

## Production Deployment Checklist

Before deploying to production:

1. ✅ Create `.env` file with secure values
2. ✅ Generate strong JWT_SECRET (32+ characters)
3. ✅ Set strong database password
4. ✅ Set NODE_ENV=production
5. ✅ Configure ALLOWED_ORIGINS with production URLs
6. ✅ Enable HTTPS/SSL
7. ✅ Keep .env file out of version control
8. ✅ Review and update rate limits if needed
9. ⚠️ Run `npm audit fix` to fix dependency vulnerabilities
10. ⚠️ Consider adding input validation library (joi, express-validator)

## Migration Notes

### Database Password Update
If your existing users have plain passwords in the database, they need to be rehashed:

```javascript
// Run this migration script once
const bcrypt = require('bcrypt');
const { pool } = require('./config/db');

async function migratePasswords() {
  const [users] = await pool.query('SELECT id, password FROM users');
  
  for (const user of users) {
    // Check if password is already hashed (bcrypt hashes start with $2)
    if (!user.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      console.log(`Updated password for user ${user.id}`);
    }
  }
  
  console.log('Migration complete');
  process.exit(0);
}

migratePasswords();
```

## Testing Security

### Test Rate Limiting
```bash
# Should block after 5 attempts
for i in {1..10}; do 
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done
```

### Test JWT Validation
```bash
# Should return 401
curl http://localhost:5000/api/users -H "Authorization: Bearer invalid_token"
```

### Test CORS
```bash
# Should be blocked if origin not allowed
curl -X GET http://localhost:5000/api/users \
  -H "Origin: http://malicious-site.com"
```

## Monitoring Recommendations

1. Monitor failed login attempts
2. Track API rate limit hits
3. Log suspicious activity
4. Set up alerts for security events
5. Regular security audits with `npm audit`

## Additional Recommendations

### Future Enhancements:
- Add input validation middleware (joi/express-validator)
- Implement refresh tokens
- Add 2FA (Two-Factor Authentication)
- Implement password reset functionality with email verification
- Add session management (Redis)
- Implement IP whitelisting for admin routes
- Add request logging (winston/morgan)
- Implement HTTPS enforcement
- Add database query logging in development
- Set up automated security scanning in CI/CD

### Password Policy:
Consider implementing:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Data Privacy:
- Never log passwords or tokens
- Sanitize user inputs
- Implement data encryption at rest
- Regular backups with encryption
- GDPR compliance for user data
