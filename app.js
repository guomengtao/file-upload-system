// Comprehensive Supabase Configuration and Initialization
(function() {
    // Validate global Supabase object
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Please include the Supabase script before app.js.');
        
        // Create a visible error message on the page
        function showSupabaseLoadError() {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <h4>⚠️ Supabase Library Loading Error</h4>
                <p>The Supabase JavaScript library could not be loaded. Please check your script inclusion.</p>
                <details>
                    <summary>Troubleshooting Steps</summary>
                    <ol>
                        <li>Ensure Supabase script is included before app.js</li>
                        <li>Check network tab for script loading errors</li>
                        <li>Verify internet connection</li>
                    </ol>
                </details>
            `;
            document.body.insertBefore(errorDiv, document.body.firstChild);
        }

        // Show error on page load
        window.addEventListener('load', showSupabaseLoadError);
        return;
    }

    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // Create Supabase client with comprehensive error handling
    let supabase;
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            db: { schema: 'public' },
            auth: { 
                persistSession: true,
                autoRefreshToken: true
            },
            global: {
                headers: { 'x-app-name': 'File Upload Manager' }
            }
        });

        // Validate client creation
        if (!supabase) {
            throw new Error('Failed to create Supabase client');
        }

        console.log('✅ Supabase client initialized successfully');
    } catch (error) {
        console.error('❌ Supabase Initialization Error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        // Create visible error message
        function showSupabaseInitError(error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.innerHTML = `
                <h4>⚠️ Supabase Initialization Failed</h4>
                <p>${error.message}</p>
                <details>
                    <summary>Technical Details</summary>
                    <pre>${error.stack}</pre>
                </details>
            `;
            document.body.insertBefore(errorDiv, document.body.firstChild);
        }

        window.addEventListener('load', () => showSupabaseInitError(error));
        return;
    }

    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const filesTableBody = document.getElementById('filesTableBody');
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

    // Upload file function
    async function uploadFile() {
        const file = fileInput.files[0];
        if (!file) {
            showErrorDetails('No file selected', 'Please choose a file before uploading');
            return;
        }

        // Reset previous states
        hideErrorDetails();
        showUploadStatus('Preparing upload...', 10);

        try {
            // Validate file size and type
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
            const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

            if (file.size > MAX_FILE_SIZE) {
                throw new Error(`File is too large. Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            }

            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed. Supported types: ${ALLOWED_TYPES.join(', ')}`);
            }

            // Create an AbortController for cancellation
            uploadController = new AbortController();
            const signal = uploadController.signal;

            // Generate a unique filename with timestamp and random string
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const fileExt = file.name.split('.').pop();
            const fileName = `${timestamp}_${randomString}.${fileExt}`;

            // Extensive logging for debugging
            console.log('Upload Attempt Details:', {
                fileName: fileName,
                fileType: file.type,
                fileSize: file.size,
                bucketName: 'Documents_bucket'
            });

            // Ensure we're using the correct bucket name
            const BUCKET_NAME = 'Documents_bucket';

            // Detailed upload attempt with comprehensive error handling
            try {
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true  // Allow overwriting existing files
                    });

                // Log upload response
                console.log('Storage Upload Response:', {
                    uploadData,
                    uploadError
                });

                if (uploadError) {
                    console.error('Supabase storage upload error:', uploadError);
                    
                    // Detailed error logging
                    console.error('Full Upload Error Details:', {
                        name: uploadError.name,
                        message: uploadError.message,
                        status: uploadError.status,
                        code: uploadError.code
                    });

                    throw uploadError;
                }

                // Get public URL for the uploaded file
                const { data: urlData } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(fileName);

                // Log URL data
                console.log('Public URL Data:', urlData);

                // Prepare file metadata
                const fileMetadata = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    path: urlData.publicUrl,
                    status: 'active',  // Explicitly set a valid status
                    created_at: new Date().toISOString()
                };

                // Insert file metadata into documents table
                const { data: insertData, error: insertError } = await supabase
                    .from('documents')
                    .insert(fileMetadata);

                // Log insert response
                console.log('Database Insert Response:', {
                    insertData,
                    insertError
                });

                if (insertError) {
                    console.error('Supabase documents table insert error:', insertError);
                    throw insertError;
                }

                // Refresh file list
                await loadFiles();

                // Final status
                showUploadStatus('Upload complete!', 100);
                setTimeout(hideUploadStatus, 3000);

                // Clear file input
                fileInput.value = '';

            } catch (uploadAttemptError) {
                // Catch and log any errors during the upload process
                console.error('Upload Attempt Error:', uploadAttemptError);
                
                // More detailed error handling
                const errorContext = 
                    uploadAttemptError.message || 
                    uploadAttemptError.details || 
                    uploadAttemptError.hint || 
                    'An unexpected error occurred during file upload';
                
                showErrorDetails('Failed to upload file', errorContext);
            }
        } catch (error) {
            console.error('Complete upload error:', error);
            
            // Detailed error handling
            if (error.name === 'AbortError') {
                showErrorDetails('Upload Cancelled', 'The file upload was manually cancelled.');
            } else {
                // More detailed error message
                const errorContext = 
                    error.message || 
                    error.details || 
                    error.hint || 
                    'An unexpected error occurred during file upload';
                
                // Log full error object for debugging
                console.error('Full error object:', error);

                showErrorDetails('Failed to upload file', errorContext);
            }
            
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

    // File type icon mapping
    const FILE_TYPE_ICONS = {
        'image/jpeg': 'bi-file-earmark-image text-primary',
        'image/png': 'bi-file-earmark-image text-info',
        'image/gif': 'bi-file-earmark-image text-warning',
        'application/pdf': 'bi-file-earmark-pdf text-danger',
        'text/plain': 'bi-file-earmark-text text-secondary',
        'default': 'bi-file-earmark text-muted'
    };

    // Get file type icon
    function getFileTypeIcon(fileType) {
        return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS['default'];
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Load files function
    async function loadFiles() {
        try {
            // Fetch file metadata from documents table
            const { data: files, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            // Log detailed information for debugging
            console.log('Load Files Debug Information:', {
                files: files,
                error: error,
                timestamp: new Date().toISOString()
            });

            // Handle different scenarios
            if (error) {
                console.error('Error fetching files:', error);
                
                // Show error message to user
                showErrorDetails(
                    'Failed to load files', 
                    error.message || 'Unable to retrieve file list'
                );
                
                // Clear existing table
                filesTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted">
                            <i class="bi bi-exclamation-circle me-2"></i>
                            No files found or error occurred
                        </td>
                    </tr>
                `;
                return;
            }

            // Check if files array is empty
            if (!files || files.length === 0) {
                console.warn('No files found in the documents table');
                
                filesTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted">
                            <i class="bi bi-cloud-upload me-2"></i>
                            No files uploaded yet
                        </td>
                    </tr>
                `;
                return;
            }

            // Clear existing table rows
            filesTableBody.innerHTML = '';

            // Populate table with files
            files.forEach(file => {
                // Create a new row for each file
                const row = document.createElement('tr');
                
                // Sanitize file information to prevent XSS
                const sanitizedName = escapeHtml(file.name);
                const formattedSize = formatFileSize(file.size);
                const sanitizedType = escapeHtml(file.type);
                const fileTypeIcon = getFileTypeIcon(file.type);
                const formattedDate = formatDate(file.created_at);

                row.innerHTML = `
                    <td>
                        <i class="bi ${fileTypeIcon} file-icon"></i>
                        ${sanitizedName}
                    </td>
                    <td>${sanitizedType}</td>
                    <td>${formattedSize}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="${file.path}" 
                               target="_blank" 
                               class="btn btn-outline-info" 
                               download="${sanitizedName}">
                                <i class="bi bi-download"></i>
                            </a>
                            <button class="btn btn-outline-danger delete-btn" 
                                    data-id="${file.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                filesTableBody.appendChild(row);
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteFile);
            });
        } catch (catchError) {
            console.error('Unexpected error in loadFiles:', catchError);
            
            showErrorDetails(
                'Unexpected Error', 
                'An unexpected error occurred while loading files'
            );
        }
    }

    // Utility function to escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // Download file function
    async function downloadFile(event) {
        const filePath = event.target.dataset.path;
        try {
            const { data, error } = await supabase.storage
                .from('Documents_bucket')
                .download(filePath);

            if (error) throw error;

            // Create a download link
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = filePath.split('/').pop();
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    }

    // Delete file function
    async function deleteFile(event) {
        const fileId = event.target.dataset.id;
        try {
            // Get file details to delete from storage
            const { data: fileToDelete, error: fetchError } = await supabase
                .from('documents')
                .select('path')
                .eq('id', fileId)
                .single();

            if (fetchError) throw fetchError;

            // Delete from storage
            const { error: storageError } = await supabase.storage
                .from('Documents_bucket')
                .remove([fileToDelete.path]);

            // Delete from documents table
            const { error: deleteError } = await supabase
                .from('documents')
                .delete()
                .eq('id', fileId);

            if (storageError) throw storageError;
            if (deleteError) throw deleteError;

            // Refresh file list
            await loadFiles();

            alert('File deleted successfully!');
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file');
        }
    }

    // Utility function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Event Listeners
    uploadBtn.addEventListener('click', debouncedUpload);
    dismissErrorBtn.addEventListener('click', hideErrorDetails);
    cancelUploadBtn.addEventListener('click', cancelUpload);

    // Load files on page load
    document.addEventListener('DOMContentLoaded', loadFiles);

    // Expose functions globally for debugging
    window.debugUpload = {
        showErrorDetails,
        hideErrorDetails,
        showUploadStatus,
        hideUploadStatus,
        uploadFile
    };
})();
