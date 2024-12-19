(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const filesTableBody = document.getElementById('filesTableBody');
    const noFilesMessage = document.getElementById('noFilesMessage');
    const refreshBtn = document.getElementById('refreshBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const previewImage = document.getElementById('previewImage');
    const imagePreviewModal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));

    // Utility Functions
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Fetch and display files from both buckets
    async function fetchAllFiles() {
        try {
            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Fetch files from both buckets
            const [documentsResult, screenshotsResult] = await Promise.all([
                supabase.storage.from('documents').list(),
                supabase.storage.from('screenshots').list()
            ]);

            // Clear previous results
            filesTableBody.innerHTML = '';

            // Combine and process files from both buckets
            const allFiles = [
                ...documentsResult.data.map(file => ({...file, bucket: 'documents'})),
                ...screenshotsResult.data.map(file => ({...file, bucket: 'screenshots'}))
            ];

            // Check if no files
            if (!allFiles || allFiles.length === 0) {
                noFilesMessage.style.display = 'block';
                return;
            }
            noFilesMessage.style.display = 'none';

            // Process and display files
            allFiles.forEach(file => {
                // Get public URL
                const publicUrl = supabase.storage
                    .from(file.bucket)
                    .getPublicUrl(file.name).data.publicUrl;

                // Determine file type icon
                const fileTypeIcons = {
                    'image/jpeg': 'bi-file-earmark-image text-primary',
                    'image/png': 'bi-file-earmark-image text-info',
                    'image/gif': 'bi-file-earmark-image text-warning',
                    'application/pdf': 'bi-file-earmark-pdf text-danger',
                    'text/plain': 'bi-file-earmark-text text-secondary',
                    'default': 'bi-file-earmark text-muted'
                };

                const fileTypeIcon = fileTypeIcons[file.metadata?.mimetype] || fileTypeIcons['default'];

                // Create table row
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input type="checkbox" class="file-checkbox" 
                               data-bucket="${escapeHtml(file.bucket)}" 
                               data-filename="${escapeHtml(file.name)}">
                    </td>
                    <td>
                        <img src="${publicUrl}" 
                             class="file-thumbnail" 
                             alt="Preview" 
                             data-bs-toggle="modal" 
                             data-bs-target="#imagePreviewModal"
                             data-image-url="${publicUrl}">
                    </td>
                    <td>
                        <i class="bi ${fileTypeIcon} me-2"></i>
                        ${escapeHtml(file.name)}
                    </td>
                    <td>
                        <span class="badge bg-${file.bucket === 'documents' ? 'primary' : 'warning'}">
                            ${escapeHtml(file.bucket)}
                        </span>
                    </td>
                    <td>${escapeHtml(file.metadata?.mimetype || 'Unknown')}</td>
                    <td>${formatFileSize(file.metadata?.size || 0)}</td>
                    <td>${new Date(file.updated_at).toLocaleString()}</td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <a href="${publicUrl}" 
                               target="_blank" 
                               class="btn btn-outline-info" 
                               download="${escapeHtml(file.name)}">
                                <i class="bi bi-download"></i>
                            </a>
                            <button class="btn btn-outline-danger delete-btn"
                                    data-bucket="${escapeHtml(file.bucket)}"
                                    data-filename="${escapeHtml(file.name)}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                filesTableBody.appendChild(row);
            });

            // Add event listeners for image preview
            document.querySelectorAll('[data-bs-toggle="modal"]').forEach(img => {
                img.addEventListener('click', (e) => {
                    previewImage.src = e.target.dataset.imageUrl;
                    imagePreviewModal.show();
                });
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', deleteFile);
            });

        } catch (error) {
            console.error('Error fetching files:', error);
            noFilesMessage.textContent = `Error: ${error.message}`;
            noFilesMessage.style.display = 'block';
        }
    }

    // Delete file function
    async function deleteFile(event) {
        const bucket = event.target.closest('.delete-btn').dataset.bucket;
        const fileName = event.target.closest('.delete-btn').dataset.filename;
        
        try {
            // Confirm deletion
            if (!confirm(`Are you sure you want to delete ${fileName} from ${bucket} bucket?`)) {
                return;
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Delete file from storage
            const { error } = await supabase.storage
                .from(bucket)
                .remove([fileName]);

            if (error) {
                throw error;
            }

            // Refresh file list
            await fetchAllFiles();

            alert('File deleted successfully!');
        } catch (error) {
            console.error('Error deleting file:', error);
            alert(`Failed to delete file: ${error.message}`);
        }
    }

    // Bulk delete selected files
    async function deleteSelectedFiles() {
        const selectedCheckboxes = document.querySelectorAll('.file-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            alert('No files selected for deletion.');
            return;
        }

        try {
            // Confirm bulk deletion
            if (!confirm(`Are you sure you want to delete ${selectedCheckboxes.length} selected files?`)) {
                return;
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Prepare deletion promises
            const deletionPromises = Array.from(selectedCheckboxes).map(checkbox => {
                const bucket = checkbox.dataset.bucket;
                const fileName = checkbox.dataset.filename;
                return supabase.storage.from(bucket).remove([fileName]);
            });

            // Execute deletions
            const results = await Promise.allSettled(deletionPromises);

            // Check for errors
            const failedDeletions = results.filter(result => result.status === 'rejected');
            if (failedDeletions.length > 0) {
                console.error('Some files failed to delete:', failedDeletions);
                alert(`${failedDeletions.length} files could not be deleted. Check console for details.`);
            }

            // Refresh file list
            await fetchAllFiles();

            alert('Selected files deleted successfully!');
        } catch (error) {
            console.error('Error deleting selected files:', error);
            alert(`Failed to delete selected files: ${error.message}`);
        }
    }

    // Select all checkbox functionality
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.file-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Event Listeners
    document.addEventListener('DOMContentLoaded', fetchAllFiles);
    refreshBtn.addEventListener('click', fetchAllFiles);
    deleteSelectedBtn.addEventListener('click', deleteSelectedFiles);
})();
