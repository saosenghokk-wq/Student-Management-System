# Copilot Instructions for Student Management System (SMS)

## Architecture Overview

**SMS** is a fullstack educational management system with:
- **Backend**: Node.js/Express API with MySQL database
- **Frontend**: React.js with router-based navigation
- **Data Flow**: Controllers → Services → Repositories → Database (with pool-based queries)

### Three-Tier Backend Architecture

1. **Controllers** (`backend/controllers/`): HTTP request handlers - parse input, delegate to service, format response
2. **Services** (`backend/services/`): Business logic - validation, data transformation, cross-entity operations
3. **Repositories** (`backend/repositories/`): Data access - SQL queries via `mysql2` promise pool

Example flow: `studentRoutes.js` → `studentController.getStudent()` → `studentService.getStudent()` → `studentRepository` queries.

## Critical Developer Workflows

### Local Development Setup
```bash
# Backend (from project root)
npm start  # Runs: cd backend && node index.js

# Or directly for hot-reload
cd backend && npm run dev  # Uses nodemon

# Frontend (from project root or frontend/)
cd frontend && npm start  # React dev server on port 3000
```

**Key Requirement**: MySQL must be running (XAMPP recommended). Backend connects via environment variables in `.env`.

### Database Configuration
Backend reads from `.env` (see `config/db.js`):
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Connection credentials
- `JWT_SECRET` - Must be ≥32 characters; app exits if missing
- `PORT` - Default 5000
- `NODE_ENV` - Development/production mode

Database uses promise-based connection pooling (`mysql2/promise`). Callbacks-style single connection also available but deprecated for new code.

## Project-Specific Patterns

### Error Handling
- Throw `ApiError(statusCode, message)` from services (defined in `backend/utils/ApiError.js`)
- Controllers wrap handlers with `asyncHandler` to catch promise rejections → global error handler
- Error handler middleware (`backend/middleware/errorHandler.js`) converts `ApiError` to JSON responses

Example:
```javascript
const ApiError = require('../utils/ApiError');
if (!user) throw new ApiError(404, 'User not found');
```

### Authentication & Authorization
- All protected routes use `authMiddleware` (Bearer token JWT validation)
- Routes list protection explicitly: `router.use(protect)` protects all child routes
- JWT payload includes user `id` and `role_id`; accessible via `req.user`
- Role-based filtering example: `const departmentId = req.user?.role_id === 2 ? req.user.department_id : null` (role 2 = dean)

### Database Query Patterns
- Repositories use **parameterized queries** (`?` placeholders) to prevent SQL injection
- Services may perform **complex JOINs** for fetching related data (e.g., `studentService.getStudent()` fetches student + department + program + batch in one query)
- Use **pool.query()** (promise-based) for new code, not legacy `db` callback style

## Naming & File Organization Conventions

- **Routes**: `/api/{resource}` → `backend/routes/{resource}Routes.js` (e.g., `/api/students` → `studentRoutes.js`)
- **Database**: Foreign keys link entities (e.g., `student.user_id` → `users.id`; `student.department_id` → `department.id`)
- **Frontend components**: Inline styles with CSS gradients; uses React Router for navigation
- **Image handling**: Backend accepts base64-encoded images via `POST /api/{resource}/upload-image`

## Security & Environment

### Core Security Settings
- **JWT**: Token verification required for protected endpoints; 15-min default expiry or 7 days with remember-me
- **Password**: Bcrypt hashing (v6.0.0) enforced; plaintext comparisons removed
- **Rate Limiting**: 100 req/15min per IP (general), 5 attempts/15min per IP (auth endpoints)
- **Helmet.js**: XSS protection, Content Security Policy, and security headers enabled
- **CORS**: Configurable via `ALLOWED_ORIGINS` env variable

### Required Environment Variables
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sms
JWT_SECRET=<min-32-chars>
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

Startup validation fails if `DB_HOST`, `DB_USER`, `DB_NAME` missing, or `JWT_SECRET` < 32 chars.

## Integration Points & Cross-Component Patterns

- **User System**: Central `users` table; students/teachers/staff have `user_id` foreign key
- **Multi-role System**: Uses `role_id` (admin, dean, teacher, registrar, accountant, student, parent)
- **Batch/Department Filtering**: Services filter by `department_id` if user is dean (role_id=2)
- **Khmer Language Support**: Frontend includes Khmer font setup (`frontend/KHMER_FONT_SETUP.md`); store Unicode names in DB
- **PDF Export**: Frontend uses `jspdf` + `jspdf-autotable` for reports; backend handles via `reportRoutes.js`

## When Adding Features

1. **Create routes** in `backend/routes/{feature}Routes.js` with `authMiddleware` protection
2. **Create controller** in `backend/controllers/{feature}Controller.js` using `asyncHandler` wrapper
3. **Create service** in `backend/services/{feature}Service.js` with business logic and `ApiError` throws
4. **Create repository** in `backend/repositories/{feature}Repository.js` for queries
5. **Use promise-based pool queries** (`const [rows] = await pool.query(...)`) not callback style
6. **Validate inputs** in service layer before database operations
7. **Frontend**: Add routes in React Router; use Axios with `Authorization: Bearer {token}` header for API calls

## Build & Deployment

- **Frontend**: `npm run build` → static assets to `frontend/build/`
- **Backend**: No build step; deployed as-is with `node index.js`
- **Deployment files**: `nixpacks.toml` (Railway CI/CD), `DEPLOYMENT_CHECKLIST.md` (manual deployments)
- **Production**: Set `NODE_ENV=production`, use strong `JWT_SECRET`, restrict `ALLOWED_ORIGINS` to production domain
