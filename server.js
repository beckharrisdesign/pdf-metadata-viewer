import express from 'express';
import { readFile, readdir, writeFile, rename, unlink } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Parse comma-delimited string, handling quoted values
function parseCommaDelimitedString(str) {
  if (!str || typeof str !== 'string') return [];
  
  // Simple split by comma, then trim each item
  const result = str
    .split(',')
    .map(item => {
      // Remove quotes if present and trim
      let trimmed = item.trim();
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
          (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1).trim();
      }
      return trimmed;
    })
    .filter(item => item.length > 0);
  
  return result;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Activity log file path
const LOG_FILE = join(__dirname, 'activity-log.json');

// Logging function
async function logActivity(type, details) {
  try {
    let log = [];
    if (existsSync(LOG_FILE)) {
      const logData = await readFile(LOG_FILE, 'utf-8');
      log = JSON.parse(logData);
    }
    
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      ...details
    };
    
    log.push(entry);
    
    // Keep only last 1000 entries to prevent file from growing too large
    if (log.length > 1000) {
      log = log.slice(-1000);
    }
    
    await writeFile(LOG_FILE, JSON.stringify(log, null, 2));
  } catch (error) {
    console.error('Error writing to activity log:', error);
  }
}

// Serve static files
app.use(express.static('public'));

// Parse JSON bodies
app.use(express.json());

// Endpoint to get PDF metadata
app.get('/api/metadata/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = join(__dirname, 'pdfs', filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const pdfBytes = await readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get keywords - pdf-lib returns an array
    let keywordsRaw = pdfDoc.getKeywords() || [];
    
    // pdf-lib's getKeywords() should return an array directly
    // If it's already an array, use it as-is
    let keywordsArray = [];
    if (Array.isArray(keywordsRaw)) {
      keywordsArray = keywordsRaw;
    } else if (typeof keywordsRaw === 'string') {
      // If it's a string (shouldn't happen with pdf-lib, but handle it)
      if (keywordsRaw.includes(',')) {
        keywordsArray = parseCommaDelimitedString(keywordsRaw);
      } else {
        // Legacy format: space-separated
        keywordsArray = keywordsRaw.split(/\s+/).filter(k => k.trim().length > 0);
      }
    }
    
    // Join with comma to send comma-delimited string to client
    const keywordsString = keywordsArray.join(',');
    
    const metadata = {
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate()?.toString() || '',
      modificationDate: pdfDoc.getModificationDate()?.toString() || '',
      keywords: keywordsString,
      pageCount: pdfDoc.getPageCount(),
      // Custom metadata (XMP)
      custom: {}
    };

    // Try to get custom properties if available
    try {
      const customProps = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
      if (customProps && customProps.get('Metadata')) {
        // Additional metadata extraction could go here
      }
    } catch (e) {
      // Ignore if custom metadata not available
    }

    res.json(metadata);
  } catch (error) {
    console.error('Error reading PDF metadata:', error);
    res.status(500).json({ error: 'Failed to read PDF metadata', details: error.message });
  }
});

// Serve PDF files
app.get('/pdfs/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = join(__dirname, 'pdfs', filename);
  
  if (!existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath);
});

