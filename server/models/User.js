const { DataTypes } = require('sequelize');
const db = require('../db');
const bcrypt = require('bcryptjs');

const User = db.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('administrator', 'admin', 'user'),
    defaultValue: 'user'
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

User.prototype.authenticate = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
