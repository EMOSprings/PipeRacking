document.addEventListener("DOMContentLoaded", function() {
    // A reusable function to fetch and inject HTML content
    const includeHTML = (filePath, placeholderId) => {
        // Add a cache-busting query parameter
        const cacheBustingFilePath = `${filePath}?v=${new Date().getTime()}`;

        // Use fetch to get the content of the file
        fetch(cacheBustingFilePath)
            .then(response => {
                // Check if the request was successful
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                // Find the placeholder element and inject the HTML
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                } else {
                    console.error(`Placeholder element with id "${placeholderId}" not found.`);
                }
            })
            .catch(error => {
                // Log any errors to the console for easier debugging
                console.error("Error including HTML:", error);
            });
    };

    // Inject the header and footer
    // These paths are relative to the root of the website.
    includeHTML("/_header.html", "header-placeholder");
    includeHTML("/_footer.html", "footer-placeholder");

    // We no longer need to inject the head content here,
    // it should be directly in each HTML file for simplicity and control.

    // =====================================================================================
    // GLOBAL SNIPCART INTEGRATION
    // =====================================================================================
    
    // This function injects the necessary Snipcart styles, scripts, and configuration
    // into any page that includes app.js, making the cart globally available.

    const setupSnipcart = () => {
        // 1. Add Snipcart's CSS to the document's head
        const snipcartStyles = document.createElement('link');
        snipcartStyles.rel = 'stylesheet';
        snipcartStyles.href = 'https://app.snipcart.com/themes/v3.4.1/default/snipcart.css';
        document.head.appendChild(snipcartStyles);

        // 2. Create the Snipcart configuration div
        const snipcartDiv = document.createElement('div');
        snipcartDiv.hidden = true;
        snipcartDiv.id = 'snipcart';
        snipcartDiv.setAttribute('data-api-key', 'YjkyOTAxOGMtMDFmNy00NTMyLWIwNGItM2EzZDI0ZjhjNmZhNjM5MDQ1NDI1OTk5NDcxNzQ2');
        document.body.appendChild(snipcartDiv);

        // 3. Add Snipcart's JavaScript to the document's body
        const snipcartScript = document.createElement('script');
        snipcartScript.async = true;
        snipcartScript.src = 'https://app.snipcart.com/themes/v3.4.1/default/snipcart.js';
        document.body.appendChild(snipcartScript);
    };

    // Initialize Snipcart on the page
    setupSnipcart();
});
