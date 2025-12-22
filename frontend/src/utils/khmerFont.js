// Khmer Font Support for jsPDF
// This file provides Khmer Unicode font support

export const addKhmerFont = (doc) => {
  // Using a workaround: configure jsPDF to handle Unicode better
  // Note: For full Khmer support, you would need to:
  // 1. Download Noto Sans Khmer font (.ttf file)
  // 2. Convert it to base64 using online tools
  // 3. Add it to jsPDF using doc.addFileToVFS() and doc.addFont()
  
  // For now, we'll use a configuration that attempts to preserve Unicode
  // This is a placeholder - proper implementation requires font files
  
  return doc;
};

// Helper function to check if text contains Khmer characters
export const containsKhmer = (text) => {
  if (!text) return false;
  // Khmer Unicode range: U+1780 to U+17FF
  return /[\u1780-\u17FF]/.test(text);
};

// Fallback: render Khmer text as English transliteration or use image
export const renderKhmerSafe = (text) => {
  if (!text || text === '-') return text;
  
  // If contains Khmer, keep it as is (will be handled by autoTable)
  // In production, you'd want to add proper font support
  return text;
};
