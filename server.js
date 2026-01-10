import express from 'express';
import { readFile, readdir, writeFile } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

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
    
    const metadata = {
      title: pdfDoc.getTitle() || 'Untitled',
      author: pdfDoc.getAuthor() || 'Unknown',
      subject: pdfDoc.getSubject() || '',
      creator: pdfDoc.getCreator() || '',
      producer: pdfDoc.getProducer() || '',
      creationDate: pdfDoc.getCreationDate()?.toString() || '',
      modificationDate: pdfDoc.getModificationDate()?.toString() || '',
      keywords: pdfDoc.getKeywords() || '',
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
    
    console.log('Update request:', { filename, field, value });
    
    if (!existsSync(filePath)) {
      console.log('File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    if (!field) {
      return res.status(400).json({ error: 'Field name is required' });
    }

    // Load the PDF
    const pdfBytes = await readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Update the specified field
    const fieldMap = {
      title: () => pdfDoc.setTitle(value || ''),
      author: () => pdfDoc.setAuthor(value || ''),
      subject: () => pdfDoc.setSubject(value || ''),
      creator: () => pdfDoc.setCreator(value || ''),
      producer: () => pdfDoc.setProducer(value || ''),
      keywords: () => pdfDoc.setKeywords(value || '')
    };

    if (fieldMap[field]) {
      fieldMap[field]();
    } else {
      return res.status(400).json({ error: `Field '${field}' is not editable` });
    }

    // Save the updated PDF
    const updatedPdfBytes = await pdfDoc.save();
    await writeFile(filePath, updatedPdfBytes);

    console.log('Successfully updated:', field);
    res.json({ success: true, message: `Updated ${field}` });
  } catch (error) {
    console.error('Error updating PDF metadata:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to update PDF metadata', details: error.message });
  }
});

// List available PDFs
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
