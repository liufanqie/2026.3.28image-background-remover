/**
 * Image Background Remover - Frontend Logic
 */

const DOM = {
  uploadArea: document.getElementById('uploadArea'),
  fileInput: document.getElementById('fileInput'),
  selectBtn: document.getElementById('selectBtn'),
  loadingArea: document.getElementById('loadingArea'),
  previewArea: document.getElementById('previewArea'),
  originalImage: document.getElementById('originalImage'),
  processedImage: document.getElementById('processedImage'),
  downloadBtn: document.getElementById('downloadBtn'),
  resetBtn: document.getElementById('resetBtn'),
  errorArea: document.getElementById('errorArea'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn')
};

// API endpoint (relative path for Cloudflare Workers)
const API_ENDPOINT = '/api/remove';

// Event Listeners
DOM.selectBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  DOM.fileInput.click();
});

DOM.uploadArea.addEventListener('click', () => {
  DOM.fileInput.click();
});

DOM.fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
DOM.uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  DOM.uploadArea.classList.add('dragover');
});

DOM.uploadArea.addEventListener('dragleave', () => {
  DOM.uploadArea.classList.remove('dragover');
});

DOM.uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  DOM.uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
});

// Download button
DOM.downloadBtn.addEventListener('click', downloadImage);

// Reset button
DOM.resetBtn.addEventListener('click', reset);
DOM.retryBtn.addEventListener('click', reset);

/**
 * Handle file selection
 */
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    processFile(file);
  }
}

/**
 * Process the selected file
 */
async function processFile(file) {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showError('不支持的文件格式，请上传 JPG、PNG 或 WebP 图片');
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    showError('文件大小超过 10MB 限制');
    return;
  }

  showLoading();

  // Show original image preview
  const reader = new FileReader();
  reader.onload = (e) => {
    DOM.originalImage.src = e.target.result;
  };
  reader.readAsDataURL(file);

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Call API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    // Get processed image
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    DOM.processedImage.src = imageUrl;
    showPreview();

  } catch (error) {
    console.error('Error:', error);
    showError(error.message || '处理失败，请重试');
  }
}

/**
 * Download the processed image
 */
function downloadImage() {
  const link = document.createElement('a');
  link.href = DOM.processedImage.src;
  link.download = 'removed-bg.png';
  link.click();
}

/**
 * UI State Functions
 */
function showLoading() {
  DOM.uploadArea.classList.add('hidden');
  DOM.previewArea.classList.add('hidden');
  DOM.errorArea.classList.add('hidden');
  DOM.loadingArea.classList.remove('hidden');
}

function showPreview() {
  DOM.loadingArea.classList.add('hidden');
  DOM.errorArea.classList.add('hidden');
  DOM.previewArea.classList.remove('hidden');
}

function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.loadingArea.classList.add('hidden');
  DOM.previewArea.classList.add('hidden');
  DOM.errorArea.classList.remove('hidden');
}

function reset() {
  DOM.fileInput.value = '';
  DOM.originalImage.src = '';
  DOM.processedImage.src = '';
  DOM.loadingArea.classList.add('hidden');
  DOM.previewArea.classList.add('hidden');
  DOM.errorArea.classList.add('hidden');
  DOM.uploadArea.classList.remove('hidden');
}
