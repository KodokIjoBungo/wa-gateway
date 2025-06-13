const { Client } = require('whatsapp-web.js');
const Message = require('../models/Message');
const Sunscreen = require('../models/Sunscreen');
const Shopsign = require('../models/Shopsign');
const Mitra = require('../models/Mitra');
const WAConnection = require('../models/WAConnection');
const { uploadToGoogleDrive } = require('./googleDriveService');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Process incoming messages
exports.processIncomingMessage = async (client, message) => {
  try {
    const from = message.from;
    const body = message.body;
    const isGroup = message.isGroupMsg;
    
    // Save message to database
    const newMessage = await Message.create({
      from,
      to: client.info.wid.user,
      body,
      isGroup,
      status: 'received'
    });
    
    // Process message content
    if (body) {
      await processMessageContent(body, message);
    }
    
    // Check for auto-reply triggers
    await checkAutoReply(client, message);
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

async function processMessageContent(body, message) {
  const parts = body.split(' ');
  const code = parts[0];
  
  // Check if message matches any of our codes
  const validCodes = ['SUNSCREEN', 'SUNSCREENSRC', 'SHOPSIGN', 'MITRA', 'MITRASRC', 'INCENTIVE'];
  
  if (validCodes.includes(code)) {
    const modelMap = {
      'SUNSCREEN': Sunscreen,
      'SUNSCREENSRC': Sunscreen,
      'SHOPSIGN': Shopsign,
      'MITRA': Mitra,
      'MITRASRC': Mitra,
      'INCENTIVE': Mitra
    };
    
    const Model = modelMap[code];
    const sender = parts[1];
    const amount = parts.length > 2 ? parseInt(parts[2]) : null;
    
    // Handle media
    let mediaUrl = null;
    let googleDriveUrl = null;
    
    if (message.hasMedia) {
      const media = await message.downloadMedia();
      const uploadPath = path.join(process.env.UPLOAD_PATH, code, `${Date.now()}.${media.mimetype.split('/')[1]}`);
      
      // Ensure directory exists
      if (!fs.existsSync(path.dirname(uploadPath))) {
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
      }
      
      fs.writeFileSync(uploadPath, media.data, 'base64');
      mediaUrl = uploadPath;
      
      // Upload to Google Drive
      googleDriveUrl = await uploadToGoogleDrive(uploadPath, code);
    }
    
    // Create record
    await Model.create({
      code,
      sender,
      amount,
      mediaUrl,
      googleDriveUrl,
      keterangan: parts.slice(3).join(' ') || null
    });
  }
}

async function checkAutoReply(client, message) {
  const body = message.body;
  const from = message.from;
  
  if (body.includes('LAPORAN SUNSCREEN')) {
    const count = await Sunscreen.count();
    client.sendMessage(from, `Total Sunscreen: ${count}`);
  }
  // Add other auto-reply conditions here
}

// Scheduled tasks
exports.startCronJobs = () => {
  // Check for unsent messages every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const unsentMessages = await Message.findAll({
        where: { status: 'pending' }
      });
      
      const connections = await WAConnection.findAll({
        where: { status: 'connected' }
      });
      
      for (const message of unsentMessages) {
        for (const connection of connections) {
          const client = clients[connection.phoneNumber];
          if (client) {
            await client.sendMessage(message.to, message.body);
            await message.update({ status: 'sent' });
          }
        }
      }
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  });
};
