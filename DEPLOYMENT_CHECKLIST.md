# Saint Paul Institute SMS - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

#### Backend (.env)
- [ ] **Update JWT_SECRET** - Change from `dev_secret` to a strong random string (minimum 32 characters)
  ```bash
  # Generate secure secret:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] **Set NODE_ENV=production**
- [ ] **Configure Database** - Update DB credentials for production database
- [ ] **Update ALLOWED_ORIGINS** - Add production frontend URL
- [ ] **Set PORT** - Confirm production port (default: 5000)

#### Frontend
- [ ] **Update API URL** - Create `.env.production` file:
  ```
  REACT_APP_API_URL=https://your-backend-domain.com
  ```
- [ ] **Verify image paths** - Check `/Picture1.jpg`, `/SPI-logo-landscape.png`, `/image.png` are in public folder

### 2. Database Preparation

- [ ] **Backup existing database** 
  ```bash
  mysqldump -u root -p sms > sms_backup_$(date +%Y%m%d).sql
  ```
- [ ] **Create production database**
- [ ] **Import schema and data** to production database
- [ ] **Test database connection** with production credentials
- [ ] **Verify all tables** have proper indexes
- [ ] **Check foreign key constraints** are working

### 3. Security Hardening

#### Backend
- [ ] **Remove console.log** from production code (optional but recommended)
- [ ] **Enable Helmet.js** security headers (already installed)
- [ ] **Configure CORS** properly - restrict to production domains only
- [ ] **Enable rate limiting** (already configured in `index.js`)
- [ ] **Use HTTPS** - SSL certificate for backend API
- [ ] **Sanitize user inputs** - Check all routes have proper validation
- [ ] **Password hashing** - Verify bcrypt is used (✓ already implemented)

#### Frontend
- [ ] **Remove debug code** and development logs
- [ ] **Enable HTTPS** - SSL certificate for frontend
- [ ] **Configure Content Security Policy**
- [ ] **Verify no sensitive data** in client-side code

### 4. Code Quality Check

- [x] **No ESLint/compilation errors** (verified ✓)
- [ ] **Test all CRUD operations** for each module
- [ ] **Test authentication flow** (login, logout, token refresh)
- [ ] **Test authorization** - role-based access control
- [ ] **Test file uploads** (student photos, documents)
- [ ] **Test PDF generation** with Khmer text
- [ ] **Test all report types**:
  - Student Profile Report
  - Student List Report  
  - Student Status Report
  - Grade Report
  - Attendance Report
  - Attendance Summary Report

### 5. Performance Optimization

#### Backend
- [ ] **Enable compression** middleware
- [ ] **Implement database connection pooling** (✓ already using mysql2 pool)
- [ ] **Add database query optimization** - check slow queries
- [ ] **Set up caching** for frequently accessed data (optional)
- [ ] **Configure proper logging** (Winston or similar)

#### Frontend
- [ ] **Build production bundle**
  ```bash
  cd frontend
  npm run build
  ```
- [ ] **Verify bundle size** is reasonable
- [ ] **Test lazy loading** of components (if implemented)
- [ ] **Optimize images** - compress logo and header images
- [ ] **Enable browser caching** in web server config

### 6. Dependencies Check

#### Backend
```json
Dependencies to verify:
- express: ^4.18.2 ✓
- mysql2: ^3.15.3 ✓
- bcrypt: ^6.0.0 ✓
- jsonwebtoken: ^9.0.2 ✓
- cors: ^2.8.5 ✓
- dotenv: ^17.2.3 ✓
- helmet: ^8.1.0 ✓
- express-rate-limit: ^8.2.1 ✓
```

#### Frontend
```json
Dependencies to verify:
- react: ^19.2.0 ✓
- jspdf: ^3.0.4 ✓
- html2canvas: ^1.4.1 ✓
- react-router-dom: ^7.9.5 ✓
```

- [ ] **Run npm audit** to check for vulnerabilities
  ```bash
  # Backend
  cd backend && npm audit
  
  # Frontend
  cd frontend && npm audit
  ```
- [ ] **Fix critical/high vulnerabilities** if any

### 7. Testing Checklist

#### Authentication & Authorization
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout functionality
- [ ] Token expiration handling
- [ ] Role-based access (Admin, Teacher, Student)

#### Student Management
- [ ] Add new student
- [ ] Edit student information
- [ ] View student profile
- [ ] Upload student photo
- [ ] Search/filter students

#### Academic Management
- [ ] Create/edit departments
- [ ] Create/edit programs
- [ ] Create/edit batches
- [ ] Create/edit subjects
- [ ] Subject enrollment
- [ ] Class schedules

#### Attendance & Grades
- [ ] Record attendance
- [ ] View attendance reports
- [ ] Enter grades
- [ ] View grade reports
- [ ] Calculate attendance rate

#### Reports
- [ ] Generate all report types
- [ ] Export to PDF with Khmer text
- [ ] Verify PDF header (logo, national motto)
- [ ] Test filters (department, batch, subject)
- [ ] Test grouping functionality

### 8. Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if targeting Mac/iOS users)
- [ ] Mobile browsers (Chrome Mobile, Safari Mobile)

### 9. Deployment Files

Required files for deployment:
```
backend/
├── .env (production config)
├── package.json
├── index.js
├── config/
├── controllers/
├── middleware/
├── models/
├── repositories/
├── routes/
├── services/
└── node_modules/ (will install on server)

