const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuarioController.js");

router.post("/cadastro", usuarioController.cadastro);

router.post("/login", usuarioController.login);

module.exports = router;
