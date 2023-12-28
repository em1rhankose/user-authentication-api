module.exports = (req, res, next) => {
    if(!req.session.isAuth) {
        return res.redirect("/auth/login?returnUrl=" + req.originalUrl); // => /admin/blogs
    }                                                                                   
    if (!req.session.roles.includes("Admin")) {
        req.session.message = {text: "Yetkiniz Yeterli Değil", class:"danger"}
        return res.redirect("/auth/login?returnUrl=" + req.originalUrl); // => /admin/blogs
    }
    next();
}

//İlk önce kullanıcı giriş yapmış mı diye kontrol ediyor
//Daha sonra kullanıcı admin mi diye kontrol ediyor