# Khmer Font Setup for PDF Reports

## Problem
jsPDF's default fonts (Helvetica, Times, Courier) don't support Khmer Unicode characters. This causes Khmer text to appear as garbled symbols.

## Solution Options

### Option 1: Use html2canvas (Recommended - Easiest)
Install html2canvas to render the report as an image first, then convert to PDF:

```bash
npm install html2canvas
```

This will allow proper Khmer rendering since it uses browser fonts.

### Option 2: Add Custom Khmer Font to jsPDF (More Complex)

1. Download Noto Sans Khmer font:
   - Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
   - Download the font files

2. Convert .ttf to base64:
   - Use: https://products.aspose.app/font/base64
   - Or use command line tool

3. Add font to jsPDF (code example in Reports.jsx)

### Option 3: Export to Excel/CSV Instead
For reports with Khmer text, consider exporting to Excel/CSV format which handles Unicode better.

## Current Workaround
The system is configured to display Khmer text, but PDF rendering may show garbled characters until a proper font is added.

## Next Steps
Choose one of the options above based on your requirements.
