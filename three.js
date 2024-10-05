// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet Data
const planets = [
  { name: 'Mercury', size: 0.5, orbitRadius: 8, orbitSpeed: 0.02, texture: 'textures/mercury.jpg' },
  { name: 'Venus', size: 0.9, orbitRadius: 11, orbitSpeed: 0.015, texture: 'textures/venus.jpg' },
  { name: 'Earth', size: 1, orbitRadius: 15, orbitSpeed: 0.01, texture: 'textures/earth.jpg' },
  { name: 'Mars', size: 0.8, orbitRadius: 19, orbitSpeed: 0.008, texture: 'textures/mars.jpg' },
  { name: 'Jupiter', size: 2, orbitRadius: 25, orbitSpeed: 0.005, texture: 'textures/jupiter.jpg' },
  { name: 'Saturn', size: 1.7, orbitRadius: 30, orbitSpeed: 0.003, texture: 'textures/saturn.jpg' },
  { name: 'Uranus', size: 1.5, orbitRadius: 35, orbitSpeed: 0.002, texture: 'textures/uranus.jpg' },
  { name: 'Neptune', size: 1.4, orbitRadius: 40, orbitSpeed: 0.0015, texture: 'textures/neptune.jpg' }
];

// Create each planet
planets.forEach(planet => {
  planet.geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    planet.texture,
    (texture) => {
      planet.material = new THREE.MeshBasicMaterial({ map: texture });
      planet.mesh = new THREE.Mesh(planet.geometry, planet.material);
      scene.add(planet.mesh);
      console.log(`Loaded texture for ${planet.name}`);
    },
    undefined,
    (err) => {
      console.error(`Error loading texture for ${planet.name}:`, err);
    }
  );

  // Create orbit line
  const orbitPoints = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    orbitPoints.push(new THREE.Vector3(Math.cos(angle) * planet.orbitRadius, 0, Math.sin(angle) * planet.orbitRadius));
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineDashedMaterial({ color: 0x778dc7, dashSize: 0.5, gapSize: 0.5 });
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
  orbit.computeLineDistances();
  scene.add(orbit);
});

// Set camera position
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);

// Orbit parameters
let angles = planets.map(() => 0);

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Get sidebar elements
const sidebar = document.getElementById('sidebar');
const planetNameElement = document.getElementById('planet-name');
const planetInfoElement = document.getElementById('planet-info');
const closeSidebarButton = document.getElementById('close-sidebar');

// Add event listener for mouse clicks
window.addEventListener('click', (event) => {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the ray
  const intersects = raycaster.intersectObjects(planets.map(planet => planet.mesh).filter(mesh => mesh !== undefined));

  if (intersects.length > 0) {
    const intersectedPlanet = intersects[0].object;
    const planetData = planets.find(planet => planet.mesh === intersectedPlanet);

    // Populate sidebar with planet data
    planetNameElement.textContent = planetData.name;
    planetInfoElement.textContent = `This is ${planetData.name}. Size: ${planetData.size}, Orbit Radius: ${planetData.orbitRadius}`;
    
    // Show the sidebar
    sidebar.classList.add('open');
  }
});

// Close sidebar functionality
closeSidebarButton.addEventListener('click', () => {
  sidebar.classList.remove('open');
});

// Animate the scene
function animate() {
  requestAnimationFrame(animate);

  // Update each planet's position
  planets.forEach((planet, i) => {
    angles[i] += planet.orbitSpeed;
    if (planet.mesh) {
      planet.mesh.position.x = Math.cos(angles[i]) * planet.orbitRadius;
      planet.mesh.position.z = Math.sin(angles[i]) * planet.orbitRadius;
    }
  });

  renderer.render(scene, camera);
}

// Responsive design
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate();