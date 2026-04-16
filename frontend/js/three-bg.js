/**
 * Smart Parking - Cyber City 3D Engine (Ver 3.0)
 * High-fidelity procedural car models and smart traffic simulation
 */

function init3DBackground() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Digital Ground Grid
    const gridColor = 0x3b82f6;
    const gridHelper = new THREE.GridHelper(200, 30, gridColor, gridColor);
    gridHelper.position.y = -10;
    gridHelper.material.opacity = 0.08;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 2. Neon Perspective Lines
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-100, -10, 0), new THREE.Vector3(100, -10, 0)]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.2 });
    for(let i=0; i<10; i++) {
        const line = new THREE.Line(lineGeo, lineMat);
        line.position.z = (i * 20) - 100;
        scene.add(line);
    }

    // 3. High-Fidelity Procedural Cars
    const cars = [];
    const carColors = [0x2563eb, 0x4f46e5, 0x7c3aed, 0x0891b2];
    
    for (let i = 0; i < 40; i++) {
        const car = new THREE.Group();
        const mainColor = carColors[Math.floor(Math.random() * carColors.length)];

        // A. Chassis (Body)
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.4, 1.0),
            new THREE.MeshPhongMaterial({ color: mainColor, shininess: 80 })
        );
        car.add(body);

        // B. Cabin (Top part)
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.4, 0.8),
            new THREE.MeshPhongMaterial({ color: 0x111827, transparent: true, opacity: 0.9 })
        );
        cabin.position.set(-0.2, 0.4, 0);
        car.add(cabin);

        // C. Wheels (Cylinders)
        const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12);
        const wheelMat = new THREE.MeshPhongMaterial({ color: 0x000000 });
        const wheels = [];
        const wCoords = [
            [0.7, -0.2, 0.5], [0.7, -0.2, -0.5],
            [-0.7, -0.2, 0.5], [-0.7, -0.2, -0.5]
        ];

        wCoords.forEach(pos => {
            const w = new THREE.Mesh(wheelGeo, wheelMat);
            w.rotation.x = Math.PI / 2;
            w.position.set(...pos);
            car.add(w);
            wheels.push(w);
        });

        // D. Lights (Emissive)
        const frontL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const frontR = frontL.clone();
        frontL.position.set(1.1, 0, 0.3);
        frontR.position.set(1.1, 0, -0.3);
        car.add(frontL, frontR);

        const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.2), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        const tailR = tailL.clone();
        tailL.position.set(-1.1, 0, 0.3);
        tailR.position.set(-1.1, 0, -0.3);
        car.add(tailL, tailR);

        // Initial Position
        const zPos = (Math.random() - 0.5) * 60;
        const xPos = (Math.random() - 0.5) * 120;
        car.position.set(xPos, -9.5, zPos);
        
        car.userData = {
            speed: 0.15 + Math.random() * 0.25,
            dir: Math.random() > 0.5 ? 1 : -1,
            wheels: wheels
        };
        
        if (car.userData.dir === -1) car.rotation.y = Math.PI;

        scene.add(car);
        cars.push(car);
    }

    // Modern Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    camera.position.set(0, 8, 40);
    camera.lookAt(0, 0, 0);

    function animate() {
        requestAnimationFrame(animate);
        
        cars.forEach(car => {
            car.position.x += car.userData.speed * car.userData.dir;
            
            // Loop with random lane change
            if (car.position.x > 70) car.position.x = -70;
            if (car.position.x < -70) car.position.x = 70;

            // Spin the wheels
            car.userData.wheels.forEach(w => {
                w.rotation.y += car.userData.speed * 2;
            });
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

document.addEventListener('DOMContentLoaded', init3DBackground);
