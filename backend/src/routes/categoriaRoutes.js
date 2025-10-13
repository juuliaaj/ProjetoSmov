const express = require("express");
const router = express.Router();

const categoriaController = require("../controllers/categoriaController.js");

router.get("/", categoriaController.get);

module.exports = router;
