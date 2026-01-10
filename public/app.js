// Store PDF list and current index
let pdfList = [];
let currentIndex = -1;

// Load available PDFs on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadPDFList();
  
  const pdfSelect = document.getElementById('pdf-select');
  pdfSelect.addEventListener('change', handlePDFSelect);
  
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  prevBtn.addEventListener('click', navigatePrevious);
  nextBtn.addEventListener('click', navigateNext);
  
  // Auto-select first PDF if available
  if (pdfList.length > 0) {
    currentIndex = 0;
    pdfSelect.value = pdfList[0];
    await loadPDFPreview(pdfList[0]);
    await loadPDFMetadata(pdfList[0]);
    updateNavigationButtons();
  }
});

async function loadPDFList() {
  try {
    const response = await fetch('/api/pdfs');
    pdfList = await response.json();
    
    const select = document.getElementById('pdf-select');
    select.innerHTML = '<option value="">-- Choose a PDF --</option>';
    
    pdfList.forEach(pdf => {
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
    currentIndex = -1;
    updateNavigationButtons();
    return;
  }
  
  // Update current index based on selection
  currentIndex = pdfList.indexOf(filename);
  
  await loadPDFPreview(filename);
  await loadPDFMetadata(filename);
  updateNavigationButtons();
}

function navigatePrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    const filename = pdfList[currentIndex];
    const select = document.getElementById('pdf-select');
    select.value = filename;
    loadPDFPreview(filename);
    loadPDFMetadata(filename);
    updateNavigationButtons();
  }
}

function navigateNext() {
  if (currentIndex < pdfList.length - 1) {
    currentIndex++;
    const filename = pdfList[currentIndex];
    const select = document.getElementById('pdf-select');
    select.value = filename;
    loadPDFPreview(filename);
    loadPDFMetadata(filename);
    updateNavigationButtons();
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  prevBtn.disabled = currentIndex <= 0 || pdfList.length === 0;
  nextBtn.disabled = currentIndex >= pdfList.length - 1 || pdfList.length === 0;
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