// Endpoint to update PDF metadata
app.put('/api/metadata/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = join(__dirname, 'pdfs', filename);
    const { field, value } = req.body;
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (!field) {
      return res.status(400).json({ error: 'Field name is required' });
    }

    // Load the PDF
    const pdfBytes = await readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get old value before updating
    let oldValue = '';
    if (field === 'title') oldValue = pdfDoc.getTitle() || '';
    else if (field === 'author') oldValue = pdfDoc.getAuthor() || '';
    else if (field === 'subject') oldValue = pdfDoc.getSubject() || '';
    else if (field === 'keywords') {
      const oldKeywords = pdfDoc.getKeywords() || [];
      oldValue = Array.isArray(oldKeywords) ? oldKeywords.join(',') : String(oldKeywords);
    }
    
    // Update the specified field
    const fieldMap = {
      title: () => pdfDoc.setTitle(value || ''),
      author: () => pdfDoc.setAuthor(value || ''),
      subject: () => pdfDoc.setSubject(value || ''),
      creator: () => pdfDoc.setCreator(value || ''),
      producer: () => pdfDoc.setProducer(value || ''),
      // Keywords expects an array, split by comma and trim each keyword
      keywords: () => {
        const keywordsArray = value 
          ? value.split(',').map(k => k.trim()).filter(k => k.length > 0)
          : [];
        pdfDoc.setKeywords(keywordsArray);
      }
    };

    if (fieldMap[field]) {
      fieldMap[field]();
    } else {
      return res.status(400).json({ error: `Field '${field}' is not editable` });
    }

    // Save the updated PDF
    const updatedPdfBytes = await pdfDoc.save();
    await writeFile(filePath, updatedPdfBytes);

    // Log the activity
    await logActivity('metadata_update', {
      filename,
      field,
      oldValue,
      newValue: value || ''
    });

    res.json({ success: true, message: `Updated ${field}` });
  } catch (error) {
    console.error('Error updating PDF metadata:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update PDF metadata', details: error.message });
  }
});

// Endpoint to rename a PDF file
app.post('/api/rename/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const { newFilename } = req.body;
    const oldFilePath = join(__dirname, 'pdfs', filename);
    const newFilePath = join(__dirname, 'pdfs', newFilename);
    
    if (!newFilename) {
      return res.status(400).json({ error: 'New filename is required' });
    }
    
    // Ensure new filename has .pdf extension
    const finalNewFilename = newFilename.endsWith('.pdf') ? newFilename : `${newFilename}.pdf`;
    const finalNewFilePath = join(__dirname, 'pdfs', finalNewFilename);
    
    if (!existsSync(oldFilePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (existsSync(finalNewFilePath)) {
      return res.status(400).json({ error: 'A file with that name already exists' });
    }
    
    await rename(oldFilePath, finalNewFilePath);
    
    // Log the activity
    await logActivity('file_rename', {
      oldFilename: filename,
      newFilename: finalNewFilename
    });
    
    res.json({ success: true, message: 'File renamed successfully', newFilename: finalNewFilename });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Failed to rename file', details: error.message });
  }
});

// Get activity log
app.get('/api/activity-log', async (req, res) => {
  try {
    if (!existsSync(LOG_FILE)) {
      // Return empty array if file doesn't exist yet
      return res.json([]);
    }
    
    const logData = await readFile(LOG_FILE, 'utf-8');
    
    // Handle empty file
    if (!logData || logData.trim() === '') {
      return res.json([]);
    }
    
    let log;
    try {
      log = JSON.parse(logData);
    } catch (parseError) {
      console.error('Error parsing activity log JSON:', parseError);
      // If JSON is malformed, return empty array and reset the file
      await writeFile(LOG_FILE, JSON.stringify([], null, 2));
      return res.json([]);
    }
    
    // Ensure log is an array
    if (!Array.isArray(log)) {
      console.error('Activity log is not an array, resetting');
      await writeFile(LOG_FILE, JSON.stringify([], null, 2));
      return res.json([]);
    }
    
    // Return most recent entries first
    res.json(log.reverse());
  } catch (error) {
    console.error('Error reading activity log:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to read activity log', details: error.message });
  }
});

// List available PDFs (simple list)
app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfsDir = join(__dirname, 'pdfs');
    
    if (!existsSync(pdfsDir)) {
      return res.json([]);
    }

    const files = await readdir(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    res.json(pdfFiles);
  } catch (error) {
    console.error('Error listing PDFs:', error);
    res.status(500).json({ error: 'Failed to list PDFs', details: error.message });
  }
});

