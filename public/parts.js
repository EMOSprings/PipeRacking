document.addEventListener('DOMContentLoaded', () => {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const partsContainer = document.getElementById('parts-container');
            
            // Add Fittings to the page
            const fittingsHeader = document.createElement('h2');
            fittingsHeader.textContent = 'Fittings';
            partsContainer.appendChild(fittingsHeader);

            for (const key in data.fittings) {
                const family = data.fittings[key];
                for (const variantKey in family.variants) {
                    const part = family.variants[variantKey];
                    const partElement = document.createElement('div');
                    partElement.classList.add('part');
                    partElement.innerHTML = `
                        <h3>${part.part_code} - ${family.name}</h3>
                        <p><strong>Description:</strong> ${family.description}</p>
                        <p><strong>Nominal Size:</strong> ${part.nominal_size_mm} mm</p>
                        <p><a href="${part.model_path}" download>Download .obj</a></p>
                        <p><a href="${family.pdf_drawing}" target="_blank">View PDF Drawing</a></p>
                    `;
                    partsContainer.appendChild(partElement);
                }
            }

            // Add Tubes to the page
            const tubesHeader = document.createElement('h2');
            tubesHeader.textContent = 'Tubes';
            partsContainer.appendChild(tubesHeader);

            for (const key in data.tubes) {
                const part = data.tubes[key];
                const partElement = document.createElement('div');
                partElement.classList.add('part');
                partElement.innerHTML = `
                    <h3>${key} - ${part.name}</h3>
                    <p><strong>Description:</strong> ${part.description}</p>
                    <p><strong>Nominal Size:</strong> ${part.nominal_size_mm} mm</p>
                    <p><strong>Wall Thickness:</strong> ${part.wall_thickness_mm} mm</p>
                    <p><strong>Size Code:</strong> ${part.size_code}</p>
                `;
                partsContainer.appendChild(partElement);
            }
        })
        .catch(error => console.error('Error fetching parts data:', error));
});