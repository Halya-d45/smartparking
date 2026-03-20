const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to);
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        } else {
            fs.copyFileSync(fromPath, toPath);
        }
    });
}

console.log('Building for Vercel...');
try {
    copyFolderSync('frontend', 'build');
    console.log('Build complete: "frontend" copied to "build"');
} catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
}
