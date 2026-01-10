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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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
  
  console.log('parseCommaDelimitedString input:', str, 'output:', result);
  return result;
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
    
    // Special handling for keywords field
    if (field.key === 'keywords') {
      if (isEditing) {
        // Parse keywords from comma-delimited string or array
        let keywordsArray = [];
        if (value) {
          if (typeof value === 'string') {
            // Split by comma only, handle quoted strings
            keywordsArray = parseCommaDelimitedString(value);
          } else if (Array.isArray(value)) {
            keywordsArray = value.filter(k => k && k.length > 0);
          }
        }
        
        console.log('Parsing keywords for editing:', { value, keywordsArray });
        
        html += `
          <div class="metadata-item editing">
            <div class="metadata-label">${field.label}</div>
            <div class="tags-editor">
              <div class="tags-container" id="tags-container-${field.key}">
                ${keywordsArray.map((tag, idx) => `
                  <span class="tag" data-tag-index="${idx}">
                    ${escapeHtml(tag)}
                    <button class="tag-remove" data-tag-index="${idx}">×</button>
                  </span>
                `).join('')}
              </div>
              <div class="tag-input-container">
                <input type="text" 
                       class="tag-input" 
                       placeholder="Add a tag..."
                       data-field="${field.key}"
                       id="tag-input-${field.key}">
                <button class="save-btn" data-field="${field.key}">Save</button>
              </div>
            </div>
          </div>
        `;
      } else {
        // Display keywords as tags
        // Parse keywords - server returns comma-delimited string
        let keywordsArray = [];
        if (value) {
          if (typeof value === 'string') {
            console.log('Display: Received string value:', value, 'Type:', typeof value, 'Has commas:', value.includes(','));
            // Split by comma only, handle quoted strings
            keywordsArray = parseCommaDelimitedString(value);
            console.log('Display: After parsing:', keywordsArray);
            
            // If we got a single element with no commas in the original, it might be legacy space-separated data
            // For display purposes, if there's only one element and the original had spaces but no commas,
            // we should NOT split by spaces (user wants comma-delimited only)
            // The user needs to re-save the keywords properly as comma-delimited
          } else if (Array.isArray(value)) {
            console.log('Display: Received array value:', value);
            keywordsArray = value.filter(k => k && k.length > 0);
          }
        }
        
        console.log('Parsing keywords for display:', { value, keywordsArray, arrayLength: keywordsArray.length });
        
        const clickable = field.editable ? 'clickable' : '';
        
        html += `
          <div class="metadata-item">
            <div class="metadata-label">${field.label}</div>
            <div class="tags-display ${clickable}" 
                 data-field="${field.key}" 
                 ${field.editable ? 'data-editable="true"' : ''}>
              ${keywordsArray.length > 0 
                ? keywordsArray.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')
                : '<span class="empty">(empty)</span>'
              }
            </div>
          </div>
        `;
      }
    } else {
      // Regular field handling
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
  
  // Add save button handlers (excluding keywords which has its own handler)
  metadataDisplay.querySelectorAll('.save-btn').forEach(btn => {
    const field = btn.dataset.field;
    if (field !== 'keywords') {
      btn.addEventListener('click', handleSave);
    }
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
  
  // Special handling for keywords tag editor
  if (currentlyEditing === 'keywords') {
    const tagInput = document.getElementById('tag-input-keywords');
    const tagsContainer = document.getElementById('tags-container-keywords');
    const saveBtn = metadataDisplay.querySelector('.save-btn[data-field="keywords"]');
    
    // Handle tag input (Enter to add tag, comma also adds)
    if (tagInput) {
      tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const tagValue = tagInput.value.trim();
          if (tagValue) {
            addTag(tagValue);
            tagInput.value = '';
          }
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        }
      });
      
      tagInput.focus();
    }
    
    // Handle tag removal
    metadataDisplay.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.tagIndex);
        removeTag(index);
      });
    });
    
    // Save button handler for keywords
    if (saveBtn) {
      console.log('Attaching keywords save handler');
      saveBtn.addEventListener('click', (e) => {
        console.log('Keywords save button clicked');
        e.preventDefault();
        e.stopPropagation();
        handleKeywordsSave(e);
      });
    } else {
      console.log('Keywords save button not found');
    }
  }
}

