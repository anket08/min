const http = require('http');

const data = JSON.stringify({
    name: 'Test',
    email: `test${Date.now()}@test.com`,
    password: 'Password123'
});

const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
}, (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log(`STATUS: ${res.statusCode}
BODY: ${body}`));
});

req.write(data);
req.end();
