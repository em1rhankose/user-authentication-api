const { DataTypes } = require("sequelize");
const sequelize = require("../data/db");

const Role = sequelize.define("role",{
    rolename: {
        type: DataTypes.STRING,     // Sequelize ile Role modelini oluşturdum 
        allowNull: false            // Role modeli veritabanında kendi tablosunu oluşturuyor ve ona karşılık geliyor      
    }
});

module.exports = Role;