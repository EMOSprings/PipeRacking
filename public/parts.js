document.addEventListener('DOMContentLoaded', () => {
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const partsContainer = document.getElementById('parts-container');
            if (!partsContainer) {
                console.error("Element with ID 'parts-container' not found.");
                return;
            }
            partsContainer.innerHTML = ''; // Clear any existing content

            // Add Fittings to the page
            const fittingsHeader = document.createElement('h2');
            fittingsHeader.textContent = 'Fittings';
            partsContainer.appendChild(fittingsHeader);

            // Loop through each fitting family (e.g., "116", "125")
            for (const fittingId in data.fittings) {
                const family = data.fittings[fittingId];

                // Loop through each size variant (e.g., "A", "B")
                for (const sizeCode in family.sizes) {
                    const variant = family.sizes[sizeCode];
                    const partElement = document.createElement('div');
                    partElement.classList.add('part');

                    // Find the corresponding pipe data to get more details
                    let pipeDetails = null;
                    for (const diameter in data.pipes) {
                        if (data.pipes[diameter].size_code === sizeCode) {
                            pipeDetails = data.pipes[diameter];
                            break;
                        }
                    }

                    const nominalSize = pipeDetails ? pipeDetails.nominal_size_mm : 'N/A';
                    const modelPath = `assets/models/${nominalSize}mm/T${fittingId}.obj`;

                    partElement.innerHTML = `
                        <h3>${variant.sku} - ${family.name}</h3>
                        <p><strong>Description:</strong> ${family.description}</p>
                        <p><strong>Size Code:</strong> ${sizeCode}</p>
                        <p><strong>Nominal Size:</strong> ${nominalSize} mm</p>
                        <p><a href="${modelPath}" download>Download .obj</a></p>
                        <p><a href="${family.pdf_drawing}" target="_blank">View PDF Drawing</a></p>
                    `;
                    partsContainer.appendChild(partElement);
                }
            }

            // Add Pipes (formerly Tubes) to the page
            const pipesHeader = document.createElement('h2');
            pipesHeader.textContent = 'Pipes';
            partsContainer.appendChild(pipesHeader);

            // Loop through each pipe diameter
            for (const diameter in data.pipes) {
                const part = data.pipes[diameter];
                const partElement = document.createElement('div');
                partElement.classList.add('part');
                partElement.innerHTML = `
                    <h3>${part.sku} - ${part.name}</h3>
                    <p><strong>Description:</strong> ${part.description}</p>
                    <p><strong>Nominal Size:</strong> ${part.nominal_size_mm} mm</p>
                    <p><strong>Wall Thickness:</strong> ${part.wall_thickness_mm} mm</p>
                    <p><strong>Size Code:</strong> ${part.size_code}</p>
                `;
                partsContainer.appendChild(partElement);
            }
        })
        .catch(error => {
            console.error('Error fetching or processing parts data:', error);
            const partsContainer = document.getElementById('parts-container');
            if(partsContainer){
                partsContainer.innerHTML = `<div class="error-message">Error loading parts list: ${error.message}. Please check the console for more details.</div>`;
            }
        });
});
