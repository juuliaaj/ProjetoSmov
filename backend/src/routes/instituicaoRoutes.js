const express = require("express");
const router = express.Router();

const reservaController = require("../controllers/reservaController.js");

router.get("/reservar", reservaController.getInstituicoes);

module.exports = router;
