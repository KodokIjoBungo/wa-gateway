const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/recent', auth, MessageController.getRecentMessages);
router.post('/incoming', MessageController.processIncomingMessage);
router.post('/send', auth, MessageController.sendMessage);

module.exports = router;
