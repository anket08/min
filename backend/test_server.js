// Minimal standalone test server to isolate the registration error
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

// Inline User model for debugging
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'vendor', 'delivery', 'admin'], default: 'student' }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('TestUser', userSchema);

app.post('/test-register', async (req, res) => {
    console.log('>>> Received body:', req.body);
    try {
        const { name, email, password, role } = req.body;
        console.log('>>> Parsed fields:', { name, email, password: password ? '***' : 'MISSING', role });

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('>>> User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        console.log('>>> Creating user...');
        const user = await User.create({ name, email, password, role });
        console.log('>>> User created:', user._id);

        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        console.error('>>> ERROR:', error.message);
        console.error('>>> STACK:', error.stack);
        res.status(500).json({ message: error.message });
    }
});

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected!');

        app.listen(5001, () => console.log('Test server on port 5001'));
    } catch (err) {
        console.error('Failed to start:', err.message);
    }
}

main();
