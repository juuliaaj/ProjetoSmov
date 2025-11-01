const express = require("express");
const router = express.Router();

const reservaController = require("../controllers/reservaController.js");

router.get("/", reservaController.getReservas);
router.post("/", reservaController.salvarReserva);
router.post("/cancelar/:id", reservaController.cancelarReserva);
router.post("/status/:id/:status", reservaController.alterarStatusReserva);

module.exports = router;
