// Store PDF list and current index
let pdfList = [];
let currentIndex = -1;
let currentFilename = '';
let currentlyEditing = null;

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
    currentFilename = pdfList[0];
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
  currentFilename = filename;
  currentlyEditing = null;
  
  await loadPDFPreview(filename);
  await loadPDFMetadata(filename);
  updateNavigationButtons();
}

function navigatePrevious() {
  if (currentIndex > 0) {
    currentIndex--;
    const filename = pdfList[currentIndex];
    currentFilename = filename;
    currentlyEditing = null;
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
    currentFilename = filename;
    currentlyEditing = null;
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

async function loadPDFPreview(filename, useCacheBust = false) {
  const preview = document.getElementById('pdf-preview');
  let pdfUrl = `/pdfs/${encodeURIComponent(filename)}`;
  
  if (useCacheBust) {
    pdfUrl += `?t=${Date.now()}`;
  }
  
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
    { key: 'title', label: 'Title', editable: true },
    { key: 'author', label: 'Author', editable: true },
    { key: 'subject', label: 'Subject', editable: true },
    { key: 'creator', label: 'Creator', editable: true },
    { key: 'producer', label: 'Producer', editable: true },
    { key: 'keywords', label: 'Keywords', editable: true },
    { key: 'creationDate', label: 'Creation Date', editable: false },
    { key: 'modificationDate', label: 'Modification Date', editable: false },
    { key: 'pageCount', label: 'Page Count', editable: false }
  ];
  
  let html = '';
  
  fields.forEach(field => {
    const value = metadata[field.key];
    const displayValue = value || (field.key === 'pageCount' ? '0' : '');
    const isEmpty = !value && field.key !== 'pageCount';
    const isEditing = currentlyEditing === field.key;
    
    if (isEditing) {
      // Show input field with save button
      html += `
        <div class="metadata-item editing">
          <div class="metadata-label">${field.label}</div>
          <div class="metadata-edit-container">
            <input type="text" 
                   class="metadata-input" 
                   value="${value || ''}" 
                   data-field="${field.key}"
                   id="edit-${field.key}">
            <button class="save-btn" data-field="${field.key}">Save</button>
          </div>
        </div>
      `;
    } else {
      // Show regular display
      const clickable = field.editable ? 'clickable' : '';
      html += `
        <div class="metadata-item">
          <div class="metadata-label">${field.label}</div>
          <div class="metadata-value ${isEmpty ? 'empty' : ''} ${clickable}" 
               data-field="${field.key}" 
               ${field.editable ? 'data-editable="true"' : ''}>
            ${isEmpty ? '(empty)' : displayValue}
          </div>
        </div>
      `;
    }
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
  
  // Add click handlers for editable fields
  metadataDisplay.querySelectorAll('[data-editable="true"]').forEach(el => {
    el.addEventListener('click', handleFieldClick);
  });
  
  // Add save button handlers
  metadataDisplay.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', handleSave);
  });
  
  // Add Enter key handler for input fields
  metadataDisplay.querySelectorAll('.metadata-input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const field = input.dataset.field;
        handleSave({ target: { dataset: { field } } });
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
    // Focus the input when it appears
    input.focus();
    input.select();
  });
}

function handleFieldClick(event) {
  if (currentlyEditing) {
    return; // Already editing a field
  }
  
  const field = event.target.dataset.field;
  if (!field) return;
  
  currentlyEditing = field;
  loadPDFMetadata(currentFilename);
}

function cancelEdit() {
  currentlyEditing = null;
  loadPDFMetadata(currentFilename);
}

async function handleSave(event) {
  const field = event.target.dataset.field;
  const input = document.getElementById(`edit-${field}`);
  const newValue = input.value;
  
  try {
    const response = await fetch(`/api/metadata/${encodeURIComponent(currentFilename)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        field: field,
        value: newValue
      })
    });
    
    if (!response.ok) {
      // Try to parse JSON error, but handle HTML error pages
      let errorMessage = 'Failed to save';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
      } else {
        // If it's HTML (like an error page), use status text
        errorMessage = response.statusText || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    
    // Success - reload metadata and clear editing state
    currentlyEditing = null;
    await loadPDFMetadata(currentFilename);
    
    // Reload preview to show updated PDF (with cache busting)
    await loadPDFPreview(currentFilename, true);
  } catch (error) {
    console.error('Error saving metadata:', error);
    alert(`Error saving: ${error.message}`);
  }
}
