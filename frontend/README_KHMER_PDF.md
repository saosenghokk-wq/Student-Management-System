# Fix Khmer Text in PDF Reports

## Problem
Khmer text appears as broken/unreadable characters in PDF because:
- PDF uses **default fonts** (Helvetica, Times, Courier)
- Default fonts **do not support Khmer Unicode**
- Result: Khmer text is garbled ❌

## Solution
**Use Khmer Unicode font and embed it in PDF** ✅

---

## Quick Setup (3 Steps)

### Step 1: Download Khmer Font
Download **Khmer OS Battambang** font:
- Option A: https://www.khmeros.info/download.php
- Option B: https://github.com/google/fonts/tree/main/ofl/khmerossiemreap

Save to: `frontend/public/fonts/KhmerOSBattambang.ttf`

### Step 2: Convert Font to Base64
Run the conversion script:
```bash
cd frontend
node setupKhmerFont.js
```

This will automatically:
- Read the .ttf file
- Convert to base64
- Update `src/utils/khmerFontBase64.js`

### Step 3: Restart and Test
```bash
npm start
```

Generate a Student List Report → Khmer text should display correctly! ✅

---

## Manual Setup (if script doesn't work)

1. **Convert font online:**
   - Go to: https://products.aspose.app/font/base64
   - Upload `KhmerOSBattambang.ttf`
   - Copy the base64 output

2. **Update font file:**
   - Open: `frontend/src/utils/khmerFontBase64.js`
   - Paste base64 into the `data` field:
   ```javascript
   export const khmerFont = {
     name: 'KhmerOSBattambang',
     data: 'PASTE_BASE64_HERE'
   };
   ```

3. **Save and restart**

---

## How It Works

1. **Embed Khmer font** in PDF (not system font)
2. **UTF-8 encoding** for proper text handling
3. **jsPDF automatically uses Khmer font** for all text
4. **Works on any computer** (font is embedded in PDF file)

---

## Best Practices

✅ Use **one standard Khmer font** for all reports  
✅ **Embed font in PDF** (don't rely on system fonts)  
✅ Use **UTF-8 encoding** throughout system  
✅ Test PDF on **different computers** to verify

---

## Troubleshooting

**Problem:** Script says "Font file not found"  
**Solution:** Make sure font is at `frontend/public/fonts/KhmerOSBattambang.ttf`

**Problem:** Still garbled after setup  
**Solution:** 
1. Check console for "Khmer font not loaded" warning
2. Verify base64 data is in `khmerFontBase64.js`
3. Restart the frontend server

**Problem:** PDF is very large  
**Solution:** This is normal - embedded fonts add ~500KB to PDF size

---

## Summary

> **Khmer PDF problem:** Default fonts don't support Khmer  
> **Fix:** Use and embed Khmer Unicode font (Khmer OS Battambang)  
> **Result:** Khmer text displays perfectly in PDF ✅
