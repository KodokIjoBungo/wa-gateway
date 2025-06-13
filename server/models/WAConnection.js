const { DataTypes } = require('sequelize');
const db = require('../db');

const WAConnection = db.define('WAConnection', {
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('connected', 'disconnected', 'authenticating'),
    defaultValue: 'disconnected'
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionData: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = WAConnection;
