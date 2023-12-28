const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const User = sequelize.define("user", {
  fullname: {
    type: DataTypes.STRING,
    allowNull: false,                           // Sequelize ile User modelini oluşturdum 
    unique: true                                // User modeli veritabanında kendi tablosunu oluşturuyor ve ona karşılık geliyor
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resetToken: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenExpiration: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
});

module.exports = User;
