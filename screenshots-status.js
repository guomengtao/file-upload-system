(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const bucketDetails = document.getElementById('bucketDetails');
    const bucketName = document.getElementById('bucketName');
    const totalFiles = document.getElementById('totalFiles');
    const totalSize = document.getElementById('totalSize');
    const lastUpdated = document.getElementById('lastUpdated');
    const connectionLogs = document.getElementById('connectionLogs');

    // Logging function
    function log(message, type = 'info') {
        const timestamp = new Date().toLocaleString();
        const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}\n`;
        connectionLogs.textContent += logEntry;
        console.log(message);
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Check Supabase and Bucket Connection
    async function checkBucketStatus() {
        try {
            // Validate Supabase library
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase library not loaded');
            }

            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            log('Supabase client created successfully');

            // Check bucket connection
            const { data, error } = await supabase.storage.getBucket('screenshots');

            if (error) {
                throw error;
            }

            // Update status UI
            statusIcon.className = 'bi bi-check-circle status-icon status-connected';
            statusText.textContent = 'Bucket Connected Successfully';
            statusText.classList.remove('text-danger');
            statusText.classList.add('text-success');
            log('Screenshots bucket connection verified', 'success');

            // Populate bucket details
            bucketName.textContent = data.name;
            bucketDetails.classList.remove('d-none');

            // Get files in the bucket
            const { data: files, error: filesError } = await supabase.storage
                .from('screenshots')
                .list();

            if (filesError) {
                log(`Error listing files: ${filesError.message}`, 'error');
                totalFiles.textContent = 'N/A';
                totalSize.textContent = 'N/A';
            } else {
                // Calculate total files and size
                const fileCount = files.length;
                const totalFileSize = files.reduce((sum, file) => sum + file.metadata.size, 0);

                totalFiles.textContent = fileCount;
                totalSize.textContent = formatFileSize(totalFileSize);
                lastUpdated.textContent = new Date().toLocaleString();

                log(`Found ${fileCount} files in the bucket`, 'info');
            }

        } catch (error) {
            // Handle connection errors
            statusIcon.className = 'bi bi-x-circle status-icon status-disconnected';
            statusText.textContent = 'Bucket Connection Failed';
            statusText.classList.remove('text-success');
            statusText.classList.add('text-danger');
            log(`Connection error: ${error.message}`, 'error');

            // Clear bucket details
            bucketDetails.classList.add('d-none');
        }
    }

    // Check status on page load
    document.addEventListener('DOMContentLoaded', checkBucketStatus);

    // Add manual refresh button functionality
    const refreshButton = document.createElement('button');
    refreshButton.className = 'btn btn-primary mt-3';
    refreshButton.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Refresh Status';
    refreshButton.addEventListener('click', checkBucketStatus);

    const cardBody = document.querySelector('.card-body');
    cardBody.appendChild(refreshButton);
})();
