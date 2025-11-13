import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './contexts/AlertContext.jsx';
import './styles/alert.css';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Students from './pages/Students.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import Profile from './pages/Profile.jsx';
import Users from './pages/Users.jsx';
import Departments from './pages/Departments.jsx';
import Programs from './pages/Programs.jsx';
import Subjects from './pages/Subjects.jsx';
import Parents from './pages/Parents.jsx';
import SubjectEnrollment from './pages/SubjectEnrollment.jsx';
import Teachers from './pages/Teachers.jsx';
import Batches from './pages/Batches.jsx';
import Admissions from './pages/Admissions.jsx';
import Staff from './pages/Staff.jsx';
import Attendance from './pages/Attendance.jsx';
import AttendanceDetail from './pages/AttendanceDetail.jsx';
import Grades from './pages/Grades.jsx';
import Schedule from './pages/Schedule.jsx';
import MySchedule from './pages/MySchedule.jsx';
import MyGrades from './pages/MyGrades.jsx';
import MyAttendance from './pages/MyAttendance.jsx';
import MyFees from './pages/MyFees.jsx';
import ParentAttendance from './pages/ParentAttendance.jsx';
import ParentGrades from './pages/ParentGrades.jsx';
import StudentClasses from './pages/StudentClasses.jsx';
import StudentGrades from './pages/StudentGrades.jsx';
import Fees from './pages/Fees.jsx';
import Settings from './pages/Settings.jsx';
import Reports from './pages/Reports.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomeRedirect from './components/HomeRedirect.jsx';

function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleProtectedRoute><HomeRedirect /></RoleProtectedRoute>} />
        <Route path="/dashboard" element={<RoleProtectedRoute><Dashboard /></RoleProtectedRoute>} />
        <Route path="/students" element={<RoleProtectedRoute><Students /></RoleProtectedRoute>} />
        <Route path="/students/:id" element={<RoleProtectedRoute><StudentProfile /></RoleProtectedRoute>} />
        <Route path="/profile" element={<RoleProtectedRoute><Profile /></RoleProtectedRoute>} />
        <Route path="/users" element={<RoleProtectedRoute><Users /></RoleProtectedRoute>} />
        <Route path="/departments" element={<RoleProtectedRoute><Departments /></RoleProtectedRoute>} />
        <Route path="/programs" element={<RoleProtectedRoute><Programs /></RoleProtectedRoute>} />
        <Route path="/subjects" element={<RoleProtectedRoute><Subjects /></RoleProtectedRoute>} />
        <Route path="/parents" element={<RoleProtectedRoute><Parents /></RoleProtectedRoute>} />
        <Route path="/subject-enrollment" element={<RoleProtectedRoute><SubjectEnrollment /></RoleProtectedRoute>} />
        <Route path="/teachers" element={<RoleProtectedRoute><Teachers /></RoleProtectedRoute>} />
        <Route path="/batches" element={<RoleProtectedRoute><Batches /></RoleProtectedRoute>} />
        <Route path="/admissions" element={<RoleProtectedRoute><Admissions /></RoleProtectedRoute>} />
        <Route path="/staff" element={<RoleProtectedRoute><Staff /></RoleProtectedRoute>} />
        <Route path="/attendance" element={<RoleProtectedRoute><Attendance /></RoleProtectedRoute>} />
        <Route path="/attendance/student/:studentId" element={<RoleProtectedRoute><AttendanceDetail /></RoleProtectedRoute>} />
        <Route path="/grades" element={<RoleProtectedRoute><Grades /></RoleProtectedRoute>} />
        <Route path="/schedule" element={<RoleProtectedRoute><Schedule /></RoleProtectedRoute>} />
        
        {/* Coming Soon Pages */}
        <Route path="/enrollment" element={<RoleProtectedRoute><ComingSoon pageName="Enrollment" /></RoleProtectedRoute>} />
        <Route path="/my-profile" element={<RoleProtectedRoute><ComingSoon pageName="My Profile" /></RoleProtectedRoute>} />
        <Route path="/my-grades" element={<RoleProtectedRoute><MyGrades /></RoleProtectedRoute>} />
        <Route path="/my-schedule" element={<RoleProtectedRoute><MySchedule /></RoleProtectedRoute>} />
        <Route path="/my-attendance" element={<RoleProtectedRoute><MyAttendance /></RoleProtectedRoute>} />
        <Route path="/my-fees" element={<RoleProtectedRoute><MyFees /></RoleProtectedRoute>} />
        <Route path="/parent-attendance" element={<RoleProtectedRoute><ParentAttendance /></RoleProtectedRoute>} />
        <Route path="/parent-attendance/student/:studentId/classes" element={<RoleProtectedRoute><StudentClasses /></RoleProtectedRoute>} />
  <Route path="/parent-grades" element={<RoleProtectedRoute><ParentGrades /></RoleProtectedRoute>} />
  <Route path="/parent-grades/student/:studentId/grades" element={<RoleProtectedRoute><StudentGrades /></RoleProtectedRoute>} />
        <Route path="/fees" element={<RoleProtectedRoute><Fees /></RoleProtectedRoute>} />
        <Route path="/reports" element={<RoleProtectedRoute><Reports /></RoleProtectedRoute>} />
        <Route path="/settings" element={<RoleProtectedRoute><Settings /></RoleProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </AlertProvider>
  );
}

export default App;
