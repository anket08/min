const http = require('http');
const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('RES', res.statusCode, d));
});
req.on('error', e => console.log('ERR', e.message));
req.write(JSON.stringify({ name: 'X', email: 'X1@x.com', password: 'pass', role: 'student' }));
req.end();
