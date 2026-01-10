// Load available PDFs on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadPDFList();
  
  const pdfSelect = document.getElementById('pdf-select');
  pdfSelect.addEventListener('change', handlePDFSelect);
});

async function loadPDFList() {
  try {
    const response = await fetch('/api/pdfs');
    const pdfs = await response.json();
    
    const select = document.getElementById('pdf-select');
    select.innerHTML = '<option value="">-- Choose a PDF --</option>';
    
    pdfs.forEach(pdf => {
      const option = document.createElement('option');
      option.value = pdf;
      option.textContent = pdf;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading PDF list:', error);
  }
}

async function handlePDFSelect(event) {
  const filename = event.target.value;
  
  if (!filename) {
    clearDisplay();
    return;
  }
  
  await loadPDFPreview(filename);
  await loadPDFMetadata(filename);
}

function clearDisplay() {
  const preview = document.getElementById('pdf-preview');
  preview.innerHTML = '<p class="placeholder">Select a PDF file to view</p>';
  
  const metadata = document.getElementById('metadata-display');
  metadata.innerHTML = '<p class="placeholder">No file selected</p>';
}

async function loadPDFPreview(filename) {
  const preview = document.getElementById('pdf-preview');
  const pdfUrl = `/pdfs/${encodeURIComponent(filename)}`;
  
  preview.innerHTML = `<iframe src="${pdfUrl}" type="application/pdf"></iframe>`;
}

async function loadPDFMetadata(filename) {
  try {
    const response = await fetch(`/api/metadata/${encodeURIComponent(filename)}`);
    const metadata = await response.json();
    
    displayMetadata(metadata);
  } catch (error) {
    console.error('Error loading metadata:', error);
    const metadataDisplay = document.getElementById('metadata-display');
    metadataDisplay.innerHTML = '<p class="placeholder">Error loading metadata</p>';
  }
}

function displayMetadata(metadata) {
  const metadataDisplay = document.getElementById('metadata-display');
  
  const fields = [
    { key: 'title', label: 'Title' },
    { key: 'author', label: 'Author' },
    { key: 'subject', label: 'Subject' },
    { key: 'creator', label: 'Creator' },
    { key: 'producer', label: 'Producer' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'creationDate', label: 'Creation Date' },
    { key: 'modificationDate', label: 'Modification Date' },
    { key: 'pageCount', label: 'Page Count' }
  ];
  
  let html = '';
  
  fields.forEach(field => {
    const value = metadata[field.key];
    const displayValue = value || (field.key === 'pageCount' ? '0' : '');
    const isEmpty = !value && field.key !== 'pageCount';
    
    html += `
      <div class="metadata-item">
        <div class="metadata-label">${field.label}</div>
        <div class="metadata-value ${isEmpty ? 'empty' : ''}">
          ${isEmpty ? '(empty)' : displayValue}
        </div>
      </div>
    `;
  });
  
  // Display custom metadata if available
  if (metadata.custom && Object.keys(metadata.custom).length > 0) {
    html += '<div class="metadata-item"><div class="metadata-label">Custom Properties</div></div>';
    Object.entries(metadata.custom).forEach(([key, value]) => {
      html += `
        <div class="metadata-item">
          <div class="metadata-label">${key}</div>
          <div class="metadata-value">${value}</div>
        </div>
      `;
    });
  }
  
  metadataDisplay.innerHTML = html;
}
