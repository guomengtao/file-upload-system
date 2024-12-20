(function() {
    // Supabase Configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Utility function to format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Fetch Document List
    async function fetchDocuments() {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            renderDocuments(data);
        } catch (error) {
            console.error('Error fetching document list:', error);
            document.getElementById('documentsTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Unable to load document list: ${error.message}
                    </td>
                </tr>
            `;
        }
    }

    // Render Document List
    function renderDocuments(documents) {
        const tableBody = document.getElementById('documentsTableBody');
        tableBody.innerHTML = documents.map(doc => `
            <tr>
                <td>${doc.id}</td>
                <td>${doc.name}</td>
                <td>${doc.type}</td>
                <td>${doc.status}</td>
                <td>${new Date(doc.created_at).toLocaleString('en-US')}</td>
                <td>${formatFileSize(doc.size)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewDocument(${doc.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" onclick="deleteDocument(${doc.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // View Document Details
    window.viewDocument = async function(documentId) {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', documentId)
                .single();

            if (error) {
                throw error;
            }

            // Open a modal or navigate to document details page
            alert(`Document Details:\nName: ${data.name}\nType: ${data.type}\nSize: ${formatFileSize(data.size)}`);
        } catch (error) {
            console.error('Error viewing document:', error);
            alert(`Unable to view document: ${error.message}`);
        }
    };

    // Delete Document
    window.deleteDocument = async function(documentId) {
        const confirmDelete = confirm('Are you sure you want to delete this document?');
        
        if (confirmDelete) {
            try {
                const { error } = await supabase
                    .from('documents')
                    .delete()
                    .eq('id', documentId);

                if (error) {
                    throw error;
                }

                // Refresh document list after deletion
                fetchDocuments();
                alert('Document deleted successfully.');
            } catch (error) {
                console.error('Error deleting document:', error);
                alert(`Unable to delete document: ${error.message}`);
            }
        }
    };

    // Page load event
    document.addEventListener('DOMContentLoaded', fetchDocuments);
})();
