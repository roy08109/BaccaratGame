const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

const server = http.createServer((req, res) => {
    console.log('Request URL:', req.url); // Debug log
    
    // Remove query string if present
    const urlPath = req.url.split('?')[0];
    
    let filePath = '.' + urlPath;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Fix for paths starting with /
    if (filePath.startsWith('.//')) {
        filePath = filePath.replace('.//', './');
    }
    
    console.log('Resolved File Path:', filePath); // Debug log

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            }
            else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
            }
        }
        else {
            // Add charset=utf-8 for text types
            let finalContentType = contentType;
            if (contentType.startsWith('text/')) {
                finalContentType += '; charset=utf-8';
            }
            res.writeHead(200, { 'Content-Type': finalContentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
