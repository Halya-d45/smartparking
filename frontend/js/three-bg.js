/**
 * Smart Parking - Hyper-Detail 3D Traffic (Ver 5.0)
 * The Ultimate Smart-City Automotive Simulation
 */

function initHyperTraffic() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Digital Expressway (Moving Grid)
    const gridColor = 0x3b82f6;
    const roadGroup = new THREE.Group();
    const grid = new THREE.GridHelper(400, 40, gridColor, 0x1e293b);
    grid.position.y = -10;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    roadGroup.add(grid);
    scene.add(roadGroup);

    // 2. High-Detail Procedural Vehicles
    const cars = [];
    const carPalette = [0x2563eb, 0x1d4ed8, 0x4f46e5, 0x7c3aed, 0x0891b2];

    for (let i = 0; i < 45; i++) {
        const car = new THREE.Group();
        const mainColor = carPalette[Math.floor(Math.random() * carPalette.length)];

        // A. Wedge Body
        const bodyGeo = new THREE.BoxGeometry(2.4, 0.4, 1.1);
        const bodyMat = new THREE.MeshPhongMaterial({ color: mainColor, shininess: 100 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        car.add(body);

        // B. Tiered Roof (Cabin)
        const roofGeo = new THREE.BoxGeometry(1.3, 0.45, 0.9);
        const roofMat = new THREE.MeshPhongMaterial({ color: 0x0f172a, transparent: true, opacity: 0.85 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(-0.2, 0.4, 0);
        car.add(roof);

        // C. Distinct Wheels with Axles
        const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
        const wheels = [];
        [[0.8, -0.2, 0.6], [0.8, -0.2, -0.6], [-0.8, -0.2, 0.6], [-0.8, -0.2, -0.6]].forEach(p => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            w.position.set(...p);
            car.add(w);
            wheels.push(w);
        });

        // D. Headlights & Tail-lights (Neon Bloom)
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.3), glowMat);
        const h2 = h1.clone();
        h1.position.set(1.2, 0.05, 0.35);
        h2.position.set(1.2, 0.05, -0.35);
        car.add(h1, h2);

        const rGlow = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 1.0), rGlow);
        t1.position.set(-1.2, 0.05, 0);
        car.add(t1);

        // E. Underglow Neon
        const uGlow = new THREE.PointLight(mainColor, 1.5, 4);
        uGlow.position.set(0, -0.5, 0);
        car.add(uGlow);

        // Position & Logic
        car.position.set((Math.random() - 0.5) * 160, -9.5, (Math.random() - 0.5) * 80);
        car.userData = {
            speed: 0.2 + Math.random() * 0.35,
            dir: Math.random() > 0.5 ? 1 : -1,
            wheels: wheels
        };
        if (car.userData.dir === -1) car.rotation.y = Math.PI;

        scene.add(car);
        cars.push(car);
    }

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);

    camera.position.set(0, 15, 60);
    camera.lookAt(0, 0, 0);

    // Mouse Parallax Interaction
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 10;
    });

    function animate() {
        requestAnimationFrame(animate);
        
        // Dynamic Camera movement
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (15 - mouseY - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        cars.forEach(car => {
            car.position.x += car.userData.speed * car.userData.dir;
            if (car.position.x > 80) car.position.x = -80;
            if (car.position.x < -80) car.position.x = 80;

            // Spin the Physical Wheels
            car.userData.wheels.forEach(w => w.rotation.y += car.userData.speed * 1.5);
            
            // Subtle body tilt
            car.rotation.z = Math.sin(Date.now() * 0.002) * 0.02;
        });

        // Loop the road grid for infinite movement feel
        grid.position.x += 0.05;
        if (grid.position.x > 10) grid.position.x = 0;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

document.addEventListener('DOMContentLoaded', initHyperTraffic);
