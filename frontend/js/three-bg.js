/**
 * Smart Parking - Cyber City 3D Engine (Ver 2.0)
 * High-end digital traffic simulation with neon aesthetics
 */

function init3DBackground() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 1. Digital Ground Grid
    const gridColor = 0x3b82f6;
    const gridHelper = new THREE.GridHelper(200, 40, gridColor, gridColor);
    gridHelper.position.y = -10;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 2. City Buildings (Ghost columns)
    const buildingGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
        const h = 5 + Math.random() * 20;
        const geo = new THREE.BoxGeometry(2, h, 2);
        const mat = new THREE.MeshPhongMaterial({ 
            color: 0x1e293b, 
            transparent: true, 
            opacity: 0.05,
            wireframe: true 
        });
        const b = new THREE.Mesh(geo, mat);
        b.position.set((Math.random() - 0.5) * 100, h/2 - 10, (Math.random() - 0.5) * 100);
        buildingGroup.add(b);
    }
    scene.add(buildingGroup);

    // 3. Smart Traffic (Cars with Neon Trails)
    const cars = [];
    const carColors = [0x3b82f6, 0x60a5fa, 0x93c5fd];
    
    for (let i = 0; i < 60; i++) {
        const carGroup = new THREE.Group();
        
        // Car Body
        const bodyGeo = new THREE.BoxGeometry(1.4, 0.4, 0.6);
        const bodyMat = new THREE.MeshPhongMaterial({ 
            color: carColors[Math.floor(Math.random() * carColors.length)],
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.5
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        carGroup.add(body);

        // Headlights (Neon White)
        const lightGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const h1 = new THREE.Mesh(lightGeo, lightMat);
        const h2 = new THREE.Mesh(lightGeo, lightMat);
        h1.position.set(0.7, 0, 0.2);
        h2.position.set(0.7, 0, -0.2);
        carGroup.add(h1);
        carGroup.add(h2);

        // Tail Lights (Neon Red)
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const t1 = new THREE.Mesh(lightGeo, tailMat);
        const t2 = new THREE.Mesh(lightGeo, tailMat);
        t1.position.set(-0.7, 0, 0.2);
        t2.position.set(-0.7, 0, -0.2);
        carGroup.add(t1);
        carGroup.add(t2);

        // Initial Position
        const zPos = (Math.random() - 0.5) * 60;
        const xPos = (Math.random() - 0.5) * 100;
        carGroup.position.set(xPos, -9.6, zPos);
        
        carGroup.userData = {
            speed: 0.1 + Math.random() * 0.2,
            dir: Math.random() > 0.5 ? 1 : -1
        };
        
        if (carGroup.userData.dir === -1) carGroup.rotation.y = Math.PI;

        scene.add(carGroup);
        cars.push(carGroup);
    }

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(amb);
    const point = new THREE.PointLight(0x3b82f6, 1, 100);
    point.position.set(10, 10, 10);
    scene.add(point);

    camera.position.set(0, 5, 30);
    camera.lookAt(0, 0, 0);

    function animate() {
        requestAnimationFrame(animate);
        
        cars.forEach(car => {
            car.position.x += car.userData.speed * car.userData.dir;
            if (car.position.x > 60) car.position.x = -60;
            if (car.position.x < -60) car.position.x = 60;
        });

        gridHelper.position.z += 0.05;
        if (gridHelper.position.z > 5) gridHelper.position.z = 0;

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
