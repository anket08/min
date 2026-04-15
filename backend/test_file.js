const http = require('http');
const fs = require('fs');

const data = JSON.stringify({ name: 'X', email: 'x' + Date.now() + '@x.com', password: 'pass123', role: 'student' });

const req = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/test-register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        const result = `STATUS: ${res.statusCode}\nBODY: ${body}\n`;
        fs.writeFileSync('test_result.txt', result);
    });
});

req.on('error', e => {
    fs.writeFileSync('test_result.txt', 'ERROR: ' + e.message + '\n');
});

req.write(data);
req.end();
