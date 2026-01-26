# Complete Deployment Guide - Student Management System

## ✅ Step 1: Frontend Deployed (Done)
Your React frontend is deployed on Vercel.

## 🚀 Step 2: Deploy Backend to Railway

### A. Create Railway Account & Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Student-Management-System` repository

### B. Configure Backend Deployment
1. Railway will detect your backend automatically (using `nixpacks.toml`)
2. Add a **MySQL database**:
   - In your Railway project, click "+ New"
   - Select "Database" → "MySQL"
   - Railway will create and connect it automatically

### C. Set Environment Variables
In Railway project settings → Variables, add:

```env
DB_HOST=${{MYSQLHOST}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}
DB_NAME=${{MYSQLDATABASE}}
DB_PORT=${{MYSQLPORT}}
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

**Note**: Railway provides MySQL variables automatically as `${{MYSQLHOST}}`, etc.

### D. Import Database Schema
1. Connect to Railway MySQL using:
   - Railway CLI: `railway connect mysql`
   - Or use MySQL Workbench with Railway credentials
2. Import your database schema:
   ```sql
   -- Run your SQL schema file
   source /path/to/your/schema.sql
   ```

### E. Get Backend URL
After deployment, Railway gives you a URL like:
`https://student-management-system-production.up.railway.app`

## 🔗 Step 3: Connect Frontend to Backend

Update your frontend to use the production backend URL:

### Option 1: Environment Variable (Recommended)
Create `.env.production` in `frontend/`:

```env
REACT_APP_API_URL=https://your-railway-backend.up.railway.app
```

Then update `frontend/src/api/api.js` to use this:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### Option 2: Direct Configuration
Update all API calls in your frontend to use the Railway URL instead of `http://localhost:5000`.

## 🔐 Step 4: Update Backend CORS

Update `backend/index.js` or `.env` to allow your Vercel domain:

```env
ALLOWED_ORIGINS=https://your-app-name.vercel.app,https://your-custom-domain.com
```

## ✅ Step 5: Redeploy Frontend

After updating API URL:

```bash
git add .
git commit -m "Configure production API URL"
git push origin main
```

Vercel will automatically redeploy with new settings.

## 🧪 Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Test creating/editing data
4. Check browser console for errors
5. Verify data is saving to Railway MySQL

## 📊 Monitoring

- **Frontend**: Vercel Dashboard → Your Project → Logs
- **Backend**: Railway Dashboard → Your Project → Logs
- **Database**: Railway → MySQL → Connect

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Add Vercel domain to `ALLOWED_ORIGINS` in Railway

### Issue: Cannot connect to database
**Solution**: Check Railway MySQL is running and env variables are correct

### Issue: JWT errors
**Solution**: Ensure `JWT_SECRET` is set and at least 32 characters

### Issue: API calls fail
**Solution**: Verify `REACT_APP_API_URL` matches Railway backend URL

## 🎯 Quick Deployment Checklist

- [x] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] MySQL database created on Railway
- [ ] Environment variables set on Railway
- [ ] Database schema imported
- [ ] Frontend API URL updated
- [ ] Backend CORS configured
- [ ] Frontend redeployed
- [ ] Login tested
- [ ] CRUD operations tested

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Your Frontend: https://your-app.vercel.app
- Your Backend: https://your-app.up.railway.app

## 💡 Alternative Backend Hosting

If you don't want to use Railway, alternatives include:
- **Render**: Free tier with PostgreSQL
- **Heroku**: Paid plans only
- **DigitalOcean App Platform**: $5/month
- **AWS Elastic Beanstalk**: Requires AWS knowledge
- **Google Cloud Run**: Pay per use

## 📝 Production Best Practices

1. **Use environment variables** for all secrets
2. **Enable HTTPS** on both frontend and backend
3. **Set strong JWT_SECRET** (at least 32 characters)
4. **Backup database** regularly (Railway provides automatic backups)
5. **Monitor logs** for errors
6. **Use custom domain** (optional but professional)

---

## Need Help?
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Your GitHub Repo: https://github.com/saosenghokk-wq/Student-Management-System
