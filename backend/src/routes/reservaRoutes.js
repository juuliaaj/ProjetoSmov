const express = require("express");
const router = express.Router();

const reservaController = require("../controllers/reservaController.js");

router.get("/", reservaController.getReservas);
router.post("/", reservaController.salvarReserva);
router.post("/cancelar/:id", reservaController.cancelarReserva);

module.exports = router;
