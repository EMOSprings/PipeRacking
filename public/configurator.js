import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', async () => {
    // =====================================================================================
    // DATA LOADING
    // =====================================================================================

    const response = await fetch('/data/data.json');
    const data = await response.json();

    const configuration = {
        dimensions: {
            height: data.defaults.height,
            width: data.defaults.width,
            depth: data.defaults.depth
        },
        pipe: {
            diameter: data.pipe.diameter,
            finish: data.pipe.finish
        },
        shelves: {
            count: data.defaults.shelves
        }
    };

    // =====================================================================================
    // ASSET LOADING
    // =====================================================================================

    const loader = new OBJLoader();
    const fittingModels = {};

    async function loadFittingModel(diameter) {
        if (fittingModels[diameter]) {
            return fittingModels[diameter];
        }

        try {
            const model = await loader.loadAsync(`/assets/models/${diameter}mm/116 A.obj`);
            
            // Auto-center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Apply the new scaling factor of 9
            model.scale.set(9, 9, 9);

            const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x8A8A8A, roughness: 0.6, metalness: 1.0 });
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = defaultMaterial;
                }
            });

            fittingModels[diameter] = model;
            return model;
        } catch (error) {
            console.warn(`Could not load model for diameter ${diameter}mm. Using placeholder.`);
            return null; // Indicates that loading failed
        }
    }

    // Pre-load the default model
    await loadFittingModel(configuration.pipe.diameter);


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

    function createFitting(type, diameter) {
        const model = fittingModels[diameter];
        if (model) {
            return model.clone();
        }
        // Fallback to placeholder
        const geometry = new THREE.SphereGeometry(40, 16, 16);
        const placeholder = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        return placeholder;
    }

    function createRacking(config) {
        const racking = new THREE.Group();
        const bom = {
            pipes: {},
            fittings: {}
        };
    
        const { height, width, depth } = config.dimensions;
        const { diameter } = config.pipe;
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

        // Add vertical posts
        postPositions.forEach(pos => {
            const post = createPipe(roundedHeight, diameter, defaultMaterial);
            post.position.set(pos[0], roundedHeight / 2, pos[1]);
            racking.add(post);
        });
        bom.pipes[roundedHeight] = (bom.pipes[roundedHeight] || 0) + 4;

        // Add shelves
        const shelfSpacing = roundedHeight / (count + 1);
        for (let i = 1; i <= count; i++) {
            const shelfY = i * shelfSpacing;

            // Add horizontal pipes (width)
            const horizontalPipeZ = createPipe(innerWidth, diameter, defaultMaterial);
            horizontalPipeZ.rotation.z = Math.PI / 2;
            const h_pipe1 = horizontalPipeZ.clone();
            h_pipe1.position.set(0, shelfY, -innerDepth / 2);
            racking.add(h_pipe1);
            const h_pipe2 = horizontalPipeZ.clone();
            h_pipe2.position.set(0, shelfY, innerDepth / 2);
            racking.add(h_pipe2);
            bom.pipes[innerWidth] = (bom.pipes[innerWidth] || 0) + 2;

            // Add horizontal pipes (depth)
            const horizontalPipeX = createPipe(innerDepth, diameter, defaultMaterial);
            horizontalPipeX.rotation.x = Math.PI / 2;
            const h_pipe3 = horizontalPipeX.clone();
            h_pipe3.position.set(-innerWidth / 2, shelfY, 0);
            racking.add(h_pipe3);
            const h_pipe4 = horizontalPipeX.clone();
            h_pipe4.position.set(innerWidth / 2, shelfY, 0);
            racking.add(h_pipe4);
            bom.pipes[innerDepth] = (bom.pipes[innerDepth] || 0) + 2;

            // Add fittings for the shelf
            postPositions.forEach((pos, index) => {
                const fitting = createFitting('116 A', diameter);
                fitting.position.set(pos[0], shelfY, pos[1]);
                fitting.rotation.y = fittingRotations[index]; // Rotate the fitting
                racking.add(fitting);
            });
            bom.fittings['116 A'] = (bom.fittings['116 A'] || 0) + 4;
        }
        return { model: racking, bom };
    }

    // =====================================================================================
    // UI & DYNAMIC REGENERATION
    // =====================================================================================

    const bomContent = document.getElementById('bom-content');

    function updateBOMUI(bom) {
        bomContent.innerHTML = ''; // Clear previous BOM

        // Display pipes
        for (const length in bom.pipes) {
            if (Object.hasOwnProperty.call(bom.pipes, length)) {
                const quantity = bom.pipes[length];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'bom-item';
                itemDiv.innerHTML = `<span class="item-name">Pipe (${configuration.pipe.diameter}mm)</span><span class="item-details">x${quantity} @ ${length}mm</span>`;
                bomContent.appendChild(itemDiv);
            }
        }

        // Display fittings
        for (const type in bom.fittings) {
            if (Object.hasOwnProperty.call(bom.fittings, type)) {
                const quantity = bom.fittings[type];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'bom-item';
                itemDiv.innerHTML = `<span class="item-name">Fitting (${type})</span><span class="item-details">x${quantity}</span>`;
                bomContent.appendChild(itemDiv);
            }
        }
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
        await loadFittingModel(configuration.pipe.diameter);
        
        if (rackingSystem) {
            scene.remove(rackingSystem);
        }

        const result = createRacking(configuration);
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
    // INITIAL UI POPULATION
    // =====================================================================================

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

    data.pipe.diameters.forEach(size => {
        const button = document.createElement('button');
        button.textContent = `${size.code} (${size.diameter}mm)`;
        button.dataset.diameter = size.diameter;

        button.addEventListener('click', () => {
            configuration.pipe.diameter = size.diameter;
            updateActiveButton(size.diameter);
            regenerateRacking();
        });

        pipeDiameterButtons.appendChild(button);
        diameterButtons[size.diameter] = button;
    });

    updateActiveButton(configuration.pipe.diameter);

    // =====================================================================================
    // ANIMATION LOOP
    // =====================================================================================

    // Initial build
    regenerateRacking();
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
});
