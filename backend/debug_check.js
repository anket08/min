// Debug test: start server, wait for it to be ready, then test registration
const { execSync } = require('child_process');

// Check installed bcryptjs version
try {
    const bcrypt = require('bcryptjs');
    console.log('bcryptjs version:', require('bcryptjs/package.json').version);

    // Test bcrypt directly
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('testpassword', salt);
    console.log('bcrypt hash test OK:', hash);
    console.log('bcrypt compare test:', bcrypt.compareSync('testpassword', hash));
} catch (e) {
    console.error('bcryptjs error:', e.message);
}

// Check mongoose version
try {
    const mongoose = require('mongoose');
    console.log('mongoose version:', require('mongoose/package.json').version);
} catch (e) {
    console.error('mongoose error:', e.message);
}

// Check express version
try {
    console.log('express version:', require('express/package.json').version);
} catch (e) {
    console.error('express error:', e.message);
}

// Check jsonwebtoken version
try {
    console.log('jsonwebtoken version:', require('jsonwebtoken/package.json').version);
} catch (e) {
    console.error('jsonwebtoken error:', e.message);
}
