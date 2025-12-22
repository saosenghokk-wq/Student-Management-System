// Temporary solution: Download and convert Khmer font
// This script helps you prepare the Khmer font for PDF

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('KHMER FONT SETUP FOR PDF REPORTS');
console.log('='.repeat(60));
console.log('\nFollow these steps:\n');

console.log('STEP 1: Download Khmer Font');
console.log('  • Go to: https://www.khmeros.info/download.php');
console.log('  • Download "Khmer OS Battambang.ttf"');
console.log('  • OR download from: https://github.com/google/fonts/tree/main/ofl/khmerossiemreap');
console.log('');

console.log('STEP 2: Place Font File');
console.log('  • Save the .ttf file to:');
console.log('    frontend/public/fonts/KhmerOSBattambang.ttf');
console.log('');

console.log('STEP 3: Convert to Base64');
console.log('  • Online tool: https://products.aspose.app/font/base64');
console.log('  • Upload your .ttf file');
console.log('  • Copy the entire base64 output');
console.log('');

console.log('STEP 4: Update Font File');
console.log('  • Open: frontend/src/utils/khmerFontBase64.js');
console.log('  • Paste the base64 string into the "data" field');
console.log('  • Save the file');
console.log('');

console.log('STEP 5: Test');
console.log('  • Restart frontend server: npm start');
console.log('  • Generate a Student List Report');
console.log('  • Khmer text should display correctly in PDF');
console.log('');

console.log('='.repeat(60));
console.log('QUICK TIP:');
console.log('If font file is at: frontend/public/fonts/KhmerOSBattambang.ttf');
console.log('Run: node convertFont.js (we can create this script)');
console.log('='.repeat(60));

// Check if font file exists
const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'KhmerOSBattambang.ttf');
if (fs.existsSync(fontPath)) {
  console.log('\n✅ Font file found!');
  console.log('Converting to base64...\n');
  
  const fontData = fs.readFileSync(fontPath);
  const base64 = fontData.toString('base64');
  
  const output = `// Khmer OS Battambang font for jsPDF
// Auto-generated from KhmerOSBattambang.ttf

export const khmerFont = {
  name: 'KhmerOSBattambang',
  data: '${base64}'
};

export const addKhmerFontToDoc = (doc) => {
  if (khmerFont.data && khmerFont.data.length > 0) {
    doc.addFileToVFS('KhmerOSBattambang.ttf', khmerFont.data);
    doc.addFont('KhmerOSBattambang.ttf', 'KhmerOSBattambang', 'normal');
    doc.setFont('KhmerOSBattambang');
    return true;
  }
  return false;
};
`;
  
  const outputPath = path.join(__dirname, '..', 'src', 'utils', 'khmerFontBase64.js');
  fs.writeFileSync(outputPath, output);
  
  console.log('✅ Font converted successfully!');
  console.log(`✅ Updated: ${outputPath}`);
  console.log('\nYou can now use Khmer font in PDF reports!');
} else {
  console.log('\n⚠️  Font file not found at:');
  console.log(`   ${fontPath}`);
  console.log('\nPlease download the font first (see STEP 1 above)');
}
