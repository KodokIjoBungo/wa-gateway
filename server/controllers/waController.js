const { Client } = require('whatsapp-web.js');
const WAConnection = require('../models/WAConnection');
const qrcode = require('qrcode');

const clients = {};

exports.connectWA = async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    const client = new Client();
    clients[phoneNumber] = client;
    
    client.on('qr', async (qr) => {
      await WAConnection.update(
        { qrCode: qr, status: 'authenticating' },
        { where: { phoneNumber } }
      );
    });
    
    client.on('ready', async () => {
      await WAConnection.update(
        { status: 'connected', qrCode: null },
        { where: { phoneNumber } }
      );
    });
    
    client.on('disconnected', async () => {
      await WAConnection.update(
        { status: 'disconnected' },
        { where: { phoneNumber } }
      );
    });
    
    await client.initialize();
    
    // Save session data periodically
    setInterval(async () => {
      const sessionData = client.session;
      if (sessionData) {
        await WAConnection.update(
          { sessionData: JSON.stringify(sessionData) },
          { where: { phoneNumber } }
        );
      }
    }, 60000);
    
    res.json({ success: true, message: 'WA connection initialized' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const connections = await WAConnection.findAll();
    res.json({ success: true, connections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
