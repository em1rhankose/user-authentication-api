//kütüphaneler ve erişimler
const express = require('express');
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session")
const csurf = require("csurf");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/authorization");
const Role = require("./models/role")
const User = require("./models/user")
const populate = require("./data/dummy-data");


//Custom Modules
const sequelize = require("./data/db");
const locals = require("./middlewares/locals")

//Node Module ve Public klasörleri için
app.use("/libs", express.static(path.join(__dirname, "node_modules")));
app.use("/static", express.static(path.join(__dirname, "public")))

// Middlewares

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: "Hello World",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: (1000 * 60 * 60 * 24) // session 1 gün aktif olur (24 saat)
    },
    store: new SequelizeStore({
        db: sequelize
    })
}));

app.use(locals);

//routers
app.use(userRoutes);
app.use("/auth", authRoutes);


 

//Veritabanı İşlemleri

async function dbcalistir(){
    try {
        await sequelize.sync({ force: true });
        console.log("Veritabanı senkronizasyonu başarıyla gerçekleştirildi.");
    } catch (error) {
        console.error("Veritabanı senkronizasyonu sırasında bir hata oluştu:", error);
    }
}
// Tablo ilişkilendirmesi ile userRoles tablosunun oluşturulması
Role.belongsToMany(User,{through: "userRoles"});
User.belongsToMany(Role,{through: "userRoles"});

//dbcalistir() // Bu komut veritabanını sıfırdan kurar (db oluşturmaz, db ismi: authenticationdb)
//populate();  // Bu komut dummy-data.js dosyasını çalıştırır

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda aktif`);
});
 