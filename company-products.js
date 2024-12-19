(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const productGallery = document.getElementById('productGallery');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noProductsMessage = document.getElementById('noProductsMessage');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalTitle = document.getElementById('productModalTitle');
    const productModalImage = document.getElementById('productModalImage');
    const productModalDescription = document.getElementById('productModalDescription');

    // Product Categories
    const PRODUCT_CATEGORIES = [
        'Tech Gadgets', 
        'Software Solutions', 
        'Design Tools', 
        'Innovative Products'
    ];

    // Fetch and display products from Screenshots bucket
    async function fetchProducts() {
        try {
            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Fetch files from screenshots bucket
            const { data: files, error } = await supabase.storage
                .from('screenshots')
                .list();

            // Hide loading spinner
            loadingSpinner.style.display = 'none';

            // Handle errors
            if (error) {
                console.error('Error fetching products:', error);
                noProductsMessage.style.display = 'block';
                return;
            }

            // Check if no files
            if (!files || files.length === 0) {
                noProductsMessage.style.display = 'block';
                return;
            }

            // Process and display products
            files.forEach((file, index) => {
                // Get public URL
                const publicUrl = supabase.storage
                    .from('screenshots')
                    .getPublicUrl(file.name).data.publicUrl;

                // Generate a random category
                const category = PRODUCT_CATEGORIES[index % PRODUCT_CATEGORIES.length];

                // Create product card
                const productCol = document.createElement('div');
                productCol.className = 'col-md-4 col-sm-6';
                productCol.innerHTML = `
                    <div class="card product-card h-100 shadow-sm" data-file-name="${escapeHtml(file.name)}">
                        <span class="badge bg-primary badge-category">${escapeHtml(category)}</span>
                        <img src="${publicUrl}" class="card-img-top product-image" alt="${escapeHtml(file.name)}">
                        <div class="product-details">
                            <h5 class="card-title">${generateProductName(file.name)}</h5>
                            <p class="card-text text-muted small">
                                Size: ${formatFileSize(file.metadata?.size || 0)}
                            </p>
                        </div>
                    </div>
                `;

                // Add click event to show modal
                productCol.querySelector('.product-card').addEventListener('click', () => {
                    showProductModal(file.name, publicUrl, category);
                });

                // Add link to product detail page
                productCol.querySelector('.product-card').addEventListener('click', () => {
                    window.location.href = `product-detail.html?file=${encodeURIComponent(file.name)}`;
                });

                productGallery.appendChild(productCol);
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            noProductsMessage.style.display = 'block';
        }
    }

    // Generate a product name from filename
    function generateProductName(filename) {
        // Remove file extension and replace underscores/hyphens with spaces
        return filename
            .replace(/\.[^/.]+$/, '')  // Remove file extension
            .replace(/[_-]/g, ' ')     // Replace underscores and hyphens with spaces
            .replace(/\b\w/g, l => l.toUpperCase());  // Capitalize first letter of each word
    }

    // Show product modal
    function showProductModal(filename, imageUrl, category) {
        productModalTitle.textContent = generateProductName(filename);
        productModalImage.src = imageUrl;
        productModalDescription.innerHTML = `
            <h6>Product Category: ${escapeHtml(category)}</h6>
            <p class="text-muted">
                This is a sample product description for ${generateProductName(filename)}. 
                Each image in the Screenshots bucket is treated as a unique product in our showcase.
            </p>
        `;
        productModal.show();
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', fetchProducts);
})();
