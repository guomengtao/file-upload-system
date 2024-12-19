(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const documentSubmissionForm = document.getElementById('documentSubmissionForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorMessageText = document.getElementById('errorMessageText');
    const documentFile = document.getElementById('documentFile');

    // Create Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Form submission handler
    async function handleSubmit(event) {
        event.preventDefault();

        // Reset messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        try {
            // Gather form data
            const documentName = document.getElementById('documentName').value.trim();
            const documentType = document.getElementById('documentType').value;
            const documentDescription = document.getElementById('documentDescription').value.trim();
            const documentPages = document.getElementById('documentPages').value;
            const documentDate = document.getElementById('documentDate').value;
            const documentFileInput = documentFile.files[0];

            // Validate required fields
            if (!documentName || !documentType) {
                throw new Error('Please fill in all required fields');
            }

            // Prepare document metadata
            const documentMetadata = {
                name: documentName,
                type: documentType,
                description: documentDescription || null,
                pages: documentPages ? parseInt(documentPages) : null,
                document_date: documentDate || new Date().toISOString(),
                status: 'active',
                created_at: new Date().toISOString()
            };

            // Optional file upload
            let fileUploadData = null;
            if (documentFileInput) {
                // Generate unique filename
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 15);
                const fileExt = documentFileInput.name.split('.').pop();
                const fileName = `document_${timestamp}_${randomString}.${fileExt}`;

                // Upload file to Supabase storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(fileName, documentFileInput, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    throw uploadError;
                }

                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);

                documentMetadata.file_path = urlData.publicUrl;
            }

            // Insert document metadata into documents table
            const { data, error } = await supabase
                .from('documents')
                .insert(documentMetadata);

            if (error) {
                throw error;
            }

            // Show success message
            successMessage.style.display = 'block';

            // Reset form
            documentSubmissionForm.reset();

            // Optional: Auto-hide success message
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error('Document submission error:', error);
            
            // Show error message
            errorMessageText.textContent = error.message || 'An unexpected error occurred';
            errorMessage.style.display = 'block';
        }
    }

    // Event Listeners
    documentSubmissionForm.addEventListener('submit', handleSubmit);
})();
