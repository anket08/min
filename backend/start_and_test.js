// Wrapper that captures all output and starts the server
const fs = require('fs');
const { spawn } = require('child_process');

const logFile = fs.createWriteStream('server_log.txt', { flags: 'w' });

const child = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env }
});

child.stdout.on('data', d => {
    logFile.write('[STDOUT] ' + d);
    process.stdout.write(d);
});

child.stderr.on('data', d => {
    logFile.write('[STDERR] ' + d);
    process.stderr.write(d);
});

child.on('exit', (code) => {
    const msg = `[EXIT] Server exited with code ${code}\n`;
    logFile.write(msg);
    logFile.end();
});

// After 5s, test registration
setTimeout(() => {
    const http = require('http');
    const data = JSON.stringify({ name: 'T', email: 't' + Date.now() + '@t.com', password: 'p', role: 'student' });

    const req = http.request({
        hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            logFile.write(`[TEST] STATUS: ${res.statusCode} BODY: ${body}\n`);
        });
    });
    req.on('error', e => logFile.write(`[TEST] ERROR: ${e.message}\n`));
    req.write(data);
    req.end();
}, 5000);
