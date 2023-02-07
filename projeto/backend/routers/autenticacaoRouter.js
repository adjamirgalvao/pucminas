const express = require("express");
const router = express.Router();
const AutorizacaoController = require("../controllers/AutorizacaoController");

//login
router.post("/login", AutorizacaoController.login);

module.exports = router;
