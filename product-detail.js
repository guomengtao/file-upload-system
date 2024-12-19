(function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';

    // DOM Elements
    const mainProductImage = document.getElementById('mainProductImage');
    const additionalImageContainer = document.getElementById('additionalImageContainer');
    const productTitle = document.getElementById('productTitle');
    const productDescription = document.getElementById('productDescription');
    const productFeatures = document.getElementById('productFeatures');
    const technicalDetailsBody = document.getElementById('technicalDetailsBody');
    const productPrice = document.getElementById('productPrice');

    // Fake product data generator
    function generateProductData(filename) {
        const basePrice = Math.floor(Math.random() * 500) + 50; // Random price between 50-550
        const productNames = {
            'screenshot': 'Advanced Screenshot Tool',
            'design': 'Creative Design Software',
            'app': 'Innovative Mobile Application',
            'interface': 'User Experience Design Kit',
            'dashboard': 'Business Intelligence Dashboard'
        };

        const descriptions = {
            'screenshot': 'A powerful screenshot capture and annotation tool designed for professionals.',
            'design': 'Unleash your creativity with our cutting-edge design software, perfect for graphic designers and artists.',
            'app': 'A revolutionary mobile application that transforms how you interact with technology.',
            'interface': 'Comprehensive UX design kit with pre-built components and intuitive design tools.',
            'dashboard': 'Real-time business intelligence dashboard with advanced analytics and reporting.'
        };

        const features = {
            'screenshot': [
                'High-resolution capture',
                'Advanced annotation tools',
                'Cloud sync',
                'Multi-platform support',
                'Instant sharing capabilities'
            ],
            'design': [
                'Unlimited design layers',
                'Professional color palette',
                'Vector graphics support',
                'Real-time collaboration',
                'AI-powered design suggestions'
            ],
            'app': [
                'Cross-platform compatibility',
                'Intuitive user interface',
                'Advanced security features',
                'Offline mode',
                'Regular updates'
            ],
            'interface': [
                'Responsive design components',
                'Customizable themes',
                'Accessibility guidelines',
                'Design system integration',
                'Rapid prototyping tools'
            ],
            'dashboard': [
                'Real-time data visualization',
                'Customizable widgets',
                'Advanced filtering',
                'Export and reporting',
                'Role-based access control'
            ]
        };

        const technicalDetails = {
            'screenshot': {
                'Version': '2.5.3',
                'Platform': 'Windows, macOS, Linux',
                'Storage Required': '250 MB',
                'Update Frequency': 'Monthly'
            },
            'design': {
                'Version': '4.7.2',
                'System Requirements': '16GB RAM, 4-core Processor',
                'File Formats': 'PSD, SVG, PNG, JPG',
                'Cloud Storage': '100GB Included'
            },
            'app': {
                'Version': '3.1.0',
                'Compatibility': 'iOS 14+, Android 10+',
                'Download Size': '45 MB',
                'In-app Purchases': 'Optional'
            },
            'interface': {
                'Version': '2.3.1',
                'Licensing': 'Commercial & Personal',
                'Components': '500+ UI Elements',
                'Framework Support': 'React, Vue, Angular'
            },
            'dashboard': {
                'Version': '5.0.1',
                'Data Sources': 'SQL, NoSQL, APIs',
                'User Roles': '5 Configurable Levels',
                'Security': 'End-to-end Encryption'
            }
        };

        // Find the best match for product type
        const productType = Object.keys(productNames).find(type => 
            filename.toLowerCase().includes(type)
        ) || 'screenshot';

        return {
            name: productNames[productType],
            description: descriptions[productType],
            features: features[productType],
            technicalDetails: technicalDetails[productType],
            price: basePrice.toFixed(2)
        };
    }

    // Fetch product details
    async function fetchProductDetails() {
        try {
            // Create Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            // Get filename from URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const filename = urlParams.get('file');

            if (!filename) {
                throw new Error('No file specified');
            }

            // Fetch file details
            const { data: fileData, error } = await supabase.storage
                .from('screenshots')
                .getPublicUrl(filename);

            if (error) {
                throw error;
            }

            // Generate product data
            const productData = generateProductData(filename);

            // Set main image
            mainProductImage.src = fileData.publicUrl;
            mainProductImage.alt = productData.name;

            // Set product details
            productTitle.textContent = productData.name;
            productDescription.textContent = productData.description;
            productPrice.textContent = productData.price;

            // Add features
            productData.features.forEach(feature => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="bi bi-check-circle-fill text-success me-2"></i>${feature}`;
                productFeatures.appendChild(li);
            });

            // Add technical details
            Object.entries(productData.technicalDetails).forEach(([key, value]) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold">${key}</td>
                    <td>${value}</td>
                `;
                technicalDetailsBody.appendChild(tr);
            });

            // Fetch additional images from the same bucket
            const { data: additionalFiles, error: listError } = await supabase.storage
                .from('screenshots')
                .list();

            if (!listError && additionalFiles) {
                // Limit to 4 additional images
                const relatedImages = additionalFiles
                    .filter(file => file.name !== filename)
                    .slice(0, 4);

                relatedImages.forEach((file, index) => {
                    const { data: imageData } = supabase.storage
                        .from('screenshots')
                        .getPublicUrl(file.name);

                    const col = document.createElement('div');
                    col.className = 'col-3';
                    const img = document.createElement('img');
                    img.src = imageData.publicUrl;
                    img.className = 'img-fluid additional-images';
                    img.alt = `Related Image ${index + 1}`;
                    img.addEventListener('click', () => {
                        mainProductImage.src = imageData.publicUrl;
                    });

                    col.appendChild(img);
                    additionalImageContainer.appendChild(col);
                });
            }

        } catch (error) {
            console.error('Error fetching product details:', error);
            // Fallback error handling
            productTitle.textContent = 'Product Not Found';
            productDescription.textContent = 'Sorry, we could not retrieve the product details.';
        }
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', fetchProductDetails);
})();
