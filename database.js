// Database Setup and Operations using SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'sign2speech.db');

let db = null;

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
            createTables().then(resolve).catch(reject);
        });
    });
}

// Create tables
function createTables() {
    return new Promise((resolve, reject) => {
        const queries = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Contact messages table
            `CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        let completed = 0;
        queries.forEach((query, index) => {
            db.run(query, (err) => {
                if (err) {
                    console.error(`Error creating table ${index}:`, err);
                    reject(err);
                    return;
                }
                completed++;
                if (completed === queries.length) {
                    console.log('Database tables created/verified');
                    resolve();
                }
            });
        });
    });
}

// Create a new user
function createUser(userData) {
    return new Promise((resolve, reject) => {
        // In production, hash the password!
        // For now, we'll store it as-is (NOT SECURE - for demo only)
        const { name, email, password, phone } = userData;
        
        const query = `INSERT INTO users (name, email, password, phone) 
                       VALUES (?, ?, ?, ?)`;
        
        db.run(query, [name, email, password, phone], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    reject(new Error('Email already exists'));
                } else {
                    reject(err);
                }
                return;
            }
            resolve(this.lastID);
        });
    });
}

// Get user by email
function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        
        db.get(query, [email], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
}

// Get all users (admin function)
function getAllUsers() {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC`;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Create a contact message
function createContactMessage(messageData) {
    return new Promise((resolve, reject) => {
        const { name, email, subject, message } = messageData;
        
        const query = `INSERT INTO contact_messages (name, email, subject, message) 
                       VALUES (?, ?, ?, ?)`;
        
        db.run(query, [name, email, subject, message], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
}

// Get all contact messages (admin function)
function getAllContacts() {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM contact_messages ORDER BY created_at DESC`;
        
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

// Close database connection
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initDatabase,
    createUser,
    getUserByEmail,
    getAllUsers,
    createContactMessage,
    getAllContacts,
    closeDatabase
};

