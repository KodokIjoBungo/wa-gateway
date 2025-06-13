const { DataTypes } = require('sequelize');
const db = require('../db');

const Sunscreen = db.define('Sunscreen', {
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleDriveUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Sunscreen;
