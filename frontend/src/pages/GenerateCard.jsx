import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api/api';
import { useAlert } from '../contexts/AlertContext';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, HeadingLevel, ImageRun, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import '../styles/table.css';

export default function GenerateCard() {
  const { showSuccess, showError } = useAlert();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generationMode, setGenerationMode] = useState('all'); // 'all', 'batch', 'select'
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewStudents, setPreviewStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [paperSize, setPaperSize] = useState('a4');

  // Generate filename for exports
  const generateFileName = (exportType) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let fileName = exportType;
    
    if (generationMode === 'batch' && selectedBatch) {
      const batch = batches.find(b => b.batch_id === parseInt(selectedBatch));
      if (batch) {
        fileName += `_${batch.batch_code}`;
      }
    }
    
    if (selectedDepartment) {
      const dept = departments.find(d => d.department_id === parseInt(selectedDepartment));
      if (dept) {
        fileName += `_${dept.department_name.replace(/\s+/g, '_')}`;
      }
    }
    
    fileName += `_${date}`;
    return fileName;
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset batch selection when department changes
  useEffect(() => {
    setSelectedBatch('');
  }, [selectedDepartment]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsData, batchesData, departmentsData, programsData] = await Promise.all([
        api.getStudents(),
        api.getBatches(),
        api.getDepartments(),
        api.getPrograms()
      ]);
      console.log('Students data sample:', studentsData?.[0]);
      console.log('Batches data sample:', batchesData?.[0]);
      console.log('Programs data sample:', programsData?.[0]);
      setStudents(studentsData || []);
      setBatches(batchesData || []);
      setDepartments(departmentsData || []);
      setPrograms(programsData || []);
    } catch (err) {
      showError('Failed to load data');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter batches by department through programs (same logic as Students page)
  // Relationship: Department → Programs (program.department_id) → Batches (batch.program_id)
  const filteredBatches = selectedDepartment
    ? (() => {
        // Get programs for selected department
        const deptPrograms = programs.filter(p => String(p.department_id) === String(selectedDepartment));
        if (deptPrograms.length > 0) {
          // Get program IDs
          const programIds = new Set(deptPrograms.map(p => String(p.program_id || p.id)));
          // Filter batches that belong to these programs
          return batches.filter(b => {
            const batchProgramId = String(b.program_id || b.ProgramId || b.programId || '');
            return batchProgramId && programIds.has(batchProgramId);
          });
        }
        return [];
      })()
    : batches;
  
  console.log('Dept:', selectedDepartment, 'Total batches:', batches.length, 'Filtered batches:', filteredBatches.length, 'Programs:', programs.length);

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' || 
      student.std_eng_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.std_khmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.std_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || student.department_id == selectedDepartment;
    const matchesBatch = !selectedBatch || student.batch_id == selectedBatch;
    
    return matchesSearch && matchesDepartment && matchesBatch;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleGenerateCards = () => {
    const studentsToGenerate = students.filter(s => selectedStudents.includes(s.id));

    if (studentsToGenerate.length === 0) {
      showError('No students selected for card generation');
      return;
    }

    setPreviewStudents(studentsToGenerate);
    setShowPreview(true);
    showSuccess(`Preview ready: ${studentsToGenerate.length} student card(s)`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!previewStudents || previewStudents.length === 0) {
      showError('No cards to export');
      return;
    }

    try {
      showSuccess('Generating PDF...');
      
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cardElements = document.querySelectorAll('.student-card-export');
      console.log('Found card elements:', cardElements.length);
      
      if (cardElements.length === 0) {
        showError('No card elements found. Please ensure cards are displayed.');
        return;
      }

      // Paper size configurations - card size with extra space to capture full borders
      const paperSizes = {
        a4: { width: 297, height: 210, cardWidth: 53, cardHeight: 85, cols: 5, rows: 2 },
        letter: { width: 279, height: 216, cardWidth: 53, cardHeight: 85, cols: 5, rows: 2 },
        a3: { width: 420, height: 297, cardWidth: 53, cardHeight: 85, cols: 7, rows: 3 }
      };
      
      const config = paperSizes[paperSize] || paperSizes.a4;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: paperSize === 'a3' ? 'a3' : paperSize === 'letter' ? 'letter' : 'a4'
      });

      const cardsPerPage = config.cols * config.rows;
      const numPages = Math.ceil(cardElements.length / cardsPerPage);
      
      for (let page = 0; page < numPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const startIdx = page * cardsPerPage;
        const endIdx = Math.min(startIdx + cardsPerPage, cardElements.length);
        
        console.log(`Processing page ${page + 1}, cards ${startIdx} to ${endIdx - 1}`);
        
        // Capture cards for this page
        for (let i = startIdx; i < endIdx; i++) {
          const cardElement = cardElements[i];
          
          try {
            const canvas = await html2canvas(cardElement, {
              scale: 3,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#fef3e8',
              logging: false,
              imageTimeout: 0,
              removeContainer: true,
              scrollX: 0,
              scrollY: 0
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Calculate position based on paper size
            const cardIndexInPage = i - startIdx;
            const row = Math.floor(cardIndexInPage / config.cols);
            const col = cardIndexInPage % config.cols;
            
            const cardWidth = config.cardWidth;
            const cardHeight = config.cardHeight;
            const spacingX = 6;
            const spacingY = 6;
            const totalWidth = cardWidth * config.cols + spacingX * (config.cols - 1);
            const totalHeight = cardHeight * config.rows + spacingY * (config.rows - 1);
            const marginX = (config.width - totalWidth) / 2;
            const marginY = (config.height - totalHeight) / 2;
            
            const x = marginX + col * (cardWidth + spacingX);
            const y = marginY + row * (cardHeight + spacingY);
            
            pdf.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight, undefined, 'FAST');
          } catch (canvasError) {
            console.error(`Error capturing card ${i}:`, canvasError);
            throw new Error(`Failed to capture card ${i + 1}`);
          }
        }
      }
      
      // Save PDF locally with formatted filename
      const fileName = generateFileName('StudentCards_PDF');
      pdf.save(`${fileName}.pdf`);
      
      showSuccess('PDF saved successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showError(`Failed to export PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const handleExportImages = async (format = 'jpg') => {
    if (!previewStudents || previewStudents.length === 0) {
      showError('No cards to export');
      return;
    }

    try {
      const formatUpper = format.toUpperCase();
      showSuccess(`Generating ${formatUpper} images...`);
      
      const cardElements = document.querySelectorAll('.student-card-export');
      
      if (cardElements.length === 0) {
        showError('No card elements found');
        return;
      }

      for (let i = 0; i < cardElements.length; i++) {
        const cardElement = cardElements[i];
        
        // Using 3x scale for high quality output
        const canvas = await html2canvas(cardElement, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#fef3e8',
          logging: false,
          windowWidth: 300,
          windowHeight: 480
        });
        
        // Convert to selected format and download
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
        const quality = format === 'png' ? undefined : 0.95;
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const student = previewStudents[i];
          const fileName = `card_${student?.student_code || i + 1}.${format}`;
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, mimeType, quality);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      showSuccess(`${cardElements.length} cards exported as ${formatUpper}`);
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()}:`, error);
      showError(`Failed to export cards as ${format.toUpperCase()}`);
    }
  };

  const handleExportJPG = () => handleExportImages('jpg');
  const handleExportPNG = () => handleExportImages('png');

  // Card Component to avoid duplication
  const StudentCard = ({ student }) => {
    if (!student) return null;
    
    return (
      <div 
        className="student-card-export"
        style={{
          width: '300px',
          height: '480px',
          background: '#fef3e8',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          border: '5px solid #e8d4b8',
          position: 'relative'
        }}
      >
        {/* Header with gradient - Navy Blue */}
        <div className="card-header" style={{
          background: 'linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%)',
          padding: '14px 16px',
          color: 'white',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '10px',
          minHeight: '75px'
        }}>
          {/* Logo */}
          <div className="card-logo" style={{
            width: '50px',
            height: '50px',
            background: 'white',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <img 
              src="/Picture1.jpg" 
              alt="Logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '🎓';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* School Name */}
          <div style={{ textAlign: 'left', flex: 1 }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '3px',
              fontFamily: 'Khmer OS Battambang, Arial',
              lineHeight: '1.2'
            }}>វិទ្យាស្ថានសន្តប៉ុល</div>
            <div className="school-name" style={{
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.2px',
              lineHeight: '1.2'
            }}>Saint Paul Institute</div>
          </div>
        </div>

        {/* Student Photo Area */}
        <div className="photo-area" style={{
          padding: '20px',
          textAlign: 'center',
          position: 'relative',
          background: '#fef3e8'
        }}>
          <div className="student-photo" style={{
            width: '160px',
            height: '180px',
            background: '#f5f5f5',
            borderRadius: '8px',
            margin: '0 auto',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            border: '3px solid #1e3a5f'
          }}>
            {student.profile_image ? (
              <img 
                src={student.profile_image}
                alt={student.std_eng_name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : null}
            <div style={{
              display: student.profile_image ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              fontSize: '64px',
              color: '#9ca3af'
            }}>
              👤
            </div>
          </div>

          {/* Student Information */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            padding: '0 20px'
          }}>
            {/* Student Name */}
            <div style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '6px',
              color: '#1e3a5f',
              lineHeight: '1.3',
              textTransform: 'uppercase'
            }}>
              Name: {student.std_eng_name || 'N/A'}
            </div>

            {/* Student ID */}
            <div className="student-id" style={{
              fontSize: '12px',
              color: '#1e3a5f',
              marginBottom: '6px',
              fontWeight: '600',
              fontFamily: 'Khmer OS Battambang, Arial'
            }}>
              ID: {student.student_code || 'N/A'}
            </div>

            {/* Department */}
            <div className="department-name" style={{
              fontSize: '11px',
              color: '#1e3a5f',
              marginBottom: '5px',
              fontWeight: '500',
              fontFamily: 'Khmer OS Battambang, Arial'
            }}>
              {student.department_name || 'N/A'}
            </div>

            {/* Academic Year */}
            <div className="batch-code" style={{
              fontSize: '11px',
              color: '#1e3a5f',
              fontWeight: '600',
              fontFamily: 'Khmer OS Battambang, Arial',
              marginTop: '5px'
            }}>
              {student.batch_code || 'N/A'}
            </div>
          </div>
        </div>

        {/* Footer with contact info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          background: 'linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%)',
          color: 'white',
          padding: '10px 12px',
          fontSize: '9px',
          textAlign: 'center',
          lineHeight: '1.6'
        }}>
          <div style={{ fontFamily: 'Khmer OS Battambang, Arial', marginBottom: '2px', fontSize: '8.5px' }}>
            អាស៉ួយដ្ហាន ៖ ផ្ទះលេខ១០៤ ក្រុមទី៥ ឃុំបឹងកក់២ ខណ្ឌទួលគោក រាជដានី
          </div>
          <div style={{ fontSize: '8px' }}>
            Phone: 078 556 552, 096 53 86 889; E-mail: info@spi.edu.kh
          </div>
        </div>
      </div>
    );
  };

  const handleExportWord = async () => {
    if (!previewStudents || previewStudents.length === 0) {
      showError('No cards to export');
      return;
    }

    try {
      showSuccess('Generating Word document...');
      
      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cardElements = document.querySelectorAll('.student-card-export');
      console.log('Found card elements for Word:', cardElements.length);
      
      if (cardElements.length === 0) {
        showError('No card elements found. Please ensure cards are displayed.');
        return;
      }

      // Capture all cards as images first
      const cardImages = [];
      for (let i = 0; i < cardElements.length; i++) {
        const cardElement = cardElements[i];
        const canvas = await html2canvas(cardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#fef3e8',
          logging: false,
          windowWidth: 300,
          windowHeight: 480
        });
        
        const imageBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
        
        cardImages.push(await imageBlob.arrayBuffer());
      }

      // Create Word document with cards in table layout (2 rows x 3 columns per page)
      const rows = [];
      const cardsPerPage = 6;
      const numPages = Math.ceil(previewStudents.length / cardsPerPage);
      
      for (let page = 0; page < numPages; page++) {
        const pageStart = page * cardsPerPage;
        
        // Row 1: Cards 0, 1, 2
        const row1Cells = [];
        for (let col = 0; col < 3; col++) {
          const cardIndex = pageStart + col;
          if (cardIndex < previewStudents.length && cardImages[cardIndex]) {
            row1Cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: cardImages[cardIndex],
                        transformation: {
                          width: 354,
                          height: 369
                        }
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ],
                width: { size: 33, type: WidthType.PERCENTAGE },
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
              })
            );
          } else {
            row1Cells.push(new TableCell({ children: [new Paragraph('')], width: { size: 33, type: WidthType.PERCENTAGE } }));
          }
        }
        rows.push(new TableRow({ children: row1Cells, height: { value: 369, rule: 'atLeast' } }));
        
        // Row 2: Cards 3, 4, 5
        const row2Cells = [];
        for (let col = 0; col < 3; col++) {
          const cardIndex = pageStart + 3 + col;
          if (cardIndex < previewStudents.length && cardImages[cardIndex]) {
            row2Cells.push(
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: cardImages[cardIndex],
                        transformation: {
                          width: 354,
                          height: 369
                        }
                      })
                    ],
                    alignment: AlignmentType.CENTER
                  })
                ],
                width: { size: 33, type: WidthType.PERCENTAGE },
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
              })
            );
          } else {
            row2Cells.push(new TableCell({ children: [new Paragraph('')], width: { size: 33, type: WidthType.PERCENTAGE } }));
          }
        }
        rows.push(new TableRow({ children: row2Cells, height: { value: 369, rule: 'atLeast' } }));
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 567, right: 567, bottom: 567, left: 567 },
              size: { orientation: 'landscape', width: 16838, height: 11906 }
            }
          },
          children: [
            new Table({
              rows: rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
              }
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      
      // Save Word document locally with formatted filename
      const fileName = generateFileName('StudentCards_Word');
      saveAs(blob, `${fileName}.docx`);
      
      showSuccess('Word document saved successfully');
    } catch (error) {
      console.error('Error exporting Word:', error);
      showError('Failed to export cards as Word document');
    }
  };



  return (
    <DashboardLayout>
      <style>{`
        @media print {
          /* Hide everything except cards */
          body * {
            visibility: hidden;
          }
          #printable-cards, #printable-cards * {
            visibility: visible;
          }
          #printable-cards {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          
          /* Page settings - matches PDF export paper size */
          @page {
            size: ${paperSize === 'a3' ? 'A3' : paperSize === 'letter' ? 'letter' : 'A4'} landscape;
            margin: 10mm;
          }
          
          /* Container for all cards */
          #printable-cards {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          
          /* Page wrapper */
          #printable-cards .page-wrapper {
            page-break-after: always !important;
            break-after: always !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 10mm !important;
          }
          
          /* Remove page break after last page */
          #printable-cards .page-wrapper:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
            margin-bottom: 0 !important;
          }
          
          /* Table for cards - 5 columns x 2 rows (matches PDF layout) */
          #printable-cards table {
            border-collapse: separate !important;
            border-spacing: 4mm !important;
            width: auto !important;
            margin: 0 auto !important;
          }
          
          /* Table cells */
          #printable-cards td {
            padding: 0 !important;
            vertical-align: top !important;
            width: 53mm !important;
            height: 85mm !important;
          }
          
          /* Card container in print - matches PDF export size */
          .student-card-export {
            width: 53mm !important;
            height: 85mm !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 5px solid #e8d4b8 !important;
            border-radius: 20px !important;
            background: #fef3e8 !important;
            overflow: hidden !important;
            position: relative !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transform: scale(1) !important;
          }
          
          /* Header styling for print */
          #printable-cards .card-header {
            padding: 8px 12px !important;
            min-height: 40px !important;
            background: linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%) !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Logo size */
          #printable-cards .card-logo {
            width: 32px !important;
            height: 32px !important;
            border-radius: 4px !important;
            flex-shrink: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }
          
          #printable-cards .card-logo img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* School name container */
          #printable-cards .card-header > div {
            text-align: left !important;
            flex: 1 !important;
            color: white !important;
          }
          
          /* Khmer school name */
          #printable-cards .card-header > div > div:first-child {
            font-size: 7px !important;
            line-height: 1.2 !important;
            margin-bottom: 1px !important;
            font-weight: 500 !important;
            color: white !important;
          }
          
          /* English school name */
          #printable-cards .school-name {
            font-size: 8.5px !important;
            line-height: 1.2 !important;
            font-weight: 600 !important;
            color: white !important;
            letter-spacing: 0.2px !important;
          }
          
          /* Photo area */
          #printable-cards .photo-area {
            padding: 8px 10px 6px !important;
            background: #fef3e8 !important;
            text-align: center !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
          
          /* Photo size */
          #printable-cards .student-photo {
            width: 70px !important;
            height: 85px !important;
            margin: 0 auto !important;
            border: 2px solid #2c5282 !important;
            border-radius: 5px !important;
            background: #f5f5f5 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          #printable-cards .student-photo img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: center top !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Student info section */
          #printable-cards .photo-area > div {
            margin-top: 5px !important;
            padding: 0 8px !important;
            text-align: center !important;
          }
          
          /* Student name */
          #printable-cards .student-name {
            font-size: 8px !important;
            margin-bottom: 2px !important;
            color: #1e3a5f !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            line-height: 1.2 !important;
            letter-spacing: 0.2px !important;
          }
          
          /* Student ID */
          #printable-cards .student-id {
            font-size: 7px !important;
            margin-bottom: 2px !important;
            color: #1e3a5f !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
          }
          
          /* Department name */
          #printable-cards .department-name {
            font-size: 6.5px !important;
            margin-bottom: 2px !important;
            color: #1e3a5f !important;
            font-weight: 500 !important;
            line-height: 1.2 !important;
          }
          
          /* Batch code */
          #printable-cards .batch-code {
            font-size: 6.5px !important;
            margin-top: 2px !important;
            color: #1e3a5f !important;
            font-weight: 600 !important;
            line-height: 1.2 !important;
          }
          
          /* Footer styling */
          #printable-cards td > div > div:last-child {
            position: absolute !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            padding: 4px 6px !important;
            font-size: 5px !important;
            line-height: 1.4 !important;
            background: linear-gradient(135deg, #2c5282 0%, #1e3a5f 100%) !important;
            color: white !important;
            text-align: center !important;
            flex-shrink: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Footer Khmer text */
          #printable-cards td > div > div:last-child > div:first-child {
            font-size: 4.5px !important;
            margin-bottom: 0.5px !important;
            color: white !important;
          }
          
          /* Footer English text */
          #printable-cards td > div > div:last-child > div:last-child {
            font-size: 4px !important;
            color: white !important;
          }
        }
      `}</style>
      
      <style>{`
        @media (max-width: 768px) {
          .main-container {
            padding: 16px !important;
          }
          .page-header h1 {
            font-size: 1.5rem !important;
          }
          .page-header p {
            font-size: 0.875rem !important;
          }
          .filter-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .button-group {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .button-group button {
            width: 100% !important;
          }
          .table-container {
            overflow-x: auto !important;
          }
          .entries-control {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .pagination-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .filter-grid > div:first-child {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
      <div className="main-container no-print" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: 0,
            marginBottom: '8px',
            flexWrap: 'wrap'
          }}>
            🎴 Generate Student Cards
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            Create identification cards for students
          </p>
        </div>

        {/* Filter Section */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Filter by Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Filter by Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '0.875rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">{selectedDepartment ? 'All Batches in Department' : 'All Batches'}</option>
                {filteredBatches.map(batch => (
                  <option key={batch.batch_id} value={batch.batch_id}>
                    {batch.batch_code || batch.batch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleGenerateCards}
              disabled={selectedStudents.length === 0}
              style={{
                padding: '10px 24px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: selectedStudents.length === 0 
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)',
                width: '100%',
                maxWidth: '300px'
              }}
              onMouseEnter={(e) => {
                if (selectedStudents.length === 0) return;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
              }}
            >
              🎴 Generate Cards ({selectedStudents.length})
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#1f2937' }}>
              📋 Student List
              <span style={{ 
                marginLeft: '12px', 
                background: '#eff6ff', 
                padding: '4px 12px', 
                borderRadius: '16px', 
                fontSize: '0.875rem',
                color: '#1e40af',
                fontWeight: '600'
              }}>
                {filteredStudents.length} students
              </span>
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Selected: <strong style={{ color: '#10b981' }}>{selectedStudents.length}</strong>
            </div>
          </div>

          {/* Entries per page */}
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Show</label>
              <select 
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>entries</label>
            </div>
          </div>

        {/* Preview Section */}
        {showPreview && previewStudents.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            marginBottom: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#1f2937' }}>
                  Card Preview ({previewStudents.length} cards)
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
                    📄 Paper Size:
                  </label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    <option value="a4">A4 (297×210mm)</option>
                    <option value="letter">Letter (279×216mm)</option>
                    <option value="a3">A3 (420×297mm)</option>
                  </select>
                </div>
              </div>
              <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleExportPDF}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  📄 Export as PDF
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#374151',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ✖️ Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Student Table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  </th>
                  <th style={{ width: '60px' }}>No</th>
                  <th>English Name</th>
                  <th>Khmer Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Batch</th>
                  <th>Program</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</td></tr>
                ) : (() => {
                  const startIndex = (currentPage - 1) * entriesPerPage;
                  const endIndex = startIndex + entriesPerPage;
                  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

                  return paginatedStudents.length === 0 ? (
                    <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No students found</td></tr>
                  ) : (
                    paginatedStudents.map((student, index) => (
                      <tr 
                        key={student.id}
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.2s',
                          background: selectedStudents.includes(student.id) ? '#f0fdf4' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedStudents.includes(student.id)) {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedStudents.includes(student.id)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                          {startIndex + index + 1}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.std_eng_name}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.std_khmer_name}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.gender == 0 || student.gender === '0' ? 'Male' : student.gender == 1 || student.gender === '1' ? 'Female' : '-'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.phone || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.batch_code || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: '#4b5563' }}>
                          {student.program_name || '-'}
                        </td>
                      </tr>
                    ))
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div style={{ 
              padding: '16px 20px', 
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Showing {Math.min((currentPage - 1) * entriesPerPage + 1, filteredStudents.length)} to{' '}
                {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} entries
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: currentPage === 1 ? '#f9fafb' : 'white',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    fontSize: '0.875rem',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Previous
                </button>
                {(() => {
                  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
                  const pages = [];
                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #d1d5db',
                            background: currentPage === i ? '#3b82f6' : 'white',
                            color: currentPage === i ? 'white' : '#374151',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            fontWeight: currentPage === i ? '600' : '500',
                            minWidth: '40px'
                          }}
                        >
                          {i}
                        </button>
                      );
                    } else if (i === currentPage - 2 || i === currentPage + 2) {
                      pages.push(<span key={i} style={{ padding: '8px 4px', color: '#9ca3af' }}>...</span>);
                    }
                  }
                  return pages;
                })()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredStudents.length / entriesPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredStudents.length / entriesPerPage)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#f9fafb' : 'white',
                    color: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? '#9ca3af' : '#374151',
                    fontSize: '0.875rem',
                    cursor: currentPage >= Math.ceil(filteredStudents.length / entriesPerPage) ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Cards Section */}
      {showPreview && previewStudents.length > 0 && (
        <div id="printable-cards" style={{ 
          padding: '20px',
          background: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Group cards into pages of 6 (2 rows x 3 columns) */}
          {Array.from({ length: Math.ceil(previewStudents.length / 6) }, (_, pageIndex) => (
            <div key={pageIndex} className="page-wrapper" style={{ 
              marginBottom: pageIndex < Math.ceil(previewStudents.length / 6) - 1 ? '20px' : '0'
            }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: '10px', margin: '0 auto' }}>
                <tbody>
                  {/* Row 1 - Cards 0, 1, 2 */}
                  <tr>
                    {[0, 1, 2].map((colIndex) => {
                      const cardIndex = pageIndex * 6 + colIndex;
                      const student = previewStudents[cardIndex];
                      return (
                        <td key={colIndex}>
                          <StudentCard student={student} />
                        </td>
                      );
                    })}
                  </tr>
                  {/* Row 2 - Cards 3, 4, 5 */}
                  <tr>
                    {[3, 4, 5].map((colIndex) => {
                      const cardIndex = pageIndex * 6 + colIndex;
                      const student = previewStudents[cardIndex];
                      return (
                        <td key={colIndex}>
                          <StudentCard student={student} />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
