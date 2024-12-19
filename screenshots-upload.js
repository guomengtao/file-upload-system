(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const imagePreview = document.getElementById('imagePreview');
    const errorDetails = document.getElementById('errorDetails');
    const errorMessage = document.getElementById('errorMessage');
    const errorContext = document.getElementById('errorContext');
    const dismissErrorBtn = document.getElementById('dismissErrorBtn');
    const statusPanel = document.getElementById('statusPanel');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const statusMessage = document.getElementById('statusMessage');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');

    // Upload cancellation
    let uploadController = null;

    // Image preview
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Debounce function to prevent multiple rapid clicks
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                timeoutId = null;
            }, delay);
        };
    }

    // Show Error Details
    function showErrorDetails(message, context = '') {
        errorMessage.textContent = message;
        errorContext.textContent = context;
        errorDetails.style.display = 'block';
    }

    // Hide Error Details
    function hideErrorDetails() {
        errorDetails.style.display = 'none';
    }

    // Show Upload Status
    function showUploadStatus(message, progress = 0) {
        statusMessage.textContent = message;
        uploadProgressBar.style.width = `${progress}%`;
        uploadProgressBar.setAttribute('aria-valuenow', progress);
        uploadProgressBar.textContent = `${progress}%`;
        statusPanel.style.display = 'block';
    }

    // Hide Upload Status
    function hideUploadStatus() {
        statusPanel.style.display = 'none';
        uploadProgressBar.style.width = '0%';
        uploadProgressBar.setAttribute('aria-valuenow', 0);
        uploadProgressBar.textContent = '0%';
        statusMessage.textContent = 'No upload in progress';
    }

    // Format file size
    function formatFileSize(size) {
        if (size < 1024) {
            return `${size} bytes`;
        } else if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${(size / 1024 / 1024).toFixed(2)} MB`;
        }
    }

    // Upload file function
    async function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            showErrorDetails('No file selected', 'Please choose a screenshot before uploading');
            return;
        }

        // Reset previous states
        hideErrorDetails();
        showUploadStatus('Preparing upload...', 10);

        try {
            // Validate file size and type
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File is too large. Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed. Supported types: ${ALLOWED_TYPES.join(', ')}`);
            }

            // Create an AbortController for cancellation
            uploadController = new AbortController();
            const signal = uploadController.signal;

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Generate a unique filename with timestamp and random string
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExt = file.name.split('.').pop();
            const fileName = `screenshot_${timestamp}_${randomString}.${fileExt}`;

            // Detailed upload attempt with comprehensive error handling
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('screenshots')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true  // Allow overwriting existing files
                });

            if (uploadError) {
                console.error('Supabase storage upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL for the uploaded file
            const { data: urlData } = supabase.storage
                .from('screenshots')
                .getPublicUrl(fileName);

            // Prepare file metadata
            const fileMetadata = {
                name: file.name,
                size: file.size,
                type: file.type,
                path: urlData.publicUrl,
                status: 'active',
                created_at: new Date().toISOString()
            };

            // Insert metadata into screenshots table (optional, if you have a table)
            const { data: metadataInsert, error: metadataError } = await supabase
                .from('screenshots')
                .insert(fileMetadata);

            // Log any metadata insertion errors (but don't stop the process)
            if (metadataError) {
                console.warn('Metadata insertion warning:', metadataError);
            }

            // Final status
            showUploadStatus('Upload complete!', 100);
            setTimeout(hideUploadStatus, 3000);

            // Clear file input and preview
            fileInput.value = '';
            imagePreview.style.display = 'none';
            imagePreview.src = '#';

            // Prepare success details
            const successDetails = {
                fileName: fileName,
                fileSize: formatFileSize(file.size),
                uploadTime: new Date().toLocaleString(),
                publicUrl: urlData.publicUrl
            };

            // Show success message with more details
            errorDetails.classList.remove('alert-danger');
            errorDetails.classList.add('alert-success');
            
            // Create a more informative success message
            const successMessage = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="alert-heading mb-2">
                            <i class="bi bi-check-circle-fill text-success me-2"></i>Screenshot Uploaded
                        </h4>
                        <p class="mb-1">
                            <strong>Filename:</strong> ${successDetails.fileName}
                        </p>
                        <p class="mb-1">
                            <strong>Size:</strong> ${successDetails.fileSize}
                        </p>
                        <p class="mb-1">
                            <strong>Uploaded:</strong> ${successDetails.uploadTime}
                        </p>
                    </div>
                    <div>
                        <a href="${successDetails.publicUrl}" 
                           target="_blank" 
                           class="btn btn-sm btn-outline-success">
                            <i class="bi bi-eye me-1"></i>View
                        </a>
                    </div>
                </div>
            `;

            // Display the success message
            errorDetails.innerHTML = successMessage;
            errorDetails.style.display = 'block';

            // Optional: Auto-hide after a delay
            setTimeout(() => {
                errorDetails.style.display = 'none';
            }, 8000);
        } catch (error) {
            console.error('Complete upload error:', error);
            
            // Detailed error handling
            const errorContext = 
                error.message || 
                error.details || 
                error.hint || 
                'An unexpected error occurred during screenshot upload';
            
            // Log full error object for debugging
            console.error('Full error object:', error);

            showErrorDetails('Failed to upload screenshot', errorContext);
            
            hideUploadStatus();
        } finally {
            uploadController = null;
        }
    }

    // Cancel Upload
    function cancelUpload() {
        if (uploadController) {
            uploadController.abort();
        }
    }

    // Debounced upload function
    const debouncedUpload = debounce(uploadFile, 300);

    // Event Listeners
    uploadBtn.addEventListener('click', debouncedUpload);
    dismissErrorBtn.addEventListener('click', () => {
        hideErrorDetails();
        errorDetails.classList.remove('alert-success');
        errorDetails.classList.add('alert-danger');
    });
    cancelUploadBtn.addEventListener('click', cancelUpload);
})();
