module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ success: false, error: 'Not authenticated' });
  },
  
  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'administrator')) {
      return next();
    }
    res.status(403).json({ success: false, error: 'Not authorized' });
  },
  
  isAdministrator: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'administrator') {
      return next();
    }
    res.status(403).json({ success: false, error: 'Not authorized' });
  }
};
