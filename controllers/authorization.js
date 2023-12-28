const User = require("../models/user")
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");
const { Op } = require("sequelize");
const Role = require("../models/role")
const jwt = require("jsonwebtoken")


exports.get_login = async function(req, res) { // Get Login
    try {
        const message = req.session.message; 
        delete req.session.message;
        return res.render("auth/login", {   //Login Sayfası Getirilir 
            title: "login",
            message: message,
            csrfToken: req.csrfToken
        });
    }
    catch(err) {
        console.log(err);
    }
}
exports.post_login = async function(req, res) { //Post Login

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({
            where: { email: email },            //User ve UserRoles tabloları üzerinde sorgu
        });
        const userRoles = await user.getRoles({
            attributes: ["rolename"],
            raw: true
        });

        //Mail Kontrolü
        if(!user){ 
            return res.render("auth/login",{
                title: "Login",
                message: {text:"Email Hatalı",class:"danger"}
            })
        }

        // Parola Kontrolü
        const match = await bcrypt.compare(password, user.password)
        if (match) {
            
            //Login Olduk
            req.session.roles = userRoles.map((role) => role["rolename"]); 
            req.session.isAuth = true;
            req.session.fullname = user.fullname;
            req.session.rolename = user.rolename;
            if (!req.session.roles.includes("Guest")) { // Yetkili Kişiye JsonWebToken Veriliyor
                const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '1h' }); // Kullanıcı yetkileri guest içermiyorsa kullanıcıya jwt veriyor
                req.session.token = token ;
            }
            res.redirect("/");
        } else {
            //Parola Yanlışsa
            return res.render("auth/login",{
                title: "Login",                     
                message: {text:"Parola Hatalı",class:"danger"}
            })
        }

    }
    catch(err) {
        console.log(err);
    }
}
exports.get_register = async function(req, res) { // Get Register
    try {
        return res.render("auth/register", {
            title: "Register Sayfası",          //Register Sayfası Getirilir
            csrfToken: req.csrfToken
        });
    }
    catch(err) {
        console.log(err);
    }
}
exports.post_register = async function(req, res) { //Post Register
    const name = req.body.name;
    const email = req.body.email;       //Formlardan alınan veriler
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await User.findOne({
            where: {email: email}             // Veritabanındaki sorgular
        });
        const username = await User.findOne({
            where: {fullname: name}
        });
        if (user) {
            req.session.message = { text:"Girdiğiniz Mail Adresi İle Daha Önce Kayıt Olunmuş", class:"danger"};
            return res.redirect("login")
        }                                               // kullanıcı adı ve epostayı unique yapmak için yazılan if blokları
        if (username) {
            req.session.message = { text:"Girdiğiniz Kullanıcı Adı İle Daha Önce Kayıt Olunmuş", class:"danger"};
            return res.redirect("login")
        }
        if (password.length < 8) {          // Güvenli Parola Sağlar 
            req.session.message = { text:"Parolanız En Az 8 Karakterli Olmalıdır", class:"danger"};
            return res.redirect("login")
        }  
        const newUser = await User.create({fullname: name, email: email, password: hashedPassword});
        
        emailService.sendMail({
            from: config.email.from,
            to: newUser.email,                                  //Mail Gönderme İşlemi
            subject: "Hesabınız Oluşturuldu.",
            text: "Hesabınız Başarılı Bir Şekilde Oluşturuldu"
        })
        req.session.message ={ text:"Hesabınıza Giriş Yapabilirsiniz", class: "success"};
        return res.redirect("login")
    }
    catch(err) {
        console.log(err);
    }
}
exports.get_logout = async function(req, res) { // Get Logout
    try {
        await req.session.destroy(); // Güvenli Çıkış İçin Session'u Destroy Ediyoruz.
        return res.redirect("/");
    }
    catch(err) {
        console.log(err);
    }
}
exports.get_reset = async function(req, res) { // Get Reset
    const message = req.session.message;
    delete req.session.message;
    try {
        return res.render("auth/reset-password", {
            title: "Reset Password",         
            message: message,               //Şifre Sıfırlama Sayfası Getirilir
            csrfToken: req.csrfToken
        });
    }
    catch(err) {
        console.log(err);
    }
}
exports.post_reset = async function(req, res) { // Post Reset
    const email = req.body.email;
    try {
        var token = crypto.randomBytes(32).toString("hex");         //Şifre Sıfırlaması için gereklilikler
        const user = await User.findOne({where: {email: email}});
        if (!user) {
            req.session.message = { text:"Email Bulunamadı", class:"danger"};
            return res.redirect("reset-password") // Kullanıcı Yoksa 
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now()+(1000*60*60);  //Reset Tokenler Veritabanına Kaydedilir
        await user.save();

        emailService.sendMail({
            from: config.email.from,
            to: user.email,             // Mail Gönderme İşlemi
            subject: "Reset Password",  // Burayı Kullanmak İçin config.js Dosyasına Email Bilgilerinizi Girmelisiniz      
            html: `                                         
            <p>Parolanızı güncellemek için aşağıdaki linke tıklayınız.</p>
            <p>
                <a href="http://127.0.0.1:3000/auth/new-password/${token}">Parola Sıfırla<a/>
            </p>
            `
        });
        req.session.message = {text: "Parolanızı Sıfırlamak İçin Eposta Adresinizi Kontrol Ediniz", class:"success"}
        res.redirect("login")
        
    }
    catch(err) {
        console.log(err);
    }
}
exports.get_newpassword = async function(req, res) { // Get New Password
    const token = req.params.token;
    console.log("Token:",token)
    try {
        const user = await User.findOne({
           where: {
            resetToken: token,              
            resetTokenExpiration: {             
                [Op.gt]: Date.now()     // Reset Token Expirationu Şimdiki Zaman İle Kıyaslayıp
            }                           // Şifre Sıfırlamak İsteyen Kullanıcıyı Buluyor
           }
        });
        console.log("User",user)
        return res.render("auth/new-password", {
            title: "New Password",
            csrfToken: req.csrfToken,           //Yeni Şifre İçin Gerekli Sayfaya Yönlendiriyor
            token: token,
            userId: user.id
        });
    }
    catch(err) {
        console.log(err);
    }
}
exports.post_newpassword = async function(req, res) { // Post New Password
    const token = req.body.token;
    const userId = req.body.userId;
    const newPassword = req.body.password;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,          // Reset Token Expirationu Şimdiki Zaman İle Kıyaslayıp
                resetTokenExpiration: {     // Şifre Sıfırlamak İsteyen Kullanıcıyı Buluyor
                    [Op.gt]: Date.now()
                },
                id: userId
            }
        });
        //console.log("Token:",token)    Ara Ara Bazı Şeyleri Kontrol Etmem Gerektiği İçin
        //console.log("userId:",userId)  Kontrol İçin Kullandım

        if (!user) {
            console.log("Kullanıcı bulunamadı veya koşullara uyan kullanıcı yok.");
            req.session.message = { text: "Geçersiz veya süresi dolmuş token.", class: "danger" };
            return res.redirect("login");
        }

        // Kullanıcı bulundu, şifreyi hashle ve alanları güncelle
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiration = null;

        // save methoduyla güncelleme işlemini gerçekleştir
        await user.save();

        req.session.message = { text: "Parolanız Güncellendi", class: "success" };
        return res.redirect("login");
    } catch (err) {
        console.log(err);
        req.session.message = { text: "Bir hata oluştu. Lütfen tekrar deneyin.", class: "error" };
        return res.redirect("login");
    }
};

