const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configure Google Drive API
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth });

// Folder IDs for each code type
const folderIds = {
  'SUNSCREEN': 'your_sunscreen_folder_id',
  'SUNSCREENSRC': 'your_sunscreensrc_folder_id',
  'SHOPSIGN': 'your_shopsign_folder_id',
  'MITRA': 'your_mitra_folder_id',
  'MITRASRC': 'your_mitrasrc_folder_id',
  'INCENTIVE': 'your_incentive_folder_id'
};

exports.uploadToGoogleDrive = async (filePath, code) => {
  try {
    const folderId = folderIds[code] || 'your_default_folder_id';
    const fileName = path.basename(filePath);
    
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
    
    // Make the file publicly viewable
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    return response.data.webViewLink;
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return null;
  }
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
