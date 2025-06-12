const db = require('../db');

class Message {
  static async create(messageData) {
    const result = await db.execute(
      `INSERT INTO messages 
      (wa_connection_id, message_id, sender, receiver, message_type, message_text, media_url, group_name, is_group) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        messageData.wa_connection_id,
        messageData.message_id,
        messageData.sender,
        messageData.receiver,
        messageData.message_type,
        messageData.message_text,
        messageData.media_url,
        messageData.group_name,
        messageData.is_group
      ]
    );
    return result.insertId;
  }

  static async findByConnection(connectionId, limit = 50) {
    return await db.query(
      `SELECT * FROM messages 
      WHERE wa_connection_id = ? 
      ORDER BY received_at DESC 
      LIMIT ?`,
      [connectionId, limit]
    );
  }

  static async updateStatus(messageId, status) {
    await db.execute(
      'UPDATE messages SET status = ? WHERE id = ?',
      [status, messageId]
    );
  }
}

module.exports = Message;
