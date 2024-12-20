(function() {
    // Debug logging function
    function debugLog(message) {
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            debugOutput.textContent += message + '\n';
        }
        console.log(message);
    }

    // Validate bucket name
    window.validateBucketName = function(input) {
        const nameLength = document.getElementById('nameLength');
        const feedback = document.getElementById('bucketNameFeedback');
        const submitButton = document.querySelector('button[type="submit"]');

        // Real-time length update
        if (nameLength) {
            nameLength.textContent = `${input.value.length}/20`;
        }

        // Regex validation
        const isValid = /^[a-z0-9-]{3,20}$/.test(input.value);

        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            submitButton.disabled = false;
            if (feedback) feedback.style.display = 'none';
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            submitButton.disabled = true;
            if (feedback) feedback.style.display = 'block';
        }
    };

    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';
    let supabase = null;

    // Show error message
    function showError(message) {
        const errorMessageEl = document.getElementById('errorMessage');
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
            errorMessageEl.style.display = 'block';
        }
        debugLog(`Error: ${message}`);
        console.error(message);
    }

    // Show success message
    function showSuccess(message) {
        const successMessageEl = document.getElementById('successMessage');
        if (successMessageEl) {
            successMessageEl.textContent = message;
            successMessageEl.style.display = 'block';
        }
        debugLog(`Success: ${message}`);

        // Auto-hide success message
        setTimeout(() => {
            if (successMessageEl) {
                successMessageEl.style.display = 'none';
            }
        }, 5000);
    }

    // Initialize Supabase client
    function initSupabase() {
        try {
            debugLog('Attempting to initialize Supabase client...');
            
            // Check if Supabase library is loaded
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase library not loaded. Please check script inclusion.');
            }

            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Additional client validation
            if (!client) {
                throw new Error('Supabase client creation failed.');
            }

            debugLog('Supabase client initialized successfully');
            return client;
        } catch (error) {
            showError(`Supabase initialization failed: ${error.message}`);
            return null;
        }
    }

    // Create bucket
    async function createBucket(bucketName, isPublic, description) {
        try {
            debugLog(`Attempting to create bucket: ${bucketName}`);

            // Validate bucket name
            if (!/^[a-z0-9-]{3,20}$/.test(bucketName)) {
                throw new Error('Bucket name must be 3-20 characters, containing only lowercase letters, numbers, and hyphens');
            }

            // Check if bucket already exists
            const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
            if (listError) {
                throw listError;
            }

            const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName);
            if (bucketExists) {
                throw new Error(`Bucket "${bucketName}" already exists`);
            }

            // Create bucket with admin permissions
            const { data, error } = await supabase.storage.createBucket(bucketName, {
                public: isPublic === 'public',
                // Can add additional metadata
                metadata: {
                    description: description || '',
                    created_at: new Date().toISOString()
                }
            });

            if (error) {
                // Detailed error logging
                debugLog(`Bucket creation error details: ${JSON.stringify(error)}`);
                
                // Specific RLS error handling
                if (error.message.includes('new row violates row-level security policy')) {
                    throw new Error('Insufficient permissions: Cannot create bucket. Please ensure you are logged in with admin rights.');
                }
                
                throw error;
            }

            showSuccess(`Bucket "${bucketName}" created successfully!`);
            
            // Reset form
            document.getElementById('createBucketForm').reset();

            return data;
        } catch (error) {
            // Handle specific RLS errors
            if (error.message.includes('row-level security policy')) {
                showError('Insufficient permissions: Cannot create bucket. Please ensure you are logged in with admin rights.');
            } else {
                showError(`Bucket creation failed: ${error.message}`);
            }
            console.error('Bucket creation error:', error);
        }
    }

    // Form submission handler
    async function handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Reset messages
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';

        // Initialize Supabase
        supabase = initSupabase();
        if (!supabase) return;

        // Get form data
        const bucketNameEl = document.getElementById('bucketName');
        const bucketPublicStatusEl = document.getElementById('bucketPublicStatus');
        const bucketDescriptionEl = document.getElementById('bucketDescription');

        const bucketName = bucketNameEl.value.trim().toLowerCase();
        const bucketPublicStatus = bucketPublicStatusEl.value;
        const bucketDescription = bucketDescriptionEl.value.trim();

        // Create bucket
        await createBucket(bucketName, bucketPublicStatus, bucketDescription);
    }

    // Page load initialization
    document.addEventListener('DOMContentLoaded', () => {
        debugLog('Page loaded, starting initialization...');
        
        const createBucketForm = document.getElementById('createBucketForm');
        if (createBucketForm) {
            createBucketForm.addEventListener('submit', handleSubmit);
        }

        const bucketNameInput = document.getElementById('bucketName');
        if (bucketNameInput) {
            bucketNameInput.addEventListener('input', () => {
                validateBucketName(bucketNameInput);
            });
        }
    });
})();
