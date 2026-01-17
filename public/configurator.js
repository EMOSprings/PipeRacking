import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// =====================================================================================
// CORE COMPONENTS & MATERIALS
// =====================================================================================

const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x8A8A8A, roughness: 0.6, metalness: 1.0 });

function createPipe(length, diameter, material) {
    const geometry = new THREE.CylinderGeometry(diameter / 2, diameter / 2, length, 32);
    const pipe = new THREE.Mesh(geometry, material);
    return pipe;
}

function createFitting(type) {
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
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [-width / 2, depth / 2],
        [width / 2, depth / 2]
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

        postPositions.forEach(pos => {
            const fitting = createFitting('104');
            fitting.position.set(pos[0], shelfY, pos[1]);
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

const heightValue = document.getElementById('height-value');
const widthValue = document.getElementById('width-value');
const depthValue = document.getElementById('depth-value');

function regenerateRacking() {
    scene.remove(rackingSystem);
    rackingSystem = createRacking(configuration);
    scene.add(rackingSystem);
    const boundingBox = new THREE.Box3().setFromObject(rackingSystem);
    const center = boundingBox.getCenter(new THREE.Vector3());
    controls.target.copy(center);
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
