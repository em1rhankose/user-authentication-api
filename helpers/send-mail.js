// Mail gönderme işlemleri için 

const nodemailer = require("nodemailer");
const config = require("../config");

var transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // Gmail için: smtp.gmail.com
    secureConnection: false,
    port: 587,
    tls: {
        ciphers: "SSLv3"
    },
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
})

module.exports = transporter;