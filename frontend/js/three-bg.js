/**
 * Smart Parking - Neon Pulse 3D Engine (Ver 4.0)
 * Modern Cyber-City Automotive Animation
 */

function initNeonNight() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Digital Road Grid (Blue Bloom)
    const gridHelper = new THREE.GridHelper(300, 60, 0x1e40af, 0x0f172a);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 2. Glowing City Pillars
    for (let i = 0; i < 50; i++) {
        const height = 5 + Math.random() * 30;
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(2, height, 2),
            new THREE.MeshPhongMaterial({ 
                color: 0x1e3a8a, 
                transparent: true, 
                opacity: 0.1,
                emissive: 0x3b82f6,
                emissiveIntensity: 0.2
            })
        );
        box.position.set((Math.random() - 0.5) * 150, (height / 2) - 8, (Math.random() - 0.5) * 150);
        scene.add(box);
    }

    // 3. Neon Cars (Streamlined glowing shapes)
    const cars = [];
    const carColors = [0x3b82f6, 0x8b5cf6, 0xec4899, 0x10b981];

    for (let i = 0; i < 60; i++) {
        const car = new THREE.Group();
        const color = carColors[Math.floor(Math.random() * carColors.length)];

        // Main Glow Body
        const body = new THREE.Mesh(
            new THREE.CapsuleGeometry(0.3, 1.2, 4, 8),
            new THREE.MeshStandardMaterial({ 
                color: color, 
                emissive: color, 
                emissiveIntensity: 2,
                metalness: 1,
                roughness: 0
            })
        );
        body.rotation.z = Math.PI / 2;
        car.add(body);

        // Headlight Beams
        const light = new THREE.PointLight(0xffffff, 0.5, 10);
        light.position.set(1, 0, 0);
        car.add(light);

        car.position.set(
            (Math.random() - 0.5) * 150,
            -7.5,
            (Math.random() - 0.5) * 100
        );

        car.userData = {
            speed: 0.2 + Math.random() * 0.4,
            dir: Math.random() > 0.5 ? 1 : -1
        };

        if (car.userData.dir === -1) car.rotation.y = Math.PI;

        scene.add(car);
        cars.push(car);
    }

    // Camera & Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    camera.position.set(0, 15, 60);
    camera.lookAt(0, 0, 0);

    function animate() {
        requestAnimationFrame(animate);
        
        cars.forEach(car => {
            car.position.x += car.userData.speed * car.userData.dir;
            if (car.position.x > 80) car.position.x = -80;
            if (car.position.x < -80) car.position.x = 80;
        });

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

document.addEventListener('DOMContentLoaded', initNeonNight);
