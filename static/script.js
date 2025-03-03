// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.querySelector('.upload-progress');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const pdfContainer = document.getElementById('pdf-container');

// Current PDF state
let currentPDF = null;
let pagesRendered = new Set();
let observer = null;

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        uploadFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file);
    }
});

// File upload function
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    uploadProgress.hidden = false;
    progressFill.style.width = '0%';
    progressText.textContent = 'Bersiap mengunggah...';

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progressFill.style.width = `${percentCompleted}%`;
                progressText.textContent = `Sedang mengunggah... ${percentCompleted}%`;
            }
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();
        if (data.success) {
            progressFill.style.width = '100%';
            progressText.textContent = 'Mengunggah berhasil!';
            uploadProgress.classList.add('show');
            setTimeout(() => {
                uploadProgress.classList.remove('show');
                uploadProgress.hidden = true;
                refreshPDFList();
            }, 2000);
        }
    } catch (error) {
        console.error('Error:', error);
        progressText.textContent = 'Gagal mengunggah. Silakan coba lagi.';
        progressFill.style.width = '0%';
        setTimeout(() => {
            uploadProgress.hidden = true;
        }, 3000);
    }
}

// Refresh PDF list
async function refreshPDFList() {
    try {
        const response = await fetch('/pdfs');
        const pdfs = await response.json();
        const pdfList = document.querySelector('.pdf-list');
        pdfList.innerHTML = pdfs.map(pdf => `
            <div class="pdf-item" data-filename="${pdf}">
                <span class="pdf-icon">📄</span>
                <span class="pdf-name">${pdf}</span>
            </div>
        `).join('');

        // Add click handlers to new items
        document.querySelectorAll('.pdf-item').forEach(item => {
            item.addEventListener('click', () => loadPDF(item.dataset.filename));
        });
    } catch (error) {
        console.error('Error refreshing PDF list:', error);
    }
}

// Load and display PDF
async function loadPDF(filename) {
    try {
        // Cleanup previous PDF
        cleanupPDF();

        // Show loading message
        pdfContainer.innerHTML = '<div class="no-pdf-message"><p>Loading PDF...</p></div>';

        const loadingTask = pdfjsLib.getDocument(`/data/${filename}`);
        currentPDF = await loadingTask.promise;

        // Create container for all pages
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'pdf-pages';
        pdfContainer.innerHTML = '';
        pdfContainer.appendChild(pagesContainer);

        // Create page placeholders
        for (let pageNum = 1; pageNum <= currentPDF.numPages; pageNum++) {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page';
            pageContainer.dataset.pageNum = pageNum;
            pageContainer.style.minHeight = '800px'; // Placeholder height
            pagesContainer.appendChild(pageContainer);
        }

        // Setup intersection observer for lazy loading
        setupIntersectionObserver();
    } catch (error) {
        console.error('Error loading PDF:', error);
        pdfContainer.innerHTML = `<div class="no-pdf-message"><p>Error loading PDF: ${error.message}</p></div>`;
    }
}

// Setup intersection observer for lazy loading
function setupIntersectionObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.pageNum);
                if (!pagesRendered.has(pageNum)) {
                    renderPage(pageNum, entry.target);
                }
            }
        });
    }, {
        rootMargin: '100px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.pdf-page').forEach(page => {
        observer.observe(page);
    });
}

// Render PDF page
async function renderPage(pageNumber, container) {
    if (!currentPDF || pagesRendered.has(pageNumber)) return;

    try {
        const page = await currentPDF.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Set canvas dimensions based on viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'pdf-loading';
        loadingIndicator.textContent = 'Rendering page...';
        container.appendChild(loadingIndicator);

        await page.render(renderContext).promise;
        
        // Remove loading indicator
        loadingIndicator.remove();

        // Add canvas to container
        container.innerHTML = '';
        container.appendChild(canvas);
        pagesRendered.add(pageNumber);

        // Cleanup page object
        page.cleanup();
    } catch (error) {
        console.error('Error rendering page:', error);
        container.innerHTML = `<div class="no-pdf-message"><p>Error rendering page: ${error.message}</p></div>`;
    }
}

// Cleanup PDF resources
function cleanupPDF() {
    if (currentPDF) {
        currentPDF.destroy();
        currentPDF = null;
    }
    if (observer) {
        observer.disconnect();
        observer = null;
    }
    pagesRendered.clear();
}

// Chat functionality
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user-message');
    chatInput.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        if (data.response) {
            addMessage(data.response, 'bot-message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage('Sorry, there was an error processing your request.', 'bot-message');
    }
}

function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initial PDF list load
refreshPDFList();