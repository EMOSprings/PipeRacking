import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================================
    // DATA LOADING
    // =====================================================================================
    // Fetch the data first. The rest of the initialization is chained to this promise
    // to ensure the data is available before any 3D objects are built.
    fetch('./data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch data.json: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // --- DATA IS NOW LOADED, PROCEED WITH INITIALIZATION ---
            initializeConfigurator(data);
        })
        .catch(error => {
            console.error("Error initializing configurator:", error);
            const sceneContainer = document.getElementById('scene-container');
            sceneContainer.innerHTML = `<div class="error-message">Error loading configurator. Please try again later.</div>`;
        });
});

// The main function that sets up everything once data is loaded
async function initializeConfigurator(data) {
    // Hardcode default dimensions as they are no longer in data.json
    const firstPipeDiameter = Object.keys(data.pipes)[0];
    const configuration = {
        dimensions: {
            height: 1800,
            width: 1200,
            depth: 400
        },
        pipe: {
            diameter: parseFloat(firstPipeDiameter),
            finish: 'Galvanised' // Assuming a default finish
        },
        shelves: {
            count: 2
        }
    };

    // =====================================================================================
    // ASSET LOADING
    // =====================================================================================

    const loader = new OBJLoader();
    const fittingModels = {}; // Cache for loaded models, e.g., fittingModels['116-A']

    async function loadFittingModel(fittingId, sizeCode, diameter) {
        const modelKey = `${fittingId}-${sizeCode}`;
        if (fittingModels[modelKey]) {
            return fittingModels[modelKey];
        }

        try {
            // Correctly constructs the path e.g., assets/models/26.9mm/T116.obj
            const model = await loader.loadAsync(`assets/models/${diameter}mm/T${fittingId}.obj`);
            
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            model.scale.set(9, 9, 9);

            const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x8A8A8A, roughness: 0.6, metalness: 1.0 });
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = defaultMaterial;
                }
            });

            fittingModels[modelKey] = model;
            return model;
        } catch (error) {
            console.warn(`Could not load model for fitting ${modelKey}. Using placeholder.`, error);
            return null; // Indicates that loading failed
        }
    }

    // =====================================================================================
    // MAIN SCENE SETUP
    // =====================================================================================

    const sceneContainer = document.getElementById('scene-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Match site background

    const camera = new THREE.PerspectiveCamera(75, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 10000);
    camera.position.set(1500, 1500, 2500);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    sceneContainer.innerHTML = ''; // Clear any previous error messages
    sceneContainer.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Bounding Box Helper
    const boundingBoxHelper = new THREE.Box3Helper(new THREE.Box3(), 0x4dabf7); // Use site accent color
    scene.add(boundingBoxHelper);

    // =====================================================================================
    // CORE COMPONENTS & MATERIALS
    // =====================================================================================

    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x8A8A8A, roughness: 0.6, metalness: 1.0 });

    function createPipe(length, diameter, material) {
        const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 32);
        const pipe = new THREE.Mesh(geometry, material);
        return pipe;
    }

    async function createFitting(fittingId, sizeCode, diameter) {
        const model = await loadFittingModel(fittingId, sizeCode, diameter);
        if (model) {
            return model.clone();
        }
        // Fallback to placeholder
        const geometry = new THREE.SphereGeometry(40, 16, 16);
        const placeholder = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        return placeholder;
    }

    // --- Data helper functions (UPDATED) ---
    function getPipeData(diameter) {
        return data.pipes[diameter];
    }

    function getFittingData(fittingId, diameter) {
        const pipeData = getPipeData(diameter);
        if (!pipeData) return null;
        const sizeCode = pipeData.size_code;
        const fittingType = data.fittings[fittingId];
        if (!fittingType) return null;
        return fittingType.sizes[sizeCode];
    }

    async function createRacking(config) {
        const racking = new THREE.Group();
        // --- BOM Structure ---
        const bom = {
            items: [],
            totalPrice: 0
        };
    
        const { height, width, depth } = config.dimensions;
        const { diameter } = config.pipe;
        // Note: 'count' now refers to *additional* shelves between the top and bottom.
        const { count } = config.shelves; 
    
        // The user-defined width and depth are for the OUTER dimensions.
        // We need to account for the pipe diameter to set the centers of the posts.
        const innerWidth = Math.round(width - diameter);
        const innerDepth = Math.round(depth - diameter);
        const roundedHeight = Math.round(height);
    
        const postPositions = [
            [-innerWidth / 2, -innerDepth / 2], // Front-left
            [innerWidth / 2, -innerDepth / 2],  // Front-right
            [-innerWidth / 2, innerDepth / 2],   // Back-left
            [innerWidth / 2, innerDepth / 2]    // Back-right
        ];

        const fittingRotations = [
            0,                  // Front-left
            -Math.PI / 2,       // Front-right
            Math.PI / 2,        // Back-left
            Math.PI             // Back-right
        ];

        // --- Get master data for current pipe/fitting size ---
        const pipeData = getPipeData(diameter);
        const fittingData = getFittingData("116", diameter);

        if (!pipeData || !fittingData) {
            console.error(`Data missing for diameter ${diameter}. Cannot create racking.`);
            // Return an empty structure to avoid crashing the app
            return { model: new THREE.Group(), bom: { items: [], totalPrice: 0 }};
        }
        
        const sizeCode = pipeData.size_code;

        // --- Helper to add items to the BOM and calculate price ---
        function addBomItem(name, sku, quantity, price, length = null) {
            const item = { name, sku, quantity, price, length };
            bom.items.push(item);
            bom.totalPrice += price * quantity;
        }

        // Add vertical posts
        postPositions.forEach(pos => {
            const post = createPipe(roundedHeight, diameter, defaultMaterial);
            post.position.set(pos[0], roundedHeight / 2, pos[1]);
            racking.add(post);
        });
        // Add 4 vertical posts to the BOM
        addBomItem(`Pipe (${diameter}mm)`, pipeData.sku, 4, pipeData.price_per_mm * roundedHeight, roundedHeight);

        // --- Helper function to create a single shelf and update the BOM ---
        async function addShelf(shelfY) {
            // Add horizontal pipes (width)
            const horizontalPipeZ1 = createPipe(innerWidth, diameter, defaultMaterial);
            horizontalPipeZ1.rotation.z = Math.PI / 2;
            horizontalPipeZ1.position.set(0, shelfY, -innerDepth / 2);
            racking.add(horizontalPipeZ1);

            const horizontalPipeZ2 = createPipe(innerWidth, diameter, defaultMaterial);
            horizontalPipeZ2.rotation.z = Math.PI / 2;
            horizontalPipeZ2.position.set(0, shelfY, innerDepth / 2);
            racking.add(horizontalPipeZ2);
            addBomItem(`Pipe (${diameter}mm)`, pipeData.sku, 2, pipeData.price_per_mm * innerWidth, innerWidth);

            // Add horizontal pipes (depth)
            const horizontalPipeX1 = createPipe(innerDepth, diameter, defaultMaterial);
            horizontalPipeX1.rotation.x = Math.PI / 2;
            horizontalPipeX1.position.set(-innerWidth / 2, shelfY, 0);
            racking.add(horizontalPipeX1);
            
            const horizontalPipeX2 = createPipe(innerDepth, diameter, defaultMaterial);
            horizontalPipeX2.rotation.x = Math.PI / 2;
            horizontalPipeX2.position.set(innerWidth / 2, shelfY, 0);
            racking.add(horizontalPipeX2);
            addBomItem(`Pipe (${diameter}mm)`, pipeData.sku, 2, pipeData.price_per_mm * innerDepth, innerDepth);

            // Add fittings for the shelf
            for(let i=0; i<postPositions.length; i++) {
                const pos = postPositions[i];
                const fitting = await createFitting('116', sizeCode, diameter);
                if (fitting) {
                    fitting.position.set(pos[0], shelfY, pos[1]);
                    fitting.rotation.y = fittingRotations[i];
                    racking.add(fitting);
                }
            }
            addBomItem(data.fittings["116"].name, fittingData.sku, 4, fittingData.price);
        }

        // --- Add Fixed Top and Bottom Shelves ---
        const fittingHeight = 40; // Estimate fitting height for positioning
        const bottomShelfY = fittingHeight / 2;
        const topShelfY = roundedHeight - (fittingHeight / 2);
        
        await addShelf(bottomShelfY);
        await addShelf(topShelfY);

        // --- Add Additional Intermediate Shelves ---
        const availableHeight = topShelfY - bottomShelfY;
        const numSpaces = count + 1;
        for (let i = 1; i <= count; i++) {
            const shelfY = bottomShelfY + i * (availableHeight / numSpaces);
            await addShelf(shelfY);
        }

        return { model: racking, bom };
    }

    // =====================================================================================
    // UI & DYNAMIC REGENERATION
    // =====================================================================================

    const bomContent = document.getElementById('bom-content');
    const bomTotal = document.getElementById('bom-total');
    const buyNowButton = document.getElementById('buy-now-button');

    function updateBOMUI(bom) {
        bomContent.innerHTML = ''; // Clear previous BOM
        
        // --- Consolidate BOM items for display ---
        const consolidatedItems = {};
        bom.items.forEach(item => {
            // Create a unique key for each item type (and length, if applicable)
            const key = item.length ? `${item.sku}-${item.length}` : item.sku;
            if (consolidatedItems[key]) {
                consolidatedItems[key].quantity += item.quantity;
            } else {
                consolidatedItems[key] = { ...item };
            }
        });

        // --- Display consolidated items in the BOM ---
        Object.values(consolidatedItems).forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bom-item';
            const details = item.length ? `x${item.quantity} @ ${item.length}mm` : `x${item.quantity}`;
            const itemPrice = (item.price * item.quantity).toFixed(2);
            itemDiv.innerHTML = `<span class="item-name">${item.name}</span><span class="item-details">${details}</span><span class="item-price">£${itemPrice}</span>`;
            bomContent.appendChild(itemDiv);
        });

        // --- Update Total Price and Buy Now Button ---
        bomTotal.innerHTML = `Total: <span class="price">£${bom.totalPrice.toFixed(2)}</span>`;
        
        // --- Snipcart: Define a single product representing the entire rack ---
        // This makes the cart summary cleaner for the user.
        buyNowButton.setAttribute('data-item-id', 'CUSTOM-RACK');
        buyNowButton.setAttribute('data-item-name', 'Custom Pipe Rack');
        buyNowButton.setAttribute('data-item-price', bom.totalPrice.toFixed(2));
        buyNowButton.setAttribute('data-item-url', '/configurator.html');
        buyNowButton.setAttribute('data-item-description', 'A custom-configured pipe racking solution.');
        buyNowButton.setAttribute('data-item-quantity', 1);
    }
    
    let rackingSystem;
    let currentBOM;

    const heightInput = document.getElementById('height');
    const widthInput = document.getElementById('width');
    const depthInput = document.getElementById('depth');
    const pipeDiameterButtons = document.getElementById('pipe-diameter-buttons');
    const shelvesInput = document.getElementById('shelves');
    const boundingBoxToggle = document.getElementById('toggle-bounding-box');

    const heightValue = document.getElementById('height-value');
    const widthValue = document.getElementById('width-value');
    const depthValue = document.getElementById('depth-value');
    const shelvesValue = document.getElementById('shelves-value');

    async function regenerateRacking() {
        // Show a loading indicator if you have one
        document.getElementById('loading-overlay').style.display = 'flex';
        
        if (rackingSystem) {
            scene.remove(rackingSystem);
        }

        const result = await createRacking(configuration);
        rackingSystem = result.model;
        currentBOM = result.bom;
        
        scene.add(rackingSystem);
        updateBOMUI(currentBOM);

        // Update bounding box
        const boundingBox = new THREE.Box3().setFromObject(rackingSystem);
        boundingBoxHelper.box = boundingBox;
        
        const center = boundingBox.getCenter(new THREE.Vector3());
        controls.target.copy(center);
        // Hide loading indicator
        document.getElementById('loading-overlay').style.display = 'none';
    }

    heightInput.addEventListener('input', (e) => {
        configuration.dimensions.height = parseInt(e.target.value);
        heightValue.textContent = e.target.value;
        regenerateRacking();
    });

    widthInput.addEventListener('input', (e) => {
        configuration.dimensions.width = parseInt(e.target.value);
        widthValue.textContent = e.target.value;
        regenerateRacking();
    });

    depthInput.addEventListener('input', (e) => {
        configuration.dimensions.depth = parseInt(e.target.value);
        depthValue.textContent = e.target.value;
        regenerateRacking();
    });

    shelvesInput.addEventListener('input', (e) => {
        configuration.shelves.count = parseInt(e.target.value);
        shelvesValue.textContent = e.target.value;
        regenerateRacking();
    });

    boundingBoxToggle.addEventListener('change', (e) => {
        boundingBoxHelper.visible = e.target.checked;
    });

    // =====================================================================================
    // INITIAL UI POPULATION (UPDATED)
    // =====================================================================================
    
    // Set initial slider values from configuration
    heightInput.value = configuration.dimensions.height;
    heightValue.textContent = configuration.dimensions.height;
    widthInput.value = configuration.dimensions.width;
    widthValue.textContent = configuration.dimensions.width;
    depthInput.value = configuration.dimensions.depth;
    depthValue.textContent = configuration.dimensions.depth;
    shelvesInput.value = configuration.shelves.count;
    shelvesValue.textContent = configuration.shelves.count;

    const diameterButtons = {};

    function updateActiveButton(diameter) {
        for (const d in diameterButtons) {
            // Use parseFloat to ensure correct comparison
            if (parseFloat(d) === diameter) {
                diameterButtons[d].classList.add('active');
            } else {
                diameterButtons[d].classList.remove('active');
            }
        }
    }
    
    pipeDiameterButtons.innerHTML = ''; // Clear any static buttons
    Object.keys(data.pipes).forEach(diameterStr => {
        const diameter = parseFloat(diameterStr);
        const pipeData = data.pipes[diameter];
        const sizeCode = pipeData.size_code;

        const button = document.createElement('button');
        button.textContent = `${sizeCode} (${diameter}mm)`;
        button.dataset.diameter = diameter;

        button.addEventListener('click', () => {
            configuration.pipe.diameter = diameter;
            updateActiveButton(diameter);
            regenerateRacking();
        });

        pipeDiameterButtons.appendChild(button);
        diameterButtons[diameter] = button;
    });

    updateActiveButton(configuration.pipe.diameter);

    // =====================================================================================
    // ANIMATION LOOP & INITIAL BUILD
    // =====================================================================================

    // Pre-load the default model first, then do the initial build
    await regenerateRacking(); // Changed to await regenerateRacking to handle async model loading
    boundingBoxHelper.visible = boundingBoxToggle.checked; // Set initial state

    window.addEventListener('resize', () => {
        camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
