import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import '../styles/reports.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
  const { showError, showSuccess } = useAlert();
  const [activeTab, setActiveTab] = useState('students');
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    programs: [],
    batches: [],
    subjects: [],
    academicYears: []
  });
  const [allPrograms, setAllPrograms] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    // Load all students when student-performance report is activated
    if (activeReport === 'student-performance') {
      loadAllStudents();
    }
  }, [activeReport]);

  useEffect(() => {
    // Filter programs based on selected department
    if (filters.department_id) {
      const filtered = allPrograms.filter(p => p.department_id === Number(filters.department_id));
      setFilterOptions(prev => ({ ...prev, programs: filtered }));
    } else {
      setFilterOptions(prev => ({ ...prev, programs: allPrograms }));
    }
  }, [filters.department_id, allPrograms]);

  useEffect(() => {
    // Filter batches based on selected program
    if (filters.program_id) {
      const filtered = allBatches.filter(b => b.program_id === Number(filters.program_id));
      setFilterOptions(prev => ({ ...prev, batches: filtered }));
    } else {
      setFilterOptions(prev => ({ ...prev, batches: allBatches }));
    }
  }, [filters.program_id, allBatches]);

  useEffect(() => {
    // Filter subjects based on selected program
    if (filters.program_id) {
      const programId = Number(filters.program_id);
      const filtered = allSubjects.filter(s => {
        const subjectProgramId = Number(s.program_id);
        return subjectProgramId === programId;
      });
      console.log('Filtering subjects for program:', programId, 'Found:', filtered.length);
      setFilterOptions(prev => ({ ...prev, subjects: filtered }));
    } else {
      setFilterOptions(prev => ({ ...prev, subjects: allSubjects }));
    }
  }, [filters.program_id, allSubjects]);

  const loadFilterOptions = async () => {
    try {
      const data = await api.getReportFilters();
      console.log('Filter options loaded:', {
        programs: data.programs?.length,
        batches: data.batches?.length,
        subjects: data.subjects?.length
      });
      console.log('Sample subject:', data.subjects?.[0]);
      setFilterOptions(data);
      setAllPrograms(data.programs || []);
      setAllBatches(data.batches || []);
      setAllSubjects(data.subjects || []);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  const loadReport = async (reportType) => {
    setLoading(true);
    try {
      let data;
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      
      switch(reportType) {
        case 'student-profile':
          data = await api.getStudentProfileReport(cleanFilters);
          break;
        case 'student-list':
          data = await api.getStudentListReport(cleanFilters);
          break;
        case 'student-status':
          data = await api.getStudentStatusReport(cleanFilters);
          break;
        case 'student-performance':
          // For student performance, generate reports for selected students
          if (selectedStudents.length > 0) {
            const performancePromises = selectedStudents.map(studentId => 
              api.getStudentPerformanceReport({ ...cleanFilters, student_id: studentId })
            );
            const results = await Promise.all(performancePromises);
            data = results.flat();
          } else {
            data = [];
          }
          break;
        case 'grade-report':
          data = await api.getGradeReport(cleanFilters);
          break;
        case 'score-execution':
          data = await api.getScoreExecutionReport(cleanFilters);
          break;
        case 'attendance-report':
          data = await api.getAttendanceReport(cleanFilters);
          break;
        case 'attendance-summary':
          data = await api.getAttendanceSummaryReport(cleanFilters);
          break;
        case 'fee-report':
          data = await api.getFeeReport(cleanFilters);
          break;
        default:
          data = [];
      }
      setReportData(data);
      if (data && data.length > 0) {
        showSuccess(`Report generated successfully with ${data.length} records`);
      }
    } catch (err) {
      console.error('Error loading report:', err);
      showError('Failed to load report: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    // Reset dependent filters when parent changes
    if (key === 'department_id') {
      setFilters(prev => ({ ...prev, [key]: value, program_id: '', batch_id: '', subject_id: '', student_id: '' }));
    } else if (key === 'program_id') {
      setFilters(prev => ({ ...prev, [key]: value, batch_id: '', subject_id: '', student_id: '' }));
    } else if (key === 'batch_id') {
      setFilters(prev => ({ ...prev, [key]: value, subject_id: '', student_id: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const loadAllStudents = async () => {
    try {
      const response = await api.getStudents();
      setStudents(response || []);
      setSelectedStudents([]);
    } catch (err) {
      console.error('Error loading students:', err);
      setStudents([]);
      setSelectedStudents([]);
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = (checked) => {
    const visibleStudents = getFilteredStudents();
    if (checked) {
      setSelectedStudents(visibleStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Filter students based on selected filters
  const getFilteredStudents = () => {
    let filtered = students;
    
    if (filters.department_id) {
      filtered = filtered.filter(s => String(s.department_id) === String(filters.department_id));
    }
    
    if (filters.batch_id) {
      filtered = filtered.filter(s => String(s.batch_id) === String(filters.batch_id));
    }
    
    return filtered;
  };

  const handleGenerateReport = () => {
    loadReport(activeReport);
  };

  // Export Student List with Khmer support using html2canvas
  const exportStudentListToPDF = async () => {
    try {
      showSuccess('Preparing PDF with Khmer text...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Group data by department and batch
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = {
            batch_code: row.batch_code,
            academic_year: row.academic_year,
            students: []
          };
        }
        groupedData[deptKey][batchKey].students.push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [, batch] of Object.entries(batches)) {
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;

        // Create temporary HTML table for this batch
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '20px';
        tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
        tempDiv.style.width = '750px';
        
        tempDiv.innerHTML = `
          <!-- Header Section -->
          <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <!-- Header Logo -->
                <td style="vertical-align: top; text-align: left; width: 50%;">
                  <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                </td>
                
                <!-- National Motto Image (Right) -->
                <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                  <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                </td>
              </tr>
              <tr>
                <!-- Report Title (Full Width Centered) -->
                <td colspan="2" style="padding-top: 12px;">
                  <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                    Student List Report
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Batch Info -->
          <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
            Department: ${department} | Batch: ${batch.batch_code} - ${batch.academic_year}
          </div>
          
          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                <th style="border: 1px solid #1e40af; padding: 14px 12px; text-align: center; width: 60px; font-weight: bold; font-size: 13px;">N0</th>
                <th style="border: 1px solid #1e40af; padding: 14px 12px; text-align: center; width: 120px; font-weight: bold; font-size: 13px;">STUDENT CODE</th>
                <th style="border: 1px solid #1e40af; padding: 14px 12px; text-align: center; width: 220px; font-weight: bold; font-size: 13px;">KHMER NAME</th>
                <th style="border: 1px solid #1e40af; padding: 14px 12px; text-align: center; font-weight: bold; font-size: 13px;">ENGLISH NAME</th>
                <th style="border: 1px solid #1e40af; padding: 14px 12px; text-align: center; width: 100px; font-weight: bold; font-size: 13px;">GENDER</th>
              </tr>
            </thead>
            <tbody>
              ${batch.students.map((student, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                  <td style="border: 1px solid #cbd5e1; padding: 12px 10px; text-align: center; font-weight: 500;">${index + 1}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 12px 10px; text-align: center; font-family: 'Arial', sans-serif; color: #1e293b;">${student.student_code || '-'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 12px 10px; text-align: left; color: #1e293b;">${student.khmer_name || '-'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 12px 10px; text-align: left; font-family: 'Arial', sans-serif; color: #1e293b;">${student.english_name || '-'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 12px 10px; text-align: center; color: #1e293b;">${student.gender || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        
        document.body.appendChild(tempDiv);

        // Convert to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });

        // Remove temp div
        document.body.removeChild(tempDiv);

        // Add image to PDF (no separate header needed - it's in the canvas)
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 10;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let yPosition = 5; // Start near top
        if (imgHeight > pageHeight - 35) {
          // If image is too tall, scale it down
          const scaledHeight = pageHeight - 10;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
          doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
        } else {
          doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
        }

        // Add footer
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(`${department} - ${batch.batch_code}: ${batch.students.length} students`, pageWidth - 15, footerY, { align: 'right' });
        doc.text('Saint Paul Institute', 15, footerY);
      }
    }

      // Save PDF
      const fileName = `student-list-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('PDF exported successfully with Khmer text!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  const exportToPDF = async () => {
    if (reportData.length === 0) return;

    // All reports now use html2canvas for proper Khmer text support
    if (activeReport === 'student-list') {
      await exportStudentListToPDF();
      return;
    }

    if (activeReport === 'student-profile') {
      await exportStudentProfileToPDF();
      return;
    }

    if (activeReport === 'grade-report') {
      await exportGradeReportToPDF();
      return;
    }

    if (activeReport === 'score-execution') {
      await exportScoreExecutionToPDF();
      return;
    }

    if (activeReport === 'student-performance') {
      await exportStudentPerformanceToPDF();
      return;
    }

    if (activeReport === 'attendance-report') {
      await exportAttendanceReportToPDF();
      return;
    }

    if (activeReport === 'attendance-summary') {
      await exportAttendanceSummaryToPDF();
      return;
    }

    if (activeReport === 'fee-report') {
      await exportFeeReportToPDF();
      return;
    }

    // For other reports, use html2canvas method too
    await exportReportWithKhmerSupport();
  };

  // Export Student Profile with grouping by department and batch
  const exportStudentProfileToPDF = async () => {
    try {
      showSuccess('Preparing Student Profile PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Group data by department and batch
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = [];
        }
        groupedData[deptKey][batchKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, students] of Object.entries(batches)) {
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;

          // Create temporary HTML table for this department/batch group
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '1100px';
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      Student Profile Report
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department and Batch Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">N0</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">STUDENT CODE</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">KHMER NAME</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">ENGLISH NAME</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">GENDER</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">DOB</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">PHONE</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">PROVINCE</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">DISTRICT</th>
                  <th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${students.map((student, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-weight: 500;">${index + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-family: 'Arial', sans-serif; color: #1e293b;">${student.student_code || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${student.khmer_name || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; font-family: 'Arial', sans-serif; color: #1e293b;">${student.english_name || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; color: #1e293b;">${student.gender || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-family: 'Arial', sans-serif; color: #1e293b;">${student.dob || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-family: 'Arial', sans-serif; color: #1e293b;">${student.phone || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${student.province || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${student.district || '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; color: #1e293b;">${student.status || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode}: ${students.length} students`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
        }
      }

      // Save PDF
      const fileName = `student-profile-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Student Profile PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Grade Report with grouping by department, batch, subject, and semester
  const exportGradeReportToPDF = async () => {
    try {
      showSuccess('Preparing Grade Report PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = 'GRADE REPORT';

      // Group data by department, batch, subject, and semester
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        const subjectKey = row.subject || 'No Subject';
        const semesterKey = row.semester || 'No Semester';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey]) {
          groupedData[deptKey][batchKey][subjectKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey][semesterKey]) {
          groupedData[deptKey][batchKey][subjectKey][semesterKey] = [];
        }
        groupedData[deptKey][batchKey][subjectKey][semesterKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, subjects] of Object.entries(batches)) {
          for (const [subject, semesters] of Object.entries(subjects)) {
            for (const [semester, records] of Object.entries(semesters)) {
              if (!isFirstPage) {
                doc.addPage();
              }
              isFirstPage = false;

            // Create temporary HTML for report
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.padding = '20px';
            tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
            tempDiv.style.width = '1100px';
            
              // Fixed columns in specific order
              const fixedColumns = ['student_code', 'khmer_name', 'english_name', 'gender'];
              
              // Collect all unique grade types across all records
              const gradeTypeSet = new Set();
              records.forEach(record => {
                Object.keys(record).forEach(key => {
                  if (!fixedColumns.includes(key) &&
                      !key.includes('batch_id') && 
                      !key.includes('department_id') && 
                      !key.includes('program_id') &&
                      key !== 'department' &&
                      key !== 'batch_code' &&
                      key !== 'academic_year' &&
                      key !== 'subject' &&
                      key !== 'semester') {
                    gradeTypeSet.add(key);
                  }
                });
              });
              
              const gradeTypeColumns = Array.from(gradeTypeSet).sort();
              
              const headers = [
                'N0', 
                'STUDENT CODE',
                'KHMER NAME', 
                'ENGLISH NAME', 
                'GENDER',
                ...gradeTypeColumns.map(col => col.replace(/_/g, ' ').toUpperCase()),
                'TOTAL'
              ];
            
              const rows = records.map((row, index) => {
                const fixedValues = fixedColumns.map(col => {
                  const value = row[col];
                  if (value === null || value === undefined) return '-';
                  // Transform gender values
                  if (col === 'gender') {
                    const genderStr = String(value).toUpperCase();
                    if (genderStr === 'M' || genderStr === 'MALE') return 'Male';
                    if (genderStr === 'F' || genderStr === 'FEMALE') return 'Female';
                    return String(value);
                  }
                  return String(value);
                });
                
                const gradeTypeValues = gradeTypeColumns.map(col => {
                  const value = row[col];
                  if (value === null || value === undefined) return 0;
                  return parseFloat(value) || 0;
                });
                
                // Calculate total
                const total = gradeTypeValues.reduce((sum, val) => sum + val, 0);
                
                return [
                  index + 1, 
                  ...fixedValues, 
                  ...gradeTypeValues.map(v => String(v)),
                  String(total)
                ];
              });
            
              tempDiv.innerHTML = `
              <!-- Header Section -->
              <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <!-- Header Logo -->
                    <td style="vertical-align: top; text-align: left; width: 50%;">
                      <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                    </td>
                    
                    <!-- National Motto Image (Right) -->
                    <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                      <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                    </td>
                  </tr>
                  <tr>
                    <!-- Report Title (Full Width Centered) -->
                    <td colspan="2" style="padding-top: 12px;">
                      <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                        ${reportTitle}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Department, Batch, Subject, and Semester Info -->
              <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
                Department: ${department} | Batch: ${batchCode} | Subject: ${subject} | Semester: ${semester}
              </div>
              
              <!-- Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                  <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                    ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${rows.map((row, index) => `
                    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                      ${row.map(cell => `<td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              `;
            
              document.body.appendChild(tempDiv);

              // Convert to canvas
              const canvas = await html2canvas(tempDiv, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false
              });

              // Remove temp div
              document.body.removeChild(tempDiv);

              // Add image to PDF
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = pageWidth - 10;
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              
              let yPosition = 5;
              if (imgHeight > pageHeight - 35) {
                const scaledHeight = pageHeight - 10;
                const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
                doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
              } else {
                doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
              }

              // Add footer
              const footerY = pageHeight - 10;
              doc.setFontSize(8);
              doc.setTextColor(100, 116, 139);
              doc.setFont('helvetica', 'normal');
              doc.text(`${department} - ${batchCode} - ${subject} - ${semester}: ${records.length} students`, pageWidth - 15, footerY, { align: 'right' });
              doc.text('Saint Paul Institute', 15, footerY);
            }
          }
        }
      }

      // Save PDF
      const fileName = `grade-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Grade Report PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Score Execution Report - Student performance by subject
  const exportScoreExecutionToPDF = async () => {
    try {
      showSuccess('Preparing Score Execution PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = 'Score Execution';

      // Group data by department and batch
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = [];
        }
        groupedData[deptKey][batchKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, records] of Object.entries(batches)) {
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;

          // Create temporary HTML for report
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '1100px';
          
          // Get all subject columns (exclude fixed columns)
          const fixedColumns = ['khmer_name', 'english_name', 'department', 'batch_code', 'academic_year', 'average_score'];
          const firstRecord = records[0];
          const subjectColumns = Object.keys(firstRecord).filter(key => !fixedColumns.includes(key));
          
          // Build table headers
          const headers = [
            'NO',
            'KHMER NAME',
            'ENGLISH NAME',
            ...subjectColumns.map(col => col.toUpperCase()),
            'AVERAGE SCORE'
          ];
          
          // Build table rows
          const rows = records.map((row, index) => {
            const subjectScores = subjectColumns.map(col => {
              const value = row[col];
              return value !== null && value !== undefined ? String(value) : '-';
            });
            
            return [
              index + 1,
              row.khmer_name || '-',
              row.english_name || '-',
              ...subjectScores,
              row.average_score !== null && row.average_score !== undefined ? String(row.average_score) : '-'
            ];
          });
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      ${reportTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department and Batch Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 10px;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                    <td style="border: 1px solid #cbd5e1; padding: 10px 6px; text-align: center; font-weight: 500; color: #1e293b;">${row[0]}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${row[1]}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; font-family: 'Arial', sans-serif; color: #1e293b;">${row[2]}</td>
                    ${row.slice(3, -1).map(cell => `<td style="border: 1px solid #cbd5e1; padding: 10px 6px; text-align: center; font-family: 'Arial', sans-serif; font-weight: 500; color: #1e293b;">${cell}</td>`).join('')}
                    <td style="border: 1px solid #cbd5e1; padding: 10px 6px; text-align: center; font-family: 'Arial', sans-serif; font-weight: bold; color: #2563eb; font-size: 11px;">${row[row.length - 1]}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode}: ${records.length} records`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
        }
      }

      // Save PDF
      const fileName = `score-execution-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Score Execution PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Student Performance Report
  const exportStudentPerformanceToPDF = async () => {
    try {
      if (reportData.length === 0) {
        showError('No data to export');
        return;
      }

      showSuccess('Preparing Student Performance PDF...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      let isFirstPage = true;

      // Loop through each student in reportData
      for (const data of reportData) {
        if (!isFirstPage) {
          doc.addPage();
        }
        isFirstPage = false;

        const student = data.student;
        const semesters = data.semesters || [];

        // Create temporary HTML for report
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.backgroundColor = 'white';
        tempDiv.style.padding = '30px';
        tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
        tempDiv.style.width = '750px';
        
        // Build semester rows
        const semesterRows = semesters.map((sem, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="border: 1px solid #cbd5e1; padding: 12px; text-align: center; font-weight: 600; color: #1e293b;">${sem.semester}</td>
            <td style="border: 1px solid #cbd5e1; padding: 12px; text-align: center; font-family: 'Arial', sans-serif; font-weight: 600; color: #2563eb; font-size: 14px;">${sem.semester_average}</td>
          </tr>
        `).join('');
        
        tempDiv.innerHTML = `
          <!-- Header Section -->
          <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; text-align: left; width: 50%;">
                  <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                </td>
                <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                  <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 12px;">
                  <div style="font-size: 20px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                    Student Performance Report
                  </div>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Student Info Section -->
          <div style="background: linear-gradient(to right, #f8fafc, #ffffff); padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; width: 150px;"><strong>Student Name:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;"><span style="font-family: 'Khmer OS Battambang';">${student.std_khmer_name}</span> / ${student.std_eng_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Student Code:</strong></td>
                <td style="padding: 6px 0; color: #1e293b; font-family: 'Arial', sans-serif;">${student.student_code}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Department:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${student.department_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Program:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${student.program_name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Batch:</strong></td>
                <td style="padding: 6px 0; color: #1e293b;">${student.batch_code} - ${student.academic_year}</td>
              </tr>
            </table>
          </div>
          
          <!-- Performance Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                <th style="border: 1px solid #1e40af; padding: 14px; text-align: center; font-weight: bold; font-size: 13px;">SEMESTER</th>
                <th style="border: 1px solid #1e40af; padding: 14px; text-align: center; font-weight: bold; font-size: 13px;">AVERAGE SCORE</th>
              </tr>
            </thead>
            <tbody>
              ${semesterRows}
            </tbody>
            <tfoot>
              <tr style="background: linear-gradient(to right, #f1f5f9, #e2e8f0); font-weight: bold;">
                <td style="border: 1px solid #cbd5e1; padding: 14px; text-align: center; color: #1e293b; font-size: 14px;">OVERALL AVERAGE</td>
                <td style="border: 1px solid #cbd5e1; padding: 14px; text-align: center; color: #2563eb; font-size: 16px; font-weight: bold;">${data.overall_average}</td>
              </tr>
              <tr style="background: linear-gradient(to right, #dbeafe, #bfdbfe); font-weight: bold;">
                <td style="border: 1px solid #cbd5e1; padding: 14px; text-align: center; color: #1e293b; font-size: 14px;">GPA (4.0 SCALE)</td>
                <td style="border: 1px solid #cbd5e1; padding: 14px; text-align: center; color: #2563eb; font-size: 16px; font-weight: bold;">${data.gpa}</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Footer Note -->
          <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 6px; font-size: 11px; color: #64748b; text-align: center;">
            <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()} | Total Credits: ${data.total_credits}</p>
          </div>
        `;
        
        document.body.appendChild(tempDiv);

        // Convert to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });

        // Remove temp div
        document.body.removeChild(tempDiv);

        // Add image to PDF
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let yPosition = 10;
        if (imgHeight > pageHeight - 20) {
          const scaledHeight = pageHeight - 20;
          const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
          doc.addImage(imgData, 'PNG', 10, yPosition, scaledWidth, scaledHeight);
        } else {
          doc.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
        }

        // Add footer
        const footerY = pageHeight - 10;
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Saint Paul Institute', pageWidth / 2, footerY, { align: 'center' });
      }

      // Save PDF
      const fileName = `student-performance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess(`Student Performance PDF exported successfully with ${reportData.length} student(s)!`);
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Attendance Report with grouping by subject and semester
  const exportAttendanceReportToPDF = async () => {
    try {
      showSuccess('Preparing Attendance Report PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = 'ATTENDANCE REPORT';

      // Group data by department, batch, subject, and semester
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || row.department_name || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        const subjectKey = row.subject || row.subject_name || 'No Subject';
        const semesterKey = row.semester || 'No Semester';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey]) {
          groupedData[deptKey][batchKey][subjectKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey][semesterKey]) {
          groupedData[deptKey][batchKey][subjectKey][semesterKey] = [];
        }
        groupedData[deptKey][batchKey][subjectKey][semesterKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, subjects] of Object.entries(batches)) {
          for (const [subject, semesters] of Object.entries(subjects)) {
            for (const [semester, records] of Object.entries(semesters)) {
              if (!isFirstPage) {
                doc.addPage();
              }
              isFirstPage = false;

          // Create temporary HTML for report
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '1100px';
          
          // Group records by student and pivot by date
          const studentMap = {};
          const allDates = new Set();
          
          records.forEach(row => {
            const studentKey = row.student_code || row.khmer_name || 'Unknown';
            if (!studentMap[studentKey]) {
              // Transform gender value
              let genderDisplay = '-';
              if (row.gender) {
                const genderStr = String(row.gender).toLowerCase();
                if (genderStr === '1' || genderStr === 'm' || genderStr === 'male') {
                  genderDisplay = 'Male';
                } else if (genderStr === '0' || genderStr === 'f' || genderStr === 'female') {
                  genderDisplay = 'Female';
                } else {
                  genderDisplay = row.gender;
                }
              }
              
              studentMap[studentKey] = {
                student_code: row.student_code,
                khmer_name: row.khmer_name,
                english_name: row.english_name,
                gender: genderDisplay,
                attendanceByDate: {}
              };
            }
            
            // Store attendance status by date (use name not ID)
            const date = row.attendance_date || row.date;
            if (date) {
              allDates.add(date);
              // Get the attendance status name, not ID
              const statusName = row.attendance_status_name || row.status_name || row.status || row.attendance_status || '-';
              studentMap[studentKey].attendanceByDate[date] = statusName;
            }
          });
          
          // Sort dates
          const sortedDates = Array.from(allDates).sort();
          
          // Build headers: N0, Khmer Name, English Name, Gender, then each date
          const headers = ['N0', 'KHMER NAME', 'ENGLISH NAME', 'GENDER', ...sortedDates.map(d => d.substring(0, 10))];
          
          // Build rows
          const students = Object.values(studentMap);
          const rows = students.map((student, index) => {
            const attendanceCells = sortedDates.map(date => student.attendanceByDate[date] || '-');
            return [
              index + 1,
              student.khmer_name || '-',
              student.english_name || '-',
              student.gender || '-',
              ...attendanceCells
            ];
          });
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      ${reportTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department, Batch, Subject and Semester Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode} | Subject: ${subject} | Semester: ${semester}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 10px 6px; text-align: center; font-weight: bold; font-size: 10px; white-space: nowrap;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    ${row.map((cell, cellIndex) => `<td style="border: 1px solid #cbd5e1; padding: 8px 6px; text-align: ${cellIndex < 4 ? 'left' : 'center'}; color: #1e293b; font-size: 10px;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode} - ${subject} - Semester ${semester}: ${students.length} students`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
            }
          }
        }
      }

      // Save PDF
      const fileName = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Attendance Report PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Attendance Summary Report with counts and rates
  const exportAttendanceSummaryToPDF = async () => {
    try {
      showSuccess('Preparing Attendance Summary PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = 'ATTENDANCE SUMMARY REPORT';

      // Group data by department, batch, subject, and semester
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || row.department_name || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        const subjectKey = row.subject || row.subject_name || 'No Subject';
        const semesterKey = row.semester || 'No Semester';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey]) {
          groupedData[deptKey][batchKey][subjectKey] = {};
        }
        if (!groupedData[deptKey][batchKey][subjectKey][semesterKey]) {
          groupedData[deptKey][batchKey][subjectKey][semesterKey] = [];
        }
        groupedData[deptKey][batchKey][subjectKey][semesterKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, subjects] of Object.entries(batches)) {
          for (const [subject, semesters] of Object.entries(subjects)) {
            for (const [semester, records] of Object.entries(semesters)) {
              if (!isFirstPage) {
                doc.addPage();
              }
              isFirstPage = false;

          // Create temporary HTML for report
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '1100px';
          
          // Build table with student summary
          const headers = ['N0', 'STUDENT CODE', 'KHMER NAME', 'ENGLISH NAME', 'GENDER', 'TOTAL SESSIONS', 'PRESENT', 'ABSENT', 'LATE', 'PERMISSION', 'ATTENDANCE RATE'];
          
          const rows = records.map((row, index) => {
            return [
              index + 1,
              row.student_code || '-',
              row.khmer_name || '-',
              row.english_name || '-',
              row.gender || '-',
              row.total_sessions || '0',
              row.present_count || '0',
              row.absent_count || '0',
              row.late_count || '0',
              row.permission_count || '0',
              (row.attendance_rate || '0') + '%'
            ];
          });
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      ${reportTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department, Batch, Subject and Semester Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode} | Subject: ${subject} | Semester: ${semester}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 10px 6px; text-align: center; font-weight: bold; font-size: 10px;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                    ${row.map((cell, cellIndex) => `<td style="border: 1px solid #cbd5e1; padding: 8px 6px; text-align: ${cellIndex < 2 || cellIndex >= 5 ? 'center' : 'left'}; color: #1e293b; ${cellIndex === row.length - 1 ? 'font-weight: bold; color: #2563eb;' : ''}">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode} - ${subject} - Semester ${semester}: ${records.length} students`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
            }
          }
        }
      }

      // Save PDF
      const fileName = `attendance-summary-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Attendance Summary PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export Fee Report with grouping by department and batch
  const exportFeeReportToPDF = async () => {
    try {
      showSuccess('Preparing Fee Report PDF...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = 'FEE REPORT';

      // Group data by department and batch
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = [];
        }
        groupedData[deptKey][batchKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, records] of Object.entries(batches)) {
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;

          // Create temporary HTML for report
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '750px';
          
          // Build table with fee information
          const headers = ['N0', 'STUDENT CODE', 'KHMER NAME', 'ENGLISH NAME', 'GENDER', 'PAYMENTS', 'TOTAL PAID ($)', 'STATUS'];
          
          const rows = records.map((row, index) => {
            return [
              index + 1,
              row.student_code || '-',
              row.khmer_name || '-',
              row.english_name || '-',
              row.gender || '-',
              row.total_payments || '0',
              row.total_paid || '0',
              row.payment_status || '-'
            ];
          });
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      ${reportTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department and Batch Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                    ${row.map((cell, cellIndex) => {
                      let style = 'border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; color: #1e293b;';
                      if (cellIndex === 2 || cellIndex === 3) style = 'border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;';
                      if (cellIndex === 6) style = 'border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; color: #16a34a; font-weight: bold;';
                      if (cellIndex === 7) {
                        const statusColor = cell === 'Paid' ? '#16a34a' : cell === 'Partial' ? '#f59e0b' : '#dc2626';
                        style = `border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; color: ${statusColor}; font-weight: bold;`;
                      }
                      return `<td style="${style}">${cell}</td>`;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode}`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
        }
      }

      // Save PDF
      const fileName = `fee-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('Fee Report PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  // Export reports with Khmer text support using html2canvas
  const exportReportWithKhmerSupport = async () => {
    try {
      showSuccess('Preparing PDF...');
      
      const doc = new jsPDF('l', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const reportTitle = reportCategories[activeTab].reports.find(r => r.id === activeReport)?.label || 'Report';

      // Group data by department and batch
      const groupedData = {};
      reportData.forEach(row => {
        const deptKey = row.department || row.department_name || 'No Department';
        const batchKey = row.batch_code || 'No Batch';
        
        if (!groupedData[deptKey]) {
          groupedData[deptKey] = {};
        }
        if (!groupedData[deptKey][batchKey]) {
          groupedData[deptKey][batchKey] = [];
        }
        groupedData[deptKey][batchKey].push(row);
      });

      let isFirstPage = true;

      for (const [department, batches] of Object.entries(groupedData)) {
        for (const [batchCode, records] of Object.entries(batches)) {
          if (!isFirstPage) {
            doc.addPage();
          }
          isFirstPage = false;

          // Create temporary HTML for report
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.backgroundColor = 'white';
          tempDiv.style.padding = '20px';
          tempDiv.style.fontFamily = 'Khmer OS Battambang, Arial, sans-serif';
          tempDiv.style.width = '750px';
          
          // Prepare table columns and rows for this group
          const allColumns = Object.keys(records[0]);
          const columns = allColumns.filter(col => 
            !col.includes('batch_id') && 
            !col.includes('department_id') && 
            !col.includes('program_id') &&
            col !== 'department' &&
            col !== 'batch_code' &&
            col !== 'academic_year'
          );
          
          const headers = ['N0', ...columns.map(col => {
            let cleanCol = col.replace(/^(student|teacher|batch|program|department|subject|grade|attendance)\./i, '');
            return cleanCol.replace(/_/g, ' ').toUpperCase();
          })];
          
          const rows = records.map((row, index) => 
            [index + 1, ...columns.map(col => {
              const value = row[col];
              if (value === null || value === undefined) return '-';
              return String(value);
            })]
          );
          
          tempDiv.innerHTML = `
            <!-- Header Section -->
            <div style="background-color: white; padding: 15px 20px 10px 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <!-- Header Logo -->
                  <td style="vertical-align: top; text-align: left; width: 50%;">
                    <img src="/SPI-logo-landscape.png" alt="School Header" style="height: 80px; object-fit: contain; display: block;" />
                  </td>
                  
                  <!-- National Motto Image (Right) -->
                  <td style="vertical-align: top; text-align: right; width: 50%; padding-left: 20px;">
                    <img src="/image.png" alt="National Motto" style="height: 110px; object-fit: contain; display: block; margin-left: auto;" />
                  </td>
                </tr>
                <tr>
                  <!-- Report Title (Full Width Centered) -->
                  <td colspan="2" style="padding-top: 12px;">
                    <div style="font-size: 18px; font-weight: bold; color: #000; font-family: 'Times New Roman', serif; line-height: 1.2; text-align: center; padding: 8px;">
                      ${reportTitle}
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Department and Batch Info -->
            <div style="margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #000; text-align: center;">
              Department: ${department} | Batch: ${batchCode}
            </div>
            
            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: 'Khmer OS Battambang', Arial, sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: linear-gradient(to bottom, #2563eb, #1e40af); color: white;">
                  ${headers.map(h => `<th style="border: 1px solid #1e40af; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 11px;">${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((row, index) => `
                  <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; transition: background-color 0.2s;">
                    ${row.map(cell => `<td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: left; color: #1e293b;">${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
          
          document.body.appendChild(tempDiv);

          // Convert to canvas
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
          });

          // Remove temp div
          document.body.removeChild(tempDiv);

          // Add image to PDF
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 10;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          let yPosition = 5;
          if (imgHeight > pageHeight - 35) {
            const scaledHeight = pageHeight - 10;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            doc.addImage(imgData, 'PNG', 5, yPosition, scaledWidth, scaledHeight);
          } else {
            doc.addImage(imgData, 'PNG', 5, yPosition, imgWidth, imgHeight);
          }

          // Add footer
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'normal');
          doc.text(`${department} - ${batchCode}: ${records.length} records`, pageWidth - 15, footerY, { align: 'right' });
          doc.text('Saint Paul Institute', 15, footerY);
        }
      }

      // Save PDF
      const fileName = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showSuccess('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showError('Failed to export PDF: ' + error.message);
    }
  };

  const reportCategories = {
    students: {
      label: 'Student Reports',
      icon: '👥',
      reports: [
        { id: 'student-profile', label: 'Student Profile Report', icon: '👤' },
        { id: 'student-list', label: 'Student List Report', icon: '📋' },
        { id: 'student-status', label: 'Student Status Report', icon: '✅' },
        { id: 'student-performance', label: 'Student Performance', icon: '📈' }
      ]
    },
    academic: {
      label: 'Academic Reports',
      icon: '📚',
      reports: [
        { id: 'grade-report', label: 'Grade Report', icon: '📊' },
        { id: 'score-execution', label: 'Score Execution', icon: '🎯' },
        { id: 'attendance-report', label: 'Attendance Report', icon: '📅' },
        { id: 'attendance-summary', label: 'Attendance Summary Report', icon: '📊' }
      ]
    },
    financial: {
      label: 'Financial Reports',
      icon: '💰',
      reports: [
        { id: 'fee-report', label: 'Fee Payment Report', icon: '💵' }
      ]
    }
  };

  const renderFilters = () => {
    const filterConfigs = {
      'student-profile': ['department_id', 'program_id', 'batch_id'],
      'student-list': ['department_id', 'program_id', 'batch_id', 'subject_id', 'status'],
      'student-status': ['status'],
      'student-performance': ['department_id', 'program_id', 'batch_id'],
      'grade-report': ['department_id', 'program_id', 'batch_id', 'subject_id', 'semester'],
      'score-execution': ['department_id', 'program_id', 'batch_id', 'semester'],
      'attendance-report': ['department_id', 'program_id', 'batch_id', 'subject_id', 'start_date', 'end_date'],
      'attendance-summary': ['department_id', 'program_id', 'batch_id', 'subject_id', 'start_date', 'end_date'],
      'fee-report': ['department_id', 'program_id', 'batch_id', 'start_date', 'end_date']
    };

    const currentFilters = filterConfigs[activeReport] || [];

    if (currentFilters.length === 0) return null;

    return (
      <div className="filters-container">
        {currentFilters.includes('department_id') && (
          <select
            value={filters.department_id || ''}
            onChange={(e) => handleFilterChange('department_id', e.target.value)}
            className="filter-select"
          >
            <option value="">🏢 All Departments</option>
            {filterOptions.departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>
        )}
        {currentFilters.includes('program_id') && (
          <select
            value={filters.program_id || ''}
            onChange={(e) => handleFilterChange('program_id', e.target.value)}
            className="filter-select"
          >
            <option value="">🎓 All Programs</option>
            {filterOptions.programs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        {currentFilters.includes('batch_id') && (
          <select
            value={filters.batch_id || ''}
            onChange={(e) => handleFilterChange('batch_id', e.target.value)}
            className="filter-select"
          >
            <option value="">📚 All Batches</option>
            {filterOptions.batches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_code}</option>
            ))}
          </select>
        )}
        {currentFilters.includes('subject_id') && (
          <select
            value={filters.subject_id || ''}
            onChange={(e) => handleFilterChange('subject_id', e.target.value)}
            className="filter-select"
          >
            <option value="">📖 All Subjects</option>
            {filterOptions.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.subject_name}</option>
            ))}
          </select>
        )}
        {currentFilters.includes('student_id') && (
          <select
            value={filters.student_id || ''}
            onChange={(e) => handleFilterChange('student_id', e.target.value)}
            className="filter-select"
          >
            <option value="">👤 Select Student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.student_code} - {student.std_eng_name}
              </option>
            ))}
          </select>
        )}
        {currentFilters.includes('academic_year') && (
          <select
            value={filters.academic_year || ''}
            onChange={(e) => handleFilterChange('academic_year', e.target.value)}
            className="filter-select"
          >
            <option value="">📅 All Years</option>
            {filterOptions.academicYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
        {currentFilters.includes('start_date') && (
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleFilterChange('start_date', e.target.value)}
            placeholder="Start Date"
            className="filter-input"
          />
        )}
        {currentFilters.includes('end_date') && (
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleFilterChange('end_date', e.target.value)}
            placeholder="End Date"
            className="filter-input"
          />
        )}
        {currentFilters.includes('semester') && (
          <select
            value={filters.semester || ''}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            className="filter-select"
          >
            <option value="">📚 All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        )}
        {currentFilters.includes('status') && (
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">📊 All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="dropped">Dropped</option>
          </select>
        )}
      </div>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Generating report...</p>
        </div>
      );
    }

    // Show student selection for student-performance report
    if (activeReport === 'student-performance') {
      const filteredStudents = getFilteredStudents();
      
      // If students are loaded
      if (filteredStudents.length > 0 && reportData.length === 0) {
        return (
          <div className="student-selection-container">
            <div className="selection-header">
              <h3>📋 Select Students for Performance Report</h3>
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={(e) => handleSelectAllStudents(e.target.checked)}
                />
                <span>Select All ({filteredStudents.length} students)</span>
              </label>
            </div>
            <div className="students-grid">
              {filteredStudents.map(student => (
                <div key={student.id} className="student-card-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentSelection(student.id)}
                    />
                    <div className="student-info">
                      <div className="student-code">{student.student_code}</div>
                      <div className="student-name-kh">{student.std_khmer_name}</div>
                      <div className="student-name-en">{student.std_eng_name}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="selection-footer">
              <p>Selected: {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        );
      }
      // If no students match filters
      if (students.length > 0 && filteredStudents.length === 0) {
        return (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No Students Found</h3>
            <p className="empty-state-message">No students match the selected filters</p>
          </div>
        );
      }
      // If still loading students
      if (students.length === 0 && !loading) {
        return (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <h3 className="empty-state-title">Loading Students...</h3>
            <p className="empty-state-message">Please wait while we load student data</p>
          </div>
        );
      }
    }

    if (reportData.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Data Available</h3>
          <p className="empty-state-message">Select filters and click "Generate Report" to view data</p>
        </div>
      );
    }

    // Custom rendering for student-performance report
    if (activeReport === 'student-performance') {
      return (
        <div className="performance-reports-container">
          {reportData.map((data, idx) => {
            const student = data.student;
            const semesters = data.semesters || [];
            
            return (
              <div key={idx} className="performance-report-card">
                <div className="performance-header">
                  <div className="student-details">
                    <h3>{student.std_khmer_name} / {student.std_eng_name}</h3>
                    <p className="student-code">Student Code: {student.student_code}</p>
                    <p className="student-program">{student.department_name} | {student.program_name} | {student.batch_code}</p>
                  </div>
                  <div className="performance-summary">
                    <div className="summary-item">
                      <span className="summary-label">Overall Average</span>
                      <span className="summary-value">{data.overall_average}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">GPA</span>
                      <span className="summary-value gpa">{data.gpa}</span>
                    </div>
                  </div>
                </div>
                
                <div className="semester-table-container">
                  <table className="semester-table">
                    <thead>
                      <tr>
                        <th>Semester</th>
                        <th>Average Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesters.map((sem, semIdx) => (
                        <tr key={semIdx}>
                          <td>Semester {sem.semester}</td>
                          <td className="score-cell">{sem.semester_average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const columns = Object.keys(reportData[0]);

    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col}>{row[col] !== null && row[col] !== undefined ? row[col] : '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 Reports</h1>
            <p className="page-subtitle">Generate and export comprehensive system reports</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {Object.entries(reportCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setActiveReport(category.reports[0]?.id || null);
                setReportData([]);
                setFilters({});
              }}
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* Report Type Selection */}
        <div className="report-type-container">
          {reportCategories[activeTab].reports.map(report => (
            <button
              key={report.id}
              onClick={() => {
                setActiveReport(report.id);
                setReportData([]);
                setFilters({});
              }}
              className={`report-type-button ${activeReport === report.id ? 'active' : ''}`}
            >
              {report.icon} {report.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleGenerateReport} className="btn-generate">
            📊 Generate Report
          </button>
          {reportData.length > 0 && (
            <button onClick={exportToPDF} className="btn-export btn-export-pdf">
              📄 Export PDF
            </button>
          )}
        </div>

        {/* Report Table */}
        <div className="card">
          <div className="card-header">
            <h3>{reportCategories[activeTab].reports.find(r => r.id === activeReport)?.label}</h3>
            {reportData.length > 0 && (
              <span style={{ color: '#6b7280' }}>Total Records: {reportData.length}</span>
            )}
          </div>
          {renderTable()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
