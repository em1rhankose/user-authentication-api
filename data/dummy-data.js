const User = require("../models/user");
const bcrypt = require("bcrypt");
const Role = require("../models/role");

// Bu sayfadaki verileri, test esnasında veritabanını bazen yeniden oluşturmam gerektiği için 
// hızlıca veritabanını doldurmak için yazdım

async function populate() {

        // Kullanıcı tablosunun doldurulması

        const users = await User.bulkCreate([
            {fullname: "Emirhan KÖSE", email: "koseemirhan09@gmail.com", password: await bcrypt.hash("123456789", 10)},
            {fullname: "Emir KÖSE", email: "info@emirkose.com", password: await bcrypt.hash("123456789", 10)},
            {fullname: "Ahmet Mehmet", email: "info@ahmetmehmet.com", password: await bcrypt.hash("123456789", 10)},
            {fullname: "Ali Veli", email: "info@aliveli.com", password: await bcrypt.hash("123456789", 10)},
        ]);

        // Yetki için rol tablosunun doldurulması
        const roles = await Role.bulkCreate([
            {rolename: "Admin"},
            {rolename: "Moderator"},
            {rolename: "Guest"},
        ]);

        // Kullanıcı yetkilendirmesi

        await users[0].addRole(roles[0]);   // admin => Emirhan KÖSE
        
        await users[0].addRole(roles[1]);   // moderator => Emirhan KÖSE
        await users[1].addRole(roles[1]);   // moderator => Emir KÖSE
        await users[2].addRole(roles[1]);   // moderator => Ahmet Mehmet

        await users[3].addRole(roles[2]);   // guest => Ali Veli

}

module.exports = populate;