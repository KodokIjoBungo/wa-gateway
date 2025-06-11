const mysql = require('mysql2/promise');
const { uploadToGoogleDrive } = require('./googleDriveService');
const path = require('path');
const fs = require('fs');

async function processMessage(message) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Save the raw message first
        const [messageResult] = await connection.execute(
            'INSERT INTO messages (wa_connection_id, message_id, sender, receiver, message_type, message_text, media_url, group_name, is_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                message.wa_connection_id,
                message.message_id,
                message.sender,
                message.receiver,
                message.message_type,
                message.message_text,
                message.media_url,
                message.group_name,
                message.is_group
            ]
        );
        
        // Process message content
        const content = message.message_text.trim();
        const parts = content.split(' ');
        
        if (parts.length >= 3) {
            const code = parts[0].toUpperCase();
            const nomorPengirim = parts[1];
            const aml = parts.length > 2 ? parts[2] : null;
            const jumlah = parts.length > 3 ? parseInt(parts[3]) : null;
            
            let tableName;
            let gdriveFolderId;
            
            // Determine table and Google Drive folder based on code
            switch(code) {
                case 'SUNSCREEN':
                case 'SUNSCREENSRC':
                    tableName = 'sunscreen';
                    gdriveFolderId = process.env.GDRIVE_SUNSCREEN_FOLDER;
                    break;
                case 'SHOPSIGN':
                    tableName = 'shopsign';
                    gdriveFolderId = process.env.GDRIVE_SHOPSIGN_FOLDER;
                    break;
                case 'MITRA':
                case 'MITRASRC':
                    tableName = 'mitra';
                    gdriveFolderId = process.env.GDRIVE_MITRA_FOLDER;
                    break;
                case 'INCENTIVE':
                    tableName = 'incentive';
                    gdriveFolderId = process.env.GDRIVE_INCENTIVE_FOLDER;
                    break;
                default:
                    // Unknown code, skip processing
                    return;
            }
            
            // Handle media upload
            let mediaPath = null;
            let gdriveUrl = null;
            
            if (message.media_url) {
                const uploadDir = 'D:/uploads/' + tableName + '/';
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                
                const fileName = Date.now() + path.extname(message.media_url);
                mediaPath = uploadDir + fileName;
                
                // Save to local (in a real app, you would download the media from WhatsApp)
                fs.writeFileSync(mediaPath, message.media_data);
                
                // Upload to Google Drive
                gdriveUrl = await uploadToGoogleDrive(mediaPath, gdriveFolderId, fileName);
            }
            
            // Save to appropriate table
            await connection.execute(
                `INSERT INTO ${tableName} (message_id, kode, nomor_pengirim, aml, jumlah, media_path, gdrive_url, keterangan, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    messageResult.insertId,
                    code,
                    nomorPengirim,
                    aml,
                    jumlah,
                    mediaPath,
                    gdriveUrl,
                    parts.slice(4).join(' '), // Keterangan
                    'processed'
                ]
            );
        }
    } catch (error) {
        console.error('Error processing message:', error);
        // Update message status to failed
        await connection.execute(
            'UPDATE messages SET status = "failed" WHERE id = ?',
            [messageResult.insertId]
        );
    } finally {
        await connection.end();
    }
}

module.exports = { processMessage };
