const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
});

async function uploadToGoogleDrive(filePath, folderId, fileName) {
    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };
        
        const media = {
            mimeType: getMimeType(filePath),
            body: fs.createReadStream(filePath)
        };
        
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id,webViewLink'
        });
        
        return response.data.webViewLink;
    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error;
    }
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.gif':
            return 'image/gif';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
}

module.exports = { uploadToGoogleDrive };
