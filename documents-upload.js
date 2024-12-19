(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const filePreview = document.getElementById('filePreview');
    const fileTypePreview = document.getElementById('fileTypePreview');
    const errorDetails = document.getElementById('errorDetails');
    const errorMessage = document.getElementById('errorMessage');
    const errorContext = document.getElementById('errorContext');
    const dismissErrorBtn = document.getElementById('dismissErrorBtn');

    // File type icons mapping
    const FILE_TYPE_ICONS = {
        'application/pdf': 'bi-file-earmark-pdf text-danger',
        'application/msword': 'bi-file-earmark-word text-primary',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bi-file-earmark-word text-primary',
        'text/plain': 'bi-file-earmark-text text-secondary',
        'image/jpeg': 'bi-file-earmark-image text-warning',
        'image/png': 'bi-file-earmark-image text-info',
        'image/gif': 'bi-file-earmark-image text-success',
        'default': 'bi-file-earmark text-muted'
    };

    // File preview and type detection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Update file type icon
            const fileTypeIcon = FILE_TYPE_ICONS[file.type] || FILE_TYPE_ICONS['default'];
            fileTypePreview.innerHTML = `<i class="bi ${fileTypeIcon}"></i>`;

            // Preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    filePreview.src = e.target.result;
                    filePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                filePreview.style.display = 'none';
            }
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

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Upload file function
    async function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            showErrorDetails('No File Selected', 'Please choose a file to upload');
            return;
        }

        try {
            // Validate file size and type
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const ALLOWED_TYPES = [
                'application/pdf', 
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                'text/plain', 
                'image/jpeg', 
                'image/png', 
                'image/gif'
            ];

            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File is too large. Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed. Supported types: ${ALLOWED_TYPES.join(', ')}`);
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Generate a unique filename
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExt = file.name.split('.').pop();
            const fileName = `document_${timestamp}_${randomString}.${fileExt}`;

            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL for the uploaded file
            const { data: urlData } = supabase.storage
                .from('documents')
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

            // Insert metadata into documents table
            const { data: metadataInsert, error: metadataError } = await supabase
                .from('documents')
                .insert(fileMetadata);

            if (metadataError) {
                console.warn('Metadata insertion warning:', metadataError);
            }

            // Prepare success details
            const successDetails = {
                fileName: fileName,
                fileSize: formatFileSize(file.size),
                uploadTime: new Date().toLocaleString(),
                publicUrl: urlData.publicUrl
            };

            // Show success message
            errorDetails.classList.remove('alert-danger');
            errorDetails.classList.add('alert-success');
            
            // Create a more informative success message
            const successMessage = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="alert-heading mb-2">
                            <i class="bi bi-check-circle-fill text-success me-2"></i>Document Uploaded
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

            // Reset form and preview
            fileInput.value = '';
            filePreview.style.display = 'none';
            fileTypePreview.innerHTML = '<i class="bi bi-file-earmark-text"></i>';

            // Optional: Auto-hide success message
            setTimeout(() => {
                errorDetails.style.display = 'none';
            }, 8000);

        } catch (error) {
            console.error('Complete upload error:', error);
            
            // Show error details
            showErrorDetails(
                'Upload Failed', 
                error.message || 'An unexpected error occurred during file upload'
            );
        }
    }

    // Show Error Details
    function showErrorDetails(title, context = '') {
        errorDetails.classList.remove('alert-success');
        errorDetails.classList.add('alert-danger');
        errorMessage.textContent = title;
        errorContext.textContent = context;
        errorDetails.style.display = 'block';
    }

    // Hide Error Details
    function hideErrorDetails() {
        errorDetails.style.display = 'none';
    }

    // Event Listeners
    const debouncedUpload = debounce(uploadFile, 300);
    uploadBtn.addEventListener('click', debouncedUpload);
    dismissErrorBtn.addEventListener('click', hideErrorDetails);
})();
