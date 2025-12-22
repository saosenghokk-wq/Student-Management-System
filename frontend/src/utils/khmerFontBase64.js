// Khmer OS Battambang font for jsPDF
// This is a placeholder - you need to add the actual base64 font data

// Instructions to get the font:
// 1. Download Khmer OS Battambang.ttf from: https://www.khmeros.info/download.php
// 2. Convert to base64 using: https://products.aspose.app/font/base64
// 3. Paste the base64 string below

// For now, we'll provide the structure
export const khmerFont = {
  name: 'KhmerOSBattambang',
  data: '' // Base64 font data will go here
};

// Function to add Khmer font to jsPDF
export const addKhmerFontToDoc = (doc) => {
  // Only add if font data exists
  if (khmerFont.data && khmerFont.data.length > 0) {
    doc.addFileToVFS('KhmerOSBattambang.ttf', khmerFont.data);
    doc.addFont('KhmerOSBattambang.ttf', 'KhmerOSBattambang', 'normal');
    doc.setFont('KhmerOSBattambang');
    return true;
  }
  return false;
};
