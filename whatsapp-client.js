const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const db = require('./db');
const { processMessage } = require('./controllers/messageProcessor');

const sessions = {};

async function initSession(sessionName, phoneNumber) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionName }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });
    
    // Store the client in our sessions object
    sessions[sessionName] = client;
    
    // Update database status
    await db.execute(
        'UPDATE wa_connections SET status = "pending" WHERE session_name = ?',
        [sessionName]
    );
    
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        // In a real implementation, you would send this QR to the web interface
        console.log(`QR code for ${phoneNumber}:`);
    });
    
    client.on('authenticated', () => {
        console.log(`Client ${sessionName} authenticated`);
    });
    
    client.on('auth_failure', msg => {
        console.error(`Client ${sessionName} authentication failure`, msg);
        updateConnectionStatus(sessionName, 'disconnected');
    });
    
    client.on('ready', () => {
        console.log(`Client ${sessionName} is ready`);
        updateConnectionStatus(sessionName, 'connected');
    });
    
    client.on('disconnected', (reason) => {
        console.log(`Client ${sessionName} disconnected`, reason);
        updateConnectionStatus(sessionName, 'disconnected');
        delete sessions[sessionName];
    });
    
    client.on('message', async msg => {
        console.log('Received message:', msg.body);
        
        try {
            // Get connection ID from database
            const [connections] = await db.query(
                'SELECT id FROM wa_connections WHERE session_name = ?',
                [sessionName]
            );
            
            if (connections.length === 0) {
                console.error('No connection found for session:', sessionName);
                return;
            }
            
            const connectionId = connections[0].id;
            
            // Prepare message object
            const messageObj = {
                wa_connection_id: connectionId,
                message_id: msg.id.id,
                sender: msg.from,
                receiver: msg.to,
                message_type: msg.hasMedia ? 'media' : 'text',
                message_text: msg.body,
                media_url: msg.hasMedia ? await downloadMedia(msg) : null,
                group_name: msg.isGroupMsg ? (await msg.getChat()).name : null,
                is_group: msg.isGroupMsg,
                status: 'received'
            };
            
            // Process the message
            await processMessage(messageObj);
            
            // Check for auto-reply
            if (msg.body) {
                const reply = await checkAutoReply(msg.body);
                if (reply) {
                    await client.sendMessage(msg.from, reply);
                }
            }
        } catch (error) {
            console.error('Error processing incoming message:', error);
        }
    });
    
    client.initialize();
}

async function terminateSession(sessionName) {
    if (sessions[sessionName]) {
        await sessions[sessionName].destroy();
        delete sessions[sessionName];
    }
    
    // Update database status
    await updateConnectionStatus(sessionName, 'disconnected');
}

async function updateConnectionStatus(sessionName, status) {
    await db.execute(
        'UPDATE wa_connections SET status = ?, last_connection = NOW() WHERE session_name = ?',
        [status, sessionName]
    );
}

async function downloadMedia(message) {
    if (!message.hasMedia) return null;
    
    try {
        const media = await message.downloadMedia();
        
        // Save to local filesystem
        const mediaPath = `D:/uploads/media/${message.id.id}.${media.mimetype.split('/')[1]}`;
        require('fs').writeFileSync(mediaPath, media.data, 'base64');
        
        return mediaPath;
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
}

async function checkAutoReply(messageText) {
    try {
        const response = await fetch('http://localhost:3000/api/auto-replies/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });
        
        const data = await response.json();
        return data.shouldReply ? data.reply : null;
    } catch (error) {
        console.error('Error checking auto reply:', error);
        return null;
    }
}

async function sendMessageToGroup(sessionName, groupId, message, mediaPath = null) {
    if (!sessions[sessionName]) {
        throw new Error('Session not found');
    }
    
    const client = sessions[sessionName];
    
    try {
        if (mediaPath) {
            const media = MessageMedia.fromFilePath(mediaPath);
            await client.sendMessage(groupId, media, { caption: message });
        } else {
            await client.sendMessage(groupId, message);
        }
        
        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

module.exports = {
    sessions,
    initSession,
    terminateSession,
    sendMessageToGroup
};
