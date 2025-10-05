const express = require("express");
const router = express.Router();

const cidadeController = require("../controllers/cidadeController.js");

router.get("/", cidadeController.get);

module.exports = router;
