
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
});
