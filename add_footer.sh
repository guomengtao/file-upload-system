#!/bin/bash

# Footer HTML to be added
FOOTER='    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-4">
        <div class="container">
            <div class="row">
                <div class="col-md-4">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="index.html" class="text-light">Home</a></li>
                        <li><a href="documents-upload.html" class="text-light">Upload Documents</a></li>
                        <li><a href="screenshots-upload.html" class="text-light">Upload Screenshots</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>File Management</h5>
                    <ul class="list-unstyled">
                        <li><a href="bucket-files.html" class="text-light">Documents Files</a></li>
                        <li><a href="screenshots-files.html" class="text-light">Screenshots Files</a></li>
                        <li><a href="combined-files.html" class="text-light">Combined Files</a></li>
                    </ul>
                </div>
                <div class="col-md-4">
                    <h5>Bucket Status</h5>
                    <ul class="list-unstyled">
                        <li><a href="bucket-status.html" class="text-light">Documents Bucket Status</a></li>
                        <li><a href="screenshots-status.html" class="text-light">Screenshots Bucket Status</a></li>
                    </ul>
                </div>
            </div>
            <hr class="bg-light">
            <div class="text-center">
                <p class="mb-0">&copy; 2024 File Upload System. All Rights Reserved.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>'

# Find all HTML files and add footer
for file in *.html; do
    # Remove existing footer-like content before </body>
    sed -i '' -e '/<\/body>/d' "$file"
    
    # Add new footer
    echo "$FOOTER" >> "$file"
done

echo "Footer added to all HTML files."
