const express = require("express");
const router = express.Router();

const reservaController = require("../controllers/reservaController.js");
const instituicaoController = require("../controllers/instituicaoController.js");

router.get("/", instituicaoController.get);
router.post("/", instituicaoController.post);
router.get("/enderecos", instituicaoController.getEnderecos);
router.get("/cadastros", instituicaoController.getCadastros);
router.put("/cadastros/:id/status", instituicaoController.updateCadastroStatus);
router.get("/cadastroStatus", instituicaoController.getCadastroStatus);
router.get("/reservar", reservaController.getInstituicoes);

module.exports = router;
