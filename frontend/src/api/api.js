const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getToken() {
  // Check sessionStorage first (non-persistent), then localStorage (persistent)
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

function getUser() {
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

function isSessionExpired() {
  const expiresAt = sessionStorage.getItem('session_expires') || localStorage.getItem('session_expires');
  if (!expiresAt) return false;
  return Date.now() > parseInt(expiresAt);
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  // Check if session has expired
  if (isSessionExpired()) {
    // Clear all session data
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_expires');
    // Keep remember_username if it exists
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  const token = getToken();
  
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const message = data?.error || data?.message || 'Request failed';
    throw new Error(message);
  }
  
  return data;
}

async function uploadRequest(path, formData) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me'),
  // Students
  getStudents: () => request('/api/students'),
  getStudent: (id) => request(`/api/students/${id}`),
  createStudent: (payload) => request('/api/students', { method: 'POST', body: payload }),
  updateStudent: (id, payload) => request(`/api/students/${id}`, { method: 'PUT', body: payload }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: 'DELETE' }),
  // Users
  getUsers: () => request('/api/users'),
  getUser: (id) => request(`/api/users/${id}`),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: 'PUT', body: payload }),
  createUser: (payload) => request('/api/users', { method: 'POST', body: payload }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),
  // Roles
  getRoles: () => request('/api/roles'),
  // Profile
  getProfile: () => request('/api/profile'),
  updateProfile: (formData) => uploadRequest('/api/profile', formData),
  deleteProfileImage: () => request('/api/profile/image', { method: 'DELETE' }),
  // Dashboard
  getDashboardStats: () => request('/api/dashboard/stats'),
  getRecentStudents: (limit) => request(`/api/dashboard/recent-students?limit=${limit || 5}`),
  getRecentActivity: (limit) => request(`/api/dashboard/recent-activity?limit=${limit || 10}`),
  getTopDepartments: () => request('/api/dashboard/top-departments'),
  getMonthlyRegistrations: () => request('/api/dashboard/monthly-registrations'),
  // Departments
  getDepartments: () => request('/api/departments'),
  createDepartment: (payload) => request('/api/departments', { method: 'POST', body: payload }),
  updateDepartment: (id, payload) => request(`/api/departments/${id}`, { method: 'PUT', body: payload }),
  deleteDepartment: (id) => request(`/api/departments/${id}`, { method: 'DELETE' }),
  // Staff (minimal for selecting head)
  getStaff: () => request('/api/staff'),
  // Teachers
  getTeachers: () => request('/api/teachers'),
  getTeacher: (id) => request(`/api/teachers/${id}`),
  createTeacher: (payload) => request('/api/teachers', { method: 'POST', body: payload }),
  updateTeacher: (id, payload) => request(`/api/teachers/${id}`, { method: 'PUT', body: payload }),
  deleteTeacher: (id) => request(`/api/teachers/${id}`, { method: 'DELETE' }),
  getTeacherTypes: () => request('/api/teachers/types'),
  getPositions: () => request('/api/teachers/positions'),
  // Programs
  getPrograms: () => request('/api/programs'),
  createProgram: (payload) => request('/api/programs', { method: 'POST', body: payload }),
  updateProgram: (id, payload) => request(`/api/programs/${id}`, { method: 'PUT', body: payload }),
  deleteProgram: (id) => request(`/api/programs/${id}`, { method: 'DELETE' }),
  // Subjects
  getSubjects: () => request('/api/subjects'),
  createSubject: (payload) => request('/api/subjects', { method: 'POST', body: payload }),
  updateSubject: (id, payload) => request(`/api/subjects/${id}`, { method: 'PUT', body: payload }),
  deleteSubject: (id) => request(`/api/subjects/${id}`, { method: 'DELETE' }),
  // Parents
  getParents: () => request('/api/parents'),
  getMyChildren: () => request('/api/parents/my-children'),
  getChildClasses: (studentId) => request(`/api/parents/child/${studentId}/classes`),
  getChildAttendanceClasses: (studentId) => request(`/api/parents/child/${studentId}/attendance-classes`),
  getChildClassAttendance: (studentId, subjectEnrollId) => request(`/api/parents/child/${studentId}/class/${subjectEnrollId}/attendance`),
    getChildGradeClasses: (studentId) => request(`/api/parents/child/${studentId}/grade-classes`),
    getChildClassGrades: (studentId, subjectEnrollId) => request(`/api/parents/child/${studentId}/class/${subjectEnrollId}/grades`),
  createParent: (payload) => request('/api/parents', { method: 'POST', body: payload }),
  updateParent: (id, payload) => request(`/api/parents/${id}`, { method: 'PUT', body: payload }),
  deleteParent: (id) => request(`/api/parents/${id}`, { method: 'DELETE' }),
  // Locations
  getProvinces: () => request('/api/locations/provinces'),
  getDistricts: (provinceId) => request(`/api/locations/districts/${provinceId}`),
  getCommunes: (districtId) => request(`/api/locations/communes/${districtId}`),
  getVillages: (communeId) => request(`/api/locations/villages/${communeId}`),
  getBatches: () => request('/api/locations/batches'),
  getStudentStatuses: () => request('/api/locations/student-statuses'),
  getScholarships: () => request('/api/locations/scholarships'),
  getProgramsByDepartment: (departmentId) => request(`/api/locations/programs/${departmentId}`),
  getBatchesByProgram: (programId) => request(`/api/locations/batches/${programId}`),
  // Degrees
  getDegrees: () => request('/api/degrees'),
  // Subject Enrollments
  getSubjectEnrollments: () => request('/api/subject-enrollments'),
  getSubjectEnrollment: (id) => request(`/api/subject-enrollments/${id}`),
  createSubjectEnrollment: (payload) => request('/api/subject-enrollments', { method: 'POST', body: payload }),
  updateSubjectEnrollment: (id, payload) => request(`/api/subject-enrollments/${id}`, { method: 'PUT', body: payload }),
  deleteSubjectEnrollment: (id) => request(`/api/subject-enrollments/${id}`, { method: 'DELETE' }),
  getEnrollmentStatuses: () => request('/api/subject-enrollments/statuses'),
  // Batches
  getAllBatches: () => request('/api/batches'),
  getBatch: (id) => request(`/api/batches/${id}`),
  createBatch: (payload) => request('/api/batches', { method: 'POST', body: payload }),
  updateBatch: (id, payload) => request(`/api/batches/${id}`, { method: 'PUT', body: payload }),
  deleteBatch: (id) => request(`/api/batches/${id}`, { method: 'DELETE' }),
  getAdmissions: () => request('/api/batches/admissions'),
  // Admissions
  getAllAdmissions: () => request('/api/admissions'),
  getAdmission: (id) => request(`/api/admissions/${id}`),
  createAdmission: (payload) => request('/api/admissions', { method: 'POST', body: payload }),
  updateAdmission: (id, payload) => request(`/api/admissions/${id}`, { method: 'PUT', body: payload }),
  deleteAdmission: (id) => request(`/api/admissions/${id}`, { method: 'DELETE' }),
  // Staff
  getAllStaff: () => request('/api/staff'),
  getStaffMember: (id) => request(`/api/staff/${id}`),
  createStaff: (payload) => request('/api/staff', { method: 'POST', body: payload }),
  updateStaff: (id, payload) => request(`/api/staff/${id}`, { method: 'PUT', body: payload }),
  deleteStaff: (id) => request(`/api/staff/${id}`, { method: 'DELETE' }),
  // Attendance
  getAllAttendance: () => request('/api/attendance'),
  getAttendance: (id) => request(`/api/attendance/${id}`),
  createAttendance: (payload) => request('/api/attendance', { method: 'POST', body: payload }),
  updateAttendance: (id, payload) => request(`/api/attendance/${id}`, { method: 'PUT', body: payload }),
  deleteAttendance: (id) => request(`/api/attendance/${id}`, { method: 'DELETE' }),
  getAttendanceStatusTypes: () => request('/api/attendance/status-types'),
  getAttendanceStudents: () => request('/api/attendance/students'),
  getAttendanceSubjectEnrollments: () => request('/api/attendance/subject-enrollments'),
  getAttendanceByFilters: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/api/attendance/filter?${params}`);
  },
  getStudentsByBatch: (batchId) => request(`/api/students/by-batch/${batchId}`),
  getAttendanceByClassAndDate: (subjectEnrollId, date) => 
    request(`/api/attendance/class/${subjectEnrollId}/date/${date}`),
  saveBulkAttendance: (attendanceRecords) => 
    request('/api/attendance/bulk', { method: 'POST', body: { records: attendanceRecords } }),
  // Schedules
  getMySchedules: () => request('/api/schedules/my-schedules'),
  getAllSchedules: () => request('/api/schedules'),
  uploadSchedule: (payload) => request('/api/schedules', { method: 'POST', body: payload }),
  deleteSchedule: (id) => request(`/api/schedules/${id}`, { method: 'DELETE' }),
  // Grades (Student)
  getMyClasses: () => request('/api/grades/my-classes'),
  getMyClassGrades: (subjectEnrollId) => request(`/api/grades/my-class/${subjectEnrollId}`),
  // Attendance (Student)
  getMyAttendanceClasses: () => request('/api/attendance/my-classes'),
  getMyClassAttendance: (subjectEnrollId) => request(`/api/attendance/my-class/${subjectEnrollId}`),
  // Fees (Student)
  getMyFeePayments: () => request('/api/fees/my-payments'),
  // Fees (Admin/Accountant)
  getAllStudentsForFees: (search) => request(`/api/fees/students?search=${search || ''}`),
  createFeePayment: (paymentData) => request('/api/fees/payments', { method: 'POST', body: paymentData }),
  updateFeePayment: (paymentId, paymentData) => request(`/api/fees/payments/${paymentId}`, { method: 'PUT', body: paymentData }),
  deleteFeePayment: (paymentId) => request(`/api/fees/payments/${paymentId}`, { method: 'DELETE' }),
  getStudentFeeDetails: (studentId) => request(`/api/fees/student/${studentId}`),
  // Grades (Admin/Teacher)
  getAllGrades: () => request('/api/grades'),
  getGradeTypes: () => request('/api/grades/types'),
  getGradesByClass: (subjectEnrollId, gradeTypeId) => {
    const params = gradeTypeId ? `?gradeTypeId=${gradeTypeId}` : '';
    return request(`/api/grades/class/${subjectEnrollId}${params}`);
  },
  saveBulkGrades: (records) => request('/api/grades/bulk', { method: 'POST', body: { records } }),
  // Settings (Admin)
  getSettings: () => request('/api/settings'),
  updateSettings: (settingsData) => request('/api/settings', { method: 'PUT', body: settingsData }),
  
  // Reports
  getReportFilters: () => request('/api/reports/filters'),
  getStudentPerformanceReport: (params) => request(`/api/reports/student-performance?${new URLSearchParams(params).toString()}`),
  getGradeDistributionReport: (params) => request(`/api/reports/grade-distribution?${new URLSearchParams(params).toString()}`),
  getStudentAttendanceReport: (params) => request(`/api/reports/student-attendance?${new URLSearchParams(params).toString()}`),
  getAttendanceSummaryReport: (params) => request(`/api/reports/attendance-summary?${new URLSearchParams(params).toString()}`),
  getStudentEnrollmentReport: (params) => request(`/api/reports/student-enrollment?${new URLSearchParams(params).toString()}`),
  getTeacherWorkloadReport: (params) => request(`/api/reports/teacher-workload?${new URLSearchParams(params).toString()}`),
  getDepartmentStatisticsReport: () => request('/api/reports/department-statistics'),
  getAdmissionReport: (params) => request(`/api/reports/admission?${new URLSearchParams(params).toString()}`),
  getFeeCollectionReport: (params) => request(`/api/reports/fee-collection?${new URLSearchParams(params).toString()}`),
  getOutstandingFeesReport: (params) => request(`/api/reports/outstanding-fees?${new URLSearchParams(params).toString()}`),
  getStudentDemographicsReport: () => request('/api/reports/student-demographics'),
  getPassFailRateReport: (params) => request(`/api/reports/pass-fail-rate?${new URLSearchParams(params).toString()}`),
};

export default api;
