require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const { whatsapp } = require('./whatsapp-client');

const app = express();

// Database connection
const db = require('./db');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wa', require('./routes/wa'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/sunscreen', require('./routes/sunscreen'));
app.use('/api/shopsign', require('./routes/shopsign'));
app.use('/api/mitra', require('./routes/mitra'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/auto-replies', require('./routes/autoReplies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stats', require('./routes/stats'));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Scheduled tasks
cron.schedule('0 10 * * *', async () => {
  console.log('Running scheduled task at 10 AM');
  try {
    // Check for unsent messages and send them
    const unsentMessages = await db.query(`
      SELECT m.*, wc.session_name 
      FROM messages m
      JOIN wa_connections wc ON m.wa_connection_id = wc.id
      WHERE m.status = 'pending' AND m.is_group = FALSE
    `);
    
    for (const message of unsentMessages) {
      if (whatsapp.sessions[message.session_name]) {
        try {
          await whatsapp.sessions[message.session_name].sendMessage(
            message.receiver, 
            message.message_text
          );
          
          await db.query(
            'UPDATE messages SET status = "sent" WHERE id = ?',
            [message.id]
          );
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
