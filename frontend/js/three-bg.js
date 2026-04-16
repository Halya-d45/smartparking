/**
 * Smart Parking - 3D Traffic Background Engine
 * Uses Three.js to create a procedural smart city traffic flow
 */

function init3DBackground() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Dynamic car-like cubes
    const cars = [];
    const carGroup = new THREE.Group();
    scene.add(carGroup);

    // Premium Color Palette (Smart Tech Blues/Purples)
    const colors = [0x3b82f6, 0x6366f1, 0x8b5cf6, 0x0ea5e9];

    for (let i = 0; i < 45; i++) {
        // Create a car body
        const geometry = new THREE.BoxGeometry(1.2, 0.5, 0.6);
        const material = new THREE.MeshPhongMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)],
            transparent: true,
            opacity: 0.7,
            shininess: 100
        });
        const car = new THREE.Mesh(geometry, material);
        
        // Add "headlights" (small bright boxes)
        const lightGeo = new THREE.BoxGeometry(0.1, 0.2, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const h1 = new THREE.Mesh(lightGeo, lightMat);
        const h2 = new THREE.Mesh(lightGeo, lightMat);
        h1.position.set(0.6, 0, 0.2);
        h2.position.set(0.6, 0, -0.2);
        car.add(h1);
        car.add(h2);

        // Random starting volume
        car.position.set(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 15 - 25
        );
        
        // Motion metadata
        car.userData = {
            speed: 0.04 + Math.random() * 0.12,
            direction: Math.random() > 0.5 ? 1 : -1,
            floatOffset: Math.random() * Math.PI * 2
        };

        // Align car to direction
        if (car.userData.direction === -1) car.rotation.y = Math.PI;
        
        carGroup.add(car);
        cars.push(car);
    }

    // Set up lighting for the 3D scene
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 10);
    scene.add(mainLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    camera.position.z = 8;

    function animate() {
        requestAnimationFrame(animate);
        
        cars.forEach(car => {
            // Forward movement
            car.position.x += car.userData.speed * car.userData.direction;
            
            // Loop navigation (Smart City continuous flow)
            if (car.position.x > 35) car.position.x = -35;
            if (car.position.x < -35) car.position.x = 35;
            
            // Subtle digital "hover" effect
            car.position.y += Math.sin(Date.now() * 0.0015 + car.userData.floatOffset) * 0.008;
            car.rotation.z = Math.sin(Date.now() * 0.001 + car.userData.floatOffset) * 0.05;
        });

        // Slow cinematic camera rotation
        carGroup.rotation.y += 0.0003;
        carGroup.rotation.x += 0.0001;
        
        renderer.render(scene, camera);
    }

    animate();

    // Handle viewport changes
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Global invocation if container exists
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DBackground);
} else {
    init3DBackground();
}
