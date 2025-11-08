# Sign2Speech Setup Guide

This guide will help you set up and run the Sign2Speech application with the new UI interface, database, and backend server.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- A modern web browser with camera access

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install:
- Express.js (web server)
- CORS (Cross-Origin Resource Sharing)
- SQLite3 (database)

### 2. Start the Server

Run the backend server:

```bash
npm start
```

Or:

```bash
node server.js
```

The server will start on `http://localhost:3000`

You should see:
```
Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
Database initialized successfully
```

### 3. Access the Application

Open your web browser and navigate to:

```
http://localhost:3000
```

## Features

### Pages

Each page is a separate HTML file:

1. **home.html** - The main sign-to-speech converter interface
2. **about.html** - Information about the application and technology
3. **signup.html** - User registration (data stored in database)
4. **contact.html** - Contact form (messages stored in database)

You can access pages directly:
- `http://localhost:3000/` or `http://localhost:3000/home.html`
- `http://localhost:3000/about.html`
- `http://localhost:3000/signup.html`
- `http://localhost:3000/contact.html`

### Database

The application uses SQLite database (`sign2speech.db`) which is automatically created in the project directory.

**Tables:**
- `users` - Stores user registration data
- `contact_messages` - Stores contact form submissions

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/signup` - User registration
- `POST /api/contact` - Contact form submission
- `GET /api/admin/contacts` - View all contact messages (admin)
- `GET /api/admin/users` - View all users (admin)

## Usage

### Navigation

- Click on navigation links to switch between pages
- The logo in the navigation bar takes you back to the home page
- On mobile devices, use the hamburger menu (☰) to access navigation

### Sign Up

1. Navigate to the Sign Up page
2. Fill in the form:
   - Full Name (required)
   - Email Address (required, must be unique)
   - Password (required, minimum 6 characters)
   - Confirm Password (must match password)
   - Phone Number (optional)
3. Click "Sign Up"
4. Data will be saved to the database

### Contact Form

1. Navigate to the Contact page
2. Fill in the form:
   - Your Name (required)
   - Your Email (required)
   - Subject (required)
   - Message (required)
3. Click "Send Message"
4. Message will be saved to the database

## Development

### File Structure

```
sign-to-speech-converter/
├── home.html           # Home page (main application)
├── about.html          # About page
├── signup.html         # Sign up page
├── contact.html        # Contact page
├── styles.css          # Main stylesheet
├── animations.css      # Animation styles
├── nav.js              # Navigation functionality
├── api.js              # API communication
├── app.js              # Main application logic
├── server.js           # Express backend server
├── database.js         # Database operations
├── package.json        # Dependencies and scripts
└── sign2speech.db      # SQLite database (created automatically)
```

### Making Changes

- **Frontend**: Edit HTML, CSS, or JavaScript files and refresh the browser
- **Backend**: Edit `server.js` or `database.js` and restart the server
- **Database**: The database file is created automatically. To reset, delete `sign2speech.db`

## Troubleshooting

### Server won't start

- Make sure Node.js is installed: `node --version`
- Make sure dependencies are installed: `npm install`
- Check if port 3000 is already in use

### Database errors

- Delete `sign2speech.db` and restart the server to recreate the database
- Check file permissions in the project directory

### API connection errors

- Make sure the server is running on port 3000
- Check browser console for CORS errors
- Verify the API_BASE_URL in `api.js` matches your server URL

### Camera not working

- Make sure you've granted camera permissions in your browser
- Check if another application is using the camera
- Try a different browser

## Security Notes

⚠️ **Important**: This is a development/demo application. For production use:

1. **Password Hashing**: Currently passwords are stored in plain text. Use bcrypt or similar to hash passwords.
2. **Input Validation**: Add more robust input validation and sanitization.
3. **Authentication**: Add proper authentication and session management.
4. **HTTPS**: Use HTTPS in production.
5. **Environment Variables**: Store sensitive configuration in environment variables.
6. **Rate Limiting**: Add rate limiting to prevent abuse.

## License

MIT

