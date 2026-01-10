import express from 'express';
import { readFile, readdir } from 'fs/promises';
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

app.listen(PORT, () => {
  console.log(`PDF Metadata Viewer running at http://localhost:${PORT}`);
  console.log(`Place your PDF files in the 'pdfs' directory`);
});
