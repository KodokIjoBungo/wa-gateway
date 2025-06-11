const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mysql = require('mysql2/promise');
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
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
        'UPDATE wa_connections SET status = "pending" WHERE session_name = ?',
        [sessionName]
    );
    
    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
        // You might want to send this QR to a web interface
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
        
        // Prepare message object for processing
        const messageObj = {
            wa_connection_id: await getConnectionId(sessionName),
            message_id: msg.id.id,
            sender: msg.from,
            receiver: msg.to,
            message_type: msg.hasMedia ? 'image' : 'text',
            message_text: msg.body,
            media_url: msg.hasMedia ? await downloadMedia(msg) : null,
            group_name: msg.isGroupMsg ? (await msg.getChat()).name : null,
            is_group: msg.isGroupMsg
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
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
        'UPDATE wa_connections SET status = ?, last_connection = NOW() WHERE session_name = ?',
        [status, sessionName]
    );
    await connection.end();
}

async function getConnectionId(sessionName) {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
        'SELECT id FROM wa_connections WHERE session_name = ?',
        [sessionName]
    );
    await connection.end();
    return rows.length > 0 ? rows[0].id : null;
}

async function downloadMedia(message) {
    // Implement media download logic
    // Return the media data or path
}

async function checkAutoReply(messageText) {
    try {
        const response = await fetch('/api/auto-replies/check', {
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
    
    if (mediaPath) {
        const media = MessageMedia.fromFilePath(mediaPath);
        await client.sendMessage(groupId, media, { caption: message });
    } else {
        await client.sendMessage(groupId, message);
    }
}

module.exports = {
    initSession,
    terminateSession,
    sendMessageToGroup
};
