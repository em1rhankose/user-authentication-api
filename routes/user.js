// Kütüphaneler, içe aktarımlar ve middleware'ler
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user")
const isAuth = require("../middlewares/isAuth")
const csrf = require("../middlewares/csrf");
const isAdmin = require("../middlewares/isAdmin");
const jwt = require("../middlewares/jwt");

//Routerlar

router.get("/", userController.index);

router.get("/roles", isAuth, jwt, userController.get_roles); // jwt ile 4. maddenin b maddesini gerçekleştirdim
router.get("/roles/:roleid", isAuth, isAdmin, csrf, userController.get_role_edit);
router.post("/roles/remove", isAuth, isAdmin, userController.roles_remove);
router.post("/roles/:roleid", isAuth, isAdmin, csrf, userController.post_role_edit);

router.get("/users", isAuth, isAdmin, userController.get_user);
router.get("/users/:userid", isAuth, isAdmin, csrf, userController.get_user_edit);
router.post("/users/:userid", isAuth, isAdmin, userController.post_user_edit);

module.exports = router;