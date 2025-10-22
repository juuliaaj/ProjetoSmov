
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController.js");



router.post("/cadastro", usuarioController.cadastro);

router.post("/login", usuarioController.login);

router.post("/recuperar-senha", usuarioController.recuperarSenha);

router.get("/perfil", usuarioController.getPerfil);

router.put("/perfil", usuarioController.updatePerfil);

module.exports = router;
