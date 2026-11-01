/**
 * ============================================================================
 * WORDBRIDGE: Local Zero-Dependency HTTP Development Server
 * Serves the GUI folder and opens the user's default browser automatically.
 * Run: node server.js (from the "dsa pbl" directory)
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
// Serve from the "gui" subfolder relative to this server.js
const GUI_DIR = path.join(__dirname, 'gui');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.txt':  'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];

    // Default to index.html
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    // Prevent path traversal attacks
    const safePath = path.normalize(reqPath).replace(/^(\.\.[\\/])+/, '');
    const filePath = path.join(GUI_DIR, safePath);

    // Ensure the resolved path is still inside GUI_DIR
    if (!filePath.startsWith(GUI_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            console.warn(`[404] ${req.url}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`404 Not Found: ${reqPath}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n${'='.repeat(54)}`);
    console.log(`  🌉  WordBridge GUI is running at: ${url}`);
    console.log(`${'='.repeat(54)}\n`);
    console.log(`  Serving files from: ${GUI_DIR}`);
    console.log(`  Press Ctrl+C to stop the server.\n`);

    // Auto-open browser on Windows / Mac / Linux
    const startCmd =
        process.platform === 'win32'  ? `start ${url}` :
        process.platform === 'darwin' ? `open ${url}`  : `xdg-open ${url}`;
    exec(startCmd, () => {});
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Close the other process or change PORT in server.js\n`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
