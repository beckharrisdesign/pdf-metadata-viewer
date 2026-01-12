# PDF Metadata Viewer

A simple, lightweight tool for viewing PDF files and their embedded metadata. Built with a focus on simplicity, open-source solutions, and minimal dependencies. This is the first tool in a suite for organizing scanned documents using embedded metadata and a custom tagging taxonomy.

## Features

- View PDF preview in browser
- Display embedded metadata (title, author, subject, keywords, dates, etc.)
- Simple, clean interface
- Minimal dependencies

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up OpenAI API key (for AI suggestions feature):
   - Create a `.env` file in the project root
   - Add: `OPENAI_API_KEY=your-api-key-here`
   - Or set the environment variable: `export OPENAI_API_KEY=your-api-key-here`

3. (Optional) Configure PDFs directory:
   - By default, PDFs are expected in the `pdfs` directory
   - To use a different location, set the `PDFS_DIR` environment variable:
     - Relative path: `PDFS_DIR=my-pdfs` (relative to project root)
     - Absolute path: `PDFS_DIR=/path/to/your/pdfs`
   - Or add to `.env`: `PDFS_DIR=/path/to/your/pdfs`

4. Place your PDF files in the configured directory (default: `pdfs`)

5. Start the server:
```bash
npm start
```

6. Open your browser to `http://localhost:3000`

## Usage

1. Select a PDF from the dropdown menu
2. View the PDF preview on the left
3. See all embedded metadata on the right

## Project Structure

```
pdf-metadata-viewer/
├── server.js          # Express server with API endpoints
├── public/            # Frontend files
│   ├── index.html     # Main HTML page
│   ├── styles.css     # Styling
│   └── app.js         # Client-side JavaScript
└── pdfs/              # Place your PDF files here (or set PDFS_DIR env var)
```

## Dependencies

- **express**: Minimal web server
- **pdf-lib**: PDF metadata extraction
