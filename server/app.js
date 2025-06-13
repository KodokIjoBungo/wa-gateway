require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const { startCronJobs } = require('./controllers/messageProcessor');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Passport config
const User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});
