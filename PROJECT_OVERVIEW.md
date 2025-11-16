# Project Overview: Student Management System (SMS)

## Yes, I Know About Your Project! 👋

This is a comprehensive **Student Management System** designed for educational institutions. Here's what I understand about your project:

---

## 🎯 Project Summary

**Student Management System (SMS)** is a full-stack web application built to manage all aspects of an educational institution - from student enrollment and attendance tracking to grade management and fee collection.

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React.js (v19.2.0)
- **Routing**: React Router DOM (v7.9.5)
- **State Management**: Context API (AlertContext)
- **UI Components**: Custom components with inline CSS and gradient styling
- **Icons**: React Icons
- **PDF Generation**: jsPDF & jsPDF-autoTable
- **Build Tool**: Create React App with React Scripts

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js (v4.18.2)
- **Database**: MySQL (via mysql2 package with both callback and promise-based connections)
- **Authentication**: JWT (JSON Web Tokens) with jsonwebtoken package
- **Password Security**: bcrypt/bcryptjs for password hashing
- **File Upload**: Multer (for handling base64 images)
- **CORS**: Enabled for frontend-backend communication
- **Environment**: dotenv for configuration management

### **Database**
- **DBMS**: MySQL (recommended: XAMPP)
- **Database Name**: `sms`
- **Connection**: Both single connection (legacy) and connection pool (modern)
- **Default Credentials**: root with no password on localhost

---

## 📁 Project Structure

```
Student-Management-System/
├── backend/
│   ├── config/
│   │   └── db.js                    # Database connection setup
│   ├── controllers/                 # Business logic handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── attendanceController.js
│   │   ├── gradeController.js
│   │   ├── feeController.js
│   │   ├── dashboardController.js
│   │   ├── departmentController.js
│   │   ├── programController.js
│   │   ├── subjectController.js
│   │   ├── userController.js
│   │   ├── scheduleController.js
│   │   ├── admissionController.js
│   │   ├── settingController.js
│   │   ├── reportController.js
│   │   └── ... (more controllers)
│   ├── repositories/                # Data access layer
│   ├── routes/                      # API route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── teacherRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── gradeRoutes.js
│   │   └── ... (more routes)
│   ├── services/                    # Business logic services
│   ├── middleware/                  # Authentication & authorization
│   ├── utils/                       # Helper utilities
│   ├── index.js                     # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                     # API client functions
│   │   ├── components/              # Reusable components
│   │   │   ├── Alert.jsx
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── HomeRedirect.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleProtectedRoute.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── contexts/                # React Context providers
│   │   │   └── AlertContext.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── AddStudent.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   ├── Teachers.jsx
│   │   │   ├── AddTeacher.jsx
│   │   │   ├── Staff.jsx
│   │   │   ├── AddStaff.jsx
│   │   │   ├── Parents.jsx
│   │   │   ├── AddParent.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── AttendanceDetail.jsx
│   │   │   ├── Grades.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Fees.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── Programs.jsx
│   │   │   ├── Subjects.jsx
│   │   │   ├── SubjectEnrollment.jsx
│   │   │   ├── Batches.jsx
│   │   │   ├── Admissions.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── MySchedule.jsx
│   │   │   ├── MyGrades.jsx
│   │   │   ├── MyAttendance.jsx
│   │   │   ├── MyFees.jsx
│   │   │   ├── ParentAttendance.jsx
│   │   │   ├── ParentGrades.jsx
│   │   │   ├── StudentClasses.jsx
│   │   │   ├── StudentGrades.jsx
│   │   │   └── ComingSoon.jsx
│   │   ├── styles/                  # CSS stylesheets
│   │   ├── App.js                   # Main app component
│   │   ├── index.js                 # React entry point
│   │   └── index.css
│   └── package.json
│
├── README.md                        # Project documentation
└── .gitignore
```

---

## 🌟 Key Features

### 🔐 **Role-Based Access Control (RBAC)**
The system supports 5 distinct user roles:

1. **Admin (role_id: 1)** - Complete system access and control
2. **Teacher (role_id: 2)** - Academic management capabilities
3. **Registrar (role_id: 3)** - Student records and enrollment management
4. **Student (role_id: 4)** - Personal information and academic record viewing
5. **Accountant (role_id: 7)** - Financial and fee management

### 👨‍💼 **Admin Features**
- 📊 Comprehensive dashboard with statistics and analytics
- 👥 User Management (CRUD operations)
- 🎓 Student Management (enrollment, profiles, records)
- 👨‍🏫 Teacher Management
- 🏢 Department Management
- 📚 Program Management
- 📖 Subject Management
- 📝 Subject Enrollment
- 📅 Schedule Management
- 📋 Attendance Tracking
- 📊 Grade Management
- 💰 Fee Management
- 📈 Reports Generation
- ⚙️ System Settings (Logo, Title, Contact Info)

### 👨‍🏫 **Teacher Features**
- View and manage assigned students
- Take attendance for classes
- Manage and enter grades
- View class schedules

### 📝 **Registrar Features**
- Manage student, teacher, and staff records
- Handle admissions process
- Manage academic programs and batches
- Oversee department operations

### 🎓 **Student Features**
- 📅 View personal class schedule
- 📊 View grades and academic performance
- 📋 View attendance records
- 💰 View fee payment history

