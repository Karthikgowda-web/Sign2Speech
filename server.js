// Express Server with Database
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, createUser, getUserByEmail, createContactMessage, getAllContacts, getAllUsers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize database
initDatabase().then(() => {
    console.log('Database initialized successfully');
}).catch(err => {
    console.error('Database initialization error:', err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email, and password are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                error: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Create user
        const userId = await createUser({
            name,
            email,
            password, // In production, hash this password!
            phone: phone || null
        });

        res.status(201).json({ 
            message: 'User created successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }

        // Save contact message
        const messageId = await createContactMessage({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({ 
            message: 'Message sent successfully',
            messageId: messageId
        });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Admin endpoints (optional - for viewing data)
app.get('/api/admin/contacts', async (req, res) => {
    try {
        const contacts = await getAllContacts();
        res.json({ contacts });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML file (home page)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Serve individual pages
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Also serve index.html as home (for compatibility)
app.get('/index.html', (req, res) => {
    res.redirect('/home.html');
});

// Serve dashboard page
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve text-to-sign page
app.get('/text-to-sign.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'text-to-sign.html'));
});

// Dashboard can also be accessed from root (optional - you can change this)
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dashboard.html'));
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

