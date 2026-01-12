import 'dotenv/config';
import express from 'express';
import { readFile, readdir, writeFile, rename, unlink } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import OpenAI from 'openai';

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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Get PDFs directory path from environment variable or default to 'pdfs'
function getPDFsDirectory() {
  const pdfsDir = process.env.PDFS_DIR || 'pdfs';
  // If it's an absolute path, use it as-is; otherwise, make it relative to project root
  if (pdfsDir.startsWith('/') || (process.platform === 'win32' && /^[A-Z]:/.test(pdfsDir))) {
    return pdfsDir;
  }
  return join(__dirname, pdfsDir);
}

const PDFS_DIR = getPDFsDirectory();

// Activity log file path
const LOG_FILE = join(__dirname, 'activity-log.json');

// Taxonomy file paths
const TAXONOMY_TAGS_FILE = join(__dirname, 'docs', 'pdf_organization_tags.md');
const TAXONOMY_ENTITIES_FILE = join(__dirname, 'docs', 'tag_entity_database.md');
const PROMPT_TEMPLATE_FILE = join(__dirname, 'docs', 'ai-prompt-template.md');

// Load and cache taxonomy
let taxonomyCache = null;

async function loadTaxonomy() {
  if (taxonomyCache) {
    return taxonomyCache;
  }

  try {
    const tagsContent = await readFile(TAXONOMY_TAGS_FILE, 'utf-8');
    const entitiesContent = await readFile(TAXONOMY_ENTITIES_FILE, 'utf-8');

    // Extract document types
    const docTypesMatch = tagsContent.match(/### 1\. DOCUMENT TYPE TAGS[\s\S]*?(?=### 2\.|$)/);
    const docTypes = docTypesMatch 
      ? [...docTypesMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract category tags
    const categoryMatch = tagsContent.match(/### 2\. CATEGORY TAGS[\s\S]*?(?=### 3\.|$)/);
    const categories = categoryMatch
      ? [...categoryMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract action tags
    const actionMatch = tagsContent.match(/### 5\. ACTION TAGS[\s\S]*?(?=### 6\.|$)/);
    const actions = actionMatch
      ? [...actionMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract status tags
    const statusMatch = tagsContent.match(/### 7\. STATUS TAGS[\s\S]*?(?=### 8\.|$)/);
    const statuses = statusMatch
      ? [...statusMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract special flags
    const specialMatch = tagsContent.match(/### 8\. SPECIAL FLAGS[\s\S]*?(?=### 9\.|$)/);
    const specials = specialMatch
      ? [...specialMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract location tags
    const locationMatch = tagsContent.match(/### 9\. LOCATION TAGS[\s\S]*?(?=---|$)/);
    const locations = locationMatch
      ? [...locationMatch[0].matchAll(/`([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract people from entity database
    const peopleMatch = entitiesContent.match(/## People Registry[\s\S]*?(?=## Vendor|$)/);
    const people = peopleMatch
      ? [...peopleMatch[0].matchAll(/\| `([^`]+)`/g)].map(m => m[1])
      : [];

    // Extract vendors from entity database (all vendor slugs)
    const vendorMatches = [...entitiesContent.matchAll(/\| `([^`]+)` \|/g)];
    const vendors = vendorMatches
      .map(m => m[1])
      .filter(v => !people.includes(v)); // Remove people from vendor list

    taxonomyCache = {
      documentTypes: docTypes,
      categories: categories,
      actions: actions,
      statuses: statuses,
      specials: specials,
      locations: locations,
      people: people,
      vendors: vendors
    };

    return taxonomyCache;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    // Return empty taxonomy if files don't exist
    return {
      documentTypes: [],
      categories: [],
      actions: [],
      statuses: [],
      specials: [],
      locations: [],
      people: [],
      vendors: []
    };
  }
}

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

// Parse JSON bodies with increased limit for image data
app.use(express.json({ limit: '10mb' }));

// Endpoint to get PDF metadata
app.get('/api/metadata/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = join(PDFS_DIR, filename);
    
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
  const filePath = join(PDFS_DIR, filename);
  
  if (!existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath);
});

// Endpoint to update PDF metadata
app.put('/api/metadata/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = join(PDFS_DIR, filename);
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
    const oldFilePath = join(PDFS_DIR, filename);
    const newFilePath = join(PDFS_DIR, newFilename);
    
    if (!newFilename) {
      return res.status(400).json({ error: 'New filename is required' });
    }
    
    // Ensure new filename has .pdf extension
    const finalNewFilename = newFilename.endsWith('.pdf') ? newFilename : `${newFilename}.pdf`;
    const finalNewFilePath = join(PDFS_DIR, finalNewFilename);
    
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
    const pdfsDir = PDFS_DIR;
    
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
    const pdfsDir = PDFS_DIR;
    
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
    const filePath = join(PDFS_DIR, filename);
    
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
    
    const filePath = join(PDFS_DIR, filename);
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
      let newFilePath = join(PDFS_DIR, newFilename);
      
      // Check if file already exists
      if (existsSync(newFilePath)) {
        // Try alternative numbering
        let altNumber = 1;
        do {
          newFilename = `${baseName}-${fileNumber}-${altNumber}.pdf`;
          newFilePath = join(PDFS_DIR, newFilename);
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

// Get AI suggestions for PDF metadata
app.post('/api/ai-suggestions/:filename', async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = join(PDFS_DIR, filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    // Get images from request body (sent from frontend)
    const { images: pageImages } = req.body;
    
    if (!pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      return res.status(400).json({ error: 'No images provided. Please ensure the PDF preview is loaded.' });
    }
    
    // Get current metadata for context
    const pdfBytes = await readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const currentTitle = pdfDoc.getTitle() || '';
    const currentSubject = pdfDoc.getSubject() || '';
    const currentKeywords = pdfDoc.getKeywords() || [];
    const currentKeywordsStr = Array.isArray(currentKeywords) ? currentKeywords.join(', ') : String(currentKeywords);
    
    // Load taxonomy
    const taxonomy = await loadTaxonomy();
    
    // Build taxonomy reference text
    const taxonomyText = `
TAGGING TAXONOMY - You MUST use these exact tag slugs:

DOCUMENT TYPES (use 1-2): ${taxonomy.documentTypes.slice(0, 20).join(', ')}${taxonomy.documentTypes.length > 20 ? ' (and more)' : ''}

CATEGORIES (use 1-2): ${taxonomy.categories.join(', ')}

ACTIONS (use if applicable): ${taxonomy.actions.join(', ')}

STATUS (use if applicable): ${taxonomy.statuses.join(', ')}

SPECIAL FLAGS (use if applicable): ${taxonomy.specials.join(', ')}

LOCATIONS (use if applicable): ${taxonomy.locations.join(', ')}

PEOPLE (use exact slugs if found): ${taxonomy.people.join(', ')}

VENDORS (use exact slugs if found, first 30): ${taxonomy.vendors.slice(0, 30).join(', ')}${taxonomy.vendors.length > 30 ? ' (and more)' : ''}

CRITICAL RULES:
- Use EXACT tag slugs from the lists above - do not create new tags
- For people: Use format fname-mname-lname (e.g., "katherine-b-harris", "john-n-pierce")
- For vendors: Use exact vendor slugs (e.g., "heb", "arc", "pnc", "rrisd")
- Combine multiple tags with commas, no spaces (e.g., "receipt,grocery,heb,paid")
- Include document type, category, vendor (if found), person (if found), and action/status tags
- Add time period tags if date is clear (e.g., "year-2025", "month-03")
`;

    // Build content array with text prompt and images
    const content = [
      {
        type: 'text',
        text: `Analyze this scanned document image and suggest appropriate metadata values using the predefined tagging taxonomy.

Current metadata:
- Title: ${currentTitle || '(empty)'}
- Subject: ${currentSubject || '(empty)'}
- Keywords: ${currentKeywordsStr || '(empty)'}

${taxonomyText}

Please provide suggestions in JSON format with the following structure:
{
  "filename": "suggested-filename-without-extension",
  "title": "concise descriptive title",
  "subject": "document category or subject",
  "keywords": "keyword1,keyword2,keyword3"
}

Guidelines:
- Filename: Use format YYYY-MM-DD — Type — Subject or Vendor — Person or persons.pdf (use em dashes — to separate sections, regular dashes only between date parts YYYY-MM-DD). Required elements: Date (YYYY-MM-DD), Document Type (receipt, invoice, bill, etc.), Subject/Vendor (category like "Grocery" or vendor name in title case like "HEB", "ARC", "PNC" - use recognizable vendor name from taxonomy), and Person (if document relates to specific person like "Alexandra" or "Felix"). If no date found, start with Type. No file extension.
- Title: Concise, descriptive title (max 100 characters)
- Subject: Concise summary of the document based on its content (10 words or less, max 50 characters)
- Keywords: 3-10 relevant tags as comma-separated values (NO SPACES), using EXACT slugs from the taxonomy above
- MUST use exact tag slugs - do not invent new tags
- Include: document type, category, vendor (if recognized), person (if found), action/status tags, and time period if date is clear

Return ONLY valid JSON, no other text.`
      }
    ];
    
    // Add all page images to the content
    pageImages.forEach(imageBase64 => {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${imageBase64}`
        }
      });
    });
    
    // Load system message from template (or use default)
    let systemMessage = 'You are a helpful assistant that analyzes scanned document images and suggests appropriate metadata. Always respond with valid JSON only.';
    try {
      const templateContent = await readFile(PROMPT_TEMPLATE_FILE, 'utf-8');
      const systemMatch = templateContent.match(/## System Message\s*```\s*([\s\S]*?)\s*```/);
      if (systemMatch) {
        systemMessage = systemMatch[1].trim();
      }
    } catch (error) {
      // Use default system message
    }

    // Call OpenAI Vision API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    const responseText = completion.choices[0].message.content.trim();
    
    // Parse JSON response
    let suggestions;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Response was:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response', details: parseError.message });
    }
    
    // Validate and format suggestions
    const result = {
      filename: suggestions.filename || filename.replace(/\.pdf$/i, ''),
      title: suggestions.title || '',
      subject: suggestions.subject || '',
      keywords: Array.isArray(suggestions.keywords) 
        ? suggestions.keywords.join(',') 
        : (typeof suggestions.keywords === 'string' ? suggestions.keywords : '')
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    res.status(500).json({ error: 'Failed to get AI suggestions', details: error.message });
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
  console.log(`PDFs directory: ${PDFS_DIR}`);
  console.log(`(Set PDFS_DIR environment variable to use a different location)`);
});