// Get files with metadata and update counts
app.get('/api/files-list', async (req, res) => {
  try {
    const pdfsDir = join(__dirname, 'pdfs');
    
    if (!existsSync(pdfsDir)) {
      return res.json([]);
    }

    const files = await readdir(pdfsDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    // Load activity log to count updates per file
    let activityLog = [];
    if (existsSync(LOG_FILE)) {
      try {
        const logData = await readFile(LOG_FILE, 'utf-8');
        if (logData && logData.trim() !== '') {
          activityLog = JSON.parse(logData);
        }
      } catch (e) {
        // Ignore log parsing errors
      }
    }
    
    // Count updates per file
    // Count all entries that reference this file in any way
    // This matches what would show in the activity log for that file
    const updateCounts = {};
    pdfFiles.forEach(filename => {
      let count = 0;
      activityLog.forEach(entry => {
        // metadata_update entries have filename
        if (entry.type === 'metadata_update' && entry.filename === filename) {
          count++;
        }
        // file_rename entries - count if file is involved (old or new name)
        else if (entry.type === 'file_rename') {
          if (entry.oldFilename === filename || entry.newFilename === filename) {
            count++;
          }
        }
        // pdf_split entries - count if file is the original or one of the created files
        else if (entry.type === 'pdf_split') {
          if (entry.originalFilename === filename) {
            count++;
          } else if (entry.createdFiles && entry.createdFiles.includes(filename)) {
            count++;
          }
        }
        // file_delete entries have filename
        else if (entry.type === 'file_delete' && entry.filename === filename) {
          count++;
        }
      });
      updateCounts[filename] = count;
    });
    
    // Get metadata for each file
    const filesWithMetadata = await Promise.all(
      pdfFiles.map(async (filename) => {
        try {
          const filePath = join(pdfsDir, filename);
          const pdfBytes = await readFile(filePath);
          const pdfDoc = await PDFDocument.load(pdfBytes);
          
          // Get keywords
          let keywordsRaw = pdfDoc.getKeywords() || [];
          let keywordsArray = [];
          if (Array.isArray(keywordsRaw)) {
            keywordsArray = keywordsRaw;
          } else if (typeof keywordsRaw === 'string') {
            if (keywordsRaw.includes(',')) {
              keywordsArray = parseCommaDelimitedString(keywordsRaw);
            } else {
              keywordsArray = keywordsRaw.split(/\s+/).filter(k => k.trim().length > 0);
            }
          }
          const keywordsString = keywordsArray.join(',');
          
          return {
            filename,
            title: pdfDoc.getTitle() || '',
            subject: pdfDoc.getSubject() || '',
            author: pdfDoc.getAuthor() || '',
            keywords: keywordsString,
            pageCount: pdfDoc.getPageCount(),
            updateCount: updateCounts[filename] || 0
          };
        } catch (error) {
          // If we can't read metadata, return basic info
          return {
            filename,
            title: '',
            subject: '',
            author: '',
            keywords: '',
            pageCount: 0,
            updateCount: updateCounts[filename] || 0
          };
        }
      })
    );
    
    res.json(filesWithMetadata);
  } catch (error) {
    console.error('Error getting files list:', error);
    res.status(500).json({ error: 'Failed to get files list', details: error.message });
  }
});

// Delete a PDF file
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = join(__dirname, 'pdfs', filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    await unlink(filePath);
    
    // Log the deletion
    await logActivity('file_delete', {
      filename
    });
    
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file', details: error.message });
  }
});

