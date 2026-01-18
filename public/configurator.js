import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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
scene.background = new THREE.Color(0xf0f0f0);

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

// Add a reference cube for scaling
const cubeGeometry = new THREE.BoxGeometry(500, 500, 500);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const referenceCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
referenceCube.position.set(0, 250, 0); // Lift it so it sits on the ground plane
scene.add(referenceCube);

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

    const { height, width, depth } = config.dimensions;
    const { diameter } = config.pipe;
    const { count } = config.shelves;

    const postPositions = [
        [-width / 2, -depth / 2], // Front-left
        [width / 2, -depth / 2],  // Front-right
        [-width / 2, depth / 2],   // Back-left
        [width / 2, depth / 2]    // Back-right
    ];

    const fittingRotations = [
        0,                  // Front-left
        -Math.PI / 2,       // Front-right
        Math.PI / 2,        // Back-left
        Math.PI             // Back-right
    ];

    postPositions.forEach(pos => {
        const post = createPipe(height, diameter, defaultMaterial);
        post.position.set(pos[0], height / 2, pos[1]);
        racking.add(post);
    });

    const shelfSpacing = height / (count + 1);
    for (let i = 1; i <= count; i++) {
        const shelfY = i * shelfSpacing;

        const horizontalPipeZ = createPipe(width, diameter, defaultMaterial);
        horizontalPipeZ.rotation.z = Math.PI / 2;
        const h_pipe1 = horizontalPipeZ.clone();
        h_pipe1.position.set(0, shelfY, -depth / 2);
        racking.add(h_pipe1);
        const h_pipe2 = horizontalPipeZ.clone();
        h_pipe2.position.set(0, shelfY, depth / 2);
        racking.add(h_pipe2);

        const horizontalPipeX = createPipe(depth, diameter, defaultMaterial);
        horizontalPipeX.rotation.x = Math.PI / 2;
        const h_pipe3 = horizontalPipeX.clone();
        h_pipe3.position.set(-width / 2, shelfY, 0);
        racking.add(h_pipe3);
        const h_pipe4 = horizontalPipeX.clone();
        h_pipe4.position.set(width / 2, shelfY, 0);
        racking.add(h_pipe4);

        postPositions.forEach((pos, index) => {
            const fitting = createFitting('116 A', diameter);
            fitting.position.set(pos[0], shelfY, pos[1]);
            fitting.rotation.y = fittingRotations[index]; // Rotate the fitting
            racking.add(fitting);
        });
    }
    return racking;
}

// =====================================================================================
// UI & DYNAMIC REGENERATION
// =====================================================================================

let rackingSystem = createRacking(configuration);
scene.add(rackingSystem);

const heightInput = document.getElementById('height');
const widthInput = document.getElementById('width');
const depthInput = document.getElementById('depth');
const pipeDiameterInput = document.getElementById('pipe-diameter');
const shelvesInput = document.getElementById('shelves');

const heightValue = document.getElementById('height-value');
const widthValue = document.getElementById('width-value');
const depthValue = document.getElementById('depth-value');
const shelvesValue = document.getElementById('shelves-value');

async function regenerateRacking() {
    // Show a loading indicator if you have one
    await loadFittingModel(configuration.pipe.diameter);
    
    scene.remove(rackingSystem);
    rackingSystem = createRacking(configuration);
    scene.add(rackingSystem);
    const boundingBox = new THREE.Box3().setFromObject(rackingSystem);
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

pipeDiameterInput.addEventListener('change', (e) => {
    configuration.pipe.diameter = parseFloat(e.target.value);
    regenerateRacking();
});

shelvesInput.addEventListener('input', (e) => {
    configuration.shelves.count = parseInt(e.target.value);
    shelvesValue.textContent = e.target.value;
    regenerateRacking();
});

// =====================================================================================
// INITIAL UI POPULATION
// =====================================================================================

data.pipe.diameters.forEach(size => {
    const option = document.createElement('option');
    option.value = size.diameter;
    option.textContent = `${size.code} = ${size.diameter} ${size.unit}`;
    if (size.diameter === configuration.pipe.diameter) {
        option.selected = true;
    }
    pipeDiameterInput.appendChild(option);
});

// =====================================================================================
// ANIMATION LOOP
// =====================================================================================

const boundingBox = new THREE.Box3().setFromObject(rackingSystem);
const center = boundingBox.getCenter(new THREE.Vector3());
controls.target.copy(center);

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
