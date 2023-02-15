const express = require("express");
const router = express.Router();
const AutorizacaoController = require("../controllers/AutorizacaoController_");

//login
router.post("/login", AutorizacaoController.login);
router.post("/loginGoogle", AutorizacaoController.loginGoogle);

module.exports = router;
