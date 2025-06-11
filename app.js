require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const cron = require('node-cron');

const app = express();

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'wa_gateway'
};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Google Drive Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'D:/uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wa', require('./routes/wa'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/sunscreen', require('./routes/sunscreen'));
app.use('/api/shopsign', require('./routes/shopsign'));
app.use('/api/mitra', require('./routes/mitra'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/auto-replies', require('./routes/autoReplies'));
app.use('/api/stats', require('./routes/stats'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// WhatsApp connection monitoring
const checkWhatsAppConnections = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM wa_connections WHERE status = "disconnected"');
    
    for (const row of rows) {
      // Logic to reconnect WhatsApp numbers
      console.log(`Attempting to reconnect ${row.phone_number}`);
      // Add your WhatsApp reconnection logic here
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error checking WhatsApp connections:', error);
  }
};

// Scheduled tasks
cron.schedule('0 10 * * *', () => {
  console.log('Running scheduled task at 10 AM');
  checkWhatsAppConnections();
  // Add other scheduled tasks here
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
