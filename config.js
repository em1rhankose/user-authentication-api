const config = {
    db: {
        host: "localhost",        // DB Ayarları
        user: "root",            // Kendinize Göre Konfigüre Edebilirsiniz
        password: "123456",
        database: "authenticationdb"
    },
    email: {
        username: "email adresiniz",
        password: "şifreniz",       //Email işlemleri için kullanılacak emailin bilgileri
        from: "email adresiniz",
    }
}

module.exports = config;