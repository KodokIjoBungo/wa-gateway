const { DataTypes } = require('sequelize');
const db = require('../db');

const Message = db.define('Message', {
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('received', 'sent', 'pending', 'failed'),
    defaultValue: 'received'
  },
  processed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Message;
