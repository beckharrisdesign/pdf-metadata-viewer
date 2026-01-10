# PDF Document Organizer - Product Requirements Document

## Problem Statement
Managing personal and household documents after scanning/photographing is time-consuming. Users need a simple way to organize PDFs and images with consistent metadata tagging without complex workflows.

## Core Workflow
1. Point application at directory of PDFs/images
2. Application loads first document in queue
3. User reviews document preview
4. User either:
   - Manually edits metadata (title, subject, keywords)
   - Requests LLM analysis to suggest metadata values
5. User saves and moves to next document
6. Repeat until queue is processed

## Key Features

### Document Viewing
- Display PDF/image preview
- Show current embedded metadata
- Navigate through document queue with arrow keys/buttons

### Metadata Editing
- Edit title, subject, and keywords fields
- Tag-based keyword editor with add/remove functionality
- Keywords stored as comma-delimited values in PDF metadata

### AI-Assisted Tagging
- LLM analyzes document content
- Suggests values for: title, subject, keywords
- User can accept, modify, or reject suggestions

### Tag Taxonomy
- Lightweight database (markdown file) of standardized tag slugs
- People registry: `fname-mname-lname` format
- Vendor/provider registry: categorized by type (retail, medical, financial, etc.)
- Validates suggested keywords against taxonomy

### Activity Log
- Track which documents were updated
- Record metadata changes
- Timestamp of updates

## Technical Constraints
- Simple, open-source solutions preferred
- Minimal dependencies
- Node.js stack
- PDF metadata stored in embedded PDF fields
- Comma-delimited keyword format (no spaces)

## Success Criteria
- User can process a batch of documents efficiently
- Metadata is consistently tagged using taxonomy
- Documents are searchable by embedded metadata
- Workflow is sustainable for quarterly batch processing

## Future Enhancements
- Point application at cloud directories (Google Drive, Dropbox, etc.)
- Autonomous batch updates via AI agent
- Reporting and analytics on document processing
- Editing additional metadata fields beyond title, subject, keywords
- Duplicate detection across document collection
- Optimizing AI prompts for better metadata suggestions
- OCR text extraction where PDF supports it
- PDF splitter mode: Split multi-page PDFs into individual files, preserving metadata and allowing batch organization