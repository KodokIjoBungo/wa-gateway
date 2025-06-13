const { DataTypes } = require('sequelize');
const db = require('../db');

const Mitra = db.define('Mitra', {
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

module.exports = Mitra;