### 💰 **Accountant Features**
- Manage student fee payments
- View comprehensive payment history
- Track financial records

---

## 🔒 Security Features

1. **JWT-Based Authentication** - Secure token-based auth system
2. **Password Hashing** - bcrypt for secure password storage
3. **Session Management** - Proper session handling
4. **Route Protection** - Role-based route access control
5. **SQL Injection Prevention** - Parameterized queries
6. **CORS Configuration** - Secure cross-origin requests
7. **User Audit Trail** - Track who created/updated records

---

## 🎨 Dynamic System Branding

- Upload and display custom institution logo
- Configure system title and branding
- Set contact information
- Images stored as base64 in database

---

## 💳 Fee Management System

- Add fee payments for students
- View detailed payment history
- Track total payments per student
- Generate fee reports

---

## 📊 Additional Features

### **Dashboard Analytics**
- Real-time statistics display
- Key metrics visualization
- Quick access to important data

### **User Audit Trail**
- Track user creation timestamps
- Track user update timestamps
- Monitor who created/modified records

### **Report Generation**
- PDF report generation using jsPDF
- Table formatting with jsPDF-autoTable
- Comprehensive reporting capabilities

---

## 🚀 Development & Deployment

### **Prerequisites**
- Node.js (v14 or higher)
- MySQL (v5.7 or higher) - XAMPP recommended
- npm or yarn package manager

### **Backend Setup**
```bash
cd backend
npm install
npm start          # Production mode
npm run dev        # Development mode with nodemon
```
Backend runs on: `http://localhost:5000`

### **Frontend Setup**
```bash
cd frontend
npm install
npm start          # Development mode
npm run build      # Production build
npm test           # Run tests
```
Frontend runs on: `http://localhost:3000`

### **Database Setup**
1. Start XAMPP and ensure MySQL is running
2. Create database named `sms`
3. Import the database schema
4. Update credentials in `backend/config/db.js` if needed

---

## 🔄 API Architecture

### **RESTful API Endpoints**
The backend exposes comprehensive REST APIs:
- `/api/auth` - Authentication endpoints
- `/api/users` - User management
- `/api/students` - Student operations
- `/api/teachers` - Teacher management
- `/api/staff` - Staff management
- `/api/parents` - Parent management
- `/api/departments` - Department operations
- `/api/programs` - Program management
- `/api/subjects` - Subject operations
- `/api/degrees` - Degree management
- `/api/batches` - Batch management
- `/api/admissions` - Admission handling
- `/api/attendance` - Attendance tracking
- `/api/grades` - Grade management
- `/api/schedule` - Schedule operations
- `/api/fees` - Fee management
- `/api/dashboard` - Dashboard data
- `/api/profile` - User profile
- `/api/settings` - System settings
- `/api/reports` - Report generation
- `/api/subject-enrollment` - Subject enrollment
- `/api/department-change` - Department changes
- `/api/locations` - Location management
- `/api/roles` - Role management

---

## 🎯 Design Patterns & Architecture

### **Backend Patterns**
- **MVC Architecture** - Separation of concerns with Controllers, Services, and Repositories
- **Repository Pattern** - Data access abstraction layer
- **Service Layer** - Business logic encapsulation
- **Middleware Pattern** - Authentication and authorization
- **Connection Pool** - Efficient database connection management

### **Frontend Patterns**
- **Component-Based Architecture** - Reusable React components
- **Context API** - State management (AlertContext)
- **Protected Routes** - Authentication and authorization
- **Layout Components** - DashboardLayout for consistent UI
- **Utility Components** - ScrollToTop, HomeRedirect

---

## 📝 Code Quality & Testing

### **Backend**
- Modular code organization
- Separation of concerns
- Error handling
- Environment variable management

### **Frontend**
- Testing Library setup (@testing-library/react)
- Jest configuration
- Component testing support
- User event testing

---

## 👨‍💻 Author

**SENG HOK**

Built with ❤️ for educational institutions

---

## 🎨 UI/UX Features

- Beautiful gradient styling
- Responsive design
- Intuitive navigation
- Role-based menu items
- Dynamic redirects based on user roles
- Alert/notification system
- Smooth scroll behavior
- Clean and modern interface

---

## 📊 Database Schema Highlights

The system manages multiple interconnected entities:
- Users (with roles)
- Students (with personal info, enrollment details)
- Teachers (with qualifications)
- Staff members
- Parents (linked to students)
- Departments
- Programs/Degrees
- Subjects
- Batches
- Attendance records
- Grades
- Schedules
- Fee payments
- System settings

---

## 🔮 Future Enhancements

Some features are marked as "Coming Soon":
- Enrollment workflows
- Additional profile features
- Enhanced reporting capabilities

---

## Summary

This is a **professional, full-featured Student Management System** that demonstrates:
- ✅ Modern full-stack development practices
- ✅ Clean architecture and code organization
- ✅ Comprehensive feature set for educational institutions
- ✅ Security-first approach
- ✅ Role-based access control
- ✅ Scalable design patterns
- ✅ User-friendly interface
- ✅ Real-world applicability

The project shows strong technical skills in React, Node.js, Express, MySQL, and modern web development practices. It's designed to handle complex educational institution workflows with multiple user types and extensive data management requirements.

---

**Yes, I definitely know about your project now!** 🎓✨
