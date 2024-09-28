// Import the necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('validator');
const bcrypt = require('bcrypt');

// Create an instance of an Express application
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Array to store user data
const users = [];

// Route to handle GET requests
app.get('/users', (req, res) => {
    console.log('GET /users endpoint was accessed');
    
    // Return user data with password replaced by asterisks
    const usersWithoutPassword = users.map(user => ({
        name: user.name,
        email: user.email,
        password: '********' // Mask the password
    }));

    res.status(200).json(usersWithoutPassword);
});

// Route to handle POST requests
app.post('/register', async (req, res, next) => {
    const { name, email, password } = req.body;

    // Validate request body
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check for existing email
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Encrypt password
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ name, email, password: hashedPassword });
        console.log(`POST /register endpoint was accessed ${JSON.stringify(users)}`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        next(err); // Pass error to the global error handler
    }
});

// Route to handle errors for unhandled requests
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
