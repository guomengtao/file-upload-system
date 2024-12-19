(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const loadingSpinner = document.getElementById('loadingSpinner');
    const filesTable = document.getElementById('filesTable');
    const filesTableBody = document.getElementById('filesTableBody');
    const noFilesMessage = document.getElementById('noFilesMessage');
    const refreshButton = document.getElementById('refreshButton');

    // File type icon mapping
    const FILE_TYPE_ICONS = {
        'image/jpeg': 'bi-file-earmark-image text-primary',
        'image/png': 'bi-file-earmark-image text-info',
        'image/gif': 'bi-file-earmark-image text-warning',
        'application/pdf': 'bi-file-earmark-pdf text-danger',
        'text/plain': 'bi-file-earmark-text text-secondary',
        'default': 'bi-file-earmark text-muted'
    };

    // Utility functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function getFileTypeIcon(fileType) {
        return FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS['default'];
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Fetch and display files
    async function fetchBucketFiles() {
        // Reset UI
        loadingSpinner.classList.remove('d-none');
        filesTable.classList.add('d-none');
        noFilesMessage.classList.add('d-none');
        filesTableBody.innerHTML = '';

        try {
            // Validate Supabase library
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // List files in the bucket
            const { data: files, error } = await supabase.storage
                .from('Documents_bucket')
                .list();

            if (error) {
                throw error;
            }

            // Hide loading spinner
            loadingSpinner.classList.add('d-none');

            // Check if no files
            if (!files || files.length === 0) {
                noFilesMessage.classList.remove('d-none');
                return;
            }

            // Show files table
            filesTable.classList.remove('d-none');

            // Populate table
            files.forEach(file => {
                const row = document.createElement('tr');
                
                // Get public URL
                const publicUrl = supabase.storage
                    .from('Documents_bucket')
                    .getPublicUrl(file.name).data.publicUrl;

                // Sanitize file information
                const sanitizedName = escapeHtml(file.name);
                const fileTypeIcon = getFileTypeIcon(
                    file.metadata?.mimetype || 
                    file.type || 
                    'application/octet-stream'
                );
                const formattedSize = formatFileSize(
                    file.metadata?.size || 
                    file.size || 
                    0
                );
                const formattedLastModified = file.updated_at 
                    ? new Date(file.updated_at).toLocaleString() 
                    : new Date().toLocaleString();

                row.innerHTML = `
                    <td>
                        <i class="bi ${fileTypeIcon} file-icon"></i>
                        ${sanitizedName}
                    </td>
                    <td>${escapeHtml(file.metadata?.mimetype || 'Unknown')}</td>
                    <td>${formattedSize}</td>
                    <td>${formattedLastModified}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="${publicUrl}" 
                               target="_blank" 
                               class="btn btn-outline-info" 
                               download="${sanitizedName}">
                                <i class="bi bi-download"></i>
                            </a>
                            <button class="btn btn-outline-danger delete-btn" 
                                    data-name="${sanitizedName}">
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

        } catch (error) {
            console.error('Error fetching bucket files:', error);
            
            // Hide loading spinner
            loadingSpinner.classList.add('d-none');
            
            // Show error message
            noFilesMessage.textContent = `Error: ${error.message}`;
            noFilesMessage.classList.remove('d-none');
        }
    }

    // Delete file function
    async function deleteFile(event) {
        const fileName = event.target.closest('.delete-btn').dataset.name;
        
        try {
            // Confirm deletion
            if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
                return;
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Delete file from storage
            const { error } = await supabase.storage
                .from('Documents_bucket')
                .remove([fileName]);

            if (error) {
                throw error;
            }

            // Refresh file list
            await fetchBucketFiles();

            alert('File deleted successfully!');
        } catch (error) {
            console.error('Error deleting file:', error);
            alert(`Failed to delete file: ${error.message}`);
        }
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', fetchBucketFiles);
    refreshButton.addEventListener('click', fetchBucketFiles);
})();
