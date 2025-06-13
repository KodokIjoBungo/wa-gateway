const express = require('express');
const router = express.Router();
const sunscreenController = require('../controllers/sunscreenController');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');

router.get('/', isAuthenticated, sunscreenController.getAll);
router.get('/:id', isAuthenticated, sunscreenController.getById);
router.post('/', isAuthenticated, isAdmin, sunscreenController.create);
router.put('/:id', isAuthenticated, isAdmin, sunscreenController.update);
router.delete('/:id', isAuthenticated, isAdmin, sunscreenController.delete);
router.get('/stats/summary', isAuthenticated, sunscreenController.getSummary);

module.exports = router;
