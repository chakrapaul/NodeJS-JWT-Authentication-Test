const express = require('express');
const jwt = require('jsonwebtoken');
const { expressjwt } = require("express-jwt");
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const secretKey = 'My super secret key';

// Middleware for JWT authentication
const jwtMW = expressjwt({ secret: secretKey, algorithms: ["HS256"] });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});

// Users data
let users = [
    { id: 1, username: 'paul', password: '1234' },
    { id: 2, username: 'chakra', password: '4567' }
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' }); // JWT expires in 3 minutes
        return res.json({
            success: true,
            err: null,
            token
        });
    } else {
        return res.status(401).json({
            success: false,
            token: null,
            err: 'Username or password is incorrect'
        });
    }
});

// Protected dashboard route
app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in users can see.'
    });
});

// Protected settings route
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is the settings page that only logged-in users can access.'
    });
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            officialError: err,
            err: 'Unauthorized access. Please log in.'
        });
    }
    next(err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
