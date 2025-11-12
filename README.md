# Student Management System (SMS)# Fullstack React + Node.js + Express + MySQL (XAMPP)



A comprehensive Student Management System built with React, Node.js, Express, and MySQL.## Structure

- `frontend/`: React app

## 🌟 Features- `backend/`: Node.js + Express API



### 👨‍💼 Admin Features## Backend Setup

- 📊 Dashboard with statistics and analytics1. Start XAMPP and run MySQL.

- 👥 User Management (Create, Read, Update, Delete users)2. Create a database (e.g., `testdb`) and a table (e.g., `users`).

- 🎓 Student Management3. Update `backend/index.js` with your database name and credentials if needed.

- 👨‍🏫 Teacher Management4. In `backend/`, run:

- 🏢 Department Management   ```powershell

- 📚 Program Management   npm start

- 📖 Subject Management   ```

- 📝 Subject Enrollment   Or:

- 📅 Schedule Management   ```powershell

- 📋 Attendance Tracking   node index.js

- 📊 Grade Management   ```

- 💰 Fee Management

- 📈 Reports## Frontend Setup

- ⚙️ System Settings (Logo, Title, Contact Info)1. In `frontend/`, run:

   ```powershell

### 👨‍🏫 Teacher Features   npm start

- View and manage students   ```

- Take attendance

- Manage grades## Example API

- View schedules- GET `/api/users` returns all users from MySQL.



### 📝 Registrar Features## Notes

- Manage students, teachers, and staff- Make sure XAMPP MySQL is running.

- Handle admissions- CORS is enabled for frontend-backend communication.

- Manage academic programs- Change database/table names as needed.

- Manage batches

### 🎓 Student Features
- 📅 View personal schedule
- 📊 View grades
- 📋 View attendance
- 💰 View fee payments

### 💰 Accountant Features
- Manage student fee payments
- View payment history

## 🛠 Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios for API calls
- Inline CSS styling with beautiful gradients

### Backend
- Node.js
- Express.js
- MySQL database
- JWT authentication
- bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher) - XAMPP recommended
- npm or yarn

### Database Setup

1. Start XAMPP and run MySQL
2. Create a MySQL database named `sms`
3. Import your database schema

### Backend Setup

```powershell
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```powershell
cd frontend
npm install
npm start
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
sms/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── index.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.js
│   └── package.json
└── README.md
```

## ✨ Features Highlights

### 🔐 Role-Based Access Control
- Different menu items and permissions for each role
- Route protection to prevent unauthorized access
- Dynamic redirects based on user role

### 🎨 Dynamic System Branding
- Upload custom logo
- Set system title and contact information
- Images stored as base64 in database

### 💳 Fee Management
- Add fee payments for students
- View payment history with details
- Track total payments per student

### 📊 User Audit Trail
- Track who created users
- Track who updated users

## 🔒 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Role-based route protection
- SQL injection prevention

## 🎯 User Roles

1. **Admin (role_id: 1)** - Full system access
2. **Teacher (role_id: 2)** - Academic management
3. **Registrar (role_id: 3)** - Student records management
4. **Student (role_id: 4)** - Personal information access
5. **Accountant (role_id: 7)** - Financial management

## 📝 Notes

- Make sure XAMPP MySQL is running before starting the backend
- CORS is enabled for frontend-backend communication
- Default database connection uses `root` with no password

## 👨‍💻 Author

SENG HOK

## 🙏 Acknowledgments

Built with ❤️ for educational institutions
