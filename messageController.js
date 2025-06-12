const Message = require('../models/Message');
const { processMessage } = require('./messageProcessor');

class MessageController {
  static async getRecentMessages(req, res) {
    try {
      const messages = await Message.findByConnection(req.params.connectionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async processIncomingMessage(req, res) {
    try {
      const messageId = await processMessage(req.body);
      res.status(201).json({ id: messageId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { sessionName, receiver, message } = req.body;
      
      if (!whatsapp.sessions[sessionName]) {
        return res.status(400).json({ error: 'WhatsApp session not found' });
      }
      
      await whatsapp.sessions[sessionName].sendMessage(receiver, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = MessageController;
