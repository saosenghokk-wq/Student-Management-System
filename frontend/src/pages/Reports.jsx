import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/api';
import '../styles/reports.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('academic');
  const [activeReport, setActiveReport] = useState('student-performance');
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

  useEffect(() => {
    loadFilterOptions();
  }, []);

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
        case 'student-performance':
          data = await api.getStudentPerformanceReport(cleanFilters);
          break;
        case 'grade-distribution':
          data = await api.getGradeDistributionReport(cleanFilters);
          break;
        case 'student-attendance':
          data = await api.getStudentAttendanceReport(cleanFilters);
          break;
        case 'attendance-summary':
          data = await api.getAttendanceSummaryReport(cleanFilters);
          break;
        case 'student-enrollment':
          data = await api.getStudentEnrollmentReport(cleanFilters);
          break;
        case 'teacher-workload':
          data = await api.getTeacherWorkloadReport(cleanFilters);
          break;
        case 'department-statistics':
          data = await api.getDepartmentStatisticsReport();
          break;
        case 'admission':
          data = await api.getAdmissionReport(cleanFilters);
          break;
        case 'fee-collection':
          data = await api.getFeeCollectionReport(cleanFilters);
          break;
        case 'outstanding-fees':
          data = await api.getOutstandingFeesReport(cleanFilters);
          break;
        case 'student-demographics':
          data = await api.getStudentDemographicsReport();
          break;
        case 'pass-fail-rate':
          data = await api.getPassFailRateReport(cleanFilters);
          break;
        default:
          data = [];
      }
      setReportData(data);
    } catch (err) {
      console.error('Error loading report:', err);
      alert('Failed to load report: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    // Reset dependent filters when parent changes
    if (key === 'department_id') {
      setFilters(prev => ({ ...prev, [key]: value, program_id: '', batch_id: '', subject_id: '' }));
    } else if (key === 'program_id') {
      setFilters(prev => ({ ...prev, [key]: value, batch_id: '', subject_id: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleGenerateReport = () => {
    loadReport(activeReport);
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    
    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeReport}-report.csv`;
    a.click();
  };

  const handleExportPDF = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Get report details
    const reportTitle = reportCategories[activeTab].reports.find(r => r.id === activeReport)?.label || 'Report';
    const categoryTitle = reportCategories[activeTab].label;
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Header Background (Gradient-like effect with multiple rectangles)
    const gradientColors = [
      [102, 126, 234], // #667eea
      [108, 120, 228],
      [114, 114, 222],
      [120, 108, 216],
      [118, 75, 162]  // #764ba2
    ];
    
    const headerHeight = 35;
    const stripeHeight = headerHeight / gradientColors.length;
    
    gradientColors.forEach((color, index) => {
      doc.setFillColor(...color);
      doc.rect(0, index * stripeHeight, pageWidth, stripeHeight, 'F');
    });

    // School/System Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('School Management System', pageWidth / 2, 12, { align: 'center' });

    // Report Category & Type
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${categoryTitle} - ${reportTitle}`, pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(9);
    doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 27, { align: 'center' });

    // Add decorative line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 30, pageWidth - 20, 30);

    // Filters Section (if any filters are applied)
    let currentY = 40;
    const appliedFilters = Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined);
    
    if (appliedFilters.length > 0) {
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(15, currentY - 3, pageWidth - 30, 12, 2, 2, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters:', 20, currentY + 3);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const filterText = appliedFilters.map(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return `${label}: ${value}`;
      }).join('  |  ');
      doc.text(filterText, 20, currentY + 8);
      
      currentY += 18;
    }

    // Prepare table data
    const columns = Object.keys(reportData[0]);
    const headers = columns.map(col => col.replace(/_/g, ' ').toUpperCase());
    const rows = reportData.map(row => 
      columns.map(col => {
        const value = row[col];
        return value !== null && value !== undefined ? String(value) : '-';
      })
    );

    // Table styling
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        // Auto-adjust column widths
      },
      margin: { left: 15, right: 15 },
      didDrawPage: function(data) {
        // Footer on each page
        const footerY = pageHeight - 10;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        
        // Page number
        const pageNum = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(`Page ${currentPage} of ${pageNum}`, pageWidth / 2, footerY, { align: 'center' });
        
        // Footer text
        doc.text('School Management System Report', 15, footerY);
        doc.text(`Total Records: ${reportData.length}`, pageWidth - 15, footerY, { align: 'right' });
        
        // Footer line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);
      }
    });

    // Save the PDF
    const fileName = `${activeReport}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const reportCategories = {
    academic: {
      label: 'Academic Reports',
      icon: '📚',
      reports: [
        { id: 'student-performance', label: 'Student Performance', icon: '📊' },
        { id: 'grade-distribution', label: 'Grade Distribution', icon: '📈' },
        { id: 'pass-fail-rate', label: 'Pass/Fail Rate', icon: '✅' }
      ]
    },
    attendance: {
      label: 'Attendance Reports',
      icon: '📋',
      reports: [
        { id: 'student-attendance', label: 'Student Attendance', icon: '👥' },
        { id: 'attendance-summary', label: 'Attendance Summary', icon: '📊' }
      ]
    },
    management: {
      label: 'Management Reports',
      icon: '👔',
      reports: [
        { id: 'student-enrollment', label: 'Student Enrollment', icon: '🎓' },
        { id: 'teacher-workload', label: 'Teacher Workload', icon: '👨‍🏫' },
        { id: 'department-statistics', label: 'Department Statistics', icon: '🏢' },
        { id: 'admission', label: 'Admission Report', icon: '📝' }
      ]
    },
    financial: {
      label: 'Financial Reports',
      icon: '💰',
      reports: [
        { id: 'fee-collection', label: 'Fee Collection', icon: '💵' },
        { id: 'outstanding-fees', label: 'Outstanding Fees', icon: '⚠️' }
      ]
    },
    analytics: {
      label: 'Analytics',
      icon: '📊',
      reports: [
        { id: 'student-demographics', label: 'Student Demographics', icon: '👥' }
      ]
    }
  };

  const renderFilters = () => {
    const filterConfigs = {
      'student-performance': ['department_id', 'program_id', 'batch_id', 'subject_id'],
      'grade-distribution': ['department_id', 'program_id', 'batch_id', 'subject_id'],
      'pass-fail-rate': ['department_id', 'program_id', 'batch_id', 'subject_id'],
      'student-attendance': ['department_id', 'program_id', 'batch_id', 'subject_id'],
      'attendance-summary': ['department_id', 'program_id', 'batch_id'],
      'student-enrollment': ['department_id', 'program_id', 'batch_id'],
      'teacher-workload': ['department_id', 'program_id'],
      'department-statistics': ['department_id'],
      'admission': ['department_id', 'program_id', 'batch_id'],
      'fee-collection': ['department_id', 'program_id', 'batch_id'],
      'outstanding-fees': ['department_id', 'program_id', 'batch_id'],
      'student-demographics': ['department_id', 'program_id', 'batch_id']
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
          <input
            type="number"
            value={filters.semester || ''}
            onChange={(e) => handleFilterChange('semester', e.target.value)}
            placeholder="Semester (1-8)"
            min="1"
            max="8"
            className="filter-input"
          />
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

    if (reportData.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3 className="empty-state-title">No Data Available</h3>
          <p className="empty-state-message">Select filters and click "Generate Report" to view data</p>
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
                setActiveReport(category.reports[0].id);
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
            <button onClick={handleExportPDF} className="btn-export btn-export-pdf">
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
