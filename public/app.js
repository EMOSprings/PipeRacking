
document.addEventListener("DOMContentLoaded", function() {
    // Inject common head elements
    const head = document.head;

    // Meta tags
    const charset = document.createElement('meta');
    charset.setAttribute('charset', 'UTF-8');
    head.appendChild(charset);

    const viewport = document.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    head.appendChild(viewport);

    // Stylesheet with cache busting
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', 'style.css?v=1.1'); // Easily update version here
    head.appendChild(stylesheet);

    // Fetch and inject the header
    fetch("_header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
        });

    // Fetch and inject the footer
    fetch("_footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });
});
