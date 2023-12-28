// Kütüphaneler ve içe aktarılan middlewareler
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authorization");
const csrf = require("../middlewares/csrf");

// Routerlar

router.get("/login", csrf, authController.get_login);
router.post("/login", authController.post_login);

router.get("/register", csrf, authController.get_register);
router.post("/register", authController.post_register);

router.get("/reset-password", csrf, authController.get_reset);
router.post("/reset-password", csrf, authController.post_reset);

router.get("/new-password/:token", csrf, authController.get_newpassword);
router.post("/new-password", authController.post_newpassword);


router.get("/logout", authController.get_logout);

module.exports = router;