function addTag(tagValue) {
  const tagsContainer = document.getElementById('tags-container-keywords');
  if (!tagsContainer) return;
  
  // Check if tag already exists
  const existingTags = Array.from(tagsContainer.querySelectorAll('.tag')).map(tag => 
    tag.textContent.replace('×', '').trim()
  );
  
  if (existingTags.includes(tagValue)) {
    return; // Don't add duplicates
  }
  
  const index = existingTags.length;
  const tagElement = document.createElement('span');
  tagElement.className = 'tag';
  tagElement.dataset.tagIndex = index;
  tagElement.innerHTML = `
    ${tagValue}
    <button class="tag-remove" data-tag-index="${index}">×</button>
  `;
  
  // Add remove handler
  tagElement.querySelector('.tag-remove').addEventListener('click', (e) => {
    e.stopPropagation();
    removeTag(index);
  });
  
  tagsContainer.appendChild(tagElement);
  
  // Update indices
  updateTagIndices();
}

function removeTag(index) {
  const tagsContainer = document.getElementById('tags-container-keywords');
  if (!tagsContainer) return;
  
  // Find tag by current index
  const tags = Array.from(tagsContainer.querySelectorAll('.tag'));
  const tag = tags.find(t => parseInt(t.dataset.tagIndex) === index);
  
  if (tag) {
    tag.remove();
    updateTagIndices();
  }
}

function updateTagIndices() {
  const tagsContainer = document.getElementById('tags-container-keywords');
  if (!tagsContainer) return;
  
  const tags = tagsContainer.querySelectorAll('.tag');
  tags.forEach((tag, newIndex) => {
    tag.dataset.tagIndex = newIndex;
    const removeBtn = tag.querySelector('.tag-remove');
    if (removeBtn) {
      removeBtn.dataset.tagIndex = newIndex;
    }
  });
}

function getKeywordsArray() {
  const tagsContainer = document.getElementById('tags-container-keywords');
  if (!tagsContainer) {
    console.log('Tags container not found');
    return [];
  }
  
  const tags = Array.from(tagsContainer.querySelectorAll('.tag'));
  console.log('Found tags:', tags.length);
  
  const keywords = tags.map(tag => {
    // Clone the tag to get text without the remove button
    const clone = tag.cloneNode(true);
    const removeBtn = clone.querySelector('.tag-remove');
    if (removeBtn) {
      removeBtn.remove();
    }
    // Get text content and clean it up
    let text = clone.textContent || clone.innerText || '';
    // Remove any remaining × characters or whitespace
    text = text.replace(/×/g, '').trim();
    return text;
  }).filter(tag => tag && tag.length > 0);
  
  console.log('Extracted keywords:', keywords);
  return keywords;
}

async function handleKeywordsSave(event) {
  const keywordsArray = getKeywordsArray();
  const keywordsString = keywordsArray.join(',');
  
  console.log('Saving keywords:', keywordsString);
  console.log('Current filename:', currentFilename);
  
  try {
    const requestBody = {
      field: 'keywords',
      value: keywordsString
    };
    console.log('Request body:', requestBody);
    
    const response = await fetch(`/api/metadata/${encodeURIComponent(currentFilename)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to save';
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const error = await response.json();
          errorMessage = error.error || error.details || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
      } else {
        errorMessage = response.statusText || `Server error (${response.status})`;
      }
      throw new Error(errorMessage);
    }
    
    await response.json();
    
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

function handleFieldClick(event) {
  if (currentlyEditing) {
    return; // Already editing a field
  }
  
  // Find the element with data-field attribute (might be clicked element or a parent)
  let target = event.target;
  let field = target.dataset.field;
  
  // If clicked on a tag or empty span, find the parent with data-field
  while (!field && target && target !== document.body) {
    target = target.parentElement;
    if (target) {
      field = target.dataset.field;
    }
  }
  
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
