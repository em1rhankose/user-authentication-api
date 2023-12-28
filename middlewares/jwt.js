const jwt = require("jsonwebtoken")
const csrfToken = require("../middlewares/csrf")

//Json Web Tokeni ve yetki seviyesini kontrol eden middleware

module.exports = (req, res, next) => {
    const token = req.session.token;
    const fullname = req.session.fullname;
    const roles = req.session.roles;
  
    if (!token) {
        
        return res.render("../views/user/index",{
            title: "Login Sayfası",
            message: {text:"Yetkilendirme Başarısız",class:"danger"},
            class: "danger",
            csrfToken: csrfToken,
            fullname: fullname,
            roles: roles
        })
    }
    
  
    jwt.verify(token, 'secret-key', (err, decoded) => {
      if (err) {
        return res.render("../views/user/index",{
          title: "Login Sayfası",
          message: {text:"Yetkilendirme Başarısız",class:"danger"},
          class: "danger",
          csrfToken: csrfToken,
          fullname: fullname,
          roles: roles
        })
      }
      req.userId = decoded.userId;
      next();
    });
  };