// Endpoint to split a PDF
app.post('/api/split', async (req, res) => {
  try {
    const { filename, splitPoints, metadata } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    if (!splitPoints || !Array.isArray(splitPoints) || splitPoints.length === 0) {
      return res.status(400).json({ error: 'Split points array is required' });
    }
    
    const filePath = join(__dirname, 'pdfs', filename);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Load the original PDF
    const pdfBytes = await readFile(filePath);
    const sourcePdf = await PDFDocument.load(pdfBytes);
    const totalPages = sourcePdf.getPageCount();
    
    // Validate split points (should be 1-indexed page numbers after which to split)
    const sortedSplitPoints = [...splitPoints].sort((a, b) => a - b);
    if (sortedSplitPoints[0] < 1 || sortedSplitPoints[sortedSplitPoints.length - 1] >= totalPages) {
      return res.status(400).json({ error: 'Split points must be between 1 and totalPages-1' });
    }
    
    // Generate base filename (without extension)
    const baseName = filename.replace(/\.pdf$/i, '');
    
    // Create split ranges: [startPage, endPage] for each split (1-indexed)
    const ranges = [];
    let startPage = 1;
    for (const splitPoint of sortedSplitPoints) {
      ranges.push([startPage, splitPoint]);
      startPage = splitPoint + 1;
    }
    // Add final range
    ranges.push([startPage, totalPages]);
    
    const createdFiles = [];
    
    // Create each split PDF
    for (let i = 0; i < ranges.length; i++) {
      const [startPage, endPage] = ranges[i];
      const pageCount = endPage - startPage + 1;
      
      // Create new PDF document
      const newPdf = await PDFDocument.create();
      
      // Copy pages from source PDF (pdf-lib uses 0-indexed pages)
      const pages = await newPdf.copyPages(sourcePdf, 
        Array.from({ length: pageCount }, (_, idx) => startPage - 1 + idx)
      );
      
      pages.forEach(page => newPdf.addPage(page));
      
      // Preserve metadata
      if (metadata) {
        if (metadata.title) newPdf.setTitle(metadata.title);
        if (metadata.subject) newPdf.setSubject(metadata.subject);
        if (metadata.author) newPdf.setAuthor(metadata.author);
        if (metadata.keywords) {
          // Keywords should be an array
          const keywordsArray = typeof metadata.keywords === 'string'
            ? metadata.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
            : (Array.isArray(metadata.keywords) ? metadata.keywords : []);
          if (keywordsArray.length > 0) {
            newPdf.setKeywords(keywordsArray);
          }
        }
      }
      
      // Preserve creator and producer from source
      const sourceCreator = sourcePdf.getCreator();
      const sourceProducer = sourcePdf.getProducer();
      if (sourceCreator) newPdf.setCreator(sourceCreator);
      if (sourceProducer) newPdf.setProducer(sourceProducer);
      
      // Generate filename with auto-numbering (001, 002, etc.)
      const fileNumber = String(i + 1).padStart(3, '0');
      let newFilename = `${baseName}-${fileNumber}.pdf`;
      let newFilePath = join(__dirname, 'pdfs', newFilename);
      
      // Check if file already exists
      if (existsSync(newFilePath)) {
        // Try alternative numbering
        let altNumber = 1;
        do {
          newFilename = `${baseName}-${fileNumber}-${altNumber}.pdf`;
          newFilePath = join(__dirname, 'pdfs', newFilename);
          altNumber++;
        } while (existsSync(newFilePath));
      }
      
      // Save the split PDF
      const newPdfBytes = await newPdf.save();
      await writeFile(newFilePath, newPdfBytes);
      
      createdFiles.push(newFilename);
    }
    
    // Log the activity
    await logActivity('pdf_split', {
      originalFilename: filename,
      splitPoints: splitPoints,
      createdFiles: createdFiles,
      totalPages: totalPages
    });
    
    res.json({ 
      success: true, 
      message: `PDF split into ${createdFiles.length} file(s)`,
      files: createdFiles 
    });
  } catch (error) {
    console.error('Error splitting PDF:', error);
    res.status(500).json({ error: 'Failed to split PDF', details: error.message });
  }
});

// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`PDF Metadata Viewer running at http://localhost:${PORT}`);
  console.log(`Place your PDF files in the 'pdfs' directory`);
});
