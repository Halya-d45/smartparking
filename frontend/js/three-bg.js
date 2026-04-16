/**
 * Smart Parking - Cinematic Video Background
 * Replaces procedural models with high-fidelity urban motion
 */

function initPremiumBackground() {
    const container = document.getElementById('dashboard-3d-bg');
    if (!container) return;

    // 1. Create Video Element
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    
    // High-quality urban traffic loop (Pexels / Public Assets)
    video.src = 'https://assets.mixkit.co/videos/preview/mixkit-car-lights-moving-on-a-busy-street-42283-large.mp4';
    
    video.style.position = 'fixed';
    video.style.top = '50%';
    video.style.left = '50%';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.transform = 'translate(-50%, -50%)';
    video.style.zIndex = '-10';
    video.style.opacity = '0.15'; // Subtle background
    video.style.filter = 'grayscale(30%) contrast(120%)';

    // 2. Add Dark/Themed Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), transparent)';
    overlay.style.zIndex = '-9';
    overlay.style.pointerEvents = 'none';

    container.appendChild(video);
    container.appendChild(overlay);

    // 3. Fallback to Image if Video Fails
    video.onerror = () => {
        container.style.backgroundImage = 'url("https://images.pexels.com/photos/307008/pexels-photo-307008.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")';
        container.style.backgroundSize = 'cover';
        container.style.opacity = '0.1';
    };
}

document.addEventListener('DOMContentLoaded', initPremiumBackground);
