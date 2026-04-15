const http = require('http');
const fs = require('fs');

const data = JSON.stringify({ name: 'TestUser', email: 'testreal' + Date.now() + '@test.com', password: 'password123', role: 'student' });

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, res => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        fs.writeFileSync('test_result_5000.txt', `STATUS: ${res.statusCode}\nBODY: ${body}\n`);
    });
});

req.on('error', e => {
    fs.writeFileSync('test_result_5000.txt', 'ERROR: ' + e.message + '\n');
});

req.write(data);
req.end();