frontend/
├── build/ (production build)
├── package.json
└── public/
    ├── Picture1.jpg ✓
    ├── SPI-logo-landscape.png ✓
    └── image.png ✓
```

### 10. Server Requirements

#### Backend Server
- **Node.js**: v18 or higher
- **MySQL**: 8.0 or higher
- **RAM**: Minimum 2GB
- **Storage**: 10GB+ (for database and files)
- **OS**: Linux (Ubuntu 20.04+) or Windows Server

#### Web Server Options
- **Option 1**: Nginx as reverse proxy for Node.js
- **Option 2**: Apache with mod_proxy
- **Option 3**: Direct Node.js with PM2 process manager

### 11. Deployment Steps

#### Backend Deployment

1. **Prepare Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server
```

2. **Upload Backend Code**
```bash
# Using Git
git clone <your-repo-url>
cd sms/backend

# Or using FTP/SCP
# Upload backend folder to server
```

3. **Install Dependencies**
```bash
cd backend
npm install --production
```

4. **Configure Environment**
```bash
# Create production .env file
nano .env

# Add production values:
# DB_HOST=your-db-host
# DB_USER=your-db-user
# DB_PASSWORD=your-db-password
# DB_NAME=sms
# JWT_SECRET=your-secure-secret
# NODE_ENV=production
# PORT=5000
# ALLOWED_ORIGINS=https://your-frontend-domain.com
```

5. **Setup Database**
```bash
mysql -u root -p
CREATE DATABASE sms;
USE sms;
SOURCE /path/to/your/database.sql;
```

6. **Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start index.js --name sms-backend
pm2 save
pm2 startup
```

7. **Setup Nginx Reverse Proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/sms-backend

# Add configuration:
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sms-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Frontend Deployment

1. **Build Production Bundle**
```bash
cd frontend
npm install
npm run build
```

2. **Deploy Build Folder**
```bash
# Option 1: Copy to web server
scp -r build/* user@server:/var/www/html/sms/

# Option 2: Deploy to Netlify/Vercel
# Follow their specific deployment guides
```

3. **Configure Web Server (Nginx)**
```bash
sudo nano /etc/nginx/sites-available/sms-frontend

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/sms;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/sms-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Setup SSL (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### 12. Post-Deployment Verification

- [ ] **Test login** from production URL
- [ ] **Verify all API endpoints** are responding
- [ ] **Check database connections** are working
- [ ] **Test file uploads** work correctly
- [ ] **Generate sample reports** and verify PDFs
- [ ] **Check error logs** for any issues
- [ ] **Monitor server resources** (CPU, RAM, Disk)
- [ ] **Test from different devices** (desktop, mobile, tablet)

### 13. Monitoring & Maintenance

- [ ] **Setup error logging** (PM2 logs, application logs)
- [ ] **Configure monitoring** (PM2 monitoring, Uptime Robot)
- [ ] **Setup database backups** (daily cron job)
- [ ] **Monitor disk space** and clean old logs
- [ ] **Keep dependencies updated** (monthly checks)

### 14. Backup Strategy

```bash
# Database backup script (add to cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p sms > /backups/sms_$DATE.sql
# Keep only last 30 days
find /backups/ -name "sms_*.sql" -mtime +30 -delete
```

Add to crontab:
```bash
crontab -e
# Add daily backup at 2 AM
0 2 * * * /path/to/backup_script.sh
```

### 15. Documentation

- [ ] **Create user manual** for end users
- [ ] **Document API endpoints** (optional)
- [ ] **Create admin guide** for system management
- [ ] **Document database schema**
- [ ] **Keep deployment notes** for future reference

---

## ⚠️ Critical Items Before Going Live

1. **Change JWT_SECRET** to secure random string
2. **Set NODE_ENV=production**
3. **Update database credentials**
4. **Configure CORS** to production domains only
5. **Enable HTTPS** with SSL certificates
6. **Test all report generation** with real data
7. **Verify backup system** is working
8. **Test user authentication** thoroughly

---

## 📞 Emergency Contacts

- Database Admin: _______________
- Server Admin: _______________
- Developer: _______________

---

## 📝 Deployment Log

| Date | Version | Changes | Deployed By |
|------|---------|---------|-------------|
| YYYY-MM-DD | 1.0.0 | Initial deployment | _______ |

---

## 🎯 Current Status

**✅ Ready for Deployment:**
- ✓ No compilation errors
- ✓ All dependencies installed
- ✓ PDF reports working with Khmer support
- ✓ Authentication & authorization implemented
- ✓ Database schema complete
- ✓ File upload functionality ready
- ✓ Security middleware configured

**⚠️ Requires Configuration:**
- JWT_SECRET (production)
- Database credentials (production)
- CORS allowed origins (production)
- SSL certificates
- Server setup

**📋 Recommended Before Launch:**
- Comprehensive testing with real users
- Performance testing with large datasets
- Security audit
- User training sessions
- Backup/restore testing
