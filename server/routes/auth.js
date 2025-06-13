const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.create({ username, password, role });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login endpoint
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info.message });
    
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ success: true, user });
    });
  })(req, res, next);
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.logout();
  res.json({ success: true });
});

// Check auth status
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

module.exports = router;
