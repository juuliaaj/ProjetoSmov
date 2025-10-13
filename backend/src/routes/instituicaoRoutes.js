const express = require("express");
const router = express.Router();

const reservaController = require("../controllers/reservaController.js");
const instituicaoController = require("../controllers/instituicaoController.js");

router.get("/", instituicaoController.get);
router.get("/reservar", reservaController.getInstituicoes);

module.exports = router;